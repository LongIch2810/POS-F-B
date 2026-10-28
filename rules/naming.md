# Quy tắc đặt tên

Áp dụng cho hàm, biến, kiểu dữ liệu, file và thư mục ở mọi phần của dự án. File này quy định **ý nghĩa của tên**, không ấn định `camelCase`, `snake_case` hay kiểu chữ khác. Dùng quy ước đã có tại nơi viết mã; tên ở ranh giới API và cơ sở dữ liệu tuân theo tài liệu tương ứng.

## Nguyên tắc chung

- Tên nói đúng vai trò trong nghiệp vụ và đúng phạm vi sử dụng. Dùng cùng một thuật ngữ cho cùng một khái niệm; không đổi qua lại giữa các từ gần nghĩa.
- Ưu tiên tên đầy đủ, dễ tìm kiếm. Chỉ viết tắt khi từ viết tắt đã quen thuộc với cả nhóm hoặc là thuật ngữ chính thức của miền nghiệp vụ.
- Độ dài tên tương xứng phạm vi: biến dùng trong vài dòng có thể ngắn; tên xuất hiện qua nhiều file phải đủ rõ khi đứng một mình.
- Không thêm thông tin đã hiển nhiên từ ngữ cảnh. Không dùng tên chung như `data`, `item`, `helper`, `manager` nếu có thể nói rõ dữ liệu hay việc được quản lý.
- Khi ý nghĩa đổi, đổi tên cùng mọi nơi sử dụng. Không giữ tên cũ rồi giải thích bằng bình luận.

## Hàm và hành động

- Tên hàm bắt đầu bằng hành động và nêu đối tượng hoặc kết quả, chẳng hạn “tính tổng hóa đơn”, “tìm ca đang mở”, “hủy hóa đơn”.
- Phân biệt hành động đọc, tính toán và ghi thay đổi. Tên mang nghĩa “lấy” hoặc “kiểm tra” không được âm thầm ghi dữ liệu hay gửi thông báo.
- Hàm kiểm tra điều kiện dùng tên có thể đọc như câu hỏi và trả lời rõ đúng hoặc sai, chẳng hạn “ca có đang mở không”.
- Tránh tên quá rộng như “xử lý đơn” khi hàm thực tế chỉ thêm món, tính tổng hoặc thanh toán.

## Biến, dữ liệu và hằng số

- Biến mang tên danh từ diễn tả giá trị đang giữ. Tập hợp dùng tên số nhiều; một phần tử dùng tên số ít.
- Giá trị đúng hoặc sai dùng tên diễn tả trạng thái hoặc điều kiện, chẳng hạn “đã thanh toán”, “được phép hủy”. Tránh phủ định kép.
- Tiền, thời gian, số lượng và đơn vị đo phải rõ trong tên khi có thể nhầm lẫn, chẳng hạn tiền khách đưa với tiền phải trả, hoặc giây với phút.
- Tên hằng số diễn tả ý nghĩa của giới hạn hay trạng thái, không chỉ lặp lại giá trị số hoặc chuỗi.
- Không đặt tên theo kiểu dữ liệu tạm thời nếu kiểu đó có thể đổi mà ý nghĩa không đổi.

## Kiểu dữ liệu, file và thư mục

- Tên kiểu dữ liệu hoặc cấu trúc diễn tả thực thể và vai trò của nó. Phân biệt dữ liệu đầu vào, bản ghi lưu trữ và dữ liệu trả ra khi chúng có nội dung hoặc ràng buộc khác nhau.
- Tên file nói được trách nhiệm chính của file và khớp với nội dung bên trong. Tránh gom nhiều việc không liên quan vào file mang tên chung.
- Thư mục nhóm theo phần việc hoặc khái niệm ổn định. Không tạo thêm cấp thư mục chỉ để chứa một file nếu cấu trúc hiện tại đã rõ.
- File kiểm tra đặt tên để người đọc tìm được phần mã hoặc hành vi được kiểm tra; giữ quy ước tên file hiện có của dự án.
