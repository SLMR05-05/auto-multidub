# Multilingual Travel Guide Backend

Backend REST API cho đề tài **Thuyết minh tự động đa ngôn ngữ**, viết bằng Java 21 + Spring Boot 3.4, kiến trúc 3 lớp (Controller → Service → Repository), MySQL, Google Cloud Translation và Text-to-Speech.

## 1. Chức năng hiện có

- Đăng ký, đăng nhập và JWT.
- Phân quyền USER / ADMIN.
- Quản lý địa điểm (ADMIN tạo/xóa, mọi người xem).
- Quản lý nội dung thuyết minh (ADMIN tạo, mọi người xem).
- Dịch văn bản bằng Google Cloud Translation.
- Tạo file MP3 bằng Google Cloud Text-to-Speech.
- Xem lịch sử dịch của tài khoản.
- Swagger UI.
- Docker Compose cho MySQL + Backend.
- GitHub Actions chạy build/test.

## 2. Yêu cầu trên Windows

Cài:
1. JDK 21.
2. Maven 3.9+ (hoặc dùng Maven Wrapper nếu tự thêm).
3. MySQL 8.x nếu chạy local, hoặc Docker Desktop nếu chạy bằng Docker.
4. IntelliJ IDEA hoặc VS Code (không bắt buộc).

Kiểm tra:
```powershell
java -version
mvn -version
```

## 3. Tạo database MySQL

Mở MySQL Workbench hoặc terminal và chạy:
```sql
CREATE DATABASE multilingual_travel_guide
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

Sửa thông tin `DB_USERNAME` và `DB_PASSWORD` trong biến môi trường hoặc trong cấu hình chạy IDE. Không commit mật khẩu thật lên Git.

## 4. Cấu hình Google Cloud

Google Cloud Translation và Text-to-Speech là dịch vụ tính phí theo mức sử dụng; cần bật billing cho project.

1. Tạo Google Cloud project.
2. Bật **Cloud Translation API** và **Cloud Text-to-Speech API**.
3. Tạo Service Account.
4. Cấp quyền phù hợp để gọi hai API (ví dụ quyền sử dụng Translation API và Text-to-Speech; tuân theo IAM tối thiểu cần thiết của tổ chức).
5. Tạo JSON key và lưu ngoài source code, ví dụ:
   `D:\secrets\travel-guide-service-account.json`
6. Thiết lập biến môi trường Windows:
```powershell
[Environment]::SetEnvironmentVariable(
  "GOOGLE_APPLICATION_CREDENTIALS",
  "D:\secrets\travel-guide-service-account.json",
  "User"
)
[Environment]::SetEnvironmentVariable(
  "GOOGLE_CLOUD_PROJECT_ID",
  "your-google-cloud-project-id",
  "User"
)
```
Đóng và mở lại terminal/IDE sau khi thiết lập.

**Không** đưa JSON key lên GitHub, không đặt trong `src/main/resources`.

## 5. Chạy local trên Windows

Mở PowerShell tại thư mục dự án:
```powershell
$env:DB_URL="jdbc:mysql://localhost:3306/multilingual_travel_guide?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Ho_Chi_Minh"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your_mysql_password"
$env:JWT_SECRET="change-this-to-a-random-secret-with-at-least-32-bytes"
$env:GOOGLE_CLOUD_PROJECT_ID="your-google-cloud-project-id"
$env:ADMIN_EMAIL="admin@example.com"
$env:ADMIN_PASSWORD="ChangeMe123!"
mvn spring-boot:run
```

API chạy tại `http://localhost:8080`.
Swagger: `http://localhost:8080/swagger-ui.html`.

Lần đầu chạy, Hibernate tự tạo/cập nhật bảng (`ddl-auto: update`). Với production nên dùng Flyway/Liquibase thay vì `update`.

## 6. Chạy bằng Docker

Tạo file `.env` từ `.env.example`, chỉnh mật khẩu và project ID. Tạo thư mục `secrets`, chép service account JSON thành `secrets/google-service-account.json`.

