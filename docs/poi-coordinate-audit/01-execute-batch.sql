-- =============================================================================
-- FILE: 01-execute-batch.sql
-- PHIÊN BẢN: v6.3
-- MỤC ĐÍCH: Gọi stored procedure thực thi cập nhật tọa độ 6 POI Quận 4.
--
-- ĐIỀU KIỆN TIÊN QUYẾT TRƯỚC KHI CHẠY FILE NÀY:
--   [x] 00-install-procedures.sql đã được chạy thành công
--   [x] DBA/người có thẩm quyền đã phê duyệt batch này (ticket/CR/review record)
--   [x] Database đã được backup (hoặc dump gần nhất đã được xác nhận)
--   [x] Chạy trên Development DB và đã kiểm thử các tình huống lỗi
--   [x] Thời gian bảo trì đã được thông báo (nếu chạy trên Production)
--
-- CẢNH BÁO:
--   - File này CHỈ chứa lệnh CALL. Không có DDL.
--   - Procedure sẽ tự COMMIT khi thành công (Hướng A – atomic).
--   - Nếu cần phê duyệt thủ công trước commit, phải dùng Hướng B (tách giai đoạn).
-- =============================================================================

-- Thay thế batch_id bằng giá trị duy nhất cho lần chạy này (ISO 8601 + mã phiên)
-- Ví dụ: 'POI_Q4_COORD_20261117_001'
CALL `sp_execute_poi_coordinate_batch`(
  'POI_Q4_COORD_20261117_001',
  'Update coordinates for 6 Q4 POIs: Activation Anchors from OSM Shoelace centroids (v6.3, PARTIALLY_VERIFIED)'
);

-- Sau khi CALL thành công, kiểm tra kết quả:
-- SELECT * FROM `_poi_change_batches` WHERE batch_id = 'POI_Q4_COORD_20261117_001';
-- SELECT * FROM `_poi_coordinate_snapshots` WHERE batch_id = 'POI_Q4_COORD_20261117_001';
-- SELECT code, latitude, longitude, radius_meters, version FROM pois WHERE code IN (
--   'POI_NHA_RONG','POI_CAU_MONG','POI_CONG_VIEN_KHANH_HOI',
--   'POI_NHA_THO_VINH_HOI','POI_DINH_VINH_HOI','POI_CHO_XOM_CHIEU'
-- ) ORDER BY code;
