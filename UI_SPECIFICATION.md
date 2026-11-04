# TÀI LIỆU ĐẶC TẢ GIAO DIỆN & CHỨC NĂNG FRONTEND (NEXT.JS)
## HỆ THỐNG THUYẾT MINH TỰ ĐỘNG & TRỢ LÝ VOICE AI ĐA NGÔN NGỮ
> **Dự án:** Auto-narration & AI Travel Companion System  
> **Phiên bản:** 2.1 (Cập nhật Xác thực Du khách Web App, Đăng nhập Google OAuth2 & Đa phương thức, CSDL 22 bảng)  
> **Nền tảng công nghệ**: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS, Lucide Icons, Web Speech API / MediaRecorder, Leaflet / MapLibre GL, NextAuth.js / Google Identity Services.

---

## MỤC LỤC
1. [Tổng quan Kiến trúc Routing Next.js](#1-tổng-quan-kiến-trúc-routing-nextjs)
2. [Bảng ánh xạ Màn hình & Mã Chức năng](#2-bảng-ánh-xạ-màn-hình--mã-chức-năng)
3. [Phân hệ Xác thực Người dùng & Du khách (Visitor Authentication)](#3-phân-hệ-xác-thực-người-dùng--du-khách-visitor-authentication)
   - [Màn 0A: Đăng nhập Du khách & Tích hợp Google OAuth (Visitor Login & Social Auth)](#màn-0a-đăng-nhập-du-khách--tích-hợp-google-oauth-visitor-login--social-auth)
   - [Màn 0B: Đăng ký tài khoản Du khách mới (Visitor Registration)](#màn-0b-đăng-ký-tài-khoản-du-khách-mới-visitor-registration)
4. [Phân hệ Du khách - Mobile-First / PWA (Visitor Experience)](#4-phân-hệ-du-khách---mobile-first--pwa-visitor-experience)
   - [Màn 1: Bản đồ tương tác & Khám phá (Interactive Map)](#màn-1-bản-đồ-tương-tác--khám-phá-interactive-map)
   - [Màn 2: Danh sách điểm thuyết minh (POI List View)](#màn-2-danh-sách-điểm-thuyết-minh-poi-list-view)
   - [Màn 3: Chi tiết điểm thuyết minh & Hỏi đáp POI (POI Detail & Context Q&A)](#màn-3-chi-tiết-điểm-thuyết-minh--hỏi-đáp-poi-poi-detail--context-qa)
   - [Màn 4: Trình quét mã QR hiện trường (QR Scanner)](#màn-4-trình-quét-mã-qr-hiện-trường-qr-scanner)
   - [Màn 5: Trợ lý đối đáp Voice AI & Dịch thuật trực tiếp (Voice AI Assistant & Translator)](#màn-5-trợ-lý-đối-đáp-voice-ai--dịch-thuật-trực-tiếp-voice-ai-assistant--translator)
   - [Màn 6: Tuyến Tour & Lộ trình tham quan (Tours & Route)](#màn-6-tuyến-tour--lộ-trình-tham-quan-tours--route)
   - [Màn 7: Trung tâm tải dữ liệu Offline (Offline Data Center)](#màn-7-trung-tâm-tải-dữ-liệu-offline-offline-data-center)
   - [Màn 8: Cài đặt hệ thống, Ngôn ngữ động & Quyền riêng tư (Settings)](#màn-8-cài-đặt-hệ-thống-ngôn-ngữ-động--quyền-riêng-tư-settings)
   - [Màn 8B: Hồ sơ Du khách, POI yêu thích & Tài khoản liên kết (User Profile & Favorites)](#màn-8b-hồ-sơ-du-khách-poi-yêu-thích--tài-khoản-liên-kết-user-profile--favorites)
5. [Phân hệ Quản trị & Vận hành - Web CMS (Admin & Management Portal)](#5-phân-hệ-quản-trị--vận-hành---web-cms-admin--management-portal)
   - [Màn 9: Đăng nhập quản trị an toàn (Secure Login)](#màn-9-đăng-nhập-quản-trị-an-toàn-secure-login)
   - [Màn 10: Dashboard tổng quan Analytics & Thống kê câu hỏi Voice AI](#màn-10-dashboard-tổng-quan-analytics--thống-kê-câu-hỏi-voice-ai)
   - [Màn 11: Bản đồ nhiệt (Heatmap) & Luồng di chuyển](#màn-11-bản-đồ-nhiệt-heatmap--luồng-di-chuyển)
   - [Màn 12: Quản lý danh sách POI (POI Registry)](#màn-12-quản-lý-danh-sách-poi-poi-registry)
   - [Màn 13: Soạn thảo POI & Cấu hình Geofence trực quan (POI Editor)](#màn-13-soạn-thảo-poi--cấu-hình-geofence-trực-quan-poi-editor)
   - [Màn 14: Quản lý danh mục Ngôn ngữ động (Dynamic Languages Registry)](#màn-14-quản-lý-danh-mục-ngôn-ngữ-động-dynamic-languages-registry)
   - [Màn 15: Ma trận độ phủ ngôn ngữ & Bản dịch (Language Coverage Matrix)](#màn-15-ma-trận-độ-phủ-ngôn-ngữ--bản-dịch-language-coverage-matrix)
   - [Màn 16: Quản lý File âm thanh & Thử nghiệm TTS (Audio Assets & TTS Playground)](#màn-16-quản-lý-file-âm-thanh--thử-nghiệm-tts-audio-assets--tts-playground)
   - [Màn 17: Quản lý Tuyến Tour tham quan (Tour Planner)](#màn-17-quản-lý-tuyến-tour-tham-quan-tour-planner)
   - [Màn 18: Quản lý Phường & Trạm dừng xe buýt (Wards & Bus Stops)](#màn-18-quản-lý-phường--trạm-dừng-xe-buýt-wards--bus-stops)
   - [Màn 19: Sinh & Quản lý in ấn mã QR (QR Code Studio)](#màn-19-sinh--quản-lý-in-ấn-mã-qr-qr-code-studio)
   - [Màn 20: Trung tâm xuất bản & Đóng gói Offline (Publish Gate & Packager)](#màn-20-trung-tâm-xuất-bản--đóng-gói-offline-publish-gate--packager)
   - [Màn 21: Phân quyền tài khoản & Nhật ký kiểm toán (Users & Audit Logs)](#màn-21-phân-quyền-tài-khoản--nhật-ký-kiểm-toán-users--audit-logs)
6. [Cấu trúc Thư mục Dự án Next.js chuẩn hóa](#6-cấu-trúc-thư-mục-dự-án-nextjs-chuẩn-hóa)

---

## 1. TỔNG QUAN KIẾN TRÚC ROUTING NEXT.JS

Hệ thống giao diện Next.js tổ chức thành **3 Route Groups độc lập**:

```text
src/app/
├── (auth)/                         # Layout Xác thực Người dùng & Du khách (MỚI)
│   ├── login/page.tsx              # SCR-00A: Đăng nhập Du khách (Email, Google, Apple, Facebook)
│   ├── register/page.tsx           # SCR-00B: Đăng ký tài khoản Du khách mới
│   └── forgot-password/page.tsx    # SCR-00C: Quên mật khẩu & Khôi phục tài khoản
│
├── (visitor)/                      # Layout Mobile-First cho Du khách (PWA / Responsive) - Yêu cầu Auth
│   ├── page.tsx                    # SCR-01: Bản đồ tương tác & Radar Geofence
│   ├── list/page.tsx               # SCR-02: Danh sách điểm POI & Bộ lọc
│   ├── poi/[id]/page.tsx           # SCR-03: Chi tiết POI & Nút hỏi đáp Voice AI
│   ├── qr/page.tsx                 # SCR-04: Trình quét mã QR Camera
│   ├── assistant/page.tsx          # SCR-05: Trợ lý đối đáp Voice AI & Dịch thuật trực tiếp
│   ├── tours/page.tsx              # SCR-06: Tuyến Tour & Lộ trình tham quan
│   ├── offline/page.tsx            # SCR-07: Trung tâm tải & Cập nhật gói Offline
│   ├── settings/page.tsx           # SCR-08: Cài đặt ngôn ngữ động & Quyền riêng tư
│   └── profile/page.tsx            # SCR-08B: Hồ sơ Du khách, POI yêu thích & Tài khoản liên kết (MỚI)
│
└── (cms)/                          # Layout Dashboard Web cho Quản trị viên & Biên tập viên
    ├── login/page.tsx              # SCR-09: Đăng nhập quản trị an toàn (RBAC)
    ├── dashboard/page.tsx          # SCR-10: Dashboard Analytics & Thống kê Voice AI
    ├── analytics/heatmap/page.tsx  # SCR-11: Bản đồ nhiệt (Heatmap) & Luồng di chuyển
    ├── poi/page.tsx                # SCR-12: Quản lý danh sách POI
    ├── poi/editor/[[...id]]/page.tsx# SCR-13: Soạn thảo POI & Cấu hình Geofence trực quan
    ├── languages/page.tsx          # SCR-14: Quản lý danh mục Ngôn ngữ động
    ├── translations/matrix/page.tsx# SCR-15: Ma trận độ phủ ngôn ngữ & Bản dịch
    ├── audio/page.tsx              # SCR-16: Quản lý Audio thu sẵn & Test TTS
    ├── tours/page.tsx              # SCR-17: Quản lý Tuyến Tour tham quan
    ├── bus-stops/page.tsx          # SCR-18: Quản lý Phường & Trạm dừng xe buýt
    ├── qr-codes/page.tsx           # SCR-19: Sinh & Quản lý in ấn mã QR
    ├── publish/page.tsx            # SCR-20: Cổng xuất bản & Build gói Offline
    └── users/page.tsx              # SCR-21: Tài khoản nhân sự CMS & Nhật ký Audit Log
```

> **Middleware Xác thực (`src/middleware.ts`)**:
> Next.js Middleware chặn và kiểm tra token phiên làm việc (JWT Cookie / Authorization Header). Nếu người dùng chưa đăng nhập khi truy cập bất kỳ route nào thuộc `(visitor)/*`, hệ thống tự động lưu URL đích và chuyển hướng tới `/(auth)/login?callbackUrl=...`.

---

## 2. BẢNG ÁNH XẠ MÀN HÌNH & MÃ CHỨC NĂNG

| Mã MH | Tên màn hình | Đường dẫn Route | Nhóm người dùng | Bảng DB liên quan | Mã chức năng PRD & Mở rộng |
|:---:|---|---|:---:|---|---|
| **SCR-00A** | **Đăng nhập Du khách & Social Auth** | `/login` | Du khách | `users`, `user_social_accounts`, `refresh_tokens` | **`FR-AUTH-01`, `FR-AUTH-02`, `FR-AUTH-03`, `FR-AUTH-04` (MỚI)** |
| **SCR-00B** | **Đăng ký tài khoản Du khách** | `/register` | Du khách | `users` | **`FR-AUTH-01` (MỚI)** |
| **SCR-01** | Bản đồ tương tác & Khám phá | `/` | Du khách | `pois`, `devices`, `playback_logs` | `FR-MAP-01` $\rightarrow$ `06`, `FR-GEO-09`, `FR-NAR-09`, `FR-NAR-12` |
| **SCR-02** | Danh sách điểm thuyết minh | `/list` | Du khách | `pois`, `poi_translations` | `FR-MAP-07` |
| **SCR-03** | Chi tiết POI & Hỏi đáp | `/poi/[id]` | Du khách | `pois`, `poi_translations`, `poi_audios`, `poi_images`, `user_favorites` | `FR-DET-01` $\rightarrow$ `05`, `FR-NAR-02`, `FR-AUTH-06` |
| **SCR-04** | Trình quét mã QR Camera | `/qr` | Du khách | `qr_codes`, `pois` | `FR-QR-01` $\rightarrow$ `06` |
| **SCR-05** | **Trợ lý Voice AI & Dịch thuật** | `/assistant` | Du khách | `conversation_sessions`, `conversation_messages`, `translation_logs` | **MỞ RỘNG (Voice Q&A + Live Translation)** |
| **SCR-06** | Tuyến Tour & Lộ trình | `/tours` | Du khách | `tours`, `tour_pois`, `pois` | `FR-MAP-08`, `US-13` |
| **SCR-07** | Quản lý tải dữ liệu Offline | `/offline` | Du khách | `offline_packages`, `offline_package_pois` | `FR-CON-01` $\rightarrow$ `11`, `FR-SET-06` |
| **SCR-08** | Cài đặt & Quyền riêng tư | `/settings` | Du khách | `devices`, `languages` | `FR-SET-01` $\rightarrow$ `08`, `FR-ANA-01`, `FR-ANA-05` |
| **SCR-08B** | **Hồ sơ Du khách & POI Yêu thích** | `/profile` | Du khách | `users`, `user_favorites`, `user_social_accounts` | **`FR-AUTH-05`, `FR-AUTH-06`, `FR-AUTH-07` (MỚI)** |
| **SCR-09** | Đăng nhập quản trị an toàn | `/cms/login` | CMS Users | `users` | `FR-CMS-01`, `FR-CMS-02` |
| **SCR-10** | Dashboard Analytics & Voice AI | `/cms/dashboard` | Admin, Analyst | `playback_logs`, `conversation_messages` | `FR-ANA-06`, `FR-ANA-07`, `FR-CMS-21` |
| **SCR-11** | Bản đồ nhiệt & Luồng di chuyển | `/cms/analytics/heatmap`| Admin, Analyst | `location_points`, `tracking_sessions` | `FR-ANA-09`, `FR-ANA-10`, `FR-ANA-11` |
| **SCR-12** | Danh sách điểm POI | `/cms/poi` | Admin, Editor | `pois`, `wards`, `bus_stops` | `FR-CMS-03`, `FR-CMS-07` |
| **SCR-13** | Soạn thảo POI & Geofence | `/cms/poi/editor/[[...id]]`| Admin, Editor | `pois`, `poi_images` | `FR-CMS-04`, `FR-CMS-05`, `FR-CMS-06`, `P1`, `P4` |
| **SCR-14** | **Quản lý Ngôn ngữ động** | `/cms/languages` | Admin, Editor | `languages` | **`FR-CMS-08` (Mở rộng số lượng động)** |
| **SCR-15** | Ma trận ngôn ngữ & Bản dịch | `/cms/translations/matrix`| Admin, Editor | `poi_translations`, `languages` | `FR-CMS-09`, `FR-CMS-10`, `FR-CMS-13` |
| **SCR-16** | Quản lý Audio & Test TTS | `/cms/audio` | Admin, Editor | `poi_audios` | `FR-CMS-11`, `FR-CMS-12` |
| **SCR-17** | Quản lý Tuyến Tour tham quan | `/cms/tours` | Admin, Editor | `tours`, `tour_pois` | `FR-CMS-14` |
| **SCR-18** | Quản lý Phường & Trạm buýt | `/cms/bus-stops` | Admin, Editor | `wards`, `bus_stops` | `FR-CMS-15`, `Quyết định 10 & 11` |
| **SCR-19** | Sinh & Quản lý in ấn mã QR | `/cms/qr-codes` | Admin, Editor | `qr_codes` | `FR-CMS-16`, `FR-CMS-17`, `FR-QR-01` |
| **SCR-20** | Cổng xuất bản & Build gói Offline | `/cms/publish` | Admin, Editor | `offline_packages`, `system_settings` | `FR-CMS-18`, `FR-CMS-19`, `FR-CON-02` |
| **SCR-21** | Tài khoản CMS & Audit Log | `/cms/users` | Admin | `users`, `audit_logs` | `FR-CMS-02`, `FR-CMS-20`, `FR-AUTH-08` |

---

## 3. PHÂN HỆ XÁC THỰC NGƯỜI DÙNG & DU KHÁCH (VISITOR AUTHENTICATION)

### Màn 0A: Đăng nhập Du khách & Tích hợp Google OAuth (Visitor Login & Social Auth)
* **Đường dẫn**: `/login`
* **Mục đích**: Bắt buộc du khách đăng nhập để mở khóa trải nghiệm Web App đầy đủ, lưu trữ lịch sử nghe, bookmark di tích yêu thích và trò chuyện với trợ lý Voice AI.
* **Thành phần giao diện chính**:
  1. **Branding Header**: Logo Auto-Narration, khẩu hiệu *"Hướng dẫn viên cá nhân bỏ túi"*, nút chuyển đổi ngôn ngữ nhanh góc trên (7 cờ quốc gia).
  2. **Nút đăng nhập xã hội ưu tiên (Social Auth Bar)**:
     - **"Tiếp tục với Google" (Google Sign-In Button)**: Thiết kế chuẩn Google Branding (nền trắng viền xám, biểu tượng Google màu sắc), hỗ trợ Google One Tap Prompt tự động hiện khi mở trang.
     - **"Đăng nhập bằng Apple"**: Nút nền đen icon Apple chuẩn iOS/Safari.
     - **"Đăng nhập bằng Facebook"**: Nút xanh dương đặc trưng.
  3. **Đường phân cách (Divider)**: Dòng *"Hoặc đăng nhập bằng Email"*.
  4. **Form đăng nhập truyền thống**:
     - Input Email & Mật khẩu (có icon ẩn/hiện mật khẩu).
     - Checkbox *"Ghi nhớ đăng nhập trên thiết bị này"*.
     - Link *"Quên mật khẩu?"* dẫn tới trang khôi phục.
     - Nút *"Đăng nhập"* (Primary Brand Color).
  5. **Footer**: Liên kết *"Chưa có tài khoản? Đăng ký ngay"* (`/register`) và Điều khoản quyền riêng tư.

---

### Màn 0B: Đăng ký tài khoản Du khách mới (Visitor Registration)
* **Đường dẫn**: `/register`
* **Chức năng chi tiết**:
  1. **Nút đăng ký nhanh với Google**: Khuyến khích du khách tạo tài khoản 1 chạm bằng Google OAuth 2.0 (tự động lấy họ tên, email, avatar).
  2. **Form đăng ký thủ công**: Họ và tên, Email, Mật khẩu (thanh đo độ mạnh mật khẩu - Weak/Medium/Strong), Xác nhận mật khẩu.
  3. **Đồng ý điều khoản**: Checkbox xác nhận điều khoản sử dụng và chính sách bảo vệ dữ liệu du lịch.
  4. **Nút "Tạo tài khoản"**: Gửi yêu cầu đăng ký lên backend, tạo phiên JWT và chuyển hướng thẳng vào bản đồ `/`.

---

## 4. PHÂN HỆ DU KHÁCH - MOBILE-FIRST / PWA (VISITOR EXPERIENCE)

### Màn 1: Bản đồ tương tác & Khám phá (Interactive Map)
* **Đường dẫn**: `/`
* **Chức năng chi tiết**:
  1. **Thanh Header Du khách**: Hiển thị Avatar du khách góc trên bên trái, chạm vào để mở Dropdown Menu (Hồ sơ cá nhân, Danh sách yêu thích, Cài đặt, Đăng xuất); Bộ chọn 7 ngôn ngữ quốc tế.
  2. **Định vị thời gian thực**: Hiển thị chấm vị trí thực tế của du khách; nút *"Về vị trí của tôi"* đưa camera về tâm người dùng (`FR-MAP-01`).
  3. **Hiển thị mạng lưới POI**: Render marker toàn bộ các điểm đã xuất bản, tự động gom cụm (Clustering) khi zoom xa (`FR-MAP-02`).
  4. **Làm nổi bật POI gần nhất**: Marker gần nhất có kích thước to hơn, màu sắc khác biệt kèm badge khoảng cách *"Cách bạn X m"* (`FR-MAP-03`).
  5. **Bottom Sheet POI tóm tắt**: Chạm marker vuốt mở thông tin nhanh: Tên, ảnh đại diện, khoảng cách, nút Yêu thích (Trái tim), nút *"Nghe ngay"* và nút *"Xem chi tiết"* (`FR-MAP-04`).
  6. **Vòng tròn Geofence**: Vẽ vòng tròn bán kính mờ quanh điểm đang chọn theo cấu hình `radius_meters` ($20\text{m} - 300\text{m}$) (`FR-MAP-05`).
  7. **Mini Audio Player**: Thanh điều khiển phát âm thanh ghim chân màn hình (Play/Pause, tên bài thuyết minh, thanh tiến độ).
  8. **Công tắc Tự động phát nhanh**: Nút gạt bật/tắt kích hoạt phát ngầm bằng GPS (`FR-NAR-12`).
  9. **Nút kích hoạt Trợ lý Voice AI nổi (Floating AI Mic Button)**: Nút micro tròn nổi góc phải màn hình, chạm vào để mở nhanh chế độ hỏi đáp giọng nói với AI.

---

### Màn 2: Danh sách điểm thuyết minh (POI List View)
* **Đường dẫn**: `/list`
* **Chức năng chi tiết**:
  1. **Thẻ danh sách (Card View)**: Danh sách cuộn mượt mà các điểm POI kèm hình ảnh đại diện, tên, khoảng cách và badge *"Đã tải offline"*.
  2. **Sắp xếp theo khoảng cách**: Tự động xếp các điểm từ gần nhất đến xa nhất theo vị trí GPS thực tế (`FR-MAP-07`).
  3. **Bộ lọc thông minh**: Lọc theo từ khóa tên, theo Phường thí điểm (Khánh Hội, Vĩnh Hội, Xóm Chiếu) và theo Tuyến Tour (`FR-MAP-07`).
  4. **Nút phát nhanh**: Bấm trực tiếp nút "Nghe" trên từng thẻ để phát thuyết minh ngay lập tức.

---

### Màn 3: Chi tiết điểm thuyết minh & Hỏi đáp POI (POI Detail & Context Q&A)
* **Đường dẫn**: `/poi/[id]`
* **Chức năng chi tiết**:
  1. **Thư viện ảnh tư liệu**: Banner carousel vuốt ngang mượt mà, hỗ trợ placeholder khi offline (`FR-DET-01`, `FR-DET-05`).
  2. **Nội dung bài viết đa ngữ**: Tiêu đề và nội dung bài thuyết minh tự dịch theo ngôn ngữ người dùng đã chọn. Tự động Fallback: `Ngôn ngữ chọn` $\rightarrow$ `en` $\rightarrow$ `vi` kèm nhãn *"Chưa có bản dịch"* (`FR-DET-04`).
  3. **Trình phát âm thanh đầy đủ (Full Audio Player)**: Tua lùi 10s / Tua tới 10s, seekbar thời lượng; ưu tiên phát file thu sẵn trước TTS (`FR-NAR-02`, `FR-NAR-03`). Bấm phát thủ công được bỏ qua Cooldown 30 phút (`FR-DET-02`).
  4. **Nút mở bản đồ chỉ đường**: Mở ứng dụng bản đồ ngoài (Google Maps) dẫn đường tới đúng tọa độ POI (`FR-DET-03`).
  5. **Widget "Hỏi AI về địa danh này" (Contextual POI Q&A)**:
     - Nút micro gắn ngay dưới bài thuyết minh: *"Hỏi thêm về địa danh này"*.
     - Khi bấm nói, hệ thống tự động đính kèm `current_poi_id` vào ngữ cảnh để AI giải đáp chính xác lịch sử, sự tích, các câu hỏi chuyên sâu về chính địa danh đó.

---

### Màn 4: Trình quét mã QR hiện trường (QR Scanner)
* **Đường dẫn**: `/qr`
* **Chức năng chi tiết**:
  1. **Khung quét camera trực tiếp**: Quét nhanh mã QR tại nhà chờ xe buýt ở cự ly $20 - 50\text{ cm}$ (`FR-QR-01`, `FR-QR-03`).
  2. **Mở POI tức thì**: Phân tích URL `https://<domain>/q/<code>`, mở thẳng vào nội dung bài thuyết minh trong vòng $\le 5$ giây (`FR-QR-02`, `K4`).
  3. **Ưu tiên ngắt âm thanh**: Quét QR tự động ngắt bài đang phát để phát ngay bài tương ứng của mã QR vừa quét; bỏ qua Cooldown (`FR-QR-05`).
  4. **Hoạt động độc lập không cần GPS**: Phát âm thanh bình thường ngay cả khi du khách tắt GPS hoặc bị khuất sóng dưới mái che (`FR-QR-04`).

---

### Màn 5: Trợ lý đối đáp Voice AI & Dịch thuật trực tiếp (Voice AI Assistant & Translator)
* **Đường dẫn**: `/assistant`
* **Mục tiêu**: **TÍNH NĂNG MỚI BỔ SUNG** — Cung cấp trải nghiệm đối thoại 2 chiều bằng giọng nói và công cụ dịch tự do cho du khách.
* **Chức năng chi tiết**:
  1. **Chế độ Đối thoại giọng nói 2 chiều (Interactive Voice Q&A)**:
     - Giao diện dạng sóng âm thanh (Voice Waveform Visualizer) sinh động.
     - Nút Micro giữ để nói (Push-to-talk) hoặc chạm để nói (Tap-to-talk).
     - Hỗ trợ du khách đặt bất kỳ câu hỏi nào bằng ngôn ngữ của họ (ví dụ: *"Quanh đây có quán ăn nào ngon?"*, *"Chùa này mở cửa đến mấy giờ?"*, *"Xe buýt nào đi qua Bến Nhà Rồng?"*).
     - Hệ thống xử lý ngữ cảnh địa phương $\rightarrow$ Trả lời bằng chữ $\rightarrow$ **Tự động phát giọng đọc âm thanh (TTS) bằng đúng ngôn ngữ của khách**.
  2. **Chế độ Dịch thuật tự do (On-demand Translator)**:
     - Chuyển tab sang chế độ Dịch thoại 2 chiều (Conversational Translator) giữa du khách và người dân địa phương.
     - Chọn cặp ngôn ngữ (ví dụ: Tiếng Thái $\leftrightarrow$ Tiếng Việt).
     - Bấm micro nói câu tiếng Thái $\rightarrow$ Hệ thống dịch sang tiếng Việt và phát loa cho người bán hàng nghe $\rightarrow$ Người bán hàng bấm nói tiếng Việt $\rightarrow$ Dịch sang tiếng Thái phát cho du khách.
  3. **Lưu lịch sử hội thoại**: Tự động lưu vào `conversation_sessions` và `conversation_messages` gắn với `device_id` của du khách.

---

### Màn 6: Tuyến Tour & Lộ trình tham quan (Tours & Route)
* **Đường dẫn**: `/tours`
* **Chức năng chi tiết**:
  1. **Danh sách Tour chuyên đề**: Thẻ hiển thị các tour du lịch (ví dụ: *“Di tích lịch sử Khánh Hội”*, *“Tour ẩm thực Xóm Chiếu”*).
  2. **Bản đồ lộ trình nối tuyến**: Vẽ đường nối giữa các điểm POI theo đúng thứ tự tham quan `order_index` (`FR-MAP-08`).
  3. **Đánh số thứ tự trạm**: Đánh số (1, 2, 3...) trực quan trên từng điểm dừng cả trên bản đồ và danh sách.

---

### Màn 7: Trung tâm tải dữ liệu Offline (Offline Data Center)
* **Đường dẫn**: `/offline`
* **Chức năng chi tiết**:
  1. **Danh mục gói tải dữ liệu**: Liệt kê các gói dữ liệu theo khu vực/phường và ngôn ngữ (`FR-CON-04`).
  2. **Tách biệt gói tải**: Tải riêng *Phần hình ảnh dùng chung* và *Phần audio theo từng ngôn ngữ* (`FR-CON-04`).
  3. **Đo dung lượng & Kiểm tra tính toàn vẹn**: Báo dung lượng bộ nhớ trống máy trước khi tải; hiển thị % tiến độ; kiểm tra mã băm SHA-256 (`FR-CON-06`, `FR-CON-04`).
  4. **Cập nhật gói vi sai (Delta update)**: Thông báo *"Có bản cập nhật mới"* và chỉ tải phần dữ liệu chênh lệch (`FR-CON-07`).
  5. **Xóa gói giải phóng bộ nhớ**: Cho phép xóa từng gói dữ liệu đã tải (`FR-CON-08`).

---

### Màn 8: Cài đặt hệ thống, Ngôn ngữ động & Quyền riêng tư (Settings)
* **Đường dẫn**: `/settings`
* **Chức năng chi tiết**:
  1. **Chọn ngôn ngữ từ danh mục động**: Danh sách ngôn ngữ được nạp động từ bảng `languages` (chỉ hiển thị các ngôn ngữ đang ở trạng thái `is_active = true`). Tự nhận diện ngôn ngữ máy trong lần đầu mở (`FR-SET-01`).
  2. **Tùy chỉnh giọng đọc TTS & Tốc độ**: Nghe thử các giọng đọc hỗ trợ; thanh chỉnh tốc độ đọc từ $0{,}8\times - 1{,}5\times$ (`FR-SET-02`).
  3. **Tùy chỉnh độ nhạy GPS**: 3 mức: *Tiết kiệm pin (15s)*, *Cân bằng (5s)*, *Chính xác cao (2s)* (`FR-SET-03`).
  4. **Hệ số bán kính Geofence**: Chọn $\times 0{,}5$ / $\times 1{,}0$ / $\times 1{,}5$ để phù hợp đi bộ hoặc đi xe buýt (`FR-SET-04`).
  5. **Quyền riêng tư & Quản lý Device ID**:
     - Nút gạt bật/tắt gửi dữ liệu tọa độ ẩn danh (`FR-SET-07`, `FR-ANA-02`).
     - Xem mã định danh ẩn danh (`device_id`) (`FR-ANA-01`).
     - Nút *"Đặt lại mã ẩn danh (Reset Device ID)"* và *"Xóa toàn bộ dữ liệu của tôi"* (`FR-SET-07`, `NFR-PRV-03`).

---

### Màn 8B: Hồ sơ Du khách, POI yêu thích & Tài khoản liên kết (User Profile & Favorites)
* **Đường dẫn**: `/profile`
* **Mục đích**: Quản lý tài khoản cá nhân, xem các điểm di tích đã đánh dấu yêu thích và quản lý các phương thức đăng nhập xã hội.
* **Chức năng chi tiết**:
  1. **Thẻ thông tin cá nhân**: Ảnh đại diện (Avatar Google hoặc ảnh tải lên), Họ và tên, Email, Vai trò (`USER`), Ngày tham gia.
  2. **Quản lý phương thức đăng nhập liên kết (Linked Accounts)**:
     - Google: Trạng thái Đã liên kết (hiển thị email Google đã liên kết).
     - Apple ID / Facebook: Nút liên kết hoặc hủy liên kết.
     - Đổi mật khẩu tài khoản (dành cho tài khoản Email/Password).
  3. **Tab "Điểm di tích yêu thích" (Favorite POIs)**:
     - Danh sách các thẻ POI mà du khách đã bấm "Yêu thích" (lưu trong bảng `user_favorites`).
     - Xem nhanh khoảng cách, mở nghe bài thuyết minh hoặc nhấn chỉ đường Google Maps.
  4. **Tab "Lịch sử tham quan"**:
     - Danh sách các POI đã nghe thành công ($\ge 5$s), thời gian nghe và các câu hỏi đã trò chuyện với Voice AI.
  5. **Nút Đăng xuất**: Thu hồi token phiên làm việc, xóa cookie xác thực an toàn và chuyển về `/login`.

---

## 5. PHÂN HỆ QUẢN TRỊ & VẬN HÀNH - WEB CMS (ADMIN & MANAGEMENT PORTAL)

### Màn 9: Đăng nhập quản trị an toàn (Secure Login)
* **Đường dẫn**: `/cms/login`
* **Chức năng chi tiết**: Đăng nhập bằng Email & Mật khẩu; khóa tạm tài khoản sau 5 lần nhập sai liên tiếp; phiên làm việc tự hết hạn khi không hoạt động; phân quyền giao diện theo `ADMIN`, `EDITOR`, `ANALYST` (`FR-CMS-01`, `FR-CMS-02`).

---

### Màn 10: Dashboard tổng quan Analytics & Thống kê Voice AI
* **Đường dẫn**: `/cms/dashboard`
* **Quyền truy cập**: `ADMIN`, `ANALYST` (Chỉ xem)
* **Chức năng chi tiết**:
  1. **Thẻ chỉ số tổng quan (KPI Cards)**: Lượt khách, lượt nghe hợp lệ ($\ge 5\text{s}$), lượt quét mã QR, tỷ lệ nghe trọn vẹn bài ($\ge 95\%$) (`FR-ANA-06`).
  2. **Biểu đồ phân bổ nguồn phát**: Tỷ lệ kích hoạt qua GPS / Quét QR / Bấm nghe thủ công.
  3. **Cơ cấu ngôn ngữ du khách**: Tỷ lệ du khách theo từng ngôn ngữ trong bảng `languages`.
  4. **Thống kê tương tác Trợ lý Voice AI (MỚI)**:
     - Tổng số lượt đặt câu hỏi bằng giọng nói qua Voice AI.
     - Danh sách các câu hỏi thường gặp nhất của khách theo từng ngôn ngữ.
     - Thống kê tỷ lệ câu hỏi gắn với từng POI cụ thể.
  5. **Bảng xếp hạng Top điểm POI**: Top điểm nghe nhiều nhất, thời lượng nghe trung bình (`FR-ANA-07`, `FR-ANA-08`).

---

### Màn 11: Bản đồ nhiệt (Heatmap) & Luồng di chuyển
* **Đường dẫn**: `/cms/analytics/heatmap`
* **Quyền truy cập**: `ADMIN`, `ANALYST`
* **Chức năng chi tiết**: Lớp nhiệt Heatmap trực quan trên bản đồ 3 phường Khánh Hội, Vĩnh Hội, Xóm Chiếu; tự động cắt 100m đầu/cuối và ẩn ô lưới dưới 5 thiết bị để bảo vệ quyền riêng tư; mô hình hóa luồng di chuyển tiếp nối giữa các POI; xuất báo cáo tổng hợp ra file CSV (`FR-ANA-09`, `FR-ANA-10`, `FR-ANA-04`, `FR-ANA-11`).

---

### Màn 12: Quản lý danh sách POI (POI Registry)
* **Đường dẫn**: `/cms/poi`
* **Quyền truy cập**: `ADMIN`, `EDITOR`
* **Chức năng chi tiết**: Bảng dữ liệu POI; lọc theo trạng thái (Nháp/Xuất bản/Lưu trữ), Phường, cảnh báo *"Thiếu bản dịch"*, *"Thiếu file audio"*; xóa mềm an toàn kèm cảnh báo nếu điểm đang nằm trong Tour hoặc có mã QR hoạt động (`FR-CMS-03`, `FR-CMS-07`).

---

### Màn 13: Soạn thảo POI & Cấu hình Geofence trực quan (POI Editor)
* **Đường dẫn**: `/cms/poi/editor/[[...id]]`
* **Quyền truy cập**: `ADMIN`, `EDITOR`
* **Chức năng chi tiết**:
  1. **Bản đồ tương tác cắm mốc tọa độ**: Click trực tiếp trên bản đồ để chọn tọa độ hoặc nhập tay `latitude`, `longitude` (`FR-CMS-04`).
  2. **Thanh trượt bán kính Geofence**: Kéo thanh trượt từ $20\text{m} - 300\text{m}$ (mặc định $50\text{m}$); vòng tròn Geofence trên bản đồ lập tức co giãn trực quan (`FR-CMS-05`, `P1`).
  3. **Cảnh báo chồng lấn Geofence**: Cảnh báo viền đỏ trên bản đồ nếu vòng bán kính va chạm với các POI lân cận (`FR-CMS-05`).
  4. **Thiết lập mức ưu tiên (`priority`) & Cooldown**: Chọn mức 1 đến 5; cho phép ghi đè thời gian cooldown riêng (`P4`).
  5. **Quản lý thư viện hình ảnh**: Tải ảnh JPG/PNG/WebP ($\le 5\text{MB}$), tự động nén kích thước, kéo thả sắp xếp thứ tự, chọn ảnh đại diện bìa (`FR-CMS-06`).

---

### Màn 14: Quản lý danh mục Ngôn ngữ động (Dynamic Languages Registry)
* **Đường dẫn**: `/cms/languages`
* **Quyền truy cập**: `ADMIN`, `EDITOR`
* **Mục tiêu**: **TÍNH NĂNG MỚI BỔ SUNG KHỚP `FR-CMS-08`** — Quản lý động danh mục ngôn ngữ toàn hệ thống.
* **Chức năng chi tiết**:
  1. **Bảng danh mục ngôn ngữ**: Hiển thị Mã ISO (`code`), Tên hiển thị (`name`), Tên bản địa (`native_name`), Cấu hình TTS (`locale_tts`), Thứ tự hiển thị (`order_index`), Trạng thái hoạt động (`is_active`).
  2. **Thêm mới ngôn ngữ**: Form thêm ngôn ngữ quốc tế mới khi hệ thống mở rộng (ví dụ thêm tiếng Pháp `fr`, tiếng Đức `de`, tiếng Nga `ru`).
  3. **Công tắc Bật/Tắt ngôn ngữ (Enable/Disable)**:
     - Gạt tắt một ngôn ngữ $\rightarrow$ Toàn bộ ứng dụng của du khách sẽ ẩn ngôn ngữ đó khỏi danh sách chọn.
     - Khóa cứng: Tiếng Việt (`vi`, `is_default = true`) là ngôn ngữ gốc bắt buộc, không cho phép tắt.
  4. **Kéo thả sắp xếp thứ tự hiển thị**: Sắp xếp thứ tự ưu tiên xuất hiện trên ứng dụng du khách.

---

### Màn 15: Ma trận độ phủ ngôn ngữ & Bản dịch (Language Coverage Matrix)
* **Đường dẫn**: `/cms/translations/matrix`
* **Quyền truy cập**: `ADMIN`, `EDITOR`
* **Chức năng chi tiết**:
  1. **Ma trận độ phủ ngôn ngữ (Coverage Matrix)**: Bảng ma trận $POI \times \text{Danh mục ngôn ngữ active}$, mỗi ô mang nhãn màu trạng thái: *Đã có Audio thu sẵn (Xanh lá)* / *Đã có Script TTS (Vàng)* / *Thiếu nội dung (Đỏ)* (`FR-CMS-13`).
  2. **Form soạn thảo bản dịch đa ngữ**: Nhập Tiêu đề, Mô tả và Kịch bản đọc TTS theo từng tab ngôn ngữ (`FR-CMS-09`).
  3. **Thanh tiến độ hoàn thiện**: Hiển thị tỷ lệ $x / \text{Tổng số ngôn ngữ active}$ (`FR-CMS-09`).
  4. **Import/Export hàng loạt**: Nhập/xuất file Excel/CSV bản dịch của toàn bộ các điểm để dịch thuật ngoại tuyến (`FR-CMS-10`).

---

### Màn 16: Quản lý File âm thanh & Thử nghiệm TTS (Audio Assets & TTS Playground)
* **Đường dẫn**: `/cms/audio`
* **Quyền truy cập**: `ADMIN`, `EDITOR`
* **Chức năng chi tiết**: Tải lên Audio thu sẵn (MP3/M4A/AAC $\le 20\text{MB}$), tự động trích xuất thời lượng; gắn với cặp `[POI + Ngôn ngữ]`; trình nghe thử trực tiếp; Sân chơi thử giọng TTS (TTS Playground) nhập văn bản và nghe thử giọng đọc nhân tạo theo từng locale (`FR-CMS-11`, `FR-CMS-12`).

---

### Màn 17: Quản lý Tuyến Tour tham quan (Tour Planner)
* **Đường dẫn**: `/cms/tours`
* **Quyền truy cập**: `ADMIN`, `EDITOR`
* **Chức năng chi tiết**: Tạo & sửa tour, kéo thả chọn POI và sắp xếp thứ tự tham quan `order_index`, bản đồ tự động nối tuyến lộ trình trực quan (`FR-CMS-14`).

---

### Màn 18: Quản lý Phường & Trạm dừng xe buýt (Wards & Bus Stops)
* **Đường dẫn**: `/cms/bus-stops`
* **Quyền truy cập**: `ADMIN`, `EDITOR`
* **Chức năng chi tiết**: Quản lý danh mục 3 phường thí điểm (Khánh Hội, Vĩnh Hội, Xóm Chiếu); quản lý danh sách trạm dừng xe buýt (mã trạm, tọa độ GPS, liên kết POI lân cận) (`FR-CMS-15`).

---

### Màn 19: Sinh & Quản lý in ấn mã QR (QR Code Studio)
* **Đường dẫn**: `/cms/qr-codes`
* **Quyền truy cập**: `ADMIN`, `EDITOR`
* **Chức năng chi tiết**: Sinh mã QR chuẩn Base62 gắn POI + Trạm xe buýt; xuất bản in chuẩn mẫu hiện trường (PNG độ nét cao, vector SVG lồng khung logo dự án); bật/tắt từng mã QR; báo cáo số lượt quét theo thời gian thực (`FR-CMS-16`, `FR-CMS-17`, `FR-QR-01`).

---

### Màn 20: Trung tâm xuất bản & Đóng gói Offline (Publish Gate & Packager)
* **Đường dẫn**: `/cms/publish`
* **Quyền truy cập**: `ADMIN`, `EDITOR`
* **Chức năng chi tiết**:
  1. **Cổng kiểm duyệt xuất bản (Publish Gate)**: Kiểm tra điều kiện dữ liệu (báo lỗi nếu POI thiếu nội dung gốc tiếng Việt hoặc thiếu tọa độ); bấm Xuất bản $\rightarrow$ Tăng phiên bản `DATA_VERSION` toàn hệ thống phục vụ Delta Sync (`FR-CMS-18`, `FR-CON-02`).
  2. **Công cụ tạo gói tải Offline (Offline Package Builder)**: Chọn danh sách POI, khu vực/tour và ngôn ngữ để đóng gói; tự động nén, tính dung lượng và sinh mã băm SHA-256 (`FR-CMS-19`, `FR-CON-04`).

---

### Màn 21: Phân quyền tài khoản & Nhật ký kiểm toán (Users & Audit Logs)
* **Đường dẫn**: `/cms/users`
* **Quyền truy cập**: `ADMIN` (Dành riêng cho Quản trị viên tối cao)
* **Chức năng chi tiết**: Quản lý tài khoản toàn hệ thống gồm: Tài khoản nhân sự CMS (thêm mới, đổi mật khẩu, phân quyền `ADMIN`, `EDITOR`, `ANALYST`) và Danh sách tài khoản Du khách (`USER` đăng ký qua Email/Google; xem trạng thái, khóa/mở khóa khi có vi phạm) (`FR-CMS-02`, `FR-AUTH-08`); Nhật ký kiểm toán (Audit Log) lưu vết chi tiết ai làm, hành động gì, dữ liệu JSON trước/sau, cấm sửa/xóa (`FR-CMS-20`).

---

## 6. CẤU TRÚC THƯ MỤC DỰ ÁN NEXT.JS CHUẨN HÓA

```text
frontend/
├── public/
│   ├── icons/                     # PWA icons, App logo
│   └── locales/                   # Cache tĩnh bản dịch giao diện
├── src/
│   ├── middleware.ts              # Next.js Auth Middleware (bảo vệ route du khách & CMS)
│   ├── app/
│   │   ├── (auth)/                # Nhóm Route Xác thực Du khách (MỚI)
│   │   │   ├── layout.tsx         # Container căn giữa, hiệu ứng nền di tích
│   │   │   ├── login/page.tsx     # SCR-00A: Đăng nhập Du khách (Email, Google, Apple, Facebook)
│   │   │   ├── register/page.tsx  # SCR-00B: Đăng ký tài khoản Du khách mới
│   │   │   └── forgot-password/page.tsx # Khôi phục mật khẩu
│   │   │
│   │   ├── (visitor)/             # Nhóm Route Du khách (Mobile-first - Yêu cầu Auth)
│   │   │   ├── layout.tsx         # Bottom nav bar, User Avatar Header, Floating AI Mic button, Mini Player
│   │   │   ├── page.tsx           # SCR-01: Bản đồ tương tác & Khám phá
│   │   │   ├── list/page.tsx      # SCR-02: Danh sách điểm POI
│   │   │   ├── poi/[id]/page.tsx  # SCR-03: Chi tiết POI & Nút hỏi đáp Voice AI
│   │   │   ├── qr/page.tsx        # SCR-04: Trình quét mã QR
│   │   │   ├── assistant/page.tsx # SCR-05: Trợ lý Voice AI & Dịch thuật trực tiếp
│   │   │   ├── tours/page.tsx     # SCR-06: Tuyến Tour & Lộ trình
│   │   │   ├── offline/page.tsx   # SCR-07: Trung tâm tải Offline
│   │   │   ├── settings/page.tsx  # SCR-08: Cài đặt & Quyền riêng tư
│   │   │   └── profile/page.tsx   # SCR-08B: Hồ sơ Du khách & POI yêu thích (MỚI)
│   │   │
│   │   ├── (cms)/                 # Nhóm Route Quản trị (Admin Portal)
│   │   │   ├── layout.tsx         # Sidebar CMS, Top header, User menu
│   │   │   ├── login/page.tsx     # SCR-09: Đăng nhập quản trị an toàn
│   │   │   ├── dashboard/page.tsx # SCR-10: Dashboard Analytics & Voice AI stats
│   │   │   ├── analytics/heatmap/page.tsx # SCR-11: Bản đồ nhiệt Heatmap
│   │   │   ├── poi/
│   │   │   │   ├── page.tsx       # SCR-12: Quản lý danh sách POI
│   │   │   │   └── editor/[[...id]]/page.tsx # SCR-13: Soạn thảo POI & Geofence
│   │   │   ├── languages/page.tsx # SCR-14: Quản lý danh mục Ngôn ngữ động
│   │   │   ├── translations/matrix/page.tsx # SCR-15: Ma trận độ phủ ngôn ngữ
│   │   │   ├── audio/page.tsx     # SCR-16: Quản lý Audio & Test TTS
│   │   │   ├── tours/page.tsx     # SCR-17: Quản lý Tuyến Tour
│   │   │   ├── bus-stops/page.tsx # SCR-18: Quản lý Phường & Trạm buýt
│   │   │   ├── qr-codes/page.tsx  # SCR-19: Sinh & Quản lý mã QR
│   │   │   ├── publish/page.tsx   # SCR-20: Cổng xuất bản & Build gói Offline
│   │   │   └── users/page.tsx     # SCR-21: Quản trị User & Audit Log
│   │   │
│   │   ├── api/                   # Route handlers (Proxy gọi Backend Spring Boot & Auth callbacks)
│   │   │   └── auth/              # NextAuth / Google OAuth callback handlers
│   │   └── layout.tsx             # Root layout & Theme provider
│   │
│   ├── components/
│   │   ├── common/                # Button, Modal, Input, Badge, WaveformVisualizer, SocialAuthButtons
│   │   ├── visitor/               # MapView, GeofenceRadar, MiniPlayer, VoiceMicButton, ChatBubble, UserMenu
│   │   └── cms/                   # GeofenceSlider, TranslationMatrixTable, AudioUploader, QrTemplate
│   │
│   ├── hooks/                     # useGeolocation, useAudioPlayer, useVoiceAssistant, useOfflineStorage, useAuth
│   ├── services/                  # apiService, syncService, voiceAiService, ttsService, authService
│   ├── stores/                    # Zustand stores: playerStore, locationStore, languageStore, assistantStore, authStore
│   └── types/                     # TypeScript definitions khớp 100% với schema.sql (22 bảng)
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```
