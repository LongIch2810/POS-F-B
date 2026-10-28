# Quy tắc trình bày mã

Áp dụng cho mọi ngôn ngữ và công nghệ trong dự án. File này quy định **cách trình bày**; cách chia trách nhiệm và xử lý lỗi xem `rules/clean-code.md`.

## Ưu tiên quy ước hiện có

- Nếu phần dự án có bộ định dạng hoặc quy ước đã được cấu hình, dùng đúng cấu hình đó. Không tạo quy ước thứ hai cho cùng một loại file.
- Khi chưa có cấu hình, theo cách trình bày nhất quán của các file gần đó. Trong một file, không trộn nhiều kiểu thụt đầu dòng, dấu cách hoặc xuống dòng cho cùng một cấu trúc.
- Không đổi định dạng ở phần mã không liên quan chỉ vì đang sửa cùng file. Nếu cần định dạng lại toàn file, tách thành thay đổi riêng để dễ xem xét.

## Bố cục dễ đọc

- Mỗi dòng thể hiện một ý rõ ràng. Ngắt biểu thức dài tại ranh giới logic; đặt các phần cùng cấp thẳng hàng hoặc thụt vào nhất quán.
- Dùng dòng trống để tách các nhóm có mục đích khác nhau. Tránh cả khối mã dày đặc lẫn khoảng trắng rải rác không mang ý nghĩa.
- Giữ thứ tự các phần tương tự nhau nhất quán trong cùng khu vực. Chỉ sắp xếp lại khi thứ tự mới giúp tìm hoặc hiểu mã dễ hơn.
- Viết điều kiện và phép tính đủ rõ để người đọc nhận ra thứ tự xử lý. Dùng dấu nhóm khi bỏ dấu có thể khiến cách hiểu mơ hồ.
- Giữ cách viết giá trị, khai báo và lời gọi nhất quán với phần mã xung quanh. Không đổi nhiều kiểu biểu đạt tương đương trong cùng một thay đổi.

## Vệ sinh file và diff

- Không để khoảng trắng ở cuối dòng; kết thúc file văn bản bằng một dòng mới. Giữ kiểu xuống dòng đang dùng trong file trừ khi dự án có quy ước khác.
- Không giữ dòng trống thừa, đoạn bị vô hiệu hóa tạm thời hoặc dấu vết chỉnh sửa trong bản hoàn tất.
- Trước khi gửi review, xem diff để phát hiện thay đổi định dạng ngoài phạm vi và chắc rằng phần nội dung mới vẫn dễ đọc ở dạng văn bản thuần.
