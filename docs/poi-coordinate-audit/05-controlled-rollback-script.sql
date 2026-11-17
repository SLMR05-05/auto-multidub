-- =============================================================================
-- SCRIPT HOÀN TÁC TOÀN DIỆN TỪ SNAPSHOT (ENTERPRISE STORED PROCEDURE v6.2)
-- =============================================================================
-- KHẮC PHỤC TRIỆT ĐỂ:
-- 1. AUD6-02: THỐNG NHẤT THỨ TỰ KHÓA TOÀN HỆ THỐNG để chống Deadlock:
--             Thứ tự khóa bắt buộc: (1) DATA_VERSION -> (2) POIs (ORDER BY p.id ASC).
-- 2. AUD6-07: Bỏ aggregate khỏi câu FOR UPDATE; khóa từng POI theo ID tăng dần
--             SELECT p.id, p.version ... ORDER BY p.id ASC FOR UPDATE.
-- 3. AUD6-08: Kiểm tra expected_records = 6 và số lượng snapshot = 6 trước khi rollback.
-- 4. AUD6-09: UPDATE trạng thái batch có điều kiện ràng buộc state = 'COMMITTED'.
-- 5. AUD5-11: Kiểm tra đồng thời CẢ version, latitude, longitude VÀ radius_meters sau batch.
-- =============================================================================

DROP PROCEDURE IF EXISTS `sp_rollback_poi_coordinate_batch`;

DELIMITER $$

