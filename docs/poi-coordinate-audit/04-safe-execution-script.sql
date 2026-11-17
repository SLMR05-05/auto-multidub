-- =============================================================================
-- KIỂM TOÁN VÀ CHUẨN BỊ THAY ĐỔI TỌA ĐỘ POI (ENTERPRISE STORED PROCEDURE v6.2)
-- =============================================================================
-- KHẮC PHỤC TRIỆT ĐỂ:
-- 1. AUD6-01: Bỏ truy vấn aggregate khỏi thao tác khóa; khóa trực tiếp từng POI bằng
--             SELECT p.id, p.code ... ORDER BY p.id ASC FOR UPDATE. Sau đó kiểm tra
--             đúng 6 dòng và đúng chính xác tập mã bằng truy vấn kiểm tra độc lập.
-- 2. AUD6-02: THỐNG NHẤT THỨ TỰ KHÓA TOÀN HỆ THỐNG để chống Deadlock:
--             Thứ tự khóa bắt buộc: (1) DATA_VERSION -> (2) POIs (ORDER BY p.id ASC).
-- 3. AUD6-04: Thêm điều kiện status = 'PUBLISHED' AND is_deleted = 0 vào INSERT snapshot.
-- 4. AUD6-05: Kiểm tra tham số đầu vào p_batch_id, p_description (NOT NULL, không rỗng).
-- 5. AUD6-06: Bọc COALESCE() chống NULL trong câu lệnh kiểm tra assertion SUM().
-- =============================================================================

DROP PROCEDURE IF EXISTS `sp_execute_poi_coordinate_batch`;

DELIMITER $$

