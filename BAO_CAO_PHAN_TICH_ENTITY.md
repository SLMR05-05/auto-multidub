# BÁO CÁO PHÂN TÍCH & QUY HOẠCH ENTITY
## HỆ THỐNG THUYẾT MINH TỰ ĐỘNG & TRỢ LÝ VOICE AI ĐA NGÔN NGỮ
> **Dự án:** auto-multidub (Auto-narration & AI Travel Companion System)  
> **Cập nhật:** Phiên bản 2.0 (Đã thống nhất các quyết định kỹ thuật và bổ sung Voice AI Chatbot)

---

## 1. TỔNG KẾT CÁC QUYẾT ĐỊNH KỸ THUẬT QUAN TRỌNG

1. **Giữ tính năng Dịch thuật & Nâng cấp thành "Trợ lý đối đáp Voice AI"**:
   - Du khách không chỉ nghe thuyết minh tự động khi đến POI mà còn có thể **đặt câu hỏi bằng giọng nói (Voice Q&A)** và hệ thống sẽ đối đáp trả lời trực tiếp bằng ngôn ngữ của họ kèm phát âm thanh (TTS).
   - Tách biệt hoàn toàn khỏi các bảng legacy cũ, sử dụng các bảng chuẩn: `conversation_sessions`, `conversation_messages`, `translation_logs`.
2. **Quản lý danh mục Ngôn ngữ động qua Entity `Language` (Bảng `languages`)**:
   - Không hardcode cố định trong code Java. Dùng bảng `languages` có các trường `is_active`, `is_default`, `order_index`, `locale_tts`.
   - Đáp ứng yêu cầu **`FR-CMS-08`**: Cho phép Admin trên Web CMS thêm mới hoặc Bật/Tắt ngôn ngữ linh hoạt khi mở rộng quy mô.
3. **Thay thế hoàn toàn Cơ sở dữ liệu cũ**:
   - Đã loại bỏ 100% file dump MySQL cũ (`multilingual_travel_guide` với các bảng chắp vá `guides`, `locations`, `translation_history`).
   - Đã tái cấu trúc toàn diện thành file `schema.sql` chuẩn InnoDB, utf8mb4 gồm **22 bảng nghiệp vụ hoàn chỉnh** và dữ liệu khởi tạo (Seed data).

---

## 2. DANH MỤC 22 ENTITY CHUẨN CỦA HỆ THỐNG

### Nhóm 1: Quản trị CMS & Người dùng hệ thống
| # | Entity | Bảng DB | Vai trò trong hệ thống |
|:---:|---|---|---|
| 1 | `AppUser` | `users` | Tài khoản nhân sự CMS: email, mật khẩu BCrypt, vai trò RBAC (`ADMIN`, `EDITOR`, `ANALYST`), khóa sau 5 lần sai. |
| 2 | `AuditLog` | `audit_logs` | Nhật ký kiểm toán CMS: lưu vết chi tiết ai làm gì, dữ liệu trước/sau (JSON). Cấm sửa/xóa. |
| 3 | `SystemSetting` | `system_settings` | Cấu hình tham số hệ thống toàn cục: P1-P10, phiên bản `DATA_VERSION` phục vụ Delta Sync. |

### Nhóm 2: Ngôn ngữ & Địa bàn quản trị
| # | Entity | Bảng DB | Vai trò trong hệ thống |
|:---:|---|---|---|
| 4 | `Language` | `languages` | Danh mục ngôn ngữ động (7 ngôn ngữ mặc định: vi, en, zh-CN, th, hi, ko, ja). Hỗ trợ Bật/Tắt. |
| 5 | `Ward` | `wards` | Danh mục Phường thí điểm (Khánh Hội, Vĩnh Hội, Xóm Chiếu - Quận 4). |
| 6 | `BusStop` | `bus_stops` | Điểm dừng/nhà chờ xe buýt: tọa độ GPS, mã trạm, địa chỉ thực tế. |

