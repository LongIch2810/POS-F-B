# <Tên chức năng>

**Trạng thái:** <bản nháp / đã chốt; ngày và căn cứ chốt nếu có>

## Mục tiêu và phạm vi

- **Mục tiêu:** <kết quả nghiệp vụ và người sử dụng>.
- **Trong phạm vi:** <chức năng, API, UI hoặc dữ liệu liên quan>.
- **Ngoài phạm vi:** <giới hạn liên quan, nếu có>.
- **Tài liệu và quy tắc:** <liên kết tài liệu liên quan, mã BR-xx>.

## Quyết định và điểm cần chốt

- **Đã chốt:** <quyết định và căn cứ>.
- **Còn mở:** <câu hỏi hoặc mâu thuẫn ảnh hưởng hành vi; phân biệt phương án đề xuất với quyết định của người dùng>.

## Luồng và hành vi

- **Luồng chính:** <các bước từ đầu vào đến kết quả>.
- **Quyền và phạm vi dữ liệu:** <vai trò/quyền, store và branch theo ngữ cảnh liên quan>.
- **Trạng thái và chuyển trạng thái:** <điều kiện, tác dụng phụ và trường hợp biên>.
- **UI:** <màn hình, tương tác, phản hồi và trạng thái liên quan nếu thuộc phạm vi>.

## Endpoint

Lặp phần dưới cho từng endpoint thuộc phạm vi, theo thứ tự của `docs/api-spec.md` mục 12. Bỏ cả mục này nếu chức năng không có API; không ghi lại quy ước chung nếu chỉ cần dẫn tài liệu.

### <METHOD /api/v1/path>

1. **Mô tả:** <mục đích>.
2. **Quyền:** <mã permission và vai trò mặc định>.
3. **Phạm vi:** <ngữ cảnh store/branch và kiểm tra ID>.
4. **Business rule:** <BR-xx liên quan>.
5. **Request:** <DTO/schema, path, query, header và body; kiểu, bắt buộc, nullable và ràng buộc>.
6. **Response thành công:** <DTO/schema, HTTP status và cấu trúc data; nêu 204 không body nếu áp dụng>.
7. **Lỗi:**

   | HTTP | Mã lỗi | Điều kiện |
   | --- | --- | --- |
   | <status> | <code> | <điều kiện> |

8. **Ghi chú xử lý:** <transaction, khóa, thứ tự và tác dụng phụ liên quan>.
9. **Ví dụ:** <request và response phù hợp quy tắc, không dùng secret thật>.
10. **Kiểm thử cần có:** <tình huống và BR tương ứng>.

## Nghiệm thu và bằng chứng

- <Tiêu chí kiểm thử được; chia rõ từng vế và trạng thái quan trọng>.
- <Tình huống, output test hoặc artifact API/UI/DB cần lưu theo `AGENTS.md`>.
