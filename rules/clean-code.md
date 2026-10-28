# Quy tắc viết mã rõ ràng

Áp dụng cho mọi phần của dự án, không phụ thuộc ngôn ngữ, framework hay công cụ. Tài liệu này nói về cách tổ chức và diễn đạt mã; quy tắc nghiệp vụ nằm trong `docs/PRODUCT_OVERVIEW.md` và `docs/BUSINESS_RULES.md`.

## Phạm vi thay đổi

- Hiểu hành vi hiện tại, nơi gọi và dữ liệu liên quan trước khi sửa mã dùng chung.
- Chỉ thay đổi những phần cần thiết để giải quyết yêu cầu. Cập nhật nơi gọi, kiểm tra và tài liệu bị ảnh hưởng bởi thay đổi đó.
- Giữ cách tổ chức đang dùng nếu nó vẫn giải quyết tốt vấn đề. Không thêm tầng, tùy chọn hay cấu hình chỉ để phòng trường hợp tương lai.
- Với thay đổi lớn, chia thành các bước có thể đọc và kiểm tra độc lập; mỗi bước giữ hệ thống ở trạng thái nhất quán.

## Mã dễ hiểu

- Đặt tên theo ý nghĩa trong nghiệp vụ. Người đọc phải hiểu một giá trị hay hành động dùng để làm gì mà không cần đoán từ chữ viết tắt.
- Mỗi phần mã có một trách nhiệm rõ ràng. Tách phần khi việc tách giúp giảm độ phức tạp hoặc làm rõ ranh giới, không tách chỉ để làm mã ngắn hơn.
- Ưu tiên luồng xử lý thẳng, ít nhánh và ít mức lồng nhau. Xử lý điều kiện không hợp lệ sớm khi điều đó giúp luồng chính dễ đọc.
- Dùng một nguồn dữ liệu chuẩn cho mỗi giá trị. Không lưu hoặc tính lại cùng một sự thật ở nhiều nơi nếu chúng có thể lệch nhau.
- Chỉ gom logic trùng khi quy tắc thật sự giống nhau. Hai đoạn trông giống nhau nhưng thay đổi vì lý do khác nhau có thể để riêng.
- Thay số hoặc chuỗi khó hiểu bằng tên diễn tả ý nghĩa; giữ giá trị hiển nhiên ngay tại chỗ dùng.

## Ranh giới và lỗi

- Kiểm tra dữ liệu tại nơi dữ liệu đi vào hệ thống và trước khi ghi hoặc tạo tác dụng phụ. Không dựa vào giả định rằng nơi gọi luôn gửi dữ liệu hợp lệ.
- Giữ các trạng thái không hợp lệ ngoài dữ liệu lâu dài. Các thay đổi liên quan phải thành công cùng nhau hoặc không thay đổi gì.
- Không nuốt lỗi. Trả hoặc ghi nhận đủ ngữ cảnh để xác định nguyên nhân, đồng thời không làm lộ dữ liệu nhạy cảm.
- Xử lý trường hợp rỗng, thiếu, trùng và thao tác lặp khi chúng có thể xảy ra trong luồng thực tế.

## Giải thích và duy trì

- Bình luận để giải thích **vì sao** một lựa chọn khó hiểu là cần thiết; không lặp lại điều mã đã thể hiện. Xóa hoặc sửa bình luận khi hành vi thay đổi.
- Xóa mã chết và dấu vết thử nghiệm khi hoàn tất. Không để nhánh xử lý hoặc tham số không còn người dùng.
- Trước khi hoàn tất, đọc lại phần đã đổi như người chưa viết nó: tên gọi, luồng lỗi và tác dụng phụ phải rõ; kiểm tra đúng hành vi bị ảnh hưởng.