Chạy:
```powershell
docker compose up --build
```
MySQL được expose ở host port `3307`; API ở `8080`.

Nếu chưa cấu hình Google Cloud, ứng dụng vẫn khởi động được nhưng endpoint dịch/TTS sẽ báo lỗi cấu hình hoặc xác thực khi gọi.

## 7. API chính

| Method | URL | Quyền | Ý nghĩa |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Public | Đăng ký |
| POST | `/api/v1/auth/login` | Public | Đăng nhập |
| GET | `/api/v1/languages` | Public | Danh sách ngôn ngữ |
| GET | `/api/v1/locations` | Public | Danh sách địa điểm |
| GET | `/api/v1/locations/{id}` | Public | Chi tiết địa điểm |
| POST | `/api/v1/locations` | ADMIN | Tạo địa điểm |
| DELETE | `/api/v1/locations/{id}` | ADMIN | Xóa địa điểm |
| GET | `/api/v1/guides` | Public | Danh sách bài thuyết minh |
| GET | `/api/v1/guides/{id}` | Public | Chi tiết bài thuyết minh |
| POST | `/api/v1/guides` | ADMIN | Tạo bài thuyết minh |
| POST | `/api/v1/translations` | Login | Dịch văn bản |
| POST | `/api/v1/audio/synthesize` | Login | Tạo MP3 từ bản dịch |
| GET | `/api/v1/audio/{id}/stream` | Login | Nghe/tải MP3 |
| GET | `/api/v1/history` | Login | Lịch sử của mình |

Các API yêu cầu đăng nhập cần header:
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

## 8. Thử API bằng PowerShell

### Đăng ký
```powershell
$register = @{
  email = "user@example.com"
  password = "Password123!"
  fullName = "Travel User"
} | ConvertTo-Json

Invoke-RestMethod -Method Post `
  -Uri "http://localhost:8080/api/v1/auth/register" `
  -ContentType "application/json" -Body $register
```

### Đăng nhập
```powershell
$login = @{
  email = "user@example.com"
  password = "Password123!"
} | ConvertTo-Json

$result = Invoke-RestMethod -Method Post `
  -Uri "http://localhost:8080/api/v1/auth/login" `
  -ContentType "application/json" -Body $login

$token = $result.token
```

### Dịch văn bản
```powershell
$body = @{
  text = "Xin chào, chào mừng bạn đến với Thành phố Hồ Chí Minh."
  sourceLanguage = "vi"
  targetLanguage = "en"
} | ConvertTo-Json

Invoke-RestMethod -Method Post `
  -Uri "http://localhost:8080/api/v1/translations" `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" -Body $body
```

### Tạo giọng nói
Dùng `id` nhận được từ response dịch:
```powershell
$speech = @{
  translationId = 1
  voiceName = ""
} | ConvertTo-Json

Invoke-RestMethod -Method Post `
  -Uri "http://localhost:8080/api/v1/audio/synthesize" `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" -Body $speech
```

Response trả về `streamUrl`, mở URL đó để nghe MP3.

## 9. Kiến trúc 3 lớp

- **Controller**: nhận HTTP request, validate DTO, gọi Service.
- **Service**: xử lý nghiệp vụ, gọi Google Cloud, phối hợp Repository.
- **Repository**: truy cập MySQL qua Spring Data JPA.
- **Entity / DTO / Config / Security / Integration** là các nhóm hỗ trợ, không phải lớp nghiệp vụ thứ tư.

## 10. Lưu ý phạm vi bản khởi đầu

Đây là bộ khung backend đầy đủ để chạy và phát triển tiếp, không phải hệ thống production đã được kiểm thử tải/bảo mật. Trước khi triển khai thật cần bổ sung: migration Flyway, phân trang, rate limit/giới hạn ký tự để kiểm soát chi phí Google API, kiểm soát quyền sở hữu audio, refresh token, logging/monitoring, kiểm thử integration và backup. Endpoint audio hiện lưu MP3 trên ổ đĩa của server; triển khai nhiều instance nên chuyển sang object storage.
