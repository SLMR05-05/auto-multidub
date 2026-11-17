-- =============================================================================
-- FILE: 02-rollback-batch.sql
-- PHIÊN BẢN: v6.3
-- MỤC ĐÍCH: Hoàn tác một batch đã COMMITTED, khôi phục 6 POI về giá trị cũ.
--
-- ĐIỀU KIỆN TIÊN QUYẾT TRƯỚC KHI CHẠY FILE NÀY:
--   [x] Batch target đang ở trạng thái COMMITTED (không phải ROLLED_BACK/EXECUTING)
--   [x] 6 POI chưa bị thay đổi tiếp bởi batch khác sau batch target
--   [x] DBA/người có thẩm quyền đã phê duyệt rollback
--
-- CẢNH BÁO:
--   - File này CHỈ chứa lệnh CALL. Không có DDL.
--   - Procedure sẽ tự COMMIT khi thành công.
--   - Idempotency được bảo vệ: gọi rollback hai lần trên cùng batch_id sẽ bị từ chối.
-- =============================================================================

-- Thay thế batch_id bằng batch cần hoàn tác
CALL `sp_rollback_poi_coordinate_batch`(
  'POI_Q4_COORD_20261117_001'
);

-- Sau khi CALL thành công, xác nhận trạng thái:
-- SELECT * FROM `_poi_change_batches` WHERE batch_id = 'POI_Q4_COORD_20261117_001';
-- SELECT code, latitude, longitude, radius_meters, version FROM pois WHERE code IN (
--   'POI_NHA_RONG','POI_CAU_MONG','POI_CONG_VIEN_KHANH_HOI',
--   'POI_NHA_THO_VINH_HOI','POI_DINH_VINH_HOI','POI_CHO_XOM_CHIEU'
-- ) ORDER BY code;
