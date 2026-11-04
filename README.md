# Auto Narration Backend (Multilingual Travel Guide)

Backend REST API cho PRD **“Hệ thống Thuyết minh tự động (Auto-narration System) v1.1”**, xây dựng bằng **Java 21 + Spring Boot 3.4**, kiến trúc 3 lớp **Controller → Service → Repository**, MySQL và JWT.

Repo này triển khai **phần Backend API** của PRD. Ứng dụng Android (geofence engine, audio queue, SQLite offline, App Links) và giao diện Web CMS không nằm trong repo này; backend cung cấp đầy đủ API để hai client đó tích hợp.

Các module cũ (`Location`, `Guide`, `Translation`, `Audio`, `History`) vẫn được giữ nguyên để không phá vỡ API hiện có. Module mới dùng entity `Poi` làm trung tâm.

---

## 1. Tính năng

### Nội dung & CMS

- Quản lý POI: tạo, sửa, soft-delete (`ARCHIVED`), tìm kiếm, lọc theo trạng thái/khu phố, lọc POI thiếu bản dịch hoặc thiếu audio.
- Quản lý 7 ngôn ngữ: `vi`, `en`, `zh-CN`, `th`, `hi`, `ko`, `ja`; tiếng Việt là ngôn ngữ gốc.
- Bản dịch POI theo từng ngôn ngữ (tên, mô tả, script TTS), nhập/xuất CSV.
- Tải audio theo ngôn ngữ, tải ảnh, sắp xếp ảnh, chọn ảnh cover; nén ảnh JPG/PNG bằng Thumbnailator.
- Kiểm tra độ phủ nội dung (translation / audio / TTS) theo từng POI và toàn hệ thống.
- Quản lý Tour: tạo, sửa, gán thứ tự POI, publish, archive.
- Quản lý phường/khu vực và trạm dừng xe buýt.
- Sinh QR Code Base62 (10 ký tự), xuất PNG/SVG và bản in PNG; QR trỏ tới `https://<domain>/q/<code>`.
- Xuất bản nội dung: kiểm tra điều kiện publish và tăng `data_version` toàn cục.
- Gói dữ liệu offline: ZIP gồm `manifest.json`, audio, ảnh và checksum SHA-256.
- Audit log append-only, phân quyền RBAC, quản lý tài khoản CMS.
- Cấu hình tham số hệ thống qua API.

### API cho Mobile App (ẩn danh)

- Đồng bộ vi sai (delta sync) theo `sinceVersion`.
- Danh sách/chi tiết POI đã publish, fallback ngôn ngữ.
- Kiểm tra geofence tham chiếu (priority, khoảng cách, approach margin).
- Resolve QR code.
- Ghi nhận playback log theo lô, idempotent bằng UUID.
- Tracking session + location points (chỉ khi người dùng bật consent).
- Quản lý consent, xóa toàn bộ dữ liệu theo `device_id`.
- Tải gói offline.

### Analytics & vận hành

- Dashboard tổng quan: sessions, lượt nghe, lượt nghe hợp lệ, QR scans, thiết bị.
- Top POI, heatmap, transition giữa các POI, thống kê QR, export CSV.
- Ẩn danh: cắt 100 m đầu/cuối mỗi hành trình, ẩn ô heatmap có dưới 5 thiết bị.
- Retention job: xóa location thô sau 90 ngày, playback log sau 12 tháng.
- Khóa tài khoản tạm thời sau 5 lần đăng nhập sai trong 15 phút.

---

## 2. Công nghệ

| Thành phần | Công nghệ |
|---|---|
| Runtime | Java 21 |
| Framework | Spring Boot 3.4.5 (Web, Security, Data JPA, Validation) |
| Database | MySQL 8.x; H2 cho test |
| Auth | JWT (HS384), BCrypt |
| Dịch văn bản (legacy) | LibreTranslate (`/translate`) |
| TTS (legacy) | Piper qua Python (`python -m piper`) |
| QR | ZXing 3.5.3 |
| Ảnh | Thumbnailator 0.4.20 |
| Audio metadata | jaudiotagger 3.0.1 |
| Docs | springdoc OpenAPI / Swagger UI |

