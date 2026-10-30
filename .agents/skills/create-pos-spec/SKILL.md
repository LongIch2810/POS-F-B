---
name: create-pos-spec
description: Use when interviewing, writing, revising, or reviewing a feature or endpoint specification for this POS repository, including as part of an implementation task.
---

# Đặc tả chức năng POS

Áp dụng một quy trình cho mọi chức năng; mỗi chức năng có spec riêng, không có skill riêng. `specs/` ở **gốc repository** chỉ chứa bản đã chốt.

1. Xác định phạm vi chức năng và đọc `docs/PRODUCT_OVERVIEW.md`, các mã liên quan trong `docs/BUSINESS_RULES.md`, cùng spec đã chốt nếu có. Với API, đọc `docs/api-spec.md` (nhất là mẫu endpoint ở mục 12) và phần DB/kiến trúc liên quan; với UI, đọc `DESIGN.md`.
2. Phỏng vấn để chốt những quyết định còn thiếu. Hỏi về kết quả nghiệp vụ và trường hợp biên có thể làm thay đổi hành vi; không hỏi lại điều đã rõ trong yêu cầu hoặc tài liệu. Phân biệt quyết định của người dùng với giả định đang đề xuất.
3. Đọc và dùng [mẫu đặc tả](assets/spec-template.md) để soạn bản nháp cho người dùng xem; chọn phần phù hợp với phạm vi, lặp mẫu endpoint cho từng route. Với endpoint, giữ đầy đủ cấu trúc và thứ tự ở `docs/api-spec.md` mục 12; không chép lại quy ước chung. Đánh dấu quyết định chưa chốt, không tự biến placeholder thành quy tắc.
4. Rà soát bản nháp với yêu cầu và các tài liệu: tìm mâu thuẫn, câu có nhiều cách hiểu, trường hợp thiếu, ví dụ không khớp quy tắc, và điểm chưa thể kiểm thử. Nêu rõ từng vấn đề và hỏi người dùng quyết định khi tài liệu không đủ; không tự biến giả định thành quy tắc đã chốt.
5. Khi người dùng đã chốt nội dung và không còn quyết định mở, ghi hoặc cập nhật file phù hợp trong `specs/` ở gốc. Ghi rõ trạng thái đã chốt và các mã BR liên quan. Nếu quyết định mới thay đổi tài liệu chung, cập nhật các chỗ bị ảnh hưởng cùng lúc; không tạo spec trùng lặp.

Nếu yêu cầu chỉ là sửa code theo hành vi đã được quyết định, không tạo spec mới chỉ vì có lỗi.