### Nhóm 3: Điểm thuyết minh POI & Đa phương tiện
| # | Entity | Bảng DB | Vai trò trong hệ thống |
|:---:|---|---|---|
| 7 | `Poi` | `pois` | Thực thể trung tâm: tọa độ GPS, bán kính geofence ($20 - 300\text{m}$), mức ưu tiên (1-5), cooldown riêng, trạng thái xuất bản. |
| 8 | `PoiTranslation` | `poi_translations` | Nội dung thuyết minh đa ngữ: tiêu đề, mô tả và kịch bản đọc TTS chuẩn dấu câu. |
| 9 | `PoiAudio` | `poi_audios` | File âm thanh thu sẵn của hướng dẫn viên hoặc file TTS nạp sẵn theo ngôn ngữ. |
| 10 | `PoiImage` | `poi_images` | Thư viện hình ảnh tư liệu di tích (nhiều ảnh, đánh dấu ảnh bìa). |

### Nhóm 4: Tuyến Tour & Mã QR hiện trường
| # | Entity | Bảng DB | Vai trò trong hệ thống |
|:---:|---|---|---|
| 11 | `Tour` | `tours` | Tuyến tour tham quan định hướng du khách. |
| 12 | `TourPoi` | `tour_pois` | Bảng liên kết Tour - POI kèm thứ tự tham quan `order_index`. |
| 13 | `QrCode` | `qr_codes` | Mã QR gắn POI + Trạm xe buýt, định dạng URL Base62 $\ge 8$ ký tự, đếm lượt quét. |

### Nhóm 5: Đóng gói Offline & Đồng bộ vi sai
| # | Entity | Bảng DB | Vai trò trong hệ thống |
|:---:|---|---|---|
| 14 | `OfflinePackage` | `offline_packages` | Quản lý gói tải offline (tách riêng ảnh và audio theo ngôn ngữ), mã băm SHA-256. |
| 15 | `OfflinePackagePoi` | `offline_package_pois` | Bảng liên kết xác định danh sách POI nằm trong từng gói tải offline. |

### Nhóm 6: Định danh ẩn danh & Phân tích hành vi (Analytics)
| # | Entity | Bảng DB | Vai trò trong hệ thống |
|:---:|---|---|---|
| 16 | `Device` | `devices` | Thiết bị di động của du khách: mã `device_id` (UUID ẩn danh), đồng ý thu thập dữ liệu. |
| 17 | `PlaybackLog` | `playback_logs` | Nhật ký nghe thuyết minh: trigger (GPS/QR/Manual), thời lượng nghe thực tế, tỷ lệ hoàn thành $\ge 95\%$. |
| 18 | `TrackingSession` | `tracking_sessions` | Phiên di chuyển của du khách (ẩn danh). |
| 19 | `LocationPoint` | `location_points` | Tọa độ GPS ghi nhận định kỳ (10s di chuyển / 60s đứng yên), tự xóa sau 90 ngày. |

### Nhóm 7: Trợ lý đối đáp Voice AI & Dịch thuật tương tác (Tính năng mở rộng)
| # | Entity | Bảng DB | Vai trò trong hệ thống |
|:---:|---|---|---|
| 20 | `ConversationSession` | `conversation_sessions` | Phiên hỏi đáp tương tác bằng giọng nói giữa du khách và AI, gắn với POI hiện tại (contextual awareness). |
| 21 | `ConversationMessage` | `conversation_messages` | Từng lượt hỏi - đáp (User voice/text $\leftrightarrow$ AI voice/text), lưu trữ URL file giọng nói phản hồi. |
| 22 | `TranslationLog` | `translation_logs` | Nhật ký dịch văn bản tự do theo nhu cầu của du khách, kèm phát âm thanh bản dịch. |

---

## 3. LÀM RÕ CÁC ĐIỂM NHẦM LẪN CŨ

1. **Bảng `users`**: Không thừa. Đây là bảng lưu tài khoản nhân sự quản trị CMS (`AppUser`), phân quyền `ADMIN`, `EDITOR`, `ANALYST`.
2. **Du khách không dùng bảng `users`**: Du khách trên thiết bị di động hoàn toàn ẩn danh, chỉ định danh qua `device_id` trong bảng `devices`.
3. **Loại bỏ các bảng Legacy**: Toàn bộ 5 bảng cũ (`locations`, `guides`, `translations`, `audios`, `histories`) đã được thay thế sạch sẽ bằng hệ thống POI chuẩn và module Conversation/Translation mới.
4. **File `schema.sql`**: Đã được viết mới 100%, sẵn sàng chạy trực tiếp vào MySQL 8.x.