---

## 3. Phân quyền

| Role | Quyền |
|---|---|
| `ADMIN` | Toàn quyền, quản lý user CMS & du khách, audit log, settings |
| `EDITOR` | POI, media, translation, tour, geography, QR, publish, package |
| `ANALYST` | Chỉ đọc dashboard, playback log, analytics, export CSV |
| `USER` | Du khách đăng nhập Web App: nghe thuyết minh, yêu thích POI, Voice AI, quản lý hồ sơ |

Web App của du khách **bắt buộc đăng nhập tài khoản** (Email & Password hoặc Google OAuth 2.0 / Apple ID / Facebook). Sau khi đăng nhập, các API du khách sẽ gắn kèm `user_id` bên cạnh `device_id` UUID để đồng bộ trải nghiệm xuyên suốt.

---

## 4. Tham số hệ thống mặc định

Các giá trị được seed vào bảng `system_settings` và trả về qua `GET /api/v1/app/config`.

| Key | Mặc định | Ý nghĩa |
|---|---:|---|
| `data_version` | 1 | Phiên bản dữ liệu publish toàn cục |
| `debounce_seconds` | 3 | Thời gian chờ trong geofence trước khi ENTER |
| `hysteresis_factor` | 1.2 | Hệ số bán kính khi LEAVE |
| `cooldown_minutes` | 30 | Cooldown phát lại tự động |
| `gps_accuracy_threshold_m` | 50 | Ngưỡng loại bỏ GPS kém chính xác |
| `gps_jump_speed_kmh` | 120 | Loại bỏ dịch chuyển bất khả thi |
| `audio_queue_capacity` | 3 | Số item tối đa trong queue |
| `audio_queue_ttl_seconds` | 60 | TTL của item trong queue |
| `min_valid_listen_seconds` | 5 | Ngưỡng lượt nghe hợp lệ |
| `location_interval_moving_seconds` | 10 | Chu kỳ tracking khi di chuyển |
| `location_interval_stationary_seconds` | 60 | Chu kỳ tracking khi đứng yên |
| `raw_location_retention_days` | 90 | Thời gian giữ location thô |
| `playback_log_retention_months` | 12 | Thời gian giữ playback log |
| `approach_margin_m` | 30 | Vùng “approaching” quanh geofence |
| `default_language` | `vi` | Ngôn ngữ gốc |

Giới hạn POI: bán kính **20–300 m**, priority **1–5**; cooldown có thể override theo từng POI.

---

## 5. Quy tắc publish

`POST /api/v1/admin/pois/{id}/publish` chỉ publish khi:

1. Có bản dịch tiếng Việt với `name` và `description`.
2. Có audio tiếng Việt **hoặc** script TTS tiếng Việt.
3. Bán kính trong khoảng 20–300 m.
4. Priority trong khoảng 1–5.
5. Tọa độ hợp lệ.

Publish thành công sẽ tăng `data_version` và gán version mới cho POI. Sửa nội dung của POI đã publish (translation, audio, ảnh, thông tin geofence) cũng tăng version để mobile nhận thay đổi qua delta sync. Sửa draft không tăng version.

`POST /api/v1/admin/publish` kiểm tra lại toàn bộ POI đang publish và tăng `data_version` **một lần** — dùng cho nút “Xuất bản” trên CMS.

POI bị archive sẽ được trả về trong delta sync với `status = ARCHIVED` để client xóa khỏi SQLite. Archive bị chặn nếu POI đang thuộc Tour hoặc có QR đang active, trừ khi dùng `?force=true`.

---

## 6. Delta sync

`GET /api/v1/app/sync?sinceVersion=<n>&lang=<code>`

