# Sprint 1 — trạng thái: đang lập kế hoạch, chưa chốt Sprint Backlog

## Mục tiêu và phạm vi

Sprint dài một tuần, nhóm gồm Product Owner và Codex. Product Backlog nằm ở [docs/PRODUCT_BACKLOG.md](../../docs/PRODUCT_BACKLOG.md). UI hiện tại là demo mock; nền API và PostgreSQL local của PB-01 đã được Product Owner nghiệm thu.

## Cách vận hành mỗi tuần

1. **Planning (đầu tuần, 30–45 phút):** chọn Sprint Goal, làm rõ acceptance criteria và chọn số item vừa sức. Chỉ item đủ rõ, có phụ thuộc được xử lý mới đưa vào Sprint Backlog.
2. **Trong sprint:** Codex cập nhật `tasks/active/` và báo tiến độ/ngăn trở hằng ngày; Product Owner trả lời các câu hỏi nghiệp vụ trước khi phần phụ thuộc được triển khai. Thay đổi ưu tiên có thể điều chỉnh backlog, không âm thầm đổi Sprint Goal.
3. **Review (cuối tuần, 30 phút):** demo trên mã chạy thật; Product Owner chấp nhận hoặc trả lại từng item theo tiêu chí. Ghi rõ cái gì chỉ là UI mock.
4. **Retrospective (15 phút):** chọn một cải tiến quy trình cho tuần sau. Sức chứa tuần tiếp theo dựa trên số item thực sự hoàn tất, không áp số story point giả.

**Definition of Ready:** mục tiêu người dùng, quy tắc BR, điều kiện chấp nhận, phụ thuộc và câu hỏi mở được ghi rõ; đặc tả endpoint liên quan đã được phỏng vấn/chốt trước khi code và lưu vào `specs/`.

**Definition of Done:** mã chạy trên nhánh riêng, kiểm thử đúng phần thay đổi (gồm quyền/tenant và ranh giới dữ liệu khi liên quan), có bằng chứng chạy theo `AGENTS.md`, review trước merge, tài liệu/spec cập nhật; không coi màn hình demo mock là chức năng đã hoàn tất. Không tự push hoặc merge.

## Product Backlog MVP

Product Backlog được lưu riêng tại [docs/PRODUCT_BACKLOG.md](../../docs/PRODUCT_BACKLOG.md). File này chỉ giữ Sprint Goal, Sprint Backlog và kết quả Sprint 1.

## Sprint Backlog đề xuất

**Sprint Goal:** có nền API và một luồng đăng nhập thật để kiểm chứng danh tính/phiên từ PostgreSQL; chưa công bố là sản phẩm bán hàng.

PB-01 đã được triển khai và Product Owner nghiệm thu; PB-02 và PB-13 vẫn là đề xuất, chưa được cam kết trong Sprint Planning. Các ô nghiệm thu chỉ được đánh dấu sau khi có bằng chứng chạy thật và Product Owner xác nhận.

Thứ tự thực hiện, **mỗi phần được làm rõ và chốt spec riêng trước khi code phần đó**:

1. Refinement PB-01: xác định điều kiện chạy local, migration, health check và cách bootstrap; ghi câu hỏi và quyết định cần thiết cho phần này.
2. PB-01: triển khai nền API/DB theo phần đã rõ, kiểm tra migration và health check trên PostgreSQL thật.
3. Refinement PB-02: phỏng vấn, rà mâu thuẫn và chốt từng endpoint xác thực vào `specs/auth.md`. Chưa viết mã auth phụ thuộc khi spec chưa chốt.
4. PB-02: triển khai và kiểm thử login, `me`, refresh, logout, đổi mật khẩu lần đầu và guard theo spec đã chốt.
5. PB-13 (lát cắt auth): nối màn đăng nhập/đổi mật khẩu trong React với API thật; access/refresh token ở cookie HttpOnly, CSRF theo spec đã chốt.
6. Review: demo đăng nhập → buộc đổi mật khẩu → đăng nhập lại → xem danh tính → tải lại trang/khôi phục phiên → đăng xuất. Ghi bằng chứng và kết quả nghiệm thu thực tế.

