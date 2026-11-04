# PRODUCT REQUIREMENT DOCUMENT (PRD)
## HỆ THỐNG THUYẾT MINH TỰ ĐỘNG (AUTO-NARRATION SYSTEM)

| Thuộc tính | Chi tiết |
|---|---|
| **Tên sản phẩm** | Hệ thống Thuyết minh tự động (Auto-narration System) |
| **Thành phần hệ thống** | Mobile App (Android du khách), Web Admin/CMS (Quản trị viên & Biên tập viên), Backend API & Analytics, QR Code hiện trường |
| **Phiên bản tài liệu** | 1.2 (Cập nhật Xác thực Du khách Web App, Đăng nhập Google OAuth2 & Đa phương thức) |
| **Khu vực triển khai thí điểm** | Các phường Khánh Hội, Vĩnh Hội, Xóm Chiếu (theo hệ thống trạm dừng xe buýt) |
| **Đối tượng độc giả** | Nhóm phát triển phần mềm, Tester/QA, Giảng viên & Hội đồng đánh giá, Đơn vị vận hành du lịch |

---

## PHẦN 1: TỔNG QUAN SẢN PHẨM

### 1. Bảng thuật ngữ chuyên môn

| Thuật ngữ | Định nghĩa & Ý nghĩa trong hệ thống |
|---|---|
| **POI** | **Point of Interest** - Điểm thuyết minh du lịch, mang tọa độ GPS, bán kính kích hoạt và kho dữ liệu thuyết minh. |
| **Geofence** | Hàng rào địa lý ảo hình tròn bao quanh POI. Khi thiết bị di động đi vào vùng này, hệ thống tự động kích hoạt sự kiện thuyết minh. |
| **TTS** | **Text-to-Speech** - Công nghệ tổng hợp giọng nói nhân tạo từ kịch bản văn bản. |
| **Debounce** | Thuật toán chờ tọa độ người dùng duy trì ổn định liên tục trong một khoảng thời gian ngắn trước khi chính thức xác nhận đã vào vùng. |
| **Cooldown** | Khoảng thời gian tối thiểu hệ thống không phát lại cùng một bài thuyết minh POI sau khi đã phát trước đó nhằm chống spam âm thanh. |
| **Audio Queue** | Hàng đợi điều phối thứ tự phát các bài thuyết minh dựa trên mức độ ưu tiên và thời gian tiếp cận. |
| **CMS** | **Content Management System** - Hệ thống web quản trị nội dung dành cho biên tập viên và nhà quản lý. |

---

### 2. Bối cảnh & Vấn đề cần giải quyết

**Bối cảnh thực tế**: Du khách tham quan theo tuyến (đi bộ ngắm cảnh, di chuyển bằng xe buýt) luôn mong muốn lắng nghe những câu chuyện văn hóa, lịch sử về từng địa danh đi qua. Tuy nhiên, nguồn thông tin hiện tại thường phân tán, biển bảng tĩnh thiếu sinh động hoặc đòi hỏi phải thuê hướng dẫn viên du lịch đi kèm với chi phí cao.

#### Bảng phân tích nỗi đau người dùng (Pain Points):

| # | Vấn đề tồn tại (Pain Point) | Đối tượng chịu ảnh hưởng |
|---|---|---|
| **P1** | Không có hướng dẫn viên thì khách đi lướt qua điểm tham quan hay mà không hề hay biết. | Du khách |
| **P2** | Bảng thông tin tĩnh ngoài trời chỉ có một vài ngôn ngữ hạn chế, rất ít người dừng lại đọc văn bản dài. | Du khách quốc tế |
| **P3** | Phải tự tìm kiếm, mở khóa điện thoại và bấm nghe thủ công, làm đứt quãng trải nghiệm ngắm cảnh thực tế. | Du khách |
| **P4** | Tại nhà chờ xe buýt có mái che hoặc khu vực hẻm phố, sóng GPS bị suy giảm làm tính năng định vị tê liệt. | Du khách |
| **P5** | Đơn vị quản lý không nắm bắt được dòng du khách: khách đi tuyến nào, nghe điểm nào, dừng lại bao lâu. | Ban quản lý du lịch |
| **P6** | Cập nhật nội dung hoặc biên dịch đa ngôn ngữ phải thực hiện thủ công, tốn nhiều thời gian và chi phí. | Biên tập viên |
| **P7** | Tại các khu vực sóng di động yếu hoặc du khách dùng SIM roaming đắt đỏ, ứng dụng không tải được dữ liệu. | Du khách |

**Định hướng giải pháp**: Xây dựng ứng dụng di động tự động phát thuyết minh rảnh tay khi đến gần điểm (qua GPS) hoặc quét mã QR tại hiện trường, hoạt động hoàn toàn Offline, hỗ trợ 7 ngôn ngữ quốc tế, đi kèm hệ thống Web CMS quản trị trực quan và Dashboard phân tích hành vi người dùng.

---

### 3. Tầm nhìn & Mục tiêu sản phẩm

**Tầm nhìn (Vision)**: Biến chiếc điện thoại thông minh thành một “hướng dẫn viên cá nhân bỏ túi” cho mỗi du khách — tự động lên tiếng đúng lúc, đúng nơi, đúng ngôn ngữ mẹ đẻ mà không cần bất kỳ thao tác bấm chạm phức tạp nào.

| Nhóm mục tiêu | Nội dung mục tiêu cụ thể |
|---|---|
| **Trải nghiệm người dùng** | • **G1**: Trải nghiệm nghe rảnh tay tự động, hoàn toàn không bị phát lặp lại hoặc chồng chéo âm thanh.<br>• **G2**: Nghe được nội dung ngay cả khi mất sóng Internet hoặc GPS bị khuất (chế độ Offline + QR Code).<br>• **G3**: Tùy chọn ngôn ngữ mẹ đẻ và giọng đọc phù hợp sở thích cá nhân. |
| **Vận hành nội dung** | • **G4**: Biên tập viên tự thêm POI, tải audio, biên dịch, gom cụm Tour trực quan mà không cần lập trình viên can thiệp.<br>• **G5**: Dữ liệu cập nhật trên CMS tự động đồng bộ về ứng dụng di động khi thiết bị có kết nối mạng. |
| **Phân tích dữ liệu** | • **G6**: Cung cấp báo cáo chuyên sâu về hành vi du khách (tuyến đường, điểm hot, thời lượng nghe) trên nguyên tắc ẩn danh tuyệt đối. |
| **Kỹ thuật hệ thống** | • **G7**: Định vị ngầm ổn định, tối ưu hóa tiêu hao pin ($\le 10\%$/giờ), thuật toán xử lý âm thanh không gây spam. |

---

### 4. Chỉ số thành công (Key Performance Indicators - KPI)

> **Ghi chú mốc nghiệm thu**: Các chỉ số định lượng dưới đây là đề xuất làm cơ sở đánh giá chất lượng kỹ thuật trong các đợt kiểm thử thực địa và nghiệm thu đề tài.

| Mã | Chỉ số đo lường | Mục tiêu đề xuất | Phương pháp kiểm chứng |
|---|---|---|---|
| **K1** | Độ chính xác kích hoạt GPS (vào vùng phát đúng POI) | $\ge 90\%$ | Kiểm thử thực địa theo kịch bản đi bộ / xe buýt |
| **K2** | Độ trễ từ khi vào vùng đến khi bắt đầu phát | $\le 3$ giây *(dữ liệu offline)* | Đo thời gian trên thiết bị di động thật |
| **K3** | Số trường hợp phát lặp ngoài ý muốn trong Cooldown | 0 vi phạm | Kiểm thử di chuyển lặp lại nhiều vòng quanh ranh giới |
| **K4** | Thời gian từ lúc quét QR đến khi phát âm thanh | $\le 5$ giây | Đo thực tế với mã QR tại trạm xe buýt |
| **K5** | Tỷ lệ du khách nghe trọn vẹn bài thuyết minh | $\ge 60\%$ | Thống kê tổng hợp qua Analytics |
| **K6** | Số điểm POI được nghe trung bình trong một phiên | $\ge 3$ POI | Thống kê tổng hợp qua Analytics |
| **K7** | Mức độ tiêu hao pin khi ứng dụng chạy nền định vị | $\le 10\%$ / giờ | Đo thực nghiệm liên tục 1 giờ trên thiết bị chuẩn |
| **K8** | Tỷ lệ POI phát được khi ngắt hoàn toàn kết nối mạng | $100\%$ | Kiểm thử thiết bị ở Chế độ máy bay (Airplane mode) |
| **K9** | Thời gian admin tạo 1 POI đủ nội dung (vi + en, có audio) | $\le 10$ phút | Đo thời gian thao tác thực tế của người dùng trên CMS |

