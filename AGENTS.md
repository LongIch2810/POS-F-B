# Hướng dẫn cho agent

## Trạng thái dự án

- Đây là dự án POS và quản lý kho SaaS cho quán cà phê, trà sữa và quán ăn nhỏ: một `store` có nhiều `branch`, mỗi chi nhánh có bàn, ca thu ngân và tồn kho riêng.
- Repository có UI demo trong `POS_UI/`; `POS_API/` và `POS_INFRA/` chưa có mã triển khai. Phân biệt quy tắc đã đặc tả với tính năng đã triển khai khi mô tả dự án.

## Bản đồ repository và thứ tự đọc

Mọi đường dẫn dưới đây tính từ **gốc repository** (thư mục chứa `AGENTS.md`), không tính từ thư mục của file đang sửa.

| Đường dẫn | Đọc khi nào / vai trò |
| --- | --- |
| `docs/PRODUCT_OVERVIEW.md` | **Đọc đầu tiên**: phạm vi MVP, vai trò, luồng nghiệp vụ, bất biến. |
| `docs/BUSINESS_RULES.md` | Tra quy tắc nghiệp vụ theo mã BR trước khi đổi hành vi. |
| `docs/DESIGN_DB_POS_SYSTEM.md` | Schema, công thức, index, constraint và transaction liên quan dữ liệu. |
| `docs/api-spec.md` | Quy ước chung HTTP, auth, lỗi, phân quyền, idempotency; đọc trước khi sửa API. |
| `docs/architecture/ARCHITECTURE.md` | Thành phần, ranh giới module, triển khai và luồng dữ liệu **mục tiêu**. |
| `docs/architecture/auth.md` | Phiên, JWT, cookie, mật khẩu và giới hạn thử. |
| `DESIGN.md` | Giao diện POS, component, tương tác, ngôn ngữ và thiết bị. |
| `rules/` | Quy tắc làm việc chung; chọn file phù hợp theo bảng bên dưới. |
| `POS_UI/`, `POS_API/`, `POS_INFRA/` | Mã UI, backend và hạ tầng; kiểm tra mã thực tế trước khi nói tính năng đã chạy. |
| `plans/`, `tasks/`, `errors/` | Kế hoạch, tiến độ và lỗi đã gặp được lưu trên đĩa; quy trình ở mục dưới. |

Trong `rules/`: đọc `clean-code.md`, `coding-style.md`, `naming.md` khi viết/sửa code; `database.md` khi làm DB/ORM; `security.md` khi xử lý dữ liệu, secret hoặc quyền; `testing.md` khi kiểm thử; `git.md` trước khi tạo nhánh, commit, push hoặc merge. Các rule này không phụ thuộc ngôn ngữ/công nghệ. `docs/specs/` được dự kiến cho spec endpoint nhưng hiện chưa có; `specs/` ở gốc đang trống. Không viện dẫn các thư mục đó như nguồn đã hoàn thiện.

## Tìm hiểu code

- Khi đã có mã nguồn, ưu tiên codebase-memory-mcp theo thứ tự: `search_graph` để tìm symbol; `trace_path` để xem caller/callee; `get_code_snippet` để đọc đoạn mã; `query_graph` cho truy vấn phức tạp; `get_architecture` để xem tổng quan. Chạy `index_repository` nếu repo chưa được index.
- Dùng `rg`/tìm file cho chuỗi literal, thông báo lỗi, config, tài liệu không phải code hoặc khi graph không đủ thông tin.
- Trước khi sửa logic dùng chung, kiểm tra caller, dữ liệu liên quan và phạm vi ảnh hưởng. Khi có code và test, chạy đúng lệnh kiểm tra của phần đã sửa; không tự đặt ra lệnh chạy khi project chưa có cấu hình.

## Quy tắc sản phẩm cần giữ

