-- =============================================================================
-- FILE: 00-install-procedures.sql
-- PHIÊN BẢN: v6.3
-- MỤC ĐÍCH: Cài đặt DDL (bảng audit + stored procedures).
--           CHỈ CHẠY TRONG BƯỚC MIGRATION ĐƯỢC PHÊ DUYỆT RIÊNG,
--           KHÔNG GỘP CHUNG VỚI execute-batch.sql hoặc rollback-batch.sql.
-- =============================================================================
-- LƯU Ý AUD6.2-04: DROP PROCEDURE là DDL có thể gây implicit commit tùy context.
--   File này KHÔNG được gọi bên trong một giao dịch dữ liệu. Chạy độc lập.
-- =============================================================================

-- -------------------------------------------------------------------------
-- PHẦN 1: TẠO BẢNG AUDIT (nếu chưa tồn tại)
-- -------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `_poi_change_batches` (
  `batch_id`             VARCHAR(60)   NOT NULL,
  `description`          VARCHAR(255)  NOT NULL,
  `state`                VARCHAR(20)   NOT NULL COMMENT 'EXECUTING | COMMITTED | ROLLED_BACK',
  `expected_records`     INT           NOT NULL DEFAULT 0,
  `data_version_before`  BIGINT        UNSIGNED NOT NULL,
  `data_version_after`   BIGINT        UNSIGNED DEFAULT NULL,
  `rollback_data_version` BIGINT       UNSIGNED DEFAULT NULL,
  `created_at`           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at`         DATETIME      DEFAULT NULL,
  PRIMARY KEY (`batch_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Audit log of POI coordinate change batches. NEVER DELETE rows directly.';

-- ON DELETE RESTRICT (AUD6.2-09): bảo vệ audit log khi batch bị xóa nhầm
CREATE TABLE IF NOT EXISTS `_poi_coordinate_snapshots` (
  `snapshot_id`       BIGINT        NOT NULL AUTO_INCREMENT,
  `batch_id`          VARCHAR(60)   NOT NULL,
  `poi_id`            BIGINT        NOT NULL,
  `code`              VARCHAR(120)  NOT NULL,
  `old_latitude`      DOUBLE        NOT NULL,
  `old_longitude`     DOUBLE        NOT NULL,
  `old_radius_meters` INT           NOT NULL,
  `old_version`       BIGINT        NOT NULL,
  `new_latitude`      DOUBLE        NOT NULL,
  `new_longitude`     DOUBLE        NOT NULL,
  `new_radius_meters` INT           NOT NULL,
  PRIMARY KEY (`snapshot_id`),
  UNIQUE KEY `uk_snapshot_batch_code` (`batch_id`, `code`),
  KEY `idx_snapshot_poi_id` (`poi_id`),
  CONSTRAINT `fk_snap_batch`
    FOREIGN KEY (`batch_id`)
    REFERENCES `_poi_change_batches` (`batch_id`)
    ON DELETE RESTRICT  -- AUD6.2-09: Was CASCADE; changed to RESTRICT to protect audit history
    ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Pre/post snapshot for each POI per batch. NEVER DELETE rows directly.';

-- -------------------------------------------------------------------------
-- PHẦN 2: STORED PROCEDURE EXECUTION
-- -------------------------------------------------------------------------

DROP PROCEDURE IF EXISTS `sp_execute_poi_coordinate_batch`;

DELIMITER $$

-- =============================================================================
-- sp_execute_poi_coordinate_batch
-- Thực thi cập nhật tọa độ 6 POI Quận 4 trong một giao dịch atomic, an toàn.
--
-- KHẮC PHỤC v6.3:
--   AUD6.2-01: Tách COUNT(*) ra khỏi SELECT…FOR UPDATE; không dùng FOUND_ROWS()
--   AUD6.2-02: Thống nhất thứ tự khóa: system_settings → _poi_change_batches → pois(ORDER BY id ASC)
--   AUD6.2-03: Dùng LEFT JOIN để xác thực đúng 6 code kỳ vọng
--   AUD6.2-04: DDL tách riêng vào file này, không nằm chung execute script
--   AUD6.2-05: Procedure tự COMMIT (Hướng A – atomic). Chính sách: CALL chỉ được phép
--              sau khi DBA đã phê duyệt batch_id bằng quy trình ngoài DB (ticket, CR, review)
--   AUD6.2-08: Xác minh chính xác tập 6 code trong snapshot sau khi tạo
--   AUD6.2-10: Bổ sung cập nhật updated_at theo contract DB (pois.updated_at ON UPDATE CURRENT_TIMESTAMP)
-- =============================================================================
CREATE PROCEDURE `sp_execute_poi_coordinate_batch`(
  IN p_batch_id    VARCHAR(60),
  IN p_description VARCHAR(255)
)
proc_main: BEGIN

  DECLARE v_current_data_version  BIGINT UNSIGNED;
  DECLARE v_new_data_version      BIGINT UNSIGNED;
  DECLARE v_expected_count        INT DEFAULT 0;
  DECLARE v_matched_count         INT DEFAULT 0;
  DECLARE v_snapshot_count        INT DEFAULT 0;
  DECLARE v_snapshot_code_match   INT DEFAULT 0;
  DECLARE v_updated_rows          INT DEFAULT 0;
  DECLARE v_matching_coords       INT DEFAULT 0;
  DECLARE v_matching_radius       INT DEFAULT 0;
  DECLARE v_matching_versions     INT DEFAULT 0;
  DECLARE v_dv_rows_updated       INT DEFAULT 0;

  -- EXIT HANDLER: Tự động ROLLBACK khi có bất kỳ lỗi SQL hoặc SIGNAL nào
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  -- ===========================================================================
  -- BƯỚC 0: VALIDATION THAM SỐ ĐẦU VÀO
  -- ===========================================================================
  IF p_batch_id IS NULL OR TRIM(p_batch_id) = '' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = '[v6.3] Input validation: p_batch_id cannot be null or empty.';
  END IF;

  IF p_description IS NULL OR TRIM(p_description) = '' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = '[v6.3] Input validation: p_description cannot be null or empty.';
  END IF;

  -- ===========================================================================
  -- BƯỚC 1: KHỞI TẠO GIAO DỊCH ATOMIC
  -- ===========================================================================
  START TRANSACTION;

  -- ---------------------------------------------------------------------------
  -- KHÓA TÀI NGUYÊN 1: system_settings (DATA_VERSION)
  -- Thứ tự khóa (AUD6.2-02): system_settings → _poi_change_batches → pois
  -- ---------------------------------------------------------------------------
  SELECT CAST(`setting_value` AS UNSIGNED) INTO v_current_data_version
  FROM `system_settings`
  WHERE `setting_key` = 'DATA_VERSION'
    AND `setting_value` REGEXP '^[0-9]+$'
  FOR UPDATE;

  IF v_current_data_version IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = '[v6.3] Pre-check: Missing or non-numeric DATA_VERSION in system_settings.';
  END IF;

  -- ---------------------------------------------------------------------------
  -- KHÓA TÀI NGUYÊN 2: _poi_change_batches
  -- Kiểm tra batch_id chưa được sử dụng (idempotency guard)
  -- Không dùng FOR UPDATE ở bước này vì chưa có row; kiểm tra bằng COUNT
  -- ---------------------------------------------------------------------------
  SELECT COUNT(*) INTO @v_existing_batch
  FROM `_poi_change_batches`
  WHERE `batch_id` = p_batch_id;

  IF @v_existing_batch > 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = '[v6.3] Pre-check: batch_id already exists. Duplicate execution prevented.';
  END IF;

  -- ---------------------------------------------------------------------------
  -- KHÓA TÀI NGUYÊN 3: Xác thực đúng 6 code kỳ vọng bằng LEFT JOIN (AUD6.2-03)
  -- Phải chạy trước SELECT…FOR UPDATE để không khóa POI khi set sai
  -- ---------------------------------------------------------------------------
  SELECT
    COUNT(*)                                                   AS total_expected,
    SUM(CASE WHEN p.`id` IS NOT NULL THEN 1 ELSE 0 END)       AS matched_in_db
  INTO
    v_expected_count,
    v_matched_count
  FROM (
    SELECT 'POI_NHA_RONG'            AS code UNION ALL
    SELECT 'POI_CAU_MONG'                    UNION ALL
    SELECT 'POI_CONG_VIEN_KHANH_HOI'         UNION ALL
    SELECT 'POI_NHA_THO_VINH_HOI'            UNION ALL
    SELECT 'POI_DINH_VINH_HOI'               UNION ALL
    SELECT 'POI_CHO_XOM_CHIEU'
  ) expected
  LEFT JOIN `pois` p
    ON p.`code` = expected.`code`
   AND p.`status` = 'PUBLISHED'
   AND p.`is_deleted` = 0;

  IF v_expected_count <> 6 OR v_matched_count <> 6 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = '[v6.3] Pre-check: Expected exactly 6 PUBLISHED, non-deleted POIs. Set validation failed.';
  END IF;

  -- ---------------------------------------------------------------------------
  -- KHÓA TÀI NGUYÊN 3 (tiếp): Locking read – khóa 6 POI theo id tăng dần (AUD6.2-01)
  -- SELECT riêng khỏi phép đếm; không dùng FOUND_ROWS()
  -- ---------------------------------------------------------------------------
  SELECT `id`
  FROM `pois`
  WHERE `code` IN (
    'POI_NHA_RONG', 'POI_CAU_MONG', 'POI_CONG_VIEN_KHANH_HOI',
    'POI_NHA_THO_VINH_HOI', 'POI_DINH_VINH_HOI', 'POI_CHO_XOM_CHIEU'
  )
  AND `status` = 'PUBLISHED'
  AND `is_deleted` = 0
  ORDER BY `id` ASC
  FOR UPDATE;

  -- ===========================================================================
  -- BƯỚC 2: ĐĂNG KÝ BATCH VÀ TẠO SNAPSHOT (trong cùng transaction)
  -- ===========================================================================
  INSERT INTO `_poi_change_batches`
    (`batch_id`, `description`, `state`, `expected_records`, `data_version_before`)
  VALUES
    (p_batch_id, p_description, 'EXECUTING', 6, v_current_data_version);

  IF ROW_COUNT() <> 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = '[v6.3] Failed to register batch in EXECUTING state.';
  END IF;

  -- Snapshot mang điều kiện status/is_deleted giống bước xác thực để nhất quán
  INSERT INTO `_poi_coordinate_snapshots`
    (`batch_id`, `poi_id`, `code`,
     `old_latitude`, `old_longitude`, `old_radius_meters`, `old_version`,
     `new_latitude`, `new_longitude`, `new_radius_meters`)
  SELECT
    p_batch_id, p.`id`, p.`code`,
    p.`latitude`, p.`longitude`, p.`radius_meters`, p.`version`,
    -- Activation Anchor coordinates (PARTIALLY_VERIFIED, v6.3)
    CASE p.`code`
      WHEN 'POI_NHA_RONG'            THEN 10.768280
      WHEN 'POI_CAU_MONG'            THEN 10.768040
      WHEN 'POI_CONG_VIEN_KHANH_HOI' THEN 10.757750
      WHEN 'POI_NHA_THO_VINH_HOI'    THEN 10.762280
      WHEN 'POI_DINH_VINH_HOI'       THEN 10.759560
      WHEN 'POI_CHO_XOM_CHIEU'       THEN 10.763510
    END,
    CASE p.`code`
      WHEN 'POI_NHA_RONG'            THEN 106.706640
      WHEN 'POI_CAU_MONG'            THEN 106.703700
      WHEN 'POI_CONG_VIEN_KHANH_HOI' THEN 106.698050
      WHEN 'POI_NHA_THO_VINH_HOI'    THEN 106.698400
      WHEN 'POI_DINH_VINH_HOI'       THEN 106.696000
      WHEN 'POI_CHO_XOM_CHIEU'       THEN 106.706100
    END,
    CASE p.`code`
      WHEN 'POI_NHA_RONG'            THEN 60
      WHEN 'POI_CAU_MONG'            THEN 45
      WHEN 'POI_CONG_VIEN_KHANH_HOI' THEN 80
      WHEN 'POI_NHA_THO_VINH_HOI'    THEN 50
      WHEN 'POI_DINH_VINH_HOI'       THEN 45
      WHEN 'POI_CHO_XOM_CHIEU'       THEN 55
    END
  FROM `pois` p
  WHERE p.`code` IN (
    'POI_NHA_RONG', 'POI_CAU_MONG', 'POI_CONG_VIEN_KHANH_HOI',
    'POI_NHA_THO_VINH_HOI', 'POI_DINH_VINH_HOI', 'POI_CHO_XOM_CHIEU'
  )
  AND p.`status` = 'PUBLISHED'
  AND p.`is_deleted` = 0;

  -- Xác nhận đúng 6 snapshot đã được tạo
  SELECT COUNT(*) INTO v_snapshot_count
  FROM `_poi_coordinate_snapshots`
  WHERE `batch_id` = p_batch_id;

  IF v_snapshot_count <> 6 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = '[v6.3] Snapshot creation failed: row count is not 6.';
  END IF;

  -- AUD6.2-08: Xác minh chính xác tập 6 code trong snapshot (không chỉ kiểm tra số lượng)
  SELECT
    SUM(CASE WHEN s.`code` IS NOT NULL THEN 1 ELSE 0 END) INTO v_snapshot_code_match
  FROM (
    SELECT 'POI_NHA_RONG'            AS code UNION ALL
    SELECT 'POI_CAU_MONG'                    UNION ALL
    SELECT 'POI_CONG_VIEN_KHANH_HOI'         UNION ALL
    SELECT 'POI_NHA_THO_VINH_HOI'            UNION ALL
    SELECT 'POI_DINH_VINH_HOI'               UNION ALL
    SELECT 'POI_CHO_XOM_CHIEU'
  ) expected
  LEFT JOIN `_poi_coordinate_snapshots` s
    ON s.`code` = expected.`code`
   AND s.`batch_id` = p_batch_id;

  IF v_snapshot_code_match <> 6 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = '[v6.3] Snapshot code-set validation failed: not all 6 expected POI codes present in snapshot.';
  END IF;

  -- ===========================================================================
  -- BƯỚC 3: CẬP NHẬT POI VỚI OPTIMISTIC LOCKING
  -- updated_at tự động cập nhật qua ON UPDATE CURRENT_TIMESTAMP (AUD6.2-10)
  -- ===========================================================================
  UPDATE `pois` p
  JOIN `_poi_coordinate_snapshots` s
    ON p.`id` = s.`poi_id`
   AND s.`batch_id` = p_batch_id
  SET
    p.`latitude`      = s.`new_latitude`,
    p.`longitude`     = s.`new_longitude`,
    p.`radius_meters` = s.`new_radius_meters`,
    p.`version`       = p.`version` + 1
    -- updated_at handled by DB: ON UPDATE CURRENT_TIMESTAMP
  WHERE p.`version` = s.`old_version`;

  SET v_updated_rows = ROW_COUNT();

  IF v_updated_rows <> 6 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = '[v6.3] Optimistic lock: UPDATE affected rows not 6. Concurrent modification detected.';
  END IF;

  -- ===========================================================================
  -- BƯỚC 4: CẬP NHẬT DATA_VERSION
  -- ===========================================================================
  UPDATE `system_settings`
  SET `setting_value` = CAST(`setting_value` AS UNSIGNED) + 1
  WHERE `setting_key` = 'DATA_VERSION'
    AND `setting_value` REGEXP '^[0-9]+$';

  SET v_dv_rows_updated = ROW_COUNT();

  IF v_dv_rows_updated <> 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = '[v6.3] DATA_VERSION update failed: affected rows not 1.';
  END IF;

  SELECT CAST(`setting_value` AS UNSIGNED) INTO v_new_data_version
  FROM `system_settings`
  WHERE `setting_key` = 'DATA_VERSION';

  IF v_new_data_version <> v_current_data_version + 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = '[v6.3] DATA_VERSION assertion: new value does not equal (current + 1).';
  END IF;

  -- ===========================================================================
  -- BƯỚC 5: POST-CHECK – xác minh giá trị thực tế sau UPDATE
  -- ===========================================================================
  SELECT
    COALESCE(SUM(CASE WHEN p.`latitude`      = s.`new_latitude`      AND
                           p.`longitude`     = s.`new_longitude`     THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN p.`radius_meters` = s.`new_radius_meters`               THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN p.`version`       = s.`old_version` + 1                 THEN 1 ELSE 0 END), 0)
  INTO
    v_matching_coords,
    v_matching_radius,
    v_matching_versions
  FROM `pois` p
  JOIN `_poi_coordinate_snapshots` s
    ON p.`id` = s.`poi_id`
   AND s.`batch_id` = p_batch_id;

  IF v_matching_coords <> 6 OR v_matching_radius <> 6 OR v_matching_versions <> 6 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = '[v6.3] Post-check assertion failed: data mismatch detected after UPDATE.';
  END IF;

  -- ===========================================================================
  -- BƯỚC 6: CHỐT BATCH → COMMITTED
  -- ===========================================================================
  UPDATE `_poi_change_batches`
  SET
    `state`              = 'COMMITTED',
    `data_version_after` = v_new_data_version,
    `completed_at`       = NOW()
  WHERE `batch_id` = p_batch_id
    AND `state`    = 'EXECUTING';

  IF ROW_COUNT() <> 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = '[v6.3] Failed to mark batch as COMMITTED.';
  END IF;

  -- ===========================================================================
  -- BƯỚC 7: COMMIT
  -- AUD6.2-05 (Hướng A – atomic): procedure tự COMMIT.
  --   Chính sách phê duyệt bên ngoài DB: DBA phải approve ticket/CR trước khi CALL.
  -- ===========================================================================
  COMMIT;

  SELECT
    'SUCCESS'           AS `status`,
    p_batch_id          AS `batch_id`,
    v_updated_rows      AS `rows_updated`,
    v_new_data_version  AS `data_version_after`;

END proc_main $$

DELIMITER ;

-- -------------------------------------------------------------------------
-- PHẦN 3: STORED PROCEDURE ROLLBACK
-- -------------------------------------------------------------------------

DROP PROCEDURE IF EXISTS `sp_rollback_poi_coordinate_batch`;

DELIMITER $$

-- =============================================================================
-- sp_rollback_poi_coordinate_batch
-- Hoàn tác một batch đã COMMITTED, khôi phục toàn bộ 6 POI về giá trị cũ.
--
-- KHẮC PHỤC v6.3:
--   AUD6.2-01: Không dùng FOUND_ROWS(); dùng COUNT(*) trước FOR UPDATE
--   AUD6.2-02: Thứ tự khóa: system_settings → _poi_change_batches → pois(ORDER BY id ASC)
--   AUD6.2-06: Bổ sung post-check đầy đủ sau UPDATE khôi phục
--   AUD6.2-08: Xác minh chính xác tập 6 code trong snapshot
-- =============================================================================
CREATE PROCEDURE `sp_rollback_poi_coordinate_batch`(
  IN p_batch_id VARCHAR(60)
)
proc_rollback: BEGIN

  DECLARE v_batch_state          VARCHAR(20);
  DECLARE v_expected_records     INT DEFAULT 0;
  DECLARE v_snapshot_count       INT DEFAULT 0;
  DECLARE v_snapshot_code_match  INT DEFAULT 0;
  DECLARE v_poi_count            INT DEFAULT 0;
  DECLARE v_unmodified_rows      INT DEFAULT 0;
  DECLARE v_rolled_rows          INT DEFAULT 0;
  DECLARE v_current_data_version BIGINT UNSIGNED;
  DECLARE v_new_data_version     BIGINT UNSIGNED;
  DECLARE v_dv_rows_updated      INT DEFAULT 0;
  DECLARE v_post_lat_lon         INT DEFAULT 0;
  DECLARE v_post_radius          INT DEFAULT 0;
  DECLARE v_post_version         INT DEFAULT 0;

  -- EXIT HANDLER: Tự động ROLLBACK khi có lỗi
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  -- ===========================================================================
  -- BƯỚC 0: VALIDATION THAM SỐ ĐẦU VÀO
  -- ===========================================================================
  IF p_batch_id IS NULL OR TRIM(p_batch_id) = '' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = '[v6.3] Rollback input: p_batch_id cannot be null or empty.';
  END IF;

  -- ===========================================================================
  -- BƯỚC 1: KHỞI TẠO GIAO DỊCH
  -- ===========================================================================
  START TRANSACTION;

  -- ---------------------------------------------------------------------------
  -- KHÓA TÀI NGUYÊN 1: system_settings (DATA_VERSION)
  -- Thứ tự khóa (AUD6.2-02): system_settings → _poi_change_batches → pois
  -- ---------------------------------------------------------------------------
  SELECT CAST(`setting_value` AS UNSIGNED) INTO v_current_data_version
  FROM `system_settings`
  WHERE `setting_key` = 'DATA_VERSION'
    AND `setting_value` REGEXP '^[0-9]+$'
  FOR UPDATE;

  IF v_current_data_version IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = '[v6.3] Rollback: Missing or non-numeric DATA_VERSION in system_settings.';
  END IF;

  -- ---------------------------------------------------------------------------
  -- KHÓA TÀI NGUYÊN 2: _poi_change_batches
  -- Khóa và xác nhận trạng thái batch
  -- ---------------------------------------------------------------------------
  SELECT `state`, `expected_records`
  INTO v_batch_state, v_expected_records
  FROM `_poi_change_batches`
  WHERE `batch_id` = p_batch_id
  FOR UPDATE;

  IF v_batch_state IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = '[v6.3] Rollback: Batch ID not found.';
  ELSEIF v_batch_state = 'ROLLED_BACK' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = '[v6.3] Rollback: Batch already rolled back (idempotency protection).';
  ELSEIF v_batch_state <> 'COMMITTED' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = '[v6.3] Rollback: Batch is not in COMMITTED state.';
  END IF;

  IF v_expected_records <> 6 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = '[v6.3] Rollback: Batch expected_records is not 6.';
  END IF;

  -- Xác nhận đúng 6 snapshot rows
  SELECT COUNT(*) INTO v_snapshot_count
  FROM `_poi_coordinate_snapshots`
  WHERE `batch_id` = p_batch_id;

  IF v_snapshot_count <> 6 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = '[v6.3] Rollback: Snapshot row count is not 6.';
  END IF;

  -- AUD6.2-08: Xác minh chính xác 6 code trong snapshot
  SELECT
    SUM(CASE WHEN s.`code` IS NOT NULL THEN 1 ELSE 0 END) INTO v_snapshot_code_match
  FROM (
    SELECT 'POI_NHA_RONG'            AS code UNION ALL
    SELECT 'POI_CAU_MONG'                    UNION ALL
    SELECT 'POI_CONG_VIEN_KHANH_HOI'         UNION ALL
    SELECT 'POI_NHA_THO_VINH_HOI'            UNION ALL
    SELECT 'POI_DINH_VINH_HOI'               UNION ALL
    SELECT 'POI_CHO_XOM_CHIEU'
  ) expected
  LEFT JOIN `_poi_coordinate_snapshots` s
    ON s.`code` = expected.`code`
   AND s.`batch_id` = p_batch_id;

  IF v_snapshot_code_match <> 6 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = '[v6.3] Rollback: Snapshot does not contain exactly the expected 6 POI codes.';
  END IF;

  -- ---------------------------------------------------------------------------
  -- KHÓA TÀI NGUYÊN 3: Đếm POI khớp snapshot trước khi khóa (AUD6.2-01)
  -- ---------------------------------------------------------------------------
  SELECT COUNT(*) INTO v_poi_count
  FROM `pois` p
  JOIN `_poi_coordinate_snapshots` s
    ON p.`id` = s.`poi_id`
   AND s.`batch_id` = p_batch_id;

  IF v_poi_count <> 6 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = '[v6.3] Rollback: Expected 6 POIs matching snapshot. Count mismatch.';
  END IF;

  -- Locking read theo id tăng dần (AUD6.2-01, AUD6.2-02)
  SELECT p.`id`
  FROM `pois` p
  JOIN `_poi_coordinate_snapshots` s
    ON p.`id` = s.`poi_id`
   AND s.`batch_id` = p_batch_id
  ORDER BY p.`id` ASC
  FOR UPDATE;

  -- ===========================================================================
  -- BƯỚC 2: OPTIMISTIC CONCURRENCY CHECK
  -- Đảm bảo POI vẫn ở trạng thái sau khi batch COMMITTED (chưa bị thay đổi tiếp)
  -- ===========================================================================
  SELECT COUNT(*) INTO v_unmodified_rows
  FROM `pois` p
  JOIN `_poi_coordinate_snapshots` s
    ON p.`id` = s.`poi_id`
   AND s.`batch_id` = p_batch_id
  WHERE p.`version`       = s.`old_version` + 1
    AND p.`latitude`      = s.`new_latitude`
    AND p.`longitude`     = s.`new_longitude`
    AND p.`radius_meters` = s.`new_radius_meters`;

  IF v_unmodified_rows <> 6 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = '[v6.3] Rollback aborted: One or more POIs were modified after batch commit. Manual resolution required.';
  END IF;

  -- ===========================================================================
  -- BƯỚC 3: HOÀN TÁC DỮ LIỆU TỪ SNAPSHOT
  -- ===========================================================================
  UPDATE `pois` p
  JOIN `_poi_coordinate_snapshots` s
    ON p.`id` = s.`poi_id`
   AND s.`batch_id` = p_batch_id
  SET
    p.`latitude`      = s.`old_latitude`,
    p.`longitude`     = s.`old_longitude`,
    p.`radius_meters` = s.`old_radius_meters`,
    p.`version`       = p.`version` + 1
    -- updated_at handled by DB: ON UPDATE CURRENT_TIMESTAMP
  WHERE p.`version` = s.`old_version` + 1;

  SET v_rolled_rows = ROW_COUNT();

  IF v_rolled_rows <> 6 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = '[v6.3] Rollback execution anomaly: Rows affected is not 6.';
  END IF;

  -- ===========================================================================
  -- BƯỚC 4: TĂNG DATA_VERSION (Delta Sync) + ASSERTION
  -- ===========================================================================
  UPDATE `system_settings`
  SET `setting_value` = CAST(`setting_value` AS UNSIGNED) + 1
  WHERE `setting_key` = 'DATA_VERSION'
    AND `setting_value` REGEXP '^[0-9]+$';

  SET v_dv_rows_updated = ROW_COUNT();

  IF v_dv_rows_updated <> 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = '[v6.3] Rollback DATA_VERSION update failed: affected rows not 1.';
  END IF;

  SELECT CAST(`setting_value` AS UNSIGNED) INTO v_new_data_version
  FROM `system_settings`
  WHERE `setting_key` = 'DATA_VERSION';

  IF v_new_data_version <> v_current_data_version + 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = '[v6.3] Rollback DATA_VERSION assertion: new value does not equal (current + 1).';
  END IF;

  -- ===========================================================================
  -- BƯỚC 5: POST-CHECK sau khôi phục (AUD6.2-06)
  -- Xác minh tọa độ cũ, bán kính cũ, version = old_version + 2
  -- ===========================================================================
  SELECT
    COALESCE(SUM(CASE WHEN p.`latitude`      = s.`old_latitude`      AND
                           p.`longitude`     = s.`old_longitude`     THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN p.`radius_meters` = s.`old_radius_meters`               THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN p.`version`       = s.`old_version` + 2                 THEN 1 ELSE 0 END), 0)
  INTO
    v_post_lat_lon,
    v_post_radius,
    v_post_version
  FROM `pois` p
  JOIN `_poi_coordinate_snapshots` s
    ON p.`id` = s.`poi_id`
   AND s.`batch_id` = p_batch_id;

  IF v_post_lat_lon <> 6 OR v_post_radius <> 6 OR v_post_version <> 6 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = '[v6.3] Rollback post-check failed: restored data does not match old snapshot values.';
  END IF;

  -- ===========================================================================
  -- BƯỚC 6: CHỐT BATCH → ROLLED_BACK
  -- ===========================================================================
  UPDATE `_poi_change_batches`
  SET
    `state`                  = 'ROLLED_BACK',
    `rollback_data_version`  = v_new_data_version,
    `completed_at`           = NOW()
  WHERE `batch_id` = p_batch_id
    AND `state`    = 'COMMITTED';

  IF ROW_COUNT() <> 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = '[v6.3] Failed to mark batch as ROLLED_BACK.';
  END IF;

  -- ===========================================================================
  -- BƯỚC 7: COMMIT
  -- ===========================================================================
  COMMIT;

  SELECT
    'ROLLED_BACK_SUCCESS'   AS `status`,
    p_batch_id              AS `batch_id`,
    v_rolled_rows           AS `rows_restored`,
    v_new_data_version      AS `rollback_data_version`;

END proc_rollback $$

DELIMITER ;

-- =============================================================================
-- END OF FILE: 00-install-procedures.sql (v6.3)
-- Sau khi chạy file này thành công, chạy execute-batch.sql để thực thi cập nhật,
-- hoặc rollback-batch.sql để hoàn tác một batch đã COMMITTED.
-- =============================================================================