---

### 5. Phạm vi sản phẩm (Product Scope)

#### Trong phạm vi phiên bản đầu tiên (In Scope - MVP):
* Bản đồ số hiển thị vị trí thời gian thực của người dùng, toàn bộ marker POI và làm nổi bật POI gần nhất.
* Màn hình chi tiết POI gồm mô tả văn bản, thư viện ảnh vuốt ngang, nút nghe thủ công và liên kết chỉ đường.
* Bộ não Geofence tự động kích hoạt kèm thuật toán Debounce và Hysteresis chống nhiễu ranh giới.
* Cơ chế phát thuyết minh hỗ trợ song song File Audio thu sẵn và TTS, điều phối qua Audio Queue, cơ chế Cooldown và xử lý ngắt âm thanh.
* Kích hoạt tức thì bằng quét mã QR tại các trạm dừng xe buýt, hoàn toàn không phụ thuộc tín hiệu GPS.
* Kiến trúc Offline-first bằng SQLite, đồng bộ dữ liệu vi sai (Delta Sync), quản lý gói tải offline theo khu vực/ngôn ngữ.
* Hỗ trợ 7 ngôn ngữ quốc tế cho giao diện và nội dung thuyết minh.
* **Xác thực người dùng Web App & Quản lý tài khoản Du khách**: Bắt buộc đăng ký và đăng nhập tài khoản để truy cập đầy đủ các phân hệ của Web App. Hỗ trợ đăng nhập một chạm qua **Google OAuth 2.0 (Google Sign-In)**, Email & Mật khẩu, liên kết mạng xã hội (Apple ID, Facebook Login). Cho phép lưu POI yêu thích và đồng bộ hành trình.
* Trang Web CMS: Quản lý POI, Audio, Bản dịch, Tour, Sinh mã QR, Xuất bản dữ liệu, Báo cáo Analytics và Quản trị tài khoản người dùng/du khách.

#### Ngoài phạm vi phiên bản đầu (Out of Scope):
* Không bắt buộc đăng nhập đối với du khách quét mã QR xem nhanh nội dung tóm tắt tại trạm (Guest Mode / Quick Preview - nếu cấu hình), nhưng yêu cầu đăng nhập tài khoản đầy đủ để truy cập toàn diện Web App, tương tác trợ lý Voice AI và đồng bộ dữ liệu.
* Không tích hợp tính năng thanh toán, mua vé tham quan hoặc đặt tour trực tuyến.
* Không xây dựng tính năng dẫn đường từng bước rẽ (Turn-by-turn navigation — chỉ mở ứng dụng bản đồ ngoài).
* Không xây dựng tính năng mạng xã hội, bình luận, chấm điểm sao.
* Chưa tích hợp tính năng tự động sinh nội dung tự động bằng Generative AI.

---

### 6. Chân dung người dùng (Personas)

* **Persona 1: Du khách (Visitor / Registered User - Primary Actor)**: Khách tham quan trong nước hoặc quốc tế đi bộ hoặc xe buýt; đăng ký/đăng nhập nhanh chóng qua tài khoản Google hoặc Email để truy cập Web App; cần nghe thuyết minh tự động rảnh tay bằng ngôn ngữ của mình; lưu danh sách điểm di tích yêu thích và xem lại lịch sử nghe.
* **Persona 2: Biên tập viên nội dung (Editor - Primary Actor)**: Nhân sự vận hành du lịch không rành lập trình; cần giao diện web trực quan để cắm mốc tọa độ POI, tải file âm thanh, nhập bản dịch và gom cụm tour tham quan.
* **Persona 3: Nhà quản lý / Chuyên viên phân tích (Analyst - Primary Actor)**: Người lập kế hoạch tuyến điểm du lịch; cần xem báo cáo trực quan về địa điểm thu hút khách nhất, mật độ phân bố và thời lượng dừng chân lắng nghe.
* **Persona 4: Quản trị viên hệ thống (Admin - Primary Actor)**: Có toàn quyền quản trị CMS, phân quyền tài khoản (Admin, Editor, Analyst, quản lý danh sách User du khách) và theo dõi nhật ký kiểm toán hệ thống (Audit Log).

---

### 7. Hành trình người dùng chính (User Journeys)

* **Kịch bản A (Tham quan tự động bằng GPS)**: Du khách mở app $\rightarrow$ Tải gói offline khi có Wifi $\rightarrow$ Bỏ điện thoại vào túi đi dạo $\rightarrow$ Khi đến gần POI, app chạy ngầm tự động phát bài thuyết minh tương ứng $\rightarrow$ Du khách có thể mở máy xem hình ảnh tư liệu $\rightarrow$ Đi tiếp sang POI kế tiếp mà không bị phát lại bài cũ.
* **Kịch bản B (Quét mã QR tại trạm xe buýt)**: Du khách đứng chờ xe buýt tại trạm dừng (Khánh Hội, Vĩnh Hội, Xóm Chiếu) $\rightarrow$ Thấy biển báo có mã QR $\rightarrow$ Quét mã bằng camera $\rightarrow$ App tự động mở đúng POI và phát thuyết minh ngay lập tức kể cả khi sóng GPS bị che khuất.
* **Kịch bản C (Biên tập viên cập nhật & xuất bản nội dung)**: Editor đăng nhập CMS $\rightarrow$ Chọn vị trí trên bản đồ, nhập bán kính $\rightarrow$ Soạn mô tả, tải file audio và nhập bản dịch đa ngữ $\rightarrow$ Bấm "Xuất bản" $\rightarrow$ Hệ thống tăng phiên bản dữ liệu; app của khách tự động cập nhật khi có mạng.
* **Kịch bản D (Đăng nhập & Trải nghiệm Web App)**: Du khách truy cập Web App $\rightarrow$ Hệ thống chuyển hướng yêu cầu Đăng nhập $\rightarrow$ Du khách chọn "Tiếp tục với Google" (Google OAuth 2.0) hoặc nhập Email/Mật khẩu $\rightarrow$ Xác thực thành công và nhận phiên làm việc JWT $\rightarrow$ Khám phá bản đồ, nghe thuyết minh, bấm "Thêm vào yêu thích" và quản lý hồ sơ cá nhân.

---

### 8. Bảng User Stories tổng quan (Phân loại MoSCoW)