CREATE PROCEDURE `sp_execute_poi_coordinate_batch`(
  IN p_batch_id VARCHAR(60),
  IN p_description VARCHAR(255)
)
proc_main: BEGIN
  DECLARE v_current_data_version BIGINT;
  DECLARE v_new_data_version BIGINT;
  DECLARE v_locked_poi_count INT DEFAULT 0;
  DECLARE v_distinct_codes INT DEFAULT 0;
  DECLARE v_unmatched_codes INT DEFAULT 0;
  DECLARE v_snapshot_count INT DEFAULT 0;
  DECLARE v_updated_rows INT DEFAULT 0;
  DECLARE v_matching_coords INT DEFAULT 0;
  DECLARE v_matching_radius INT DEFAULT 0;
  DECLARE v_matching_versions INT DEFAULT 0;
  DECLARE v_batch_state VARCHAR(20);
  DECLARE v_dv_rows_updated INT DEFAULT 0;

  -- EXIT HANDLER: Nếu có bất kỳ lỗi SQL hoặc SIGNAL nào, tự động ROLLBACK toàn diện
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  -- BƯỚC 0: VALIDATION THAM SỐ ĐẦU VÀO (AUD6-05)
  IF p_batch_id IS NULL OR TRIM(p_batch_id) = '' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Input validation failed: p_batch_id cannot be null or empty.';
  END IF;

  IF p_description IS NULL OR TRIM(p_description) = '' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Input validation failed: p_description cannot be null or empty.';
  END IF;

  -- BƯỚC 1: KHỞI TẠO GIAO DỊCH ATOMIC
  START TRANSACTION;

  -- THỨ TỰ KHÓA TÀI NGUYÊN TOÀN HỆ THỐNG (AUD6-02):
  -- TÀI NGUYÊN 1: system_settings (DATA_VERSION)
  SELECT CAST(setting_value AS UNSIGNED) INTO v_current_data_version
  FROM `system_settings`
  WHERE setting_key = 'DATA_VERSION' AND setting_value REGEXP '^[0-9]+$'
  FOR UPDATE;

  IF v_current_data_version IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Pre-validation failed: Invalid or missing numeric DATA_VERSION in system_settings.';
  END IF;

  -- TÀI NGUYÊN 2: Khóa trực tiếp từng POI bằng con trỏ dòng theo id tăng dần (AUD6-01)
  -- Bỏ aggregate khỏi câu FOR UPDATE để đảm bảo row-level lock chuẩn xác
  SELECT p.id, p.code
  FROM `pois` p
  WHERE p.code IN (
    'POI_NHA_RONG', 'POI_CAU_MONG', 'POI_CONG_VIEN_KHANH_HOI',
    'POI_NHA_THO_VINH_HOI', 'POI_DINH_VINH_HOI', 'POI_CHO_XOM_CHIEU'
  )
  AND p.status = 'PUBLISHED'
  AND p.is_deleted = 0
  ORDER BY p.id ASC
  FOR UPDATE;

  SET v_locked_poi_count = FOUND_ROWS();

  IF v_locked_poi_count <> 6 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Pre-validation failed: Expected exactly 6 target POIs to be locked.';
  END IF;

  -- 1.3 Kiểm tra xác thực tập mã độc lập
  SELECT 
    COUNT(DISTINCT p.code),
    SUM(CASE WHEN expected.code IS NULL THEN 1 ELSE 0 END)
  INTO 
    v_distinct_codes,
    v_unmatched_codes
  FROM (
    SELECT 'POI_NHA_RONG' AS code UNION ALL
    SELECT 'POI_CAU_MONG' UNION ALL
    SELECT 'POI_CONG_VIEN_KHANH_HOI' UNION ALL
    SELECT 'POI_NHA_THO_VINH_HOI' UNION ALL
    SELECT 'POI_DINH_VINH_HOI' UNION ALL
    SELECT 'POI_CHO_XOM_CHIEU'
  ) expected
  JOIN `pois` p ON p.code = expected.code AND p.status = 'PUBLISHED' AND p.is_deleted = 0;

  IF v_distinct_codes <> 6 OR v_unmatched_codes > 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Pre-validation failed: Expected exactly 6 distinct target POIs, all PUBLISHED and non-deleted.';
  END IF;

  -- BƯỚC 2: TẠO BATCH VÀ LƯU SNAPSHOT (TRONG TRANSACTION)
  INSERT INTO `_poi_change_batches` 
    (`batch_id`, `description`, `state`, `expected_records`, `data_version_before`)
  VALUES 
    (p_batch_id, p_description, 'EXECUTING', 6, v_current_data_version);

  IF ROW_COUNT() <> 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Failed to register change batch in EXECUTING state. Batch ID might already exist.';
  END IF;

  -- Snapshot có ràng buộc điều kiện trạng thái (AUD6-04)
  INSERT INTO `_poi_coordinate_snapshots`
    (`batch_id`, `poi_id`, `code`, `old_latitude`, `old_longitude`, `old_radius_meters`, `old_version`, `new_latitude`, `new_longitude`, `new_radius_meters`)
  SELECT 
    p_batch_id, p.`id`, p.`code`, p.`latitude`, p.`longitude`, p.`radius_meters`, p.`version`,
    CASE p.`code`
      WHEN 'POI_NHA_RONG' THEN 10.768280
      WHEN 'POI_CAU_MONG' THEN 10.768040
      WHEN 'POI_CONG_VIEN_KHANH_HOI' THEN 10.757750
      WHEN 'POI_NHA_THO_VINH_HOI' THEN 10.762280
      WHEN 'POI_DINH_VINH_HOI' THEN 10.759560
      WHEN 'POI_CHO_XOM_CHIEU' THEN 10.763510
    END,
    CASE p.`code`
      WHEN 'POI_NHA_RONG' THEN 106.706640
      WHEN 'POI_CAU_MONG' THEN 106.703700
      WHEN 'POI_CONG_VIEN_KHANH_HOI' THEN 106.698050
      WHEN 'POI_NHA_THO_VINH_HOI' THEN 106.698400
      WHEN 'POI_DINH_VINH_HOI' THEN 106.696000
      WHEN 'POI_CHO_XOM_CHIEU' THEN 106.706100
    END,
    CASE p.`code`
      WHEN 'POI_NHA_RONG' THEN 60
      WHEN 'POI_CAU_MONG' THEN 45
      WHEN 'POI_CONG_VIEN_KHANH_HOI' THEN 80
      WHEN 'POI_NHA_THO_VINH_HOI' THEN 50
      WHEN 'POI_DINH_VINH_HOI' THEN 45
      WHEN 'POI_CHO_XOM_CHIEU' THEN 55
    END
  FROM `pois` p
  WHERE p.`code` IN (
    'POI_NHA_RONG', 'POI_CAU_MONG', 'POI_CONG_VIEN_KHANH_HOI',
    'POI_NHA_THO_VINH_HOI', 'POI_DINH_VINH_HOI', 'POI_CHO_XOM_CHIEU'
  )
  AND p.`status` = 'PUBLISHED'
  AND p.`is_deleted` = 0;

  SELECT COUNT(*) INTO v_snapshot_count 
  FROM `_poi_coordinate_snapshots` 
  WHERE `batch_id` = p_batch_id;

  IF v_snapshot_count <> 6 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Snapshot creation failed: Snapshot row count is not 6.';
  END IF;

  -- BƯỚC 3: THỰC THI CẬP NHẬT POI KÈM OPTIMISTIC LOCKING
  UPDATE `pois` p
  JOIN `_poi_coordinate_snapshots` s 
    ON p.`id` = s.`poi_id` AND s.`batch_id` = p_batch_id
  SET 
    p.`latitude` = s.`new_latitude`,
    p.`longitude` = s.`new_longitude`,
    p.`radius_meters` = s.`new_radius_meters`,
    p.`version` = p.`version` + 1
  WHERE p.`version` = s.`old_version`;

  SET v_updated_rows = ROW_COUNT();

  IF v_updated_rows <> 6 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Optimistic lock error: UPDATE affected row count is not 6. Concurrent modification detected.';
  END IF;

  -- BƯỚC 4: CẬP NHẬT VÀ XÁC THỰC NGHIÊM NGẶT DATA_VERSION
  UPDATE `system_settings`
  SET `setting_value` = CAST(`setting_value` AS UNSIGNED) + 1
  WHERE `setting_key` = 'DATA_VERSION' AND `setting_value` REGEXP '^[0-9]+$';

  SET v_dv_rows_updated = ROW_COUNT();

  IF v_dv_rows_updated <> 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'DATA_VERSION update assertion failed: Affected rows is not 1.';
  END IF;

  SELECT CAST(setting_value AS UNSIGNED) INTO v_new_data_version
  FROM `system_settings`
  WHERE setting_key = 'DATA_VERSION';

  IF v_new_data_version <> v_current_data_version + 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'DATA_VERSION assertion failed: New value does not match (current + 1).';
  END IF;

  -- BƯỚC 5: TỰ ĐỘNG KIỂM TRA TOÀN BỘ ASSERTIONS (CÓ BỌC COALESCE CHỐNG NULL - AUD6-06)
  SELECT 
    COALESCE(SUM(CASE WHEN p.`latitude` = s.`new_latitude` AND p.`longitude` = s.`new_longitude` THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN p.`radius_meters` = s.`new_radius_meters` THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN p.`version` = s.`old_version` + 1 THEN 1 ELSE 0 END), 0)
  INTO 
    v_matching_coords,
    v_matching_radius,
    v_matching_versions
  FROM `pois` p
  JOIN `_poi_coordinate_snapshots` s 
    ON p.`id` = s.`poi_id` AND s.`batch_id` = p_batch_id;

  IF v_matching_coords <> 6 OR v_matching_radius <> 6 OR v_matching_versions <> 6 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Post-check assertion failed: Data mismatch detected after update.';
  END IF;

  -- BƯỚC 6: CHỐT BATCH TRẠNG THÁI COMMITTED VÀ HOÀN TẤT TRANSACTION
  UPDATE `_poi_change_batches`
  SET 
    `state` = 'COMMITTED',
    `data_version_after` = v_new_data_version,
    `completed_at` = NOW()
  WHERE `batch_id` = p_batch_id AND `state` = 'EXECUTING';

  IF ROW_COUNT() <> 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Failed to mark batch as COMMITTED.';
  END IF;

  COMMIT;

  SELECT 'SUCCESS' AS `status`, p_batch_id AS `batch_id`, v_updated_rows AS `rows_updated`, v_new_data_version AS `data_version_after`;
END proc_main $$

DELIMITER ;