## Tiêu chí nghiệm thu Sprint 1

### PB-01 — nền API và PostgreSQL

- [x] Từ PostgreSQL local trống, migration chạy bằng lệnh riêng và chạy lại không nhân đôi; API không tự chạy migration và không phục vụ khi schema thiếu.
- [x] Schema auth và constraint được kiểm tra trên PostgreSQL thật: username chuẩn hóa/duy nhất, `token_hash` duy nhất, mỗi phiên tối đa một refresh token chưa thu hồi; mật khẩu và refresh token chỉ lưu hash.
- [x] Bootstrap từ biến môi trường tạo đúng một `PLATFORM_ADMIN` với `store_id`/`branch_id` là `NULL`, bắt buộc đổi mật khẩu; thiếu/sai biến lần đầu làm startup thất bại, khởi động lại không cần biến và không sửa user cũ. Không có tài khoản hay secret mặc định trong source/log.
- [x] `GET /api/v1/health` trả `200` khi DB sẵn sàng, `503` với `SERVICE_UNAVAILABLE` khi DB mất kết nối; truy vấn timeout 5 giây. Lỗi HTTP có envelope và `X-Request-Id`, không lộ thông tin kết nối. Build/test trên DB thật và artifact QA đạt theo [spec PB-01](../../specs/foundation.md).

Các ô trên dành cho **quyết định nghiệm thu của Product Owner**; kết quả kiểm tra kỹ thuật và giới hạn bằng chứng nằm trong bảng Review bên dưới.

### PB-02 — xác thực và phiên

- [ ] Người dùng được cấp tài khoản đăng nhập đúng mật khẩu; server đặt access token 30 phút và refresh token 7 ngày trong hai cookie HttpOnly riêng, không trả token trong JSON. Refresh token chỉ lưu hash trong DB. Sai tài khoản/mật khẩu, tài khoản bị khóa hoặc store tạm khóa không để lộ tài khoản tồn tại qua thông báo đăng nhập; áp giới hạn thử theo tài liệu auth.
- [ ] `GET /auth/me` trả danh tính, vai trò, quyền và phạm vi store/branch hiện hành từ DB. Token sai, hết hạn hoặc phiên đã thu hồi bị từ chối; `PLATFORM_ADMIN` không có quyền đọc dữ liệu vận hành store.
- [ ] Tài khoản mới bị chặn chức năng nghiệp vụ cho đến khi đổi mật khẩu. Đổi mật khẩu thành công bỏ cờ bắt buộc, thu hồi mọi phiên và yêu cầu đăng nhập lại; mật khẩu mới tối thiểu 12 ký tự.
- [ ] Tải lại trang khi phiên còn hiệu lực đọc danh tính bằng access cookie; khi access cookie hết hạn, refresh đặt cookie mới. Mỗi lần refresh xoay token; dùng lại token đã xoay thu hồi đúng phiên đó. Mọi request ghi sau đăng nhập thiếu/sai Origin hoặc CSRF bị từ chối theo tài liệu auth.
- [ ] Đăng xuất thu hồi phiên hiện tại ngay; access/refresh token của phiên đó không dùng lại được, phiên thiết bị khác vẫn hoạt động. Không có route đăng ký công khai.

### PB-13 — giao diện cho lát cắt auth

- [ ] Màn đăng nhập/đổi mật khẩu gọi API thật; sau đăng nhập lần đầu, người dùng chỉ có thể đổi mật khẩu hoặc đăng xuất. Đổi xong quay về đăng nhập.
- [ ] Tải lại trang khôi phục phiên hợp lệ; đăng xuất hoặc phiên hết hiệu lực quay về màn đăng nhập. Access token chỉ trong cookie HttpOnly, không xuất hiện trong JSON, JavaScript, localStorage/sessionStorage/URL hay header Bearer.
- [ ] Không cho tài khoản thật dùng nút đổi tài khoản demo hoặc màn vận hành còn dựa vào mock như chức năng đã triển khai. UI hiển thị lỗi bằng tiếng Việt và thao tác được trên tablet ngang.

