# Sprint 2 — PB-03 và PB-13 quản trị nền tảng đã nghiệm thu local

## Cơ sở lập kế hoạch

Sprint diễn ra trong một tuần, từ **29/10/2026 đến hết 04/11/2026**; nhóm gồm Product Owner và Codex theo [cách vận hành Sprint 1](../sprint-01/SPRINT.md). [Product Backlog](../../docs/PRODUCT_BACKLOG.md) đặt PB-03 sau PB-02 và PB-13 đi cùng các lát cắt API đã hoàn thành. Trong [Review Sprint 1](../sprint-01/SPRINT.md#review-và-retrospective), Product Owner đã chấp nhận PB-01, PB-02 và PB-13 trong phạm vi xác thực; các màn vận hành còn dùng dữ liệu mô phỏng.

Sprint 1 đã được [chốt bằng Review và retrospective từ hồ sơ](../sprint-01/SPRINT.md#kết-luận-sprint-1--2026-10-29). Product Owner đã chốt Sprint Goal và Sprint Backlog bên dưới ngày 29/10/2026. Đây là **cam kết phạm vi**, chưa phải bằng chứng chức năng đã hoàn thành; đặc tả PB-03 phải được chốt trong bước refinement trước khi triển khai phần phụ thuộc.

## Sprint Goal

`PLATFORM_ADMIN` tạo được cửa hàng và tài khoản `OWNER`, tạm khóa/mở lại cửa hàng trên API và giao diện thật, với phạm vi quyền được kiểm tra bằng PostgreSQL. Đây là lát cắt **PB-03 + PB-13 (quản trị nền tảng)**.

## Sprint Backlog đã chốt

| Thứ tự | Item | Kết quả cần đạt | Điều kiện trước khi triển khai |
| --- | --- | --- | --- |
| 1 | Refinement PB-03 | Phỏng vấn, rà quy tắc [BR-79–BR-86](../../docs/BUSINESS_RULES.md), làm rõ request/response, quyền, lỗi và tình huống biên; lập bảng tiêu chí → tình huống → artifact; chốt `specs/platform.md` và phần cấp `OWNER` liên quan. | Product Owner quyết định các điểm còn mở; chỉ lưu spec đã chốt. |
| 2 | PB-03 API/DB | Quản trị viên nền tảng quản lý store và cấp `OWNER` theo spec; khóa/mở store áp dụng đúng quy tắc phiên và cô lập dữ liệu. | PB-02 đã nghiệm thu; spec ở mục 1 đã chốt. |
| 3 | PB-13 lát cắt PB-03 | Màn quản trị nền tảng gọi API thật cho các thao tác PB-03, hiển thị kết quả/lỗi và không dùng mock làm nguồn dữ liệu của lát cắt này. | API PB-03 đã có và được kiểm tra. |
| 4 | Review | Demo luồng trên bản mã cuối, đối chiếu từng tiêu chí với artifact API, DB và browser; Product Owner chấp nhận hoặc trả lại từng item. | Các kiểm tra và bằng chứng theo `AGENTS.md` đã hoàn tất. |

Product Owner chốt sức chứa Sprint 2 là PB-03 và lát cắt UI PB-13 trong bảng trên. PB-04 phụ thuộc PB-03; nếu đổi phạm vi trong sprint, ghi quyết định và lý do tại đây trước khi bổ sung. SePay/VietQR là hướng tích hợp tùy chọn, không thuộc Sprint 2.

## Tiêu chí nghiệm thu

Đây là tiêu chí ở cấp sprint; hợp đồng endpoint và tình huống biên sẽ được chốt trong spec PB-03. Các ô để trống cho đến khi chạy kiểm tra trên mã cuối, QA đối chiếu artifact và Product Owner quyết định nghiệm thu. Khi refinement thay đổi tiêu chí, cập nhật bảng này trước khi triển khai phần bị ảnh hưởng.

### PB-03 — quản trị nền tảng

- [x] `PLATFORM_ADMIN` tạo store và cấp `OWNER` trong đúng store; mật khẩu tạm chỉ trả một lần, không xuất hiện lại trong API/log, tài khoản mới phải đổi mật khẩu trước khi dùng chức năng nghiệp vụ (BR-83, BR-84).
- [x] Người không có permission hoặc context phù hợp bị từ chối thao tác quản trị nền tảng; danh tính platform không có tenant context và bị chặn quyền vận hành theo BR-81. Kiểm tra HTTP từng API hóa đơn/ca/kho/doanh thu thật được theo dõi khi module tương ứng triển khai.
- [x] Tạm khóa store chặn đăng nhập và API của người dùng trong store, thu hồi refresh token, giữ dữ liệu; mở lại yêu cầu đăng nhập mới (BR-82).
- [x] Kiểm tra ranh giới store, các ID tham chiếu, lỗi đầu vào và trường hợp request lặp theo spec đã chốt; log sự kiện quản trị theo BR-86 mà không ghi mật khẩu/token.

### PB-13 — UI cho PB-03

- [x] Màn quản trị nền tảng đọc/ghi qua API PB-03 thật; tạo store/`OWNER`, khóa/mở store và hiển thị trạng thái cuối sau tải lại trang.
- [x] UI chỉ hiển thị mật khẩu tạm ở thời điểm được cấp và không lưu vào browser storage; lỗi/quyền được trình bày bằng tiếng Việt.
- [x] Các màn POS/kho còn mô phỏng được ghi rõ là demo, không được tính là PB-03 hoặc PB-13 đã hoàn thành.

## Kiểm tra và bằng chứng dự kiến

Trước khi chạy QA, lập bảng tiêu chí → tình huống → artifact theo `AGENTS.md`. Cần test API/DB với PostgreSQL cho tạo store, cấp `OWNER`, khóa/mở và cô lập quyền; giữ output runner và trạng thái DB trước/sau. Cần kiểm tra browser trên UI cuối cho mật khẩu tạm, tải lại trang, phiên bị khóa/mở lại; giữ snapshot, request/response đã che dữ liệu nhạy cảm. Chỉ tick tiêu chí sau khi QA mở lại artifact và đối chiếu được; phân biệt CI độc lập, local do agent chạy và chưa xác minh.

## Quyết định planning và câu hỏi refinement

- Đã chốt ngày 29/10/2026: Sprint Goal và sức chứa gồm PB-03 API/DB + lát cắt UI PB-13; thời lượng một tuần từ 29/10 đến hết 04/11/2026.
- Chốt luồng tạo store/cấp `OWNER`, dữ liệu bắt buộc, cách xử lý thất bại và các endpoint trong `specs/platform.md`; phần tài khoản liên quan phải thống nhất với spec auth.
- Chốt hành vi UI khi store bị tạm khóa giữa phiên, khi mở lại và khi mật khẩu tạm chỉ hiển thị một lần.
- Áp dụng cải tiến từ retrospective Sprint 1: lập bảng bằng chứng khi refinement PB-03, kiểm tra trên mã/UI cuối và cho QA đối chiếu trước khi trình nghiệm thu.

## Review và retrospective

Ngày 30/10/2026 Product Owner chốt làm lại theo spec mới: cursor/limit/meta, permission và context platform/store, target store của admin, UI Cửa hàng/Chủ quán với xác nhận lưu mật khẩu. Nhật ký/chi nhánh UI và kiểm tra HTTP trên API vận hành hoãn đến lát cắt tương ứng. Các quyết định ngày29/10 trong bảng dưới là lịch sử; các ô nghiệm thu ở trên hiện phản ánh phiên bản sau fix race cursor được chấp nhận ngày30/10 theo bằng chứng QA cuối.

| Item | Kết quả kiểm tra/demo | Bằng chứng | Quyết định Product Owner |
| --- | --- | --- | --- |
| PB-03 | API/DB và browser đã kiểm tra local; QA đối chiếu artifact | [Bằng chứng QA local](../../qa-evidence/20261029-202132-53d794b/run.md) | Product Owner chấp nhận các tiêu chí đủ bằng chứng ngày 29/10/2026; ô quyền còn chờ API vận hành |
| PB-13 (quản trị nền tảng) | UI cuối đã kiểm tra local; QA đối chiếu artifact | [Bằng chứng QA local](../../qa-evidence/20261029-202132-53d794b/run.md) | Product Owner chấp nhận ba tiêu chí lát cắt quản trị nền tảng ngày 29/10/2026 |
| PB-03 làm lại 30/10 | API PostgreSQL7/7, context/permission/cursor và browser API thật; QA đối chiếu đủ phạm vi mới | [Run API/DB](../../qa-evidence/20261030-0158-53d794b-pb03-rework/run.md), [QA nghiệm thu cuối](../../qa-evidence/20261030-platform-tab-race/qa-acceptance-audit.md) | Product Owner chấp nhận ngày30/10/2026 trong phạm vi local đã chốt |
| PB-13 làm lại 30/10 | UI10/10/build, browser sau fix race, chọn store trang sau, modal mật khẩu và refresh lỗi/retry | [Run sau fix](../../qa-evidence/20261030-platform-tab-race/run.md), [QA nghiệm thu cuối](../../qa-evidence/20261030-platform-tab-race/qa-acceptance-audit.md) | Product Owner chấp nhận ngày30/10/2026, chỉ lát cắt quản trị nền tảng |

Retrospective Sprint 2: chưa diễn ra. Sau review, ghi việc đã hoàn tất, việc chuyển về Product Backlog và một cải tiến cụ thể cho sprint tiếp theo.

QA sau fix race cursor ngày30/10 đã đối chiếu UI/container source hash, browser với API thật, cấp OWNER cho store chọn ở trang sau và refresh lỗi/retry. [Báo cáo QA nghiệm thu cuối](../../qa-evidence/20261030-platform-tab-race/qa-acceptance-audit.md) kết luận đủ chứng cứ local theo phạm vi mới; QA tự chạy UI10/10, phần browser/API/DB do agent chính chạy và QA đối chiếu.

Product Owner yêu cầu nghiệm thu các tiêu chí đủ chứng cứ sau kết luận QA ngày30/10/2026. Đã chấp nhận **4/4 tiêu chí PB-03 và 3/3 tiêu chí PB-13 quản trị nền tảng** trên phiên bản sau fix race cursor. Bằng chứng local trên working tree dirty, chưa có CI độc lập; không phải xác nhận production hoặc hoàn thành toàn bộ PB-13. Kiểm tra HTTP từng API vận hành, UI nhật ký và chi nhánh tiếp tục theo dõi ở lát cắt tương ứng theo phạm vi đã chốt.