- Giao diện tiếng Việt, tiền VND (đơn vị đồng), hiển thị giờ `Asia/Ho_Chi_Minh`, lưu thời gian UTC. Màn hình POS ưu tiên máy tính bảng ngang và thao tác cảm ứng.
- Tiền dùng số nguyên/`bigint`; server tính giá và tổng, không nhận giá từ client. Hóa đơn giữ snapshot tên và giá lúc bán. Thanh toán phải chống lặp bằng `idempotency_key`.
- Luôn lấy `store_id` và phạm vi `branch_id` từ danh tính/permission, kiểm tra mọi ID tham chiếu cùng cửa hàng. Người không có `branch.access_all` chỉ được xem chi nhánh mình. `PLATFORM_ADMIN` không đọc dữ liệu vận hành của store.
- Thanh toán, đổi trạng thái hóa đơn và trừ kho thuộc một transaction. Tồn kho cập nhật nguyên tử; `stock_movements` chỉ thêm dòng. Không sửa trực tiếp hóa đơn `PAID`/`CANCELLED` hoặc ca đã đóng. Dữ liệu có tham chiếu được ngưng dùng thay vì xóa cứng.
- Mỗi người chỉ có một ca mở, mỗi chi nhánh chỉ có một ca thu ngân mở, mỗi bàn chỉ có một đơn `OPEN`. Không bán hoặc thanh toán khi chưa có ca thu ngân; không đóng ca khi còn đơn `OPEN` của ca đó. Đối soát đếm mù: nhận `counted_cash` trước khi hiện tiền kỳ vọng.
- Không có đăng ký công khai. Mật khẩu và refresh token chỉ lưu hash; tài khoản mới phải đổi mật khẩu lần đầu. Store `SUSPENDED` bị chặn truy cập nhưng giữ nguyên dữ liệu.

## Cách làm việc

- MVP và các phần để sau được phân định ở mục 5 của `docs/PRODUCT_OVERVIEW.md`; chỉ làm phần ngoài MVP khi người dùng yêu cầu. Nếu tài liệu mâu thuẫn hoặc thiếu business rule quyết định kết quả, hỏi người dùng trước khi tự chọn.
- Khi triển khai, theo công nghệ đã định: NestJS/TypeScript/PostgreSQL cho backend, React/TypeScript cho frontend. Redis/BullMQ chỉ khi thực sự cần cache hoặc job nền.
- Với thay đổi code trong tương lai, làm trên nhánh riêng, đưa ra review trước khi merge và không tự push nếu chưa được yêu cầu, theo mục 11 của product overview.

## Ghi plan, task và lỗi ra file

**Không dùng trí nhớ phiên chat làm nơi duy nhất giữ plan hoặc tiến độ.** Trước khi bắt đầu hay tiếp tục việc nhiều bước, đọc `tasks/active/`, `plans/active/` và tra `errors/` theo chủ đề. Khi tiếp tục sau compact hoặc phiên mới, đọc file đang active, đối chiếu với Git/mã/test hiện tại rồi mới làm bước tiếp theo; ghi chép có thể cũ hơn trạng thái repository.

- `plans/draft/`: plan đang soạn, có thể thay đổi. Mỗi plan ghi mục tiêu, phạm vi, các bước, tiêu chí hoàn thành, quyết định và rủi ro. Khi người dùng yêu cầu triển khai plan nháp, đọc lại plan và chốt phạm vi trước khi chuyển **cùng file** sang `plans/active/`; ghi thay đổi phạm vi/lý do vào plan thay vì âm thầm sửa. Khi mọi task và kiểm tra của plan xong, chuyển sang `plans/completed/` kèm kết quả. Mỗi plan chỉ nằm ở **một** trạng thái.
- `tasks/active/`: tạo file task trước khi triển khai một plan hoặc bắt đầu việc nhiều bước. Task ghi plan liên quan (nếu có), mục tiêu, nhánh, việc đã hoàn tất kèm bằng chứng, trạng thái hiện tại, **bước tiếp theo cụ thể**, file đã đổi, lệnh kiểm tra và blocker/câu hỏi. Cập nhật sau mỗi mốc quan trọng và **trước khi dừng, đổi phiên hoặc ngữ cảnh bị rút gọn**. Xong và đã kiểm tra thì chuyển sang `tasks/completed/` cùng tên file; không để task active đã hoàn tất.
- `errors/`: lưu một file cho mỗi lỗi đáng kể gặp khi làm hoặc review. Ghi triệu chứng, điều kiện tái hiện, nguyên nhân đã xác minh, cách sửa, cách kiểm chứng, task/commit liên quan; lỗi chưa giải quyết đánh dấu rõ. Tra thư mục này trước khi xử lý lỗi tương tự. Không ghi secret, token hoặc dữ liệu cá nhân thật.

Tên file dùng `YYYY-MM-DD-ten-ngan.md`; task thuộc plan ghi đường dẫn plan trong nội dung. Mỗi file ghi trạng thái ở đầu và giữ nguyên tên khi chuyển thư mục; không tạo bản sao ở nhiều trạng thái. Không tạo plan cho việc một bước đơn giản, nhưng mọi việc kéo dài qua phiên phải có task active để tiếp tục được. Nội dung user yêu cầu và mã/test hiện tại luôn được đối chiếu trước khi áp dụng ghi chép cũ.
