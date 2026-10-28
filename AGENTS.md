# Hướng dẫn cho agent

## Trạng thái dự án

- Đây là dự án POS và quản lý kho SaaS cho quán cà phê, trà sữa và quán ăn nhỏ: một `store` có nhiều `branch`, mỗi chi nhánh có bàn, ca thu ngân và tồn kho riêng.
- Repository có UI demo trong `POS_UI/`; `POS_API/` và `POS_INFRA/` chưa có mã triển khai. Phân biệt quy tắc đã đặc tả với tính năng đã triển khai khi mô tả dự án.
- `docs/PRODUCT_OVERVIEW.md` là nguồn chính về phạm vi, vai trò, luồng nghiệp vụ và các quy tắc bất biến. Đọc file này trước khi làm việc. `docs/BUSINESS_RULES.md` là danh sách rule theo mã BR. `docs/DESIGN_DB_POS_SYSTEM.md` là thiết kế dữ liệu 28 bảng, công thức và ràng buộc. `DESIGN.md` là thiết kế giao diện POS.
- `docs/api-spec.md`, `docs/architecture/ARCHITECTURE.md`, `docs/architecture/auth.md` và các file trong `rules/` đã có; các spec endpoint trong `docs/specs/` chưa có. Tài liệu kiến trúc mô tả mục tiêu, không chứng minh backend đã triển khai.

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
