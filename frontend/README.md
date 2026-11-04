# HỆ THỐNG THUYẾT MINH DU LỊCH TỰ ĐỘNG QUẬN 4 & TRỢ LÝ VOICE AI
## Frontend Web & PWA Mobile Portal (Next.js 14 + TypeScript + Tailwind CSS)

Hệ thống giao diện người dùng hoàn chỉnh theo đúng **25 trang Đặc tả Yêu cầu Sản phẩm (PRD)** và tài liệu thiết kế chi tiết **[UI_SPECIFICATION.md](../UI_SPECIFICATION.md)**.

---

### 1. KIẾN TRÚC TỔNG THỂ & DANH MỤC 21 MÀN HÌNH

Hệ thống được chia thành 2 phân hệ độc lập:
1. **Phân hệ Du khách (`src/app/(visitor)/`)**: Giao diện Mobile-First / PWA dành cho du khách đến tham quan Quận 4 (Khánh Hội, Vĩnh Hội, Xóm Chiếu).
2. **Phân hệ Quản trị CMS (`src/app/(cms)/`)**: Giao diện Web Desktop Admin Portal dành cho cán bộ quản lý di tích và vận hành nội dung.

---

### 2. PHÂN HỆ DU KHÁCH - VISITOR EXPERIENCE (8 MÀN HÌNH)

| STT | Mã Màn Hình | Tên Màn Hình & Chức Năng | Đường Dẫn Tuyến (Route) |
|---|---|---|---|
| 1 | **SCR-01** | **Bản đồ Vệ tinh & Radar Geofence**: Hiển thị vị trí GPS thời gian thực, quét bán kính Geofence 20–300m, tự động phát âm thanh khi vào vùng (`FR-NAR-01`), công tắc rảnh tay. | `/` |
| 2 | **SCR-02** | **Danh sách Điểm Thuyết minh (POI List)**: Sắp xếp theo khoảng cách gần nhất, tìm kiếm, lọc theo 3 phường thí điểm. | `/list` |
| 3 | **SCR-03** | **Chi tiết POI & Trình phát Audio**: Trượt ảnh Carousel, kịch bản thuyết minh đa ngữ, trình phát audio đa tốc độ ($0.8\times - 1.5\times$), chỉ đường Google Maps, widget hỏi đáp Voice AI theo ngữ cảnh. | `/poi/[id]` |
| 4 | **SCR-04** | **Quét mã QR Hiện trường**: Kính ngắm camera, giải mã Base62, tự kích hoạt audio ngay lập tức bỏ qua Cooldown (`FR-QR-05`), hỗ trợ offline. | `/qr` |
| 5 | **SCR-05** | **Trợ lý Voice AI 2 Chiều & Dịch thuật Trực tiếp**: Sóng âm thanh tương tác (Waveform Visualizer), du khách hỏi bằng ngôn ngữ mẹ đẻ $\rightarrow$ AI trả lời bằng văn bản và phát âm thanh TTS; Chế độ dịch thoại 2 chiều với tiểu thương/người dân. | `/assistant` |
| 6 | **SCR-06** | **Tuyến Tour & Lộ trình Tham quan**: Danh sách tour chuyên đề, sơ đồ nối tuyến tuần tự (1, 2, 3...) theo `order_index`. | `/tours` |
| 7 | **SCR-07** | **Trung tâm Tải Dữ liệu Offline**: Đo dung lượng trống, tải riêng gói Ảnh và gói Audio theo từng ngôn ngữ, kiểm tra tính toàn vẹn mã băm SHA-256 (`FR-CON-04`). | `/offline` |
| 8 | **SCR-08** | **Cài đặt Hệ thống, Ngôn ngữ động & Quyền riêng tư**: Danh mục ngôn ngữ nạp động từ bảng `languages`, chỉnh tốc độ đọc TTS, chỉnh độ nhạy GPS, xem và Reset Device ID ẩn danh. | `/settings` |

---

### 3. PHÂN HỆ QUẢN TRỊ CMS - ADMIN PORTAL (13 MÀN HÌNH)