- `sinceVersion = 0`: trả toàn bộ POI đang publish, Tour đang publish, toàn bộ QR và gói offline READY.
- `sinceVersion > 0`: trả POI/Tour/QR có version lớn hơn `n`, bao gồm bản ghi đã archive hoặc QR đã disable.
- Response chứa `dataVersion` hiện tại, `config` (7 ngôn ngữ + settings), `pois`, `tours`, `qrCodes`, `offlinePackages`.
- Mỗi POI có `version`, `missingTranslation`, `localizedName` (tên theo `lang` nếu có, fallback về tiếng Việt), danh sách audio/ảnh/tour liên quan.
- Client nên lưu `dataVersion` sau khi áp dụng thành công; lần sync sau gửi lại giá trị đó.

QR code bị “xóa” sẽ được **deactivate** thay vì hard-delete, vì mã vật lý đã in không thể thu hồi; delta sync sẽ gửi `active = false`.

---

## 7. Cài đặt & chạy local

### Yêu cầu

- JDK 21
- Maven 3.9+
- MySQL 8.x (hoặc Docker Desktop)
- Python + Piper nếu dùng TTS legacy
- LibreTranslate nếu dùng translation legacy

### Tạo database

```sql
CREATE DATABASE multilingual_travel_guide
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

### Biến môi trường

Tạo file `.env` từ `.env.example`, hoặc set biến trong PowerShell:

```powershell
$env:DB_URL="jdbc:mysql://localhost:3306/multilingual_travel_guide?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Ho_Chi_Minh"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your_mysql_password"
$env:JWT_SECRET="change-this-to-a-random-secret-with-at-least-32-bytes"
$env:ADMIN_EMAIL="admin@example.com"
$env:ADMIN_PASSWORD="ChangeMe123!"
$env:APP_QR_BASE_URL="http://localhost:8080/q/"
$env:CORS_ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173"
mvn spring-boot:run
```

API: `http://localhost:8080`
Swagger UI: `http://localhost:8080/swagger-ui.html`

Lần đầu chạy, Hibernate tự tạo/cập nhật bảng (`ddl-auto: update`). Production nên chuyển sang Flyway/Liquibase.

### Biến cấu hình chính

| Biến | Mặc định | Mô tả |
|---|---|---|
| `SERVER_PORT` | 8080 | Cổng API |
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | — | Kết nối MySQL |
| `JWT_SECRET` | dev secret | Phải đổi khi deploy |
| `JWT_EXPIRATION_MS` | 86400000 | Hạn JWT |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | trống | Seed admin đầu tiên |
| `AUDIO_DIRECTORY` | `./storage/audio` | Audio legacy + audio POI |
| `IMAGE_DIRECTORY` | `./storage/images` | Ảnh POI |
| `PACKAGE_DIRECTORY` | `./storage/packages` | Gói offline ZIP |
| `APP_QR_BASE_URL` | `https://auto-narration.local/q/` | URL nhúng trong QR |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000,http://localhost:5173` | Origin CMS được phép |
| `GOOGLE_CLIENT_ID` | — | Client ID xác thực Google OAuth 2.0 |
| `GOOGLE_CLIENT_SECRET` | — | Secret xác thực Google OAuth 2.0 |
| `LIBRETRANSLATE_BASE_URL` | `http://127.0.0.1:5001` | LibreTranslate legacy |
| `PIPER_PYTHON_COMMAND` | `python` | Lệnh Python cho Piper |
| `PIPER_MODEL` | `vi_VN-vais1000-medium` | Model Piper |

### Docker

```powershell
Copy-Item .env.example .env
# sửa mật khẩu/secret trong .env
docker compose up --build
```

MySQL expose ở host port `3307`, API ở `8080`. Volume `audio_data`, `image_data`, `package_data` giữ file qua các lần restart.

---

## 8. API chính

### 8.1 Xác thực & Tài khoản Du khách (Auth & User Profile)