**Bằng chứng nghiệm thu:** chạy build/test và kiểm tra luồng với API + PostgreSQL thật; ghi lệnh, kết quả và artifact vào `qa-evidence/` theo `AGENTS.md`, rồi điền kết quả Product Owner chấp nhận/trả lại vào mục Review bên dưới. UI mock hoặc ảnh màn hình đơn lẻ không chứng minh dữ liệu DB đã đổi.

**Điều kiện hoàn thành Sprint Goal:** luồng trên chạy với DB thật và UI thật; test tự động cho quy tắc auth/phiên then chốt; không có secret trong Git; build/typecheck của phần đã sửa đạt; có bằng chứng QA. Nếu khối lượng vượt sức chứa, ưu tiên chất lượng PB-01/PB-02 và chuyển PB-13 chưa xong về backlog; khi đó Sprint Goal chưa đạt và phải ghi rõ trong Review, không gọi là hoàn tất.

**Rủi ro/sức chứa:** auth gồm nhiều quy tắc bảo mật và là phần lớn nhất của tuần đầu. Không cam kết ngày hoàn thành cho từng item trước khi refinement; sau 1–2 sprint dùng số item Done thực tế để điều chỉnh. Nếu spec auth phát sinh quyết định nghiệp vụ mở, Product Owner chốt trước khi triển khai phần phụ thuộc.

## Quyết định cần theo dõi

- Đã chốt: nhóm một người dùng + Codex; sprint một tuần. Product Owner muốn lưu sprint trong `sprints/`, sau đó làm rõ spec từng phần theo thứ tự.
- Ngày 2026-10-28: Product Owner yêu cầu hoàn tác lần bắt đầu triển khai trước và lập lại cấu trúc sprint. Bản nháp auth spec cũ chưa được chốt; mã thử đã được gỡ khỏi `POS_API/`. Tại thời điểm đó chưa có PB nào được nghiệm thu.
- Ngày 2026-10-28: Product Owner xác nhận nghiệm thu PB-01 sau khi xem kết quả triển khai và QA local được ghi trong Review; PB-02 và PB-13 chưa được nghiệm thu.
- Quyết định PB-01 đã chốt trong [spec nền API](../../specs/foundation.md): bootstrap lần đầu từ biến môi trường, startup thất bại khi thiếu/sai biến, bỏ qua biến khi đã có admin; health trả `503` khi DB mất kết nối.
- Các lựa chọn infra còn mở ở `docs/architecture/ARCHITECTURE.md` mục 13 chỉ cần chốt trước PB-14.

## Review và retrospective

| PB | Kết quả demo/kiểm tra | Bằng chứng | Quyết định của Product Owner |
| --- | --- | --- | --- |
| PB-01 | Đã triển khai; migration, bootstrap, constraint và test tích hợp trên PostgreSQL thật đạt. Health `200`/`503` đã kiểm tra thủ công; lần QA cuối kiểm tra lại test nhưng không ngắt DB. | [QA local ban đầu](../../qa-evidence/20261028-125139-842ba1e/run.md), [QA local cuối](../../qa-evidence/20261028-131159-842ba1e/run.md); chưa có CI độc lập. | Chấp nhận PB-01 — Product Owner xác nhận ngày 2026-10-28 trong cuộc trao đổi này. |
| PB-02 | Chưa thực hiện | Chưa có | Chưa nghiệm thu |
| PB-13 (auth) | Chưa thực hiện | Chưa có | Chưa nghiệm thu |

Retrospective chưa diễn ra. Chỉ điền kết quả đã demo/kiểm tra thật; item chưa đạt Definition of Done trở về Product Backlog.