CREATE PROCEDURE `sp_rollback_poi_coordinate_batch`(
  IN p_batch_id VARCHAR(60)
)
proc_rollback: BEGIN
  DECLARE v_batch_state VARCHAR(20);
  DECLARE v_expected_records INT DEFAULT 0;
  DECLARE v_snapshot_count INT DEFAULT 0;
  DECLARE v_locked_poi_count INT DEFAULT 0;
  DECLARE v_unmodified_rows INT DEFAULT 0;
  DECLARE v_rolled_rows INT DEFAULT 0;
  DECLARE v_current_data_version BIGINT;
  DECLARE v_new_data_version BIGINT;
  DECLARE v_dv_rows_updated INT DEFAULT 0;

  -- EXIT HANDLER: Tự động rollback nếu có bất kỳ lỗi nào
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  -- BƯỚC 0: KIỂM TRA THAM SỐ ĐẦU VÀO
  IF p_batch_id IS NULL OR TRIM(p_batch_id) = '' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Input validation failed: p_batch_id cannot be null or empty.';
  END IF;

  START TRANSACTION;

  -- BƯỚC 1: THỨ TỰ KHÓA TÀI NGUYÊN TOÀN HỆ THỐNG (AUD6-02)
  -- TÀI NGUYÊN 1: system_settings (DATA_VERSION)
  SELECT CAST(setting_value AS UNSIGNED) INTO v_current_data_version
  FROM `system_settings`
  WHERE setting_key = 'DATA_VERSION' AND setting_value REGEXP '^[0-9]+$'
  FOR UPDATE;

  IF v_current_data_version IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Rollback failed: Invalid or missing numeric DATA_VERSION in system_settings.';
  END IF;

  -- TÀI NGUYÊN 2: Khóa và kiểm tra trạng thái batch trong transaction
  SELECT `state`, `expected_records` INTO v_batch_state, v_expected_records
  FROM `_poi_change_batches` 
  WHERE `batch_id` = p_batch_id
  FOR UPDATE;

  IF v_batch_state IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Rollback failed: Batch ID not found.';
  ELSEIF v_batch_state = 'ROLLED_BACK' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Rollback failed: Batch has already been rolled back (Idempotency protection).';
  ELSEIF v_batch_state <> 'COMMITTED' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Rollback failed: Batch is not in COMMITTED state.';
  END IF;

  -- AUD6-08: Kiểm tra expected_records = 6
  IF v_expected_records <> 6 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Rollback failed: Batch expected_records is not 6.';
  END IF;

  SELECT COUNT(*) INTO v_snapshot_count 
  FROM `_poi_coordinate_snapshots` 
  WHERE `batch_id` = p_batch_id;

  IF v_snapshot_count <> 6 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Rollback failed: Snapshot row count is not 6.';
  END IF;

  -- TÀI NGUYÊN 3: Khóa trực tiếp từng POI bằng con trỏ dòng theo ID tăng dần (AUD6-07)
  SELECT p.id, p.version
  FROM `pois` p
  JOIN `_poi_coordinate_snapshots` s 
    ON p.`id` = s.`poi_id` AND s.`batch_id` = p_batch_id
  ORDER BY p.id ASC
  FOR UPDATE;

  SET v_locked_poi_count = FOUND_ROWS();

  IF v_locked_poi_count <> 6 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Rollback failed: Expected exactly 6 snapshot POIs to be locked.';
  END IF;

  -- BƯỚC 2: OPTIMISTIC CONCURRENCY CHECK CHẶT CHẼ
  -- Bắt buộc đúng version VÀ đúng các giá trị new_latitude, new_longitude, new_radius_meters (AUD5-11)
  SELECT COUNT(*) INTO v_unmodified_rows
  FROM `pois` p
  JOIN `_poi_coordinate_snapshots` s 
    ON p.`id` = s.`poi_id` AND s.`batch_id` = p_batch_id
  WHERE p.`version` = s.`old_version` + 1
    AND p.`latitude` = s.`new_latitude`
    AND p.`longitude` = s.`new_longitude`
    AND p.`radius_meters` = s.`new_radius_meters`;

  IF v_unmodified_rows <> 6 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Rollback aborted: One or more POIs were modified (or reverted) after the batch committed. Manual resolution required.';
  END IF;

  -- BƯỚC 3: HOÀN TÁC DỮ LIỆU TỪ SNAPSHOT GỐC
  UPDATE `pois` p
  JOIN `_poi_coordinate_snapshots` s 
    ON p.`id` = s.`poi_id` AND s.`batch_id` = p_batch_id
  SET 
    p.`latitude` = s.`old_latitude`,
    p.`longitude` = s.`old_longitude`,
    p.`radius_meters` = s.`old_radius_meters`,
    p.`version` = p.`version` + 1
  WHERE p.`version` = s.`old_version` + 1;

  SET v_rolled_rows = ROW_COUNT();

  IF v_rolled_rows <> 6 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Rollback execution anomaly: Row count affected is not 6.';
  END IF;

  -- BƯỚC 4: TẠO REVISION MỚI ĐƠN ĐIỆU CHO DELTA SYNC VÀ KIỂM TRA CHẶT CHẼ
  UPDATE `system_settings`
  SET `setting_value` = CAST(`setting_value` AS UNSIGNED) + 1
  WHERE `setting_key` = 'DATA_VERSION' AND `setting_value` REGEXP '^[0-9]+$';

  SET v_dv_rows_updated = ROW_COUNT();

  IF v_dv_rows_updated <> 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Rollback DATA_VERSION update assertion failed: Affected rows is not 1.';
  END IF;

  SELECT CAST(setting_value AS UNSIGNED) INTO v_new_data_version
  FROM `system_settings`
  WHERE setting_key = 'DATA_VERSION';

  IF v_new_data_version <> v_current_data_version + 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Rollback DATA_VERSION assertion failed: New value does not match (current + 1).';
  END IF;

  -- BƯỚC 5: CHỐT TRẠNG THÁI BATCH THÀNH ROLLED_BACK (AUD6-09)
  UPDATE `_poi_change_batches`
  SET 
    `state` = 'ROLLED_BACK',
    `rollback_data_version` = v_new_data_version,
    `completed_at` = NOW()
  WHERE `batch_id` = p_batch_id AND `state` = 'COMMITTED';

  IF ROW_COUNT() <> 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Failed to mark batch as ROLLED_BACK.';
  END IF;

  COMMIT;

  SELECT 'ROLLED_BACK_SUCCESS' AS `status`, p_batch_id AS `batch_id`, v_rolled_rows AS `rows_restored`, v_new_data_version AS `rollback_data_version`;
END proc_rollback $$

DELIMITER ;