| Method | URL | Quyền | Ý nghĩa |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Public | Đăng ký tài khoản Email & Mật khẩu |
| POST | `/api/v1/auth/login` | Public | Đăng nhập Email & Mật khẩu, nhận JWT Access + Refresh Token |
| POST | `/api/v1/auth/oauth2/google` | Public | Đăng nhập một chạm bằng Google ID Token |
| POST | `/api/v1/auth/oauth2/apple` | Public | Đăng nhập qua Apple ID |
| POST | `/api/v1/auth/oauth2/facebook` | Public | Đăng nhập qua Facebook Login |
| POST | `/api/v1/auth/refresh` | Public | Làm mới Access Token bằng Refresh Token |
| POST | `/api/v1/auth/logout` | Login | Đăng xuất và thu hồi Refresh Token |
| GET | `/api/v1/user/profile` | Login | Xem thông tin hồ sơ người dùng |
| PUT | `/api/v1/user/profile` | Login | Cập nhật hồ sơ (tên, avatar, điện thoại) |
| GET | `/api/v1/user/favorites` | Login | Danh sách POI yêu thích của du khách |
| POST | `/api/v1/user/favorites/{poiId}` | Login | Thêm POI vào danh sách yêu thích |
| DELETE | `/api/v1/user/favorites/{poiId}` | Login | Xóa POI khỏi danh sách yêu thích |
| GET | `/api/v1/languages` | Public | 7 ngôn ngữ PRD |

### 8.2 POI & media (CMS)

| Method | URL | Quyền | Ý nghĩa |
|---|---|---|---|
| GET | `/api/v1/admin/pois` | ADMIN/EDITOR | Tìm kiếm, lọc, phân trang POI |
| POST | `/api/v1/admin/pois` | ADMIN/EDITOR | Tạo POI (DRAFT) |
| GET/PUT/DELETE | `/api/v1/admin/pois/{id}` | ADMIN/EDITOR | Xem/sửa/archive POI |
| POST | `/api/v1/admin/pois/{id}/publish` | ADMIN/EDITOR | Publish một POI |
| GET | `/api/v1/admin/pois/{id}/translations` | ADMIN/EDITOR | Danh sách bản dịch |
| PUT/DELETE | `/api/v1/admin/pois/{id}/translations/{lang}` | ADMIN/EDITOR | Upsert/xóa bản dịch |
| GET | `/api/v1/admin/pois/{id}/coverage` | ADMIN/EDITOR | Độ phủ 7 ngôn ngữ |
| GET | `/api/v1/admin/pois/coverage/all` | ADMIN/EDITOR | Độ phủ toàn bộ POI |
| POST | `/api/v1/admin/pois/{id}/audio?lang=vi` | ADMIN/EDITOR | Upload audio |
| DELETE | `/api/v1/admin/pois/{id}/audio/{lang}` | ADMIN/EDITOR | Xóa audio |
| POST | `/api/v1/admin/pois/{id}/images` | ADMIN/EDITOR | Upload ảnh |
| PUT | `/api/v1/admin/pois/{id}/images/order` | ADMIN/EDITOR | Sắp xếp ảnh |
| PUT | `/api/v1/admin/pois/{id}/images/{imageId}/cover` | ADMIN/EDITOR | Chọn cover |
| DELETE | `/api/v1/admin/pois/{id}/images/{imageId}` | ADMIN/EDITOR | Xóa ảnh |

### 8.3 Publish, settings, translation CSV

| Method | URL | Quyền | Ý nghĩa |
|---|---|---|---|
| POST | `/api/v1/admin/publish` | ADMIN/EDITOR | Validate toàn bộ POI publish + tăng version |
| GET | `/api/v1/admin/settings` | ADMIN/EDITOR | Xem settings |
| PUT | `/api/v1/admin/settings/{key}` | ADMIN | Cập nhật setting (không cho sửa `data_version`) |
| GET | `/api/v1/admin/translations/export.csv` | ADMIN/EDITOR | Export ma trận bản dịch |
| POST | `/api/v1/admin/translations/import` | ADMIN/EDITOR | Import CSV |

### 8.4 Tour, geography, QR, package