| ID | Là một... | Tôi muốn... | Để... | Ưu tiên |
|---|---|---|---|:---:|
| **US-01** | Du khách | Thấy vị trí của mình và các POI trên bản đồ | Biết xung quanh mình có những điểm tham quan nào | **M** |
| **US-02** | Du khách | POI gần nhất được làm nổi bật trên bản đồ | Dễ dàng nhận biết và định hướng tới điểm gần nhất | **M** |
| **US-03** | Du khách | Ứng dụng tự động phát thuyết minh khi tôi đến gần POI | Trải nghiệm rảnh tay, không cần liên tục bấm điện thoại | **M** |
| **US-04** | Du khách | Không bị nghe lặp lại cùng một bài thuyết minh liên tục | Tránh cảm giác bị làm phiền và spam âm thanh | **M** |
| **US-05** | Du khách | Âm thanh tự tạm dừng khi có cuộc gọi hoặc thông báo | Không bị xung đột và chồng chéo âm thanh | **M** |
| **US-06** | Du khách | Quét mã QR tại điểm dừng để nghe ngay nội dung | Nghe thuyết minh dễ dàng ở khu vực GPS yếu | **M** |
| **US-07** | Du khách | Tải trước gói dữ liệu để sử dụng Offline | Nghe thuyết minh bình thường khi không có mạng 4G | **M** |
| **US-08** | Du khách | Chọn ngôn ngữ mẹ đẻ và giọng đọc TTS yêu thích | Nghe thuyết minh tự nhiên và thuận tiện nhất | **S** |
| **US-09** | Du khách | Chỉnh độ nhạy GPS và hệ số bán kính kích hoạt | Phù hợp với phương tiện di chuyển (đi bộ, xe buýt) | **S** |
| **US-10** | Du khách | Xem chi tiết thông tin, lịch sử và hình ảnh POI | Tìm hiểu sâu sắc hơn về giá trị di tích | **M** |
| **US-11** | Admin/Editor | Tạo, sửa POI (tọa độ GPS, bán kính, ưu tiên) | Quản lý mạng lưới điểm thuyết minh chuẩn xác | **M** |
| **US-12** | Admin/Editor | Tải audio và cấu hình script TTS theo ngôn ngữ | Cung cấp nội dung thuyết minh phong phú, đa ngữ | **M** |
| **US-13** | Admin/Editor | Gom các POI thành tuyến Tour tham quan hoàn chỉnh | Định hướng lộ trình du lịch chuyên nghiệp cho du khách | **S** |
| **US-14** | Admin | Xem nhật ký hoạt động quản trị và lịch sử sử dụng | Kiểm soát vận hành và bảo đảm an toàn hệ thống | **S** |
| **US-15** | Manager | Xem Top POI nghe nhiều nhất và thời gian nghe TB | Đánh giá mức độ thu hút của từng điểm tham quan | **S** |
| **US-16** | Manager | Xem Heatmap mật độ vị trí và tuyến di chuyển ẩn danh | Thấu hiểu dòng lưu chuyển để quy hoạch du lịch | **S** |
| **US-17** | Người lắp QR | Sinh mã và quản lý danh sách QR theo trạm dừng | Gắn chính xác mã QR vật lý với đúng nội dung số | **M** |
| **US-18** | Du khách | Đăng nhập một chạm bằng tài khoản Google | Truy cập Web App tức thì không cần nhớ mật khẩu mới | **M** |
| **US-19** | Du khách | Đăng ký & Đăng nhập bằng Email và mật khẩu | Sử dụng ứng dụng khi không muốn liên kết mạng xã hội | **M** |
| **US-20** | Du khách | Đăng nhập bằng Apple ID / Facebook | Có thêm phương thức đăng nhập linh hoạt theo thói quen | **S** |
| **US-21** | Du khách | Lưu danh sách POI yêu thích vào tài khoản | Dễ dàng xem lại các địa điểm tâm đắc bất kỳ lúc nào | **M** |
| **US-22** | Admin | Quản lý danh sách tài khoản du khách | Xem số lượng người dùng, hỗ trợ khóa/mở khóa tài khoản khi cần | **S** |

