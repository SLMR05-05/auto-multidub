# Luồng tạo POI hoàn chỉnh

## Sử dụng CMS

1. Đăng nhập bằng tài khoản `ADMIN` hoặc `EDITOR`, vào `/cms/poi/editor`.
2. Nhập tên, phường/trạm (tùy chọn), chọn vị trí bằng click/kéo marker hoặc nhập tọa độ.
   Bản đồ hiển thị bán kính thật và các vùng chồng lấn để điều chỉnh mức ưu tiên.
3. Soạn nội dung trong các tab ngôn ngữ. Tiếng Việt là nền bắt buộc khi xuất bản;
   các ngôn ngữ khác có thể bổ sung sau. Có thể nghe thử TTS (Piper cho tiếng Việt,
   giọng Web Speech trên thiết bị cho ngôn ngữ khác).
4. Chọn ảnh JPG/PNG/WebP ≤5 MB và audio MP3/M4A/AAC ≤20 MB theo ngôn ngữ.
   File có bản xem/nghe thử; file mới được tải khi bấm Lưu.
5. **Lưu nháp/Lưu toàn bộ** lưu thông tin cơ bản và tất cả bản dịch trong một transaction,
   rồi upload file vào ID POI đã tạo. Nếu một upload lỗi, form và các file còn chờ được giữ
   trong trang; thử lại dùng cùng ID, không upload lại các file đã thành công.
6. Với ảnh đã tải, có thể đổi thứ tự, đặt ảnh bìa, xóa ngay. Audio có thể thay thế hoặc xóa.
   Sau lần lưu đầu tiên, có thể thêm POI vào Tour và tạo/tải QR.
7. **Lưu và đánh dấu Ready** lưu dữ liệu rồi chạy kiểm tra và đánh dấu `READY`.
   Sửa nội dung/media của POI `READY` đưa về `DRAFT` để kiểm tra lại.
8. **Lưu và xuất bản** luôn lưu toàn bộ form trước khi xuất bản. Hoặc chọn POI ở
   `/cms/publish` để xuất bản nhiều điểm tại cùng một `DATA_VERSION`.

### Publish Gate

- Tọa độ: latitude −90..90, longitude −180..180.
- Bán kính 20..300 m, priority nguyên 1..5.
- Cooldown tùy chọn: 1..1440 phút; để trống dùng cấu hình hệ thống (mặc định 30).
- Tiêu đề và mô tả tiếng Việt; ít nhất audio **hoặc** kịch bản TTS tiếng Việt.
- POI lưu trữ không được xuất bản.
- Xuất bản theo danh sách là all-or-nothing: nếu một điểm thiếu dữ liệu, chưa điểm nào
  được xuất bản, không tăng version và không tạo job offline.
- Quyền xuất bản là `ADMIN`/`EDITOR`, nhất quán với RBAC đang có.

## Offline và đồng bộ

- Transaction xuất bản cập nhật trạng thái, version, audit và tạo 7 job `BUILDING` trong
  database. Job không xuất hiện khi transaction rollback.
- `OfflinePackageWorker` xử lý ở nền mỗi 2 giây (cấu hình
  `app.offline-packages.build-delay-ms`). Job còn `BUILDING` sau restart được xử lý tiếp.
- Mỗi job khóa bản ghi khi build và đọc dữ liệu bằng transaction `REPEATABLE_READ`.
  Nếu có phiên bản mới trong lúc chờ, gói lấy snapshot mới nhất lúc bắt đầu build;
  `dataVersion` trong manifest và bản ghi gói phản ánh chính snapshot đó.
- ZIP gồm manifest, ảnh, audio theo ngôn ngữ/fallback và checksum SHA-256.
  Thiếu file đã được tham chiếu làm job `FAILED`, thay vì phát hành gói thiếu media.
- Trang xuất bản hiển thị trạng thái, tải ZIP, checksum và thao tác thử lại gói lỗi.
- Ứng dụng khách nhận POI `PUBLISHED` qua `/api/v1/app/sync`; `DRAFT`/`READY` không được công khai.

## Database

`PoiStatus` gồm `DRAFT`, `READY`, `PUBLISHED`, `ARCHIVED`. Cấu hình hiện tại
`spring.jpa.hibernate.ddl-auto=update` cập nhật enum khi khởi động backend.
Nếu triển khai bằng `validate/none`, chạy
[`migrations/20261118-poi-ready.sql`](migrations/20261118-poi-ready.sql) trước khi deploy.

## Kiểm chứng

Backend (H2 và thư mục lưu test riêng):

```sh
mvn test
```

Frontend:

```sh
cd frontend
npm ci
npm run typecheck
npx playwright install chromium
npm run test:e2e
```

Playwright tự khởi động Spring Boot profile `e2e` tại `18080`, Next.js tại `13000`,
database H2 riêng và media trong `target/e2e-storage`. Cần Java 21+, Maven và Node 20+.
CMS/API dùng dữ liệu thật trong môi trường test; chỉ tile bản đồ/CDN ngoài được thay bằng fixture.

Các kịch bản gồm bản đồ, đa ngôn ngữ, media, ảnh bìa/thứ tự, Ready, Tour/QR, xuất bản
tập trung, ZIP offline, lỗi Publish Gate, lưu thay đổi cơ bản trước xuất bản, retry upload
không tạo trùng POI/ảnh, và upload thực từ kho audio.

Ảnh chụp/trace nằm trong `frontend/test-results`; báo cáo HTML trong
`frontend/playwright-report`. Các thư mục này không được commit.
