# Quy tắc kiểm thử

Áp dụng cho mọi phần của dự án, không phụ thuộc ngôn ngữ hay bộ kiểm thử. Mục tiêu là chứng minh hành vi quan trọng và phát hiện lỗi hồi quy với số phép kiểm tra vừa đủ.

## Chọn điều cần kiểm tra

- Mỗi business rule có ít nhất một test nhận diện được bằng mã `BR-xx`, theo `docs/BUSINESS_RULES.md`. Một test có thể bao phủ nhiều rule nếu cùng một hành vi; không tạo test chỉ để tăng số lượng.
- Với thay đổi logic, kiểm tra hành vi nhìn từ ranh giới sử dụng: đầu vào, kết quả, trạng thái được lưu và tác dụng phụ. Không viết test chỉ lặp lại từng dòng triển khai.
- Ưu tiên trường hợp dễ gây mất tiền, lộ dữ liệu, ghi sai trạng thái hoặc xử lý trùng. Bao gồm đường thành công, đầu vào không hợp lệ, ranh giới và trường hợp bị từ chối.
- Sửa lỗi thì thêm hoặc cập nhật một test thể hiện tình huống lỗi trước khi coi là xong. Thay đổi thuần trình bày, không đổi hành vi và có thể kiểm tra trực tiếp thì không cần test mới.
- Chọn mức kiểm tra thấp nhất vẫn bắt được lỗi cần tìm: kiểm tra phần tính toán riêng, kiểm tra tích hợp cho ràng buộc giữa các thành phần, kiểm tra luồng người dùng cho các bước thật sự quan trọng.

## Test đáng tin

- Mỗi test nói rõ điều kiện ban đầu, hành động và kết quả cần thấy. Tên test mô tả hành vi; khẳng định kết quả quan trọng, không chỉ kiểm tra thao tác không báo lỗi.
- Test phải độc lập, chạy lại cho cùng kết quả và không phụ thuộc thứ tự chạy. Kiểm soát thời gian, dữ liệu ngẫu nhiên và trạng thái dùng chung khi chúng ảnh hưởng kết quả.
- Dữ liệu thử nhỏ nhưng đủ phân biệt đúng sai. Dùng dữ liệu giả; không đưa thông tin cá nhân hoặc secret thật vào test và fixture.
- Chỉ giả lập ranh giới không thuộc phần đang kiểm tra. Với logic phụ thuộc ràng buộc cơ sở dữ liệu, transaction hoặc truy vấn, cần ít nhất một kiểm tra tích hợp trên cơ sở dữ liệu phù hợp thay vì chỉ giả lập ORM.
- Không dùng thời gian chờ cố định để che điều kiện đồng bộ. Với xử lý đồng thời hoặc gửi lại, kiểm tra kết quả cuối và số lần tác dụng phụ xảy ra.
- Khi test thất bại, thông báo phải giúp tìm được hành vi sai. Không sửa test chỉ để chấp nhận kết quả mới trước khi xác nhận yêu cầu đã đổi.

## Các ranh giới cần chú ý

- Phân quyền: kiểm tra cả quyền được cấp và bị từ chối, ID thuộc phạm vi khác, cùng một tài nguyên qua các đường truy cập khác nhau.
- Ghi dữ liệu: kiểm tra rollback khi một bước lỗi, xung đột đồng thời, ràng buộc duy nhất và thao tác gửi lại không tạo bản ghi hoặc tác dụng phụ thứ hai.
- Truy vấn danh sách: kiểm tra lọc, phân trang ổn định và số truy vấn khi danh sách đủ lớn để lộ N+1.
- Giao diện: kiểm tra hành động chính, trạng thái tải/lỗi, thông báo và khả năng thao tác bằng cách tương tác mà người dùng thực hiện; tránh test dựa vào cấu trúc nội bộ dễ thay đổi.

## Trước khi hoàn tất

- Chạy đúng lệnh kiểm tra đã được cấu hình cho phần bị ảnh hưởng. Nếu chưa có lệnh hoặc môi trường cần thiết, nói rõ phần nào chưa kiểm tra thay vì khẳng định đã qua.
- Xem kết quả thực tế của test mới và test liên quan. Dừng mở rộng kiểm thử khi đã có bằng chứng đủ cho rủi ro của thay đổi.
- Báo cáo ngắn gọn những gì đã chạy, kết quả và giới hạn còn lại. Không dùng tỷ lệ bao phủ làm bằng chứng duy nhất về chất lượng.