| STT | Mã Màn Hình | Tên Màn Hình & Chức Năng | Đường Dẫn Tuyến (Route) | Phân Quyền |
|---|---|---|---|---|
| 9 | **SCR-09** | **Đăng nhập Quản trị An toàn**: Email & Mật khẩu, khóa tài khoản tạm thời sau 5 lần sai (`FR-CMS-01`), RBAC. | `/cms/login` | Công khai |
| 10 | **SCR-10** | **Bảng điều khiển Analytics & Thống kê Voice AI**: KPI lượt nghe $\ge 5$s, tỷ lệ nghe trọn vẹn $\ge 95\%$, biểu đồ nguồn phát GPS/QR/Thủ công, thống kê câu hỏi Voice AI. | `/cms/dashboard` | ADMIN, ANALYST |
| 11 | **SCR-11** | **Bản đồ Nhiệt (Heatmap) & Luồng Di chuyển**: Lớp nhiệt mật độ khách tại Quận 4, tự động cắt 100m đầu/cuối bảo vệ quyền riêng tư, mô hình hóa luồng chuyển dịch POI, xuất CSV (`FR-ANA-11`). | `/cms/analytics/heatmap` | ADMIN, ANALYST |
| 12 | **SCR-12** | **Quản lý Danh sách POI (POI Registry)**: Bảng dữ liệu POI, lọc theo Phường, cảnh báo thiếu bản dịch/audio, xóa mềm an toàn. | `/cms/poi` | ADMIN, EDITOR |
| 13 | **SCR-13** | **Soạn thảo POI & Geofence Editor**: Bản đồ cắm mốc tọa độ, thanh trượt bán kính 20–300m, SVG radar canvas hiển thị trực quan và phát hiện chồng lấn Geofence (`FR-CMS-05`). | `/cms/poi/editor/[[...id]]` | ADMIN, EDITOR |
| 14 | **SCR-14** | **Quản lý Danh mục Ngôn ngữ Động**: Bảng ngôn ngữ (ISO code, tên bản địa, locale TTS), Bật/Tắt ngôn ngữ tức thời (`FR-CMS-08`), thêm mới ngôn ngữ mở rộng (Pháp, Đức, Nga...). | `/cms/languages` | ADMIN, EDITOR |
| 15 | **SCR-15** | **Ma trận Độ phủ Ngôn ngữ & Bản dịch**: Ma trận $POI \times Languages$, gắn nhãn màu trạng thái (Audio sẵn / Script TTS / Thiếu), xuất nhập Excel hàng loạt. | `/cms/translations/matrix` | ADMIN, EDITOR |
| 16 | **SCR-16** | **Quản lý File Âm thanh & TTS Playground**: Tải lên Audio thu sẵn ($\le 20$MB), tự trích xuất thời lượng, Sân chơi thử giọng đọc nhân tạo TTS Playground. | `/cms/audio` | ADMIN, EDITOR |
| 17 | **SCR-17** | **Quản lý Tuyến Tour Tham quan (Tour Planner)**: Kéo thả/di chuyển sắp xếp thứ tự POI `order_index`, bản đồ tự động vẽ liên kết tuyến tour (`FR-CMS-14`). | `/cms/tours` | ADMIN, EDITOR |
| 18 | **SCR-18** | **Quản lý Phường & Trạm Xe Buýt**: Danh mục 3 phường Quận 4, danh sách trạm xe buýt, tọa độ GPS, liên kết POI lân cận (`FR-CMS-15`). | `/cms/bus-stops` | ADMIN, EDITOR |
| 19 | **SCR-19** | **Xưởng Sinh & Quản lý In ấn Mã QR**: Sinh mã Base62 $\ge 8$ ký tự (`FR-QR-01`), mẫu in thực địa tiêu chuẩn mica/decal A4/A5 lồng khung logo dự án, xuất file vector SVG/PNG độ nét cao, đếm lượt quét. | `/cms/qr-codes` | ADMIN, EDITOR |
| 20 | **SCR-20** | **Cổng Xuất bản & Đóng gói Offline**: Publish Gate kiểm tra điều kiện dữ liệu trước khi phát hành, tăng phiên bản `DATA_VERSION` toàn hệ thống, tạo gói nén offline kèm mã băm SHA-256 (`FR-CMS-19`). | `/cms/publish` | ADMIN, EDITOR |
| 21 | **SCR-21** | **Tài khoản CMS & Nhật ký Kiểm toán (Audit Logs)**: CRUD tài khoản nhân sự CMS, phân quyền ADMIN/EDITOR/ANALYST, bảng Audit Log bất biến (Immutable) ghi nhận thao tác (`FR-CMS-20`). | `/cms/users` | Dành riêng ADMIN |

---

### 4. HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN

#### Yêu cầu môi trường:
- Node.js version $\ge 18.17.0$
- Trình quản lý gói `npm` hoặc `pnpm` hoặc `yarn`

#### Các bước khởi chạy:
```bash
# 1. Di chuyển vào thư mục frontend
cd frontend

# 2. Cài đặt các thư viện phụ thuộc
npm install

# 3. Khởi chạy máy chủ phát triển cục bộ
npm run dev
```

Mở trình duyệt truy cập:
- **Giao diện du khách**: `http://localhost:3000`
- **Trợ lý Voice AI**: `http://localhost:3000/assistant`
- **Trang Quản trị CMS**: `http://localhost:3000/cms/dashboard` (hoặc `/cms/login`)

---

### 5. CÔNG NGHỆ SỬ DỤNG
- **Core Framework**: Next.js 14 (App Router)
- **Ngôn ngữ**: TypeScript 5.x (Strict type checking)
- **Styling**: Tailwind CSS + PostCSS
- **Icon Set**: Lucide React
- **Quản lý State toàn cục**: Zustand (`playerStore`, `languageStore`, `assistantStore`)
- **Speech API**: Web Speech Synthesis & Recognition tích hợp sẵn
