# POI Coordinate Audit – Summary v6.3

## Phạm vi
7 POI Quận 4, dự án Auto-Multidub. Chỉ 6 POI có cập nhật tọa độ; `POI_PHO_OC_VINH_KHANH` giữ nguyên do là tuyến đường tuyến tính.

## Phương pháp tính tọa độ
**Planar area-weighted Shoelace centroid** trên mặt phẳng equirectangular cục bộ, sau đó chọn **Visitor Activation Anchor** (gần cổng vào / điểm du khách tiếp cận) dựa trên centroid.

## Kết quả xác minh

| POI | OSM Way | OSM Object | Activation Anchor | Anchor→Centroid |
|-----|---------|------------|-------------------|-----------------|
| Bến Nhà Rồng | 808033616 | VERIFIED | PARTIALLY_VERIFIED | 9.56 m |
| Cầu Mống | 286297477 | VERIFIED | PARTIALLY_VERIFIED | 8.92 m |
| Công viên Khánh Hội | 682412572 | VERIFIED | PARTIALLY_VERIFIED | 24.56 m |
| Nhà thờ Vĩnh Hội | 166344439 | VERIFIED | PARTIALLY_VERIFIED | 2.53 m |
| Đình Vĩnh Hội | 187949842 | VERIFIED | PARTIALLY_VERIFIED | 0.25 m |
| Chợ Xóm Chiếu | 1538947028 | VERIFIED | PARTIALLY_VERIFIED | 0.38 m |
| Phố Ốc Vĩnh Khánh | 32578226 | VERIFIED_AS_ROAD | UNVERIFIED | N/A |

## Files hồ sơ

| File | Nội dung |
|------|----------|
| `00-install-procedures.sql` | DDL: tạo bảng audit + 2 Stored Procedures (v6.3) |
| `01-execute-batch.sql` | Chỉ chứa CALL sp_execute; không DDL |
| `02-rollback-batch.sql` | Chỉ chứa CALL sp_rollback; không DDL |
| `03-poi-coordinate-matrix.csv` | Ma trận tọa độ đầy đủ với raw centroid |
| `06-shoelace-calculation-audit-results.json` | Output JSON đầy đủ từ calc_shoelace.js v6.3 |
| `raw-osm-json/` | 6 file JSON nguyên bản từ OSM API v0.6 |

## Các vấn đề đã khắc phục trong v6.3

| Mã | Vấn đề | Trạng thái |
|----|--------|-----------|
| AUD6.2-01 | `FOUND_ROWS()` không đáng tin cậy | ✅ Sửa: COUNT(*) trước FOR UPDATE |
| AUD6.2-02 | Thứ tự khóa không nhất quán | ✅ Sửa: system_settings → batch → pois(id ASC) |
| AUD6.2-03 | INNER JOIN không phát hiện POI thiếu | ✅ Sửa: LEFT JOIN từ bảng expected |
| AUD6.2-04 | DDL DROP PROCEDURE trong file thực thi | ✅ Tách: 00-install / 01-execute / 02-rollback |
| AUD6.2-05 | Procedure tự COMMIT | ✅ Ghi nhận: Hướng A atomic; policy ngoài DB |
| AUD6.2-06 | Rollback thiếu post-check | ✅ Thêm: xác minh old_lat/lon/radius + old_version+2 |
| AUD6.2-08 | Snapshot chỉ kiểm tra số lượng | ✅ Thêm: LEFT JOIN xác minh chính xác 6 code |
| AUD6.2-09 | FK ON DELETE CASCADE trên snapshot | ✅ Sửa: ON DELETE RESTRICT |
| AUD6.2-10 | updated_at không được cập nhật | ✅ Ghi chú: ON UPDATE CURRENT_TIMESTAMP trên DB |
| AUD5-01..03 | Validation GIS node/ring/area | ✅ Có trong calc_shoelace.js v6.3 |
| GIS-new | Self-intersection detection | ✅ Thêm: kiểm tra giao cắt cạnh non-consecutive |
| GIS-new | Coordinate finite/bounds check | ✅ Thêm: isFinite + phạm vi địa lý |
| GIS-new | Distinct vertex count | ✅ Thêm: tối thiểu 3 đỉnh phân biệt |
| GIS-new | JSON structure validation | ✅ Thêm: kiểm tra data.elements, way, nodes |

## Giới hạn còn lại (cần thực địa / runtime test)
- **Activation Anchor**: Vẫn là `PARTIALLY_VERIFIED` – chưa có khảo sát thực địa GPS.
- **Self-intersection**: Thuật toán O(n²) đơn giản, đủ cho các polygon OSM nhỏ; không thay thế được thư viện GIS chuẩn cho polygon phức tạp.
- **Runtime DB**: Chưa chạy procedure trên Development DB; chưa kiểm thử tình huống lỗi (concurrent, duplicate batch, deadlock).

## Trạng thái phê duyệt
> ⚠️ **CHƯA ĐƯỢC PHÊ DUYỆT CHẠY TRÊN DATABASE** – cần kiểm thử trên Development DB trước.