| Method | URL | Quyền | Ý nghĩa |
|---|---|---|---|
| GET/POST | `/api/v1/admin/tours` | ADMIN/EDITOR | Danh sách/tạo Tour |
| GET/PUT/DELETE | `/api/v1/admin/tours/{id}` | ADMIN/EDITOR | Xem/sửa/archive Tour |
| PUT | `/api/v1/admin/tours/{id}/pois` | ADMIN/EDITOR | Gán danh sách POI theo thứ tự |
| POST | `/api/v1/admin/tours/{id}/publish` | ADMIN/EDITOR | Publish Tour |
| GET/POST | `/api/v1/admin/wards` | ADMIN/EDITOR | Phường/khu vực |
| PUT/DELETE | `/api/v1/admin/wards/{id}` | ADMIN/EDITOR | Sửa/xóa phường |
| GET/POST | `/api/v1/admin/bus-stops` | ADMIN/EDITOR | Trạm dừng |
| PUT/DELETE | `/api/v1/admin/bus-stops/{id}` | ADMIN/EDITOR | Sửa/xóa trạm |
| GET/POST | `/api/v1/admin/qr-codes` | ADMIN/EDITOR | Danh sách/tạo QR |
| GET | `/api/v1/admin/qr-codes/{id}/image?format=png\|svg&size=512` | ADMIN/EDITOR | Ảnh QR |
| GET | `/api/v1/admin/qr-codes/{id}/print` | ADMIN/EDITOR | Ảnh in kèm caption |
| PUT | `/api/v1/admin/qr-codes/{id}/active?active=true` | ADMIN/EDITOR | Bật/tắt QR |
| DELETE | `/api/v1/admin/qr-codes/{id}` | ADMIN/EDITOR | Deactivate QR |
| GET | `/api/v1/admin/qr-codes/stats` | ADMIN/EDITOR | Thống kê lượt quét |
| GET/POST | `/api/v1/admin/offline-packages` | ADMIN/EDITOR | Danh sách/tạo gói offline |
| GET | `/api/v1/admin/offline-packages/{id}/download` | ADMIN/EDITOR | Tải ZIP |
| DELETE | `/api/v1/admin/offline-packages/{id}` | ADMIN/EDITOR | Xóa gói |

### 8.5 Analytics, audit, users

| Method | URL | Quyền | Ý nghĩa |
|---|---|---|---|
| GET | `/api/v1/admin/analytics/dashboard` | ADMIN/ANALYST | Dashboard |
| GET | `/api/v1/admin/analytics/top-pois` | ADMIN/ANALYST | Top POI |
| GET | `/api/v1/admin/analytics/heatmap` | ADMIN/ANALYST | Heatmap đã ẩn danh |
| GET | `/api/v1/admin/analytics/transitions` | ADMIN/ANALYST | Chuyển tiếp giữa POI |
| GET | `/api/v1/admin/analytics/export.csv` | ADMIN/ANALYST | Export CSV tổng hợp |
| GET | `/api/v1/admin/playback-logs` | ADMIN/ANALYST | Lịch sử phát |
| GET | `/api/v1/admin/audit-logs` | ADMIN | Audit log |
| GET/POST | `/api/v1/admin/users` | ADMIN | Danh sách/tạo user CMS |
| PUT | `/api/v1/admin/users/{id}` | ADMIN | Sửa role/trạng thái |
| PUT | `/api/v1/admin/users/{id}/password` | ADMIN | Reset mật khẩu |

### 8.6 Mobile App (public, anonymous)