*(Ghi chú: **M** = Must have, **S** = Should have, **C** = Could have, **W** = Won't have)*

---

## PHẦN 2: YÊU CẦU CHỨC NĂNG CHI TIẾT (FUNCTIONAL REQUIREMENTS)

### 9. Bảng tham số hệ thống mặc định (System Parameters)

| Mã | Tên tham số | Giá trị mặc định đề xuất | Vị trí cấu hình |
|---|---|---|---|
| **P1** | Bán kính kích hoạt Geofence | $50\text{ m}$ (cho phép cấu hình $20 - 300\text{ m}$) | Cấu hình trên CMS theo từng POI |
| **P2** | Thời gian Debounce lọc nhiễu | Ở trong vùng liên tục $\ge 3$ giây | Cấu hình hệ thống |
| **P3** | Hệ số Hysteresis khi rời vùng | Khoảng cách $>$ Bán kính $\times 1{,}2$ | Cấu hình hệ thống |
| **P4** | Thời gian Cooldown mỗi POI | 30 phút (cho phép ghi đè theo POI) | Hệ thống, ghi đè trên CMS |
| **P5** | Ngưỡng sai số GPS chấp nhận | Sai số $\le 50\text{ m}$ | Cài đặt app (theo mức độ nhạy) |
| **P6** | Sức chứa hàng đợi Audio Queue | 3 mục chờ | Cố định trong mã nguồn |
| **P7** | Hạn hiệu lực mục trong hàng đợi | 60 giây | Cố định trong mã nguồn |
| **P8** | Ngưỡng tính một lượt nghe hợp lệ | Lắng nghe $\ge 5$ giây | Cấu hình hệ thống |
| **P9** | Chu kỳ ghi tọa độ vị trí Analytics | 10s khi di chuyển, 60s khi đứng yên | Cấu hình hệ thống |
| **P10** | Thời gian lưu trữ vị trí thô | 90 ngày (sau đó xóa vĩnh viễn) | Cấu hình hệ thống |

---

### 10. Module Bản đồ (FR-MAP)

| ID | Yêu cầu chức năng | Tiêu chí nghiệm thu (Acceptance Criteria - AC) | Ưu tiên |
|---|---|---|:---:|
| **FR-MAP-01** | Hiển thị vị trí thực tế của người dùng | Chấm vị trí cập nhật liên tục theo chu kỳ GPS; có nút “Về vị trí của tôi” đưa góc nhìn camera về đúng vị trí thực. | **M** |
| **FR-MAP-02** | Hiển thị toàn bộ POI đã xuất bản | Mỗi POI trong CSDL local thể hiện bằng 1 marker; POI Nháp/Lưu trữ không hiển thị; tự động gom cụm (Clustering) khi zoom xa. | **M** |
| **FR-MAP-03** | Làm nổi bật POI gần nhất | Marker gần nhất có màu sắc/kích thước khác biệt, kèm nhãn “Cách bạn X m”; tự đổi khi vị trí thay đổi; sai số tính toán $< 1\text{ m}$. | **M** |
| **FR-MAP-04** | Chạm marker xem tóm tắt | Hiện Bottom sheet gồm tên, ảnh đại diện, khoảng cách, nút “Nghe” và “Chi tiết”; thời gian mở $\le 1$ giây. | **M** |
| **FR-MAP-05** | Vẽ vòng Geofence của POI đang chọn | Vẽ vòng tròn trực quan thể hiện bán kính kích hoạt đúng theo giá trị cấu hình `geofence_radius`. | **S** |
| **FR-MAP-06** | Xin quyền vị trí và xử lý từ chối | Có màn hình giải thích trước khi xin quyền; nếu từ chối vẫn cho xem bản đồ, nghe thủ công và quét QR; có nút dẫn tới cài đặt máy. | **M** |
| **FR-MAP-07** | Danh sách POI dạng List | Cung cấp danh sách song song, hỗ trợ sắp xếp theo khoảng cách, tìm theo tên, lọc theo Tour. | **S** |
| **FR-MAP-08** | Hiển thị lộ trình Tour | Khi chọn Tour, các POI được nối tuyến theo chỉ số `order_index` và đánh số thứ tự trên bản đồ. | **S** |

---

### 11. Module Chi tiết POI (FR-DET)

| ID | Yêu cầu chức năng | Tiêu chí nghiệm thu (AC) | Ưu tiên |
|---|---|---|:---:|
| **FR-DET-01** | Màn hình chi tiết POI | Hiển thị tên, mô tả theo ngôn ngữ chọn, thư viện ảnh vuốt ngang, nút Phát/Tạm dừng, danh sách Tour liên quan. | **M** |
| **FR-DET-02** | Cơ chế nghe thủ công | Bấm “Nghe” thì phát ngay lập tức kể cả khi đang trong thời gian Cooldown; nhật ký ghi nhận `trigger_type = MANUAL`. | **M** |
| **FR-DET-03** | Liên kết bản đồ chỉ đường (Map link) | Nút “Chỉ đường” mở ứng dụng bản đồ mặc định của điện thoại (Google Maps) dẫn đường tới đúng tọa độ POI. | **S** |
| **FR-DET-04** | Chuỗi dự phòng ngôn ngữ (Fallback) | Nếu thiếu bản dịch ngôn ngữ chọn, hệ thống tự động fallback: Ngôn ngữ chọn $\rightarrow$ Tiếng Anh (`en`) $\rightarrow$ Tiếng Việt (`vi`), kèm nhãn “Chưa có bản dịch”. | **M** |
| **FR-DET-05** | Hiển thị ảnh khi Offline | Ảnh thuộc gói đã tải hiển thị không cần mạng; ảnh chưa tải hiển thị ảnh giữ chỗ (placeholder), không gây crash ứng dụng. | **M** |

---

### 12. Module Geofence Engine (FR-GEO)

* **Nguyên tắc phân định**: Geofence Engine chỉ chịu trách nhiệm quyết định thời điểm phát sinh sự kiện kích hoạt. Việc quyết định có phát âm thanh hay không hoàn toàn thuộc về Narration Engine.
* **Máy trạng thái Geofence**:  
  $$\text{OUTSIDE} \xrightarrow{\text{khoảng cách} \le \text{bán kính}} \text{ENTERING (đang debounce)} \xrightarrow{\text{đủ } P2 \ge 3s} \text{INSIDE (bắn sự kiện ENTER)} \xrightarrow{\text{khoảng cách} > \text{bán kính} \times 1{,}2} \text{OUTSIDE}$$
* **Quy tắc ưu tiên**: Khi vị trí người dùng nằm trong nhiều POI cùng lúc: Xét mức độ ưu tiên (`priority`) cao nhất trước, nếu bằng nhau mới xét khoảng cách gần nhất sau.

| ID | Yêu cầu chức năng | Tiêu chí nghiệm thu (AC) | Ưu tiên |
|---|---|---|:---:|
| **FR-GEO-01** | Nạp dữ liệu vào bộ nhớ RAM khi mở | Nạp toàn bộ 500 POI từ SQLite vào RAM trong thời gian $< 1$ giây; hoàn toàn offline. | **M** |
| **FR-GEO-02** | Theo dõi vị trí chạy nền (Background Service) | Khóa màn hình hoặc chuyển ứng dụng khác trong 10 phút vẫn kích hoạt chính xác; có thông báo thường trực trên thanh thông báo. | **M** |
| **FR-GEO-03** | Lọc dữ liệu GPS kém chất lượng | Bỏ qua tọa độ có sai số lớn hơn ngưỡng P5 ($> 50\text{ m}$); bỏ qua điểm nhảy cóc có vận tốc suy đoán $> 120\text{ km/h}$. | **M** |
| **FR-GEO-04** | Tính khoảng cách bằng công thức Haversine | Sai lệch khoảng cách $< 1\text{ m}$ so với công cụ tính toán địa lý chuẩn trên 20 cặp tọa độ kiểm thử. | **M** |
| **FR-GEO-05** | Sinh sự kiện ENTER khi vào vùng | Đứng/đi vào bán kính POI liên tục $\ge P2$ (3s) sinh đúng 1 sự kiện ENTER kèm: `poi_id`, `distance`, `accuracy`, `timestamp`. | **M** |
| **FR-GEO-06** | Thuật toán Debounce chống nhiễu | Đi lướt qua mép vùng $< 3$ giây không sinh sự kiện; ra vào mép 10 lần liên tục trong 1 phút chỉ sinh tối đa 1 sự kiện. | **M** |
| **FR-GEO-07** | Thuật toán Hysteresis khi rời vùng | Chỉ trở về trạng thái OUTSIDE khi khoảng cách $>$ bán kính $\times 1{,}2$; di chuyển sát ranh giới không sinh sự kiện thứ hai. | **M** |
| **FR-GEO-08** | Lựa chọn POI theo quy tắc ưu tiên | Với 3 POI chồng lấn (mức ưu tiên lần lượt là 3, 3, 1), POI mức ưu tiên 3 ở gần hơn sẽ được kích hoạt đầu tiên. | **M** |
| **FR-GEO-09** | Sự kiện tiếp cận sớm (APPROACH) | Khi vào vòng ngoài (bán kính $+ 30\text{ m}$), app nạp sẵn audio/chuẩn bị TTS và highlight POI nhằm giảm độ trễ phát ($\le 3$s); không phát tiếng. | **S** |
| **FR-GEO-10** | Tối ưu pin thích ứng | Đứng yên $> 60$ giây hoặc cách POI gần nhất $> 500\text{ m}$ thì tự động giảm tần suất quét GPS; tăng lại khi tiến gần; bảo đảm tiêu hao pin $\le 10\%$/giờ. | **M** |
| **FR-GEO-11** | Xử lý mất GPS / Thu hồi quyền | Hiện banner trạng thái; khi có lại tín hiệu hoặc cấp lại quyền thì tự tiếp tục, không cần khởi động lại ứng dụng. | **M** |
| **FR-GEO-12** | Tham số động theo từng POI | Giá trị `radius` và `priority` lấy từ CMS; sửa trên CMS và đồng bộ là áp dụng ngay ở chu kỳ quét kế tiếp. | **M** |
| **FR-GEO-13** | Tự phục hồi sau khi bị hệ điều hành tắt service | Nếu service bị HĐH tắt giải phóng RAM, service tự khởi động lại và nạp lại trạng thái; mất tối đa 1 chu kỳ lấy vị trí. | **S** |

---

### 13. Module Narration Engine (FR-NAR)

* **Thứ tự ưu tiên nguồn phát âm thanh**:  
  $$\text{Audio local đúng ngôn ngữ} \rightarrow \text{Audio streaming trực tuyến} \rightarrow \text{TTS đúng ngôn ngữ} \rightarrow \text{TTS ngôn ngữ mặc định (vi)} \rightarrow \text{Hiển thị văn bản kèm thông báo}$$

| ID | Yêu cầu chức năng | Tiêu chí nghiệm thu (AC) | Ưu tiên |
|---|---|---|:---:|
| **FR-NAR-01** | Giao diện Trigger thống nhất | Cả 3 nguồn (GPS, QR, Manual) đều đi qua cùng một hàm xử lý trung tâm; nhật ký ghi đúng `trigger_type`. | **M** |
| **FR-NAR-02** | Lựa chọn nguồn phát theo thứ tự ưu tiên | Có file audio: luôn phát audio; xóa audio: tự dùng TTS; xóa cả script TTS: hiển thị văn bản mô tả. | **M** |
| **FR-NAR-03** | Phát file âm thanh thu sẵn | Hỗ trợ định dạng mp3/m4a/aac; cho phép tua; phát đúng file theo ngôn ngữ chọn; bắt đầu phát $\le 3$ giây kể từ sự kiện. | **M** |
| **FR-NAR-04** | Phát giọng đọc nhân tạo TTS đa ngữ | Chia script theo dấu câu đặc thù (`. ? !` cho vi/en/ko; `。！？` cho zh/ja; `।` cho hi; khoảng trắng/xuống dòng $\le 200$ ký tự cho th); kiểm tra gói giọng trên máy. | **M** |
| **FR-NAR-05** | Hàng đợi âm thanh (Audio Queue) | Sức chứa tối đa 3 mục; xếp theo `priority` rồi thời gian vào hàng; mục chờ quá 60s mà khách đã rời vùng thì bị loại; hàng đầy thì loại mục `priority` thấp nhất. | **M** |
| **FR-NAR-06** | Chống phát lặp bằng Cooldown | Trong vòng 30 phút sau khi phát tự động, tuyệt đối không phát lại POI đó; mốc cooldown lưu bền trong SQLite, còn nguyên sau khi tắt/mở app. | **M** |
| **FR-NAR-07** | Ngoại lệ của Cooldown | Kích hoạt thủ công (MANUAL) và quét mã (QR) được bỏ qua cooldown và phát ngay lập tức. | **M** |
| **FR-NAR-08** | Xử lý ngắt âm thanh (Interruption) | Tuân thủ quy tắc ngắt chuẩn: Cuộc gọi đến $\rightarrow$ Tạm dừng; Nhạc/Video khác $\rightarrow$ Dừng hẳn; Thông báo ngắn $\rightarrow$ Ducking giảm âm; Rút tai nghe $\rightarrow$ Tạm dừng ngay. | **M** |
| **FR-NAR-09** | Giao diện điều khiển trình phát | Đầy đủ nút Phát/Tạm dừng/Dừng/Qua bài/Chỉnh tốc độ; điều khiển được từ màn hình khóa và nút bấm trên tai nghe. | **M** |
| **FR-NAR-10** | Ghi nhật ký lịch sử phát (Playback_Log) | Ghi nhận `device_id`, `poi_id`, `trigger_type`, `audio_mode`, `start_time`, `end_time`, `listened_seconds`, `is_completed`; lưu tức thì vào SQLite cục bộ. | **M** |
| **FR-NAR-11** | Xử lý lỗi phát âm thanh | File audio hỏng thì chuyển sang TTS; TTS lỗi thì hiện văn bản; app không crash; phát lỗi không bị tính cooldown. | **M** |
| **FR-NAR-12** | Công tắc tạm dừng "Tự động phát" nhanh | Nút gạt nhanh trên màn hình chính; khi tắt: GPS không tự phát nhưng vẫn ghi nhận sự kiện phục vụ thống kê (nếu bật). | **S** |

---

### 14. Module Dữ liệu, Offline & Đồng bộ (FR-CON)

| ID | Yêu cầu chức năng | Tiêu chí nghiệm thu (AC) | Ưu tiên |
|---|---|---|:---:|
| **FR-CON-01** | CSDL SQLite cục bộ | Lưu bản sao `POI`, `Translation`, `Audio`, `Image`, `Tour`, `Offline_Package`, `QR_Code`, `Settings`, `Playback_Log`; phát âm thanh chỉ đọc từ local. | **M** |
| **FR-CON-02** | Đồng bộ dữ liệu vi sai (Delta Sync) | Gửi `since_version`; nhận phần thay đổi trong 1 Database Transaction duy nhất; lỗi thì rollback toàn bộ, không để dữ liệu dở dang. | **M** |
| **FR-CON-03** | Quy tắc giải quyết xung đột | Dữ liệu nội dung (POI, Tour): Server thắng (Server Wins). Dữ liệu nhật ký log: Local gửi lên, server lưu tích lũy, không ghi đè. | **M** |
| **FR-CON-04** | Tải gói dữ liệu Offline | Gói tải tách riêng phần ảnh dùng chung và phần audio theo ngôn ngữ; có tiến độ %, kiểm tra mã băm SHA-256; tải tiếp khi đứt mạng. | **M** |
| **FR-CON-05** | Tùy chọn "Chỉ tải bằng Wi-Fi" | Bật thì chặn tải các gói dữ liệu offline qua mạng di động 4G/5G; mặc định được bật. | **S** |
| **FR-CON-06** | Kiểm tra dung lượng bộ nhớ trống | Đo bộ nhớ máy trước khi tải; không đủ chỗ trống thì báo lỗi rõ ràng và không cho phép tải. | **M** |
| **FR-CON-07** | Cập nhật gói đã tải | Có phiên bản mới hiện “Có bản cập nhật”; chỉ tải phần chênh lệch (delta); tải xong mới thay thế bản cũ (atomic). | **S** |
| **FR-CON-08** | Xóa gói dữ liệu Offline | Cho phép xóa từng gói giải phóng bộ nhớ; xóa xong thì chuyển sang dùng TTS hoặc streaming online khi có mạng. | **M** |
| **FR-CON-09** | Gửi log lên máy chủ | Gửi theo lô khi có mạng; mỗi bản ghi có UUID chống trùng lặp (Idempotent); thất bại thì thử lại với cơ chế Exponential Backoff. | **M** |
| **FR-CON-10** | Dữ liệu khởi tạo lần đầu | Lần đầu mở app cần mạng tải danh sách POI cơ bản hoặc đóng gói sẵn bộ dữ liệu mẫu trong APK; nếu không có thì hiện hướng dẫn rõ ràng. | **M** |
| **FR-CON-11** | Kiểm tra toàn vẹn khi Offline | Bật Chế độ máy bay: 100% các điểm POI thuộc gói đã tải đều phát được nội dung thuyết minh đầy đủ (đáp ứng KPI K8). | **M** |

---

### 15. Module QR Code (FR-QR)

| ID | Yêu cầu chức năng | Tiêu chí nghiệm thu (AC) | Ưu tiên |
|---|---|---|:---:|
| **FR-QR-01** | Tiêu chuẩn cấu trúc mã QR | Mã chứa URL `https://<domain>/q/<code>` với code ngẫu nhiên bảo mật $\ge 8$ ký tự Base62; quét nhạy ở khoảng cách 20 – 50 cm. | **M** |
| **FR-QR-02** | Mở app qua Android App Links | Máy đã cài app: quét mã mở thẳng vào đúng POI, không qua các bước trung gian thừa. | **M** |
| **FR-QR-03** | Trình quét mã QR tích hợp trong App | Nút quét QR ngay tại màn hình chính; có hộp thoại xin quyền camera kèm giải thích rõ ràng. | **M** |
| **FR-QR-04** | Hoạt động độc lập không cần GPS | Tắt hoàn toàn GPS trên thiết bị vẫn phát thuyết minh bình thường (thời gian phản hồi $\le 5$ giây theo K4). | **M** |
| **FR-QR-05** | Hành vi khi đang phát bài khác | Quét QR là hành động chủ động trực tiếp $\rightarrow$ hệ thống ngắt bài đang phát để phát ngay bài của mã QR; bỏ qua Cooldown. | **M** |
| **FR-QR-06** | Ghi nhận nhật ký lượt quét | Bản ghi nhật ký ghi nhận `trigger_type = QR`, `qr_id`, `bus_stop_id`. | **M** |

---

### 16. Module Cài đặt & Giao diện (FR-SET)

| ID | Yêu cầu chức năng | Tiêu chí nghiệm thu (AC) | Ưu tiên |
|---|---|---|:---:|
| **FR-SET-01** | Lựa chọn ngôn ngữ | Lần đầu tự nhận ngôn ngữ máy (nếu ngoài 7 ngôn ngữ thì chọn Tiếng Anh); đổi ngôn ngữ lập tức cập nhật giao diện và âm thanh, không cần khởi động lại app. | **M** |
| **FR-SET-02** | Tùy chọn giọng đọc TTS và tốc độ | Liệt kê các giọng đọc hỗ trợ trên thiết bị theo ngôn ngữ; có nút nghe thử; thanh chỉnh tốc độ đọc ($0{,}8\times - 1{,}5\times$). | **S** |
| **FR-SET-03** | Tùy chỉnh độ nhạy GPS | 3 mức: Tiết kiệm pin (15s, sai số 80m) / Cân bằng (5s, sai số 50m) / Chính xác cao (2s, sai số 30m); áp dụng ngay lập tức. | **S** |
| **FR-SET-04** | Điều chỉnh hệ số bán kính kích hoạt | Cho phép chọn hệ số $\times 0{,}5$ / $\times 1{,}0$ / $\times 1{,}5$ áp dụng lên bán kính POI; không vượt khoảng cho phép của P1 (20 – 300m). | **S** |
| **FR-SET-05** | Bật/tắt tự động phát và chạy nền | Tắt chạy nền thì dừng hoàn toàn background service và gỡ thông báo thường trực trên thanh trạng thái. | **M** |
| **FR-SET-06** | Quản lý gói dữ liệu Offline | Xem danh sách gói đã tải, dung lượng, ngày cập nhật; có nút xóa và cập nhật riêng cho từng gói. | **M** |
| **FR-SET-07** | Cài đặt quyền riêng tư | Bật/tắt thu thập vị trí ẩn danh; nút Đặt lại mã ẩn danh (Reset Device ID); nút Xóa dữ liệu cục bộ và gửi lệnh xóa trên server. | **M** |
| **FR-SET-08** | Lưu trữ cài đặt bền vững | Mở lại ứng dụng các cài đặt vẫn được giữ nguyên trạng thái. | **M** |

---

### 17. Module Web CMS - Quản trị nội dung (FR-CMS)

#### Phân quyền quản trị (RBAC):
* **Admin**: Toàn quyền hệ thống, quản lý tài khoản người dùng CMS và du khách, xem nhật ký `Audit_Log`.
* **Editor**: Quản lý POI, tải audio, biên tập bản dịch đa ngữ, quản lý Tour, trạm buýt, sinh mã QR và xuất bản nội dung.
* **Analyst**: Quyền chỉ xem (Read-only) các màn hình Dashboard Analytics và lịch sử sử dụng `Playback_Log`.
* **User (Du khách)**: Quyền truy cập các tính năng người dùng trên Web App (xem bản đồ, nghe thuyết minh, hỏi đáp Voice AI, lưu điểm yêu thích, quản lý hồ sơ cá nhân).

| ID | Yêu cầu chức năng | Tiêu chí nghiệm thu (AC) | Ưu tiên |
|---|---|---|:---:|
| **FR-CMS-01** | Đăng nhập an toàn | Mật khẩu băm chuẩn bcrypt/argon2; khóa tài khoản tạm sau 5 lần nhập sai; phiên làm việc tự hết hạn khi không hoạt động. | **M** |
| **FR-CMS-02** | Phân quyền theo vai trò | Kiểm tra quyền hạn tại từng API máy chủ; chặn truy cập trái phép ở cả giao diện và tầng backend. | **M** |
| **FR-CMS-03** | Quản lý danh sách POI | Tìm kiếm theo tên; lọc theo Trạng thái (Nháp/Xuất bản/Lưu trữ), Phường, “Thiếu bản dịch”, “Thiếu audio”; phân trang. | **M** |
| **FR-CMS-04** | Tạo & Chỉnh sửa POI | Chọn tọa độ trên bản đồ hoặc nhập tay; kiểm tra dữ liệu hợp lệ: lat [-90, 90], lng [-180, 180], bán kính 20 – 300m, priority số nguyên 1-5. | **M** |
| **FR-CMS-05** | Xem trước vùng Geofence | Kéo chỉnh thanh trượt bán kính thì vòng tròn geofence co giãn trực quan trên bản đồ; cảnh báo nếu chồng lấn POI lân cận. | **S** |
| **FR-CMS-06** | Quản lý hình ảnh POI | Tải ảnh jpg/png/webp $\le 5\text{ MB}$; tự động nén kích thước; kéo thả đổi thứ tự; chọn ảnh bìa đại diện. | **M** |
| **FR-CMS-07** | Xóa POI an toàn (Soft delete) | Xóa mềm; cảnh báo nếu điểm POI đang thuộc Tour hoặc có mã QR đang hoạt động liên kết tới. | **M** |
| **FR-CMS-08** | Quản lý danh mục ngôn ngữ | Thêm/Bật/Tắt các ngôn ngữ; Tiếng Việt (vi) là ngôn ngữ gốc bắt buộc và không thể bị tắt. | **M** |
| **FR-CMS-09** | Nhập liệu bản dịch đa ngữ | Nhập tên, mô tả, script TTS theo từng ngôn ngữ; hiển thị tiến độ hoàn thiện dạng phân số $x/7$. | **M** |
| **FR-CMS-10** | Nhập/Xuất hàng loạt (CSV/XLSX) | Hỗ trợ Import/Export file Excel/CSV bản dịch 7 ngôn ngữ; báo lỗi chi tiết theo từng dòng (nâng lên mức S). | **S** |
| **FR-CMS-11** | Tải lên Audio thu sẵn | Nhận mp3/m4a/aac $\le 20\text{ MB}$; tự động trích xuất thời lượng; gắn theo POI + Ngôn ngữ; có trình nghe thử trực tiếp. | **M** |
| **FR-CMS-12** | Cấu hình script TTS và nghe thử | Nghe thử script đọc TTS cho cả 7 ngôn ngữ ngay trên web; cảnh báo nếu trình duyệt thiếu giọng đọc. | **S** |
| **FR-CMS-13** | Ma trận độ phủ ngôn ngữ | Hiển thị ma trận POI $\times$ 7 ngôn ngữ, mỗi ô ghi rõ nhãn: Audio thu sẵn / Script TTS / Thiếu nội dung. | **S** |
| **FR-CMS-14** | Quản lý Tour tham quan | Tạo/sửa tour, chọn POI, kéo thả sắp xếp thứ tự tham quan (`order_index`), xem trước lộ trình trên bản đồ. | **S** |
| **FR-CMS-15** | Quản lý Phường & Điểm dừng xe buýt | Thao tác CRUD danh mục Phường và Điểm dừng xe buýt (Khánh Hội, Vĩnh Hội, Xóm Chiếu); cấu hình tọa độ điểm dừng. | **M** |
| **FR-CMS-16** | Sinh và quản lý mã QR | Tạo mã QR gắn POI và điểm dừng xe buýt; tải ảnh PNG/SVG; tạo bản in chuẩn mẫu kèm tên trạm; bật/tắt từng mã. | **M** |
| **FR-CMS-17** | Thống kê lượt quét QR | Báo cáo số lượt quét theo từng mã QR, theo điểm dừng xe buýt, theo phường và khoảng thời gian. | **S** |
| **FR-CMS-18** | Cơ chế xuất bản nội dung (Publish) | Bấm Xuất bản $\rightarrow$ kiểm tra điều kiện Publish Gate $\rightarrow$ tăng phiên bản `data_version`; ghi nhận `Audit_Log`. | **M** |
| **FR-CMS-19** | Build gói dữ liệu Offline | Tạo gói offline theo tour/khu vực + ngôn ngữ; hiển thị dung lượng, phiên bản; yêu cầu phải có bản đã xuất bản. | **M** |
| **FR-CMS-20** | Nhật ký kiểm toán (Audit_Log) | Ghi nhận: Ai làm, hành động gì, dữ liệu trước/sau, thời gian; bộ lọc tra cứu; cấm sửa hoặc xóa. | **S** |
| **FR-CMS-21** | Nhật ký sử dụng (Playback_Log) | Xem danh sách các lượt nghe ẩn danh; lọc theo POI, thời gian, loại trigger (GPS/QR/Manual), ngôn ngữ. | **S** |

---

### 18. Module Phân tích dữ liệu (FR-ANA)

#### Định nghĩa các chỉ số phân tích:
* **Lượt nghe hợp lệ**: Bản ghi phát có thời lượng lắng nghe thực tế `listened_seconds` $\ge 5$ giây.
* **Top POI**: Xếp hạng các điểm POI theo tổng số lượng lượt nghe hợp lệ trong khoảng thời gian chọn.
* **Thời gian nghe TB / POI**: Tổng thời gian nghe thực tế chia cho tổng số lượt nghe hợp lệ của POI đó.
* **Tỷ lệ nghe hết bài (Completion Rate)**: Số lượt có `is_completed = true` ($\ge 95\%$ độ dài bài) chia cho tổng số lượt nghe hợp lệ.

| ID | Yêu cầu chức năng | Tiêu chí nghiệm thu (AC) | Ưu tiên |
|---|---|---|:---:|
| **FR-ANA-01** | Định danh thiết bị hoàn toàn ẩn danh | `device_id` là chuỗi UUID ngẫu nhiên sinh khi cài app; không thu thập IMEI, SĐT, Email, ID quảng cáo; cho phép reset. | **M** |
| **FR-ANA-02** | Cơ chế đồng ý thu thập dữ liệu | Lần đầu mở app có màn hình giải thích và xin đồng ý; từ chối thì vẫn dùng đủ tính năng nghe, chỉ ngưng gửi tọa độ. | **M** |
| **FR-ANA-03** | Ghi nhận tuyến đường di chuyển | Tạo `Tracking_Session` và ghi nhận `Location_Point` theo chu kỳ P9 (10s/60s); lưu local và gửi theo lô khi có mạng. | **M** |
| **FR-ANA-04** | Bảo vệ quyền riêng tư trong xử lý | Cắt bỏ 100m đầu và cuối mỗi hành trình trước khi đưa vào báo cáo; ô lưới Heatmap có ít hơn 5 thiết bị thì ẩn dữ liệu. | **M** |
| **FR-ANA-05** | Chính sách xóa dữ liệu vị trí thô | Vị trí thô tự động xóa sau 90 ngày (P10), chỉ giữ số liệu tổng hợp; khi người dùng reset ID thì ngắt liên kết dữ liệu cũ. | **M** |
| **FR-ANA-06** | Dashboard tổng quan | Hiển thị số phiên, lượt nghe, lượt quét QR, tỷ lệ phân bổ trigger (GPS/QR/Manual), ngôn ngữ phổ biến theo khoảng ngày. | **S** |
| **FR-ANA-07** | Báo cáo Top điểm thuyết minh | Bảng xếp hạng Top 10/20 POI nghe nhiều nhất; lọc theo khoảng ngày, ngôn ngữ, tour, loại trigger. | **S** |
| **FR-ANA-08** | Thời gian nghe trung bình mỗi POI | Hiển thị thời gian nghe TB, tỷ lệ nghe hết bài, biểu đồ đối chiếu với độ dài chuẩn của bài thuyết minh. | **S** |
| **FR-ANA-09** | Bản đồ nhiệt vị trí (Heatmap) | Lớp nhiệt Heatmap trực quan trên bản đồ; lọc theo khung giờ, ngày trong tuần, theo Tour; tuân thủ quy tắc ẩn danh. | **S** |
| **FR-ANA-10** | Mô hình tuyến di chuyển mẫu | Hiển thị tuyến đường di chuyển ẩn danh; thống kê luồng chuyển tiếp giữa các POI (từ POI A sang POI B). | **C** |
| **FR-ANA-11** | Xuất báo cáo tổng hợp | Hỗ trợ xuất báo cáo số liệu tổng hợp ra định dạng CSV; không bao gồm dữ liệu thô gắn với thiết bị cụ thể. | **C** |

---

### 19. Module Xác thực & Quản lý Người dùng Web App (FR-AUTH)

Hệ thống cung cấp cơ chế đăng ký và đăng nhập bắt buộc cho Du khách khi truy cập Web App, tích hợp Single Sign-On (SSO) qua Google OAuth 2.0 và các nhà cung cấp phổ biến, kết hợp với phiên làm việc bảo mật cao bằng JWT (Access Token + Refresh Token).

| ID | Yêu cầu chức năng | Tiêu chí nghiệm thu (Acceptance Criteria - AC) | Ưu tiên |
|---|---|---|:---:|
| **FR-AUTH-01** | Đăng ký & Đăng nhập bằng Email/Mật khẩu | Cho phép du khách đăng ký bằng Email hợp lệ, họ tên và mật khẩu (tối thiểu 8 ký tự, có chữ và số); băm mật khẩu chuẩn bcrypt/argon2; hỗ trợ quên/đặt lại mật khẩu. | **M** |
| **FR-AUTH-02** | Đăng nhập một chạm qua Google OAuth 2.0 | Tích hợp Google Sign-In (OpenID Connect / OAuth 2.0); xác thực Google ID Token tại máy chủ backend; tự động tạo tài khoản hoặc liên kết tài khoản theo email; đồng bộ họ tên và ảnh đại diện Google. | **M** |
| **FR-AUTH-03** | Đăng nhập qua các nền tảng xã hội khác | Hỗ trợ đăng nhập nhanh bằng Apple ID (Sign in with Apple) và Facebook Login; lưu thông tin liên kết vào bảng `user_social_accounts`. | **S** |
| **FR-AUTH-04** | Quản lý phiên làm việc JWT & Refresh Token | Trả về Access Token (JWT, hạn 15–60 phút) và Refresh Token (lưu an toàn trong HttpOnly Cookie và bảng `refresh_tokens`); hỗ trợ cơ chế Silent Refresh và thu hồi token khi đăng xuất. | **M** |
| **FR-AUTH-05** | Quản lý hồ sơ cá nhân (User Profile) | Du khách xem và cập nhật họ tên, ảnh đại diện, số điện thoại, đổi mật khẩu; xem danh sách tài khoản xã hội đang liên kết. | **M** |
| **FR-AUTH-06** | Lưu danh sách POI yêu thích (Favorites) | Nút "Yêu thích" (Bookmark) tại màn hình chi tiết POI; danh sách yêu thích lưu vào bảng `user_favorites` gắn liền tài khoản; đồng bộ tức thì trên Web App. | **M** |
| **FR-AUTH-07** | Liên kết dữ liệu thiết bị với tài khoản | Khi du khách đăng nhập, hệ thống tự động liên kết `device_id` hiện tại với `user_id`, cho phép gom lịch sử nghe và đối thoại Voice AI vào tài khoản cá nhân. | **M** |
| **FR-AUTH-08** | Quản lý người dùng tại CMS | Admin có thể xem danh sách toàn bộ người dùng (phân loại Admin, Editor, Analyst, Du khách), tìm kiếm theo email/tên, khóa hoặc mở khóa tài khoản vi phạm. | **M** |

---

## PHẦN 3: YÊU CẦU PHI CHỨC NĂNG, DỮ LIỆU & LỘ TRÌNH TRIỂN KHAI

### 21. Yêu cầu phi chức năng (Non-Functional Requirements - NFR)

| ID | Nhóm yêu cầu | Chỉ tiêu kỹ thuật đo lường | Ưu tiên |
|---|---|---|:---:|
| **NFR-PER-01** | Hiệu năng khởi động | Thời gian khởi động nguội (Cold start) $\le 3$ giây trên thiết bị tầm trung với dữ liệu cục bộ. | **M** |
| **NFR-PER-02** | Độ trễ phát âm thanh | Từ sự kiện ENTER đến khi phát $\le 3$s (K2); Từ quét QR đến khi phát $\le 5$s (K4). | **M** |
| **NFR-PER-03** | Hiệu năng bản đồ | Render 500 marker mượt mà $\ge 30$ FPS; tự động gom cụm (Clustering) khi zoom xa. | **M** |
| **NFR-PER-04** | Truy vấn SQLite | Thời gian tìm kiếm và tính khoảng cách chọn POI gần nhất $< 50\text{ ms}$ với 500 POI. | **M** |
| **NFR-PWR-01** | Tiêu hao năng lượng pin | Mức tụt pin khi chạy ngầm định vị $\le 10\%$ / giờ ở mức độ nhạy Cân bằng (đạt KPI K7). | **M** |
| **NFR-PWR-02** | Chiếm dụng bộ nhớ RAM | Bộ nhớ RAM tiêu thụ khi chạy nền $\le 150\text{ MB}$ trên thiết bị Android. | **S** |
| **NFR-REL-01** | Độ ổn định ứng dụng | Tỷ lệ phiên không bị sự cố crash $\ge 99\%$ (theo dõi qua Crashlytics). | **M** |
| **NFR-REL-02** | An toàn dữ liệu log | Không mất log khi app bị tắt hoặc hết pin đột ngột; bắt buộc ghi vào SQLite trong Transaction. | **M** |
| **NFR-SEC-01** | Mã hóa đường truyền | $100\%$ các API và luồng tải tập tin sử dụng giao thức HTTPS (TLS 1.2+). | **M** |
| **NFR-SEC-02** | Bảo mật xác thực CMS & Web | Mật khẩu băm chuẩn bcrypt/argon2; token có thời hạn ngắn; kiểm tra RBAC tại API backend. | **M** |
| **NFR-SEC-03** | Bảo mật OAuth 2.0 & Token | Tuân thủ chuẩn OAuth 2.0 / OpenID Connect; cơ chế Refresh Token Rotation; chặn lỗ hổng CSRF và XSS cho Web App. | **M** |
| **NFR-PRV-01** | Quyền riêng tư & Tối thiểu hóa dữ liệu | Đối với khách vãng lai chỉ thu thập `device_id` ngẫu nhiên; đối với user đăng ký chỉ lưu thông tin cần thiết (email, tên, avatar) với sự đồng ý minh bạch. | **M** |
| **NFR-PRV-03** | Quyền xóa dữ liệu & Tài khoản | Cung cấp tùy chọn xóa tài khoản và dữ liệu cá nhân theo quy định bảo vệ dữ liệu (`DELETE /api/v1/user/account`). | **M** |
| **NFR-CMP-01** | Khả năng tương thích HĐH | Ứng dụng di động hỗ trợ từ Android 8.0 trở lên (API level 26+). Web App tương thích mọi trình duyệt hiện đại (Chrome, Safari, Edge). | **M** |
| **NFR-LOC-01** | Hỗ trợ 7 ngôn ngữ | Bản đầu hỗ trợ đầy đủ 7 ngôn ngữ cho giao diện app và nội dung thuyết minh; chữ viết UTF-8 chuẩn. | **M** |

---

### 22. Danh mục 7 ngôn ngữ quốc tế hỗ trợ

| STT | Ngôn ngữ | Mã ISO | Tên hiển thị trong App | Locale TTS | Hệ chữ viết |
|:---:|---|:---:|---|:---:|---|
| 1 | **Tiếng Việt (mặc định)** | `vi` | Tiếng Việt | `vi-VN` | Latin |
| 2 | **Tiếng Anh** | `en` | English | `en-US` | Latin |
| 3 | **Tiếng Trung (Giản thể)** | `zh-CN` | 简体中文 | `zh-CN` | Hán |
| 4 | **Tiếng Thái** | `th` | ไทย | `th-TH` | Thái |
| 5 | **Tiếng Hindi (Ấn Độ)** | `hi` | हिन्दी | `hi-IN` | Devanagari |
| 6 | **Tiếng Hàn** | `ko` | 한국어 | `ko-KR` | Hangul |
| 7 | **Tiếng Nhật** | `ja` | 日本語 | `ja-JP` | Kana + Kanji |

---

### 23. Bảng 16 Quyết định kỹ thuật đã chốt

| # | Vấn đề kỹ thuật | Quyết định chính thức | Trạng thái |
|:---:|---|---|:---:|
| **1** | Nền tảng ứng dụng di động | Ưu tiên phát triển trên Android trước (Android 8.0+); iOS dời sang Phase 2. | Chốt một phần |
| **2** | Nhiều POI cùng vùng kích hoạt | Xét mức độ ưu tiên (`priority`) cao hơn trước, khoảng cách gần hơn sau. | Chốt chính thức |
| **3** | Nguồn phát khi có cả Audio & TTS | Ưu tiên phát file Audio thu sẵn; không cung cấp nút chọn để đơn giản hóa UI. | Chốt chính thức |
| **4** | Quét QR khi đang phát bài khác | Ngắt bài đang phát để phát ngay bài của mã QR vừa quét (hành động chủ động). | Chốt chính thức |
| **5** | Cách tính mốc thời gian Cooldown | Tính ngay từ thời điểm bắt đầu phát thành công (30 phút). | Chốt chính thức |
| **6** | Bản đồ nền có lưu Offline không? | Không lưu offline bản đồ nền (chỉ lưu offline bài thuyết minh và marker). | Chốt chính thức |
| **7** | Trang web QR dự phòng | Triển khai ở Release 2; bản MVP quét mã mở thẳng ứng dụng Android. | Chốt chính thức |
| **8** | Số lượng ngôn ngữ hỗ trợ | Hỗ trợ đầy đủ 7 ngôn ngữ quốc tế (`vi`, `en`, `zh-CN`, `th`, `hi`, `ko`, `ja`). | Chốt chính thức |
| **9** | Bản quyền nội dung & âm thanh | Nhóm thực hiện đề tài tự biên soạn và thu âm kết hợp tư liệu công cộng. | Chốt chính thức |
| **10** | Chế độ riêng cho xe buýt | Không làm chế độ riêng; admin tự cấu hình bán kính lớn hơn (100–150m) cho trục xe buýt. | Chốt chính thức |
| **11** | Phạm vi thí điểm địa lý | 10 – 15 điểm POI tiêu biểu tại các phường Khánh Hội, Vĩnh Hội, Xóm Chiếu. | Chốt chính thức |
| **12** | Dán mã QR tại trạm xe buýt | Liên hệ đơn vị quản lý giao thông; dự phòng bảng tin nội bộ. | Chốt chính thức |
| **13** | Chính sách lưu giữ dữ liệu | Vị trí thô xóa sau 90 ngày; nhật ký `Playback_Log` lưu 12 tháng. | Chốt chính thức |
| **14** | Hạ tầng máy chủ triển khai | Sử dụng VPS chi phí thấp hoặc Cloud Free Tier phù hợp ngân sách đề tài. | Chốt một phần |
| **15** | Xóa dữ liệu server theo yêu cầu | Có; cung cấp endpoint `DELETE /v1/devices/{id}/data` theo chuẩn quyền riêng tư. | Chốt chính thức |
| **16** | Xác thực người dùng trên Web App | Bắt buộc đăng ký/đăng nhập để truy cập Web App. Hỗ trợ Email/Mật khẩu và Google OAuth 2.0 (mặc định), mở rộng Apple ID / Facebook. | Chốt chính thức |

---

### 24. Lộ trình phát triển sản phẩm (Product Roadmap)

| Giai đoạn | Mục tiêu cốt lõi | Nội dung công việc trọng tâm | Điều kiện qua cổng |
|---|---|---|---|
| **Giai đoạn 0: Khởi động** | Chốt nền tảng & Dữ liệu mẫu | Chuẩn bị dữ liệu 10-15 POI mẫu 7 ngôn ngữ; hạ tầng server, domain; công cụ mô phỏng GPS GPX. | Chốt quyết định nền tảng; có nội dung mẫu. |
| **Giai đoạn 1: Nền tảng** | Vận hành CSDL & Bản đồ | CSDL SQLite + Server; API sync; CMS cơ bản; App hiển thị bản đồ và chi tiết POI sau khi sync. | Admin tạo POI, app hiển thị sau khi sync. |
| **Giai đoạn 2: Lõi thuyết minh** | Tự động phát chính xác | Background service; Geofence Engine; Narration Engine (queue, cooldown, ngắt, TTS/audio); log local. | Đạt kiểm thử kịch bản thực địa TC-F01 đến TC-F07. |
| **Giai đoạn 3: Offline & QR** | Hoạt động tin cậy khi mất mạng | Đóng gói offline; quét QR; quản lý trạm xe buýt; thu thập ẩn danh; cơ chế xuất bản tăng version. | Đạt kiểm thử TC-F08 đến TC-F10; đạt K4, K8. |
| **Giai đoạn 4: Nghiệm thu MVP** | Tối ưu hóa & Đo kiểm | Sửa lỗi; đo pin ($\le 10\%$/h), đo hiệu năng; test trên ma trận thiết bị Android thật; hoàn thiện tài liệu. | Đạt toàn bộ tiêu chí nghiệm thu MVP; đạt KPI K1-K9. |
| **Release 2: Trải nghiệm & Phân tích** | Nâng cấp trải nghiệm du khách | Toàn bộ yêu cầu mức S: vẽ vòng geofence, danh sách list, tour, import CSV, Dashboard Analytics, web QR. | Đạt 80% yêu cầu mức S; đo lường K5, K6 thực tế. |
| **Release 3: Mở rộng nhẹ** | Tiện ích bổ sung | Yêu cầu mức C: mô hình hóa tuyến di chuyển mẫu A $\rightarrow$ B, xuất báo cáo CSV, chế độ tối Dark Mode. | Tùy thuộc nguồn lực còn lại của nhóm. |
| **Phase 2: Dài hạn** | Mở rộng quy mô | Phát triển ứng dụng iOS; bản đồ nền offline; gợi ý tour thông minh bằng AI; tương tác thực tế ảo AR. | Xây dựng PRD độc lập cho Giai đoạn 2. |

