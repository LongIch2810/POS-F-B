# Sprint 2 — đề xuất, chưa chốt Sprint Backlog

## Cơ sở lập kế hoạch

Sprint dài một tuần; nhóm gồm Product Owner và Codex theo [cách vận hành Sprint 1](../sprint-01/SPRINT.md). [Product Backlog](../../docs/PRODUCT_BACKLOG.md) đặt PB-03 sau PB-02 và PB-13 đi cùng các lát cắt API đã hoàn thành. Trong [Review Sprint 1](../sprint-01/SPRINT.md#review-và-retrospective), Product Owner đã chấp nhận PB-01, PB-02 và PB-13 trong phạm vi xác thực; các màn vận hành còn dùng dữ liệu mô phỏng.

Sprint 1 đã được [chốt bằng Review và retrospective từ hồ sơ](../sprint-01/SPRINT.md#kết-luận-sprint-1--2026-10-29). Buổi planning Sprint 2 cần xem lại cải tiến đã chọn, chốt sức chứa và chọn Sprint Goal. Các mục dưới đây là **đề xuất**, chưa phải cam kết hay bằng chứng chức năng đã hoàn thành.

## Sprint Goal đề xuất

`PLATFORM_ADMIN` tạo được cửa hàng và tài khoản `OWNER`, tạm khóa/mở lại cửa hàng trên API và giao diện thật, với phạm vi quyền được kiểm tra bằng PostgreSQL. Đây là lát cắt **PB-03 + PB-13 (quản trị nền tảng)**.

## Sprint Backlog đề xuất

| Thứ tự | Item | Kết quả cần đạt | Điều kiện trước khi triển khai |
| --- | --- | --- | --- |
| 1 | Refinement PB-03 | Phỏng vấn, rà quy tắc [BR-79–BR-86](../../docs/BUSINESS_RULES.md), làm rõ request/response, quyền, lỗi và tình huống biên; lập bảng tiêu chí → tình huống → artifact; chốt `specs/platform.md` và phần cấp `OWNER` liên quan. | Product Owner quyết định các điểm còn mở; chỉ lưu spec đã chốt. |
| 2 | PB-03 API/DB | Quản trị viên nền tảng quản lý store và cấp `OWNER` theo spec; khóa/mở store áp dụng đúng quy tắc phiên và cô lập dữ liệu. | PB-02 đã nghiệm thu; spec ở mục 1 đã chốt. |
| 3 | PB-13 lát cắt PB-03 | Màn quản trị nền tảng gọi API thật cho các thao tác PB-03, hiển thị kết quả/lỗi và không dùng mock làm nguồn dữ liệu của lát cắt này. | API PB-03 đã có và được kiểm tra. |
| 4 | Review | Demo luồng trên bản mã cuối, đối chiếu từng tiêu chí với artifact API, DB và browser; Product Owner chấp nhận hoặc trả lại từng item. | Các kiểm tra và bằng chứng theo `AGENTS.md` đã hoàn tất. |

PB-04 phụ thuộc PB-03; chỉ đưa vào Sprint Backlog nếu Product Owner chọn lại phạm vi tại planning và cập nhật file này. SePay/VietQR là hướng tích hợp tùy chọn, không nằm trong đề xuất Sprint 2.

## Tiêu chí nghiệm thu đề xuất

Các ô để trống cho đến khi chạy kiểm tra trên mã cuối, QA đối chiếu artifact và Product Owner quyết định nghiệm thu. Khi refinement thay đổi tiêu chí, cập nhật bảng này trước khi triển khai.

### PB-03 — quản trị nền tảng

- [ ] `PLATFORM_ADMIN` tạo store và cấp `OWNER` trong đúng store; mật khẩu tạm chỉ trả một lần, không xuất hiện lại trong API/log, tài khoản mới phải đổi mật khẩu trước khi dùng chức năng nghiệp vụ (BR-83, BR-84).
- [ ] Người không có quyền bị từ chối thao tác quản trị nền tảng; `PLATFORM_ADMIN` không đọc được hóa đơn, ca, kho hoặc doanh thu của store (BR-81).
- [ ] Tạm khóa store chặn đăng nhập và API của người dùng trong store, thu hồi refresh token, giữ dữ liệu; mở lại yêu cầu đăng nhập mới (BR-82).
- [ ] Kiểm tra ranh giới store, các ID tham chiếu, lỗi đầu vào và trường hợp request lặp theo spec đã chốt; log sự kiện quản trị theo BR-86 mà không ghi mật khẩu/token.

### PB-13 — UI cho PB-03

- [ ] Màn quản trị nền tảng đọc/ghi qua API PB-03 thật; tạo store/`OWNER`, khóa/mở store và hiển thị trạng thái cuối sau tải lại trang.
- [ ] UI chỉ hiển thị mật khẩu tạm ở thời điểm được cấp và không lưu vào browser storage; lỗi/quyền được trình bày bằng tiếng Việt.
- [ ] Các màn POS/kho còn mô phỏng được ghi rõ là demo, không được tính là PB-03 hoặc PB-13 đã hoàn thành.

## Kiểm tra và bằng chứng dự kiến

Trước khi chạy QA, lập bảng tiêu chí → tình huống → artifact theo `AGENTS.md`. Cần test API/DB với PostgreSQL cho tạo store, cấp `OWNER`, khóa/mở và cô lập quyền; giữ output runner và trạng thái DB trước/sau. Cần kiểm tra browser trên UI cuối cho mật khẩu tạm, tải lại trang, phiên bị khóa/mở lại; giữ snapshot, request/response đã che dữ liệu nhạy cảm. Chỉ tick tiêu chí sau khi QA mở lại artifact và đối chiếu được; phân biệt CI độc lập, local do agent chạy và chưa xác minh.

## Quyết định cần chốt tại planning/refinement

- Xác nhận Sprint Goal, sức chứa và có đưa cả PB-03 lẫn lát cắt UI PB-13 vào Sprint Backlog hay không.
- Chốt luồng tạo store/cấp `OWNER`, dữ liệu bắt buộc, cách xử lý thất bại và các endpoint trong `specs/platform.md`; phần tài khoản liên quan phải thống nhất với spec auth.
- Chốt hành vi UI khi store bị tạm khóa giữa phiên, khi mở lại và khi mật khẩu tạm chỉ hiển thị một lần.
- Áp dụng cải tiến từ retrospective Sprint 1: lập bảng bằng chứng khi refinement PB-03, kiểm tra trên mã/UI cuối và cho QA đối chiếu trước khi trình nghiệm thu.

## Review và retrospective

| Item | Kết quả kiểm tra/demo | Bằng chứng | Quyết định Product Owner |
| --- | --- | --- | --- |
| PB-03 | Chưa thực hiện | Chưa có | Chưa quyết định |
| PB-13 (quản trị nền tảng) | Chưa thực hiện | Chưa có | Chưa quyết định |

Retrospective Sprint 2: chưa diễn ra. Sau review, ghi việc đã hoàn tất, việc chuyển về Product Backlog và một cải tiến cụ thể cho sprint tiếp theo.