| Method | URL | Ý nghĩa |
|---|---|---|
| GET | `/api/v1/app/config` | 7 ngôn ngữ + settings + dataVersion |
| GET | `/api/v1/app/sync?sinceVersion=&lang=` | Delta sync |
| GET | `/api/v1/app/pois?lang=&tourId=&lat=&lng=&maxDistanceMeters=&limit=` | Danh sách POI publish |
| GET | `/api/v1/app/pois/{id}?lang=` | Chi tiết POI + audio/ảnh/tour |
| GET | `/api/v1/app/geofence?lat=&lng=&lang=` | Kiểm tra geofence tham chiếu |
| GET | `/api/v1/app/tours`, `/api/v1/app/tours/{id}` | Tour publish |
| GET | `/api/v1/app/qr/{code}?lang=` | Resolve QR |
| POST | `/api/v1/app/playback-logs` | Gửi playback log theo lô |
| POST | `/api/v1/app/tracking/sessions` | Bắt đầu tracking session |
| POST | `/api/v1/app/tracking/sessions/{id}/points` | Gửi location points |
| POST | `/api/v1/app/tracking/sessions/{id}/end` | Kết thúc session |
| GET | `/api/v1/app/devices/{deviceId}` | Trạng thái consent |
| PUT | `/api/v1/app/devices/{deviceId}/consent` | Bật/tắt consent |
| DELETE | `/api/v1/app/devices/{deviceId}/data` | Xóa dữ liệu thiết bị |
| GET | `/api/v1/app/offline-packages/{id}/download` | Tải gói offline |
| GET | `/q/{code}?lang=` | QR landing URL fallback |
| GET | `/api/v1/media/audio/{id}`, `/api/v1/media/images/{id}` | Media public |

---

## 9. Ví dụ luồng CMS → Mobile

```powershell
# 1. Đăng nhập
$login = @{ email = "admin@example.com"; password = "ChangeMe123!" } | ConvertTo-Json
$token = (Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/v1/auth/login" `
  -ContentType "application/json" -Body $login).token

$headers = @{ Authorization = "Bearer $token" }

# 2. Tạo POI
$poi = @{
  name = "Bến Nhà Rồng"
  wardId = 1
  latitude = 10.7681
  longitude = 106.7065
  radiusMeters = 50
  priority = 5
} | ConvertTo-Json

$created = Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/v1/admin/pois" `
  -Headers $headers -ContentType "application/json" -Body $poi

# 3. Nhập bản dịch tiếng Việt
$translation = @{
  name = "Bến Nhà Rồng"
  description = "Di tích lịch sử bên sông Sài Gòn."
  ttsScript = "Chào mừng bạn đến với Bến Nhà Rồng."
} | ConvertTo-Json

Invoke-RestMethod -Method Put `
  -Uri "http://localhost:8080/api/v1/admin/pois/$($created.id)/translations/vi" `
  -Headers $headers -ContentType "application/json" -Body $translation

# 4. Publish
Invoke-RestMethod -Method Post `
  -Uri "http://localhost:8080/api/v1/admin/pois/$($created.id)/publish" -Headers $headers

# 5. Mobile sync
Invoke-RestMethod -Method Get `
  -Uri "http://localhost:8080/api/v1/app/sync?sinceVersion=0&lang=vi"
```

Playback log gửi theo lô, mỗi item có `id` UUID do client sinh; gửi lại cùng `id` sẽ được tính là duplicate và bỏ qua:

```json
{
  "logs": [{
    "id": "5c1d0f0e-6d1e-4f0e-9d5a-0e6f2a1b3c4d",
    "deviceId": "0f0e0d0c-0b0a-4908-8706-050403020100",
    "poiId": 1,
    "triggerType": "GPS",
    "audioMode": "AUDIO",
    "languageCode": "vi",
    "startTime": "2026-11-03T10:00:00",
    "endTime": "2026-11-03T10:01:12",
    "listenedSeconds": 72,
    "completed": true
  }]
}
```

---

## 10. Quyền riêng tư & lưu trữ

- `device_id` là UUID ẩn danh do app sinh; backend không lưu thông tin cá nhân.
- Consent mặc định **tắt** khi thiết bị xuất hiện lần đầu; app phải gọi `PUT /api/v1/app/devices/{deviceId}/consent` với `analyticsConsent = true` sau khi người dùng đồng ý. Tắt consent sẽ chặn ghi location mới.
- `DELETE /api/v1/app/devices/{deviceId}/data` xóa playback log, tracking session, location point và device record.
- Heatmap cắt 100 m đầu/cuối mỗi hành trình và chỉ trả ô có ≥ 5 thiết bị.
- CSV analytics chỉ chứa số liệu tổng hợp, không có raw device id hay tọa độ thô.
- Retention job chạy 03:00 hằng ngày; có thể chỉnh qua `raw_location_retention_days` và `playback_log_retention_months`.
- Gói offline chỉ chứa nội dung đã publish.

---

## 11. Kiểm thử

```powershell
mvn test
mvn -DskipTests package
```

Test hiện có:

- `ApiFlowTests`: login → tạo POI → translation → publish → public detail/fallback → delta sync → geofence → QR resolve → playback idempotent → analytics → CSV import.
- `AnalyticsServiceTest`: kiểm tra cắt 100 m đầu/cuối.
- `TranslationCsvServiceTest`: parser CSV có quote/comma/CRLF.
- `GeoUtilsTest`, `CodeUtilsTest`.
- `TravelGuideApplicationTests`: context load với H2.

Test dùng H2 (`src/test/resources/application-test.yml`) và seed admin `admin@test.local` / `Admin123!`.

---

## 12. Phạm vi PRD & giới hạn hiện tại

### Đã triển khai ở backend

- POI, geofence params, priority, cooldown override.
- 7 ngôn ngữ, translation matrix, CSV import/export, coverage.
- Audio/image upload, cover image, media public.
- Tour + thứ tự POI, bus stop, ward.
- QR generation (PNG/SVG/print), resolve, deactivate, stats.
- Publish gate + global `data_version`, delta sync.
- Playback log idempotent, tracking session, consent, delete device data.
- Analytics dashboard/top/heatmap/transitions/QR/CSV.
- Offline package ZIP + manifest + SHA-256.
- Audit log, RBAC, user management, login lockout, retention job.

### Thuộc client / chưa triển khai trong repo này

- Android geofence engine, debounce/hysteresis, audio queue/cooldown, TTS playback, SQLite offline, App Links, camera QR scanner.
- Web CMS UI (React/Vue…) và màn hình dashboard.
- TTS đa ngôn ngữ thực tế: backend chỉ cung cấp script TTS + audio upload; TTS legacy dùng Piper tiếng Việt.
- Gói offline hiện là **full rebuild** theo scope/language, chưa phải gói delta thật; client có thể dùng checksum + `data_version` để kiểm tra.
- Ảnh WebP được lưu nguyên bản (không nén) do ImageIO/Thumbnailator thiếu plugin WebP.
- Heatmap hiện lọc theo khoảng ngày; filter theo giờ/ngày trong tuần/Tour là phần mở rộng của CMS.
- Chưa có Flyway/Liquibase, rate limit, object storage, refresh token; `ddl-auto: update` chỉ phù hợp dev/demo.

---

## 13. Cấu trúc thư mục

```
src/main/java/com/travelguide/
├── config/       Security, CORS, exception handler, data initializer
├── controller/   REST controllers (admin, app, QR, media, legacy)
├── dto/          Request/response records
├── entity/       JPA entities + enums
├── repository/   Spring Data JPA repositories
├── security/     JWT service/filter
├── service/      Business logic
└── util/         Geo, code, hash, language helpers
src/test/java/com/travelguide/   Unit + integration tests
src/main/resources/application.yml
src/test/resources/application-test.yml
```

---

## 14. Ghi chú vận hành

- File audio/ảnh/gói offline lưu trên filesystem; khi chạy nhiều instance cần chuyển sang S3/MinIO và dùng chung DB.
- `JWT_SECRET` phải là chuỗi ngẫu nhiên ≥ 32 byte khi deploy.
- Không commit `.env`, service account JSON, thư mục `storage/`.
- Swagger UI và OpenAPI dùng để thử API; các endpoint admin cần JWT.
