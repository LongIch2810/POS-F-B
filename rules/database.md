# Quy tắc làm việc với cơ sở dữ liệu và ORM

Áp dụng cho mọi công nghệ lưu trữ quan hệ và mọi ORM. File này nói về cách truy cập, thay đổi và vận hành dữ liệu; bảng, cột và ràng buộc nghiệp vụ của dự án nằm trong `docs/DESIGN_DB_POS_SYSTEM.md` và `docs/BUSINESS_RULES.md`.

## Truy vấn

- Xem ORM là cách tạo truy vấn, không phải lớp che giấu chi phí truy vấn. Với luồng quan trọng, kiểm tra số truy vấn và câu lệnh thực sự được chạy.
- Tránh N+1: không truy vấn quan hệ riêng cho từng phần tử của một danh sách. Lấy dữ liệu cần thiết bằng truy vấn gộp, tải quan hệ có chủ đích hoặc truy vấn theo lô. Kiểm tra lại khi danh sách có nhiều phần tử.
- Chỉ lấy cột và quan hệ cần cho kết quả. Không tải toàn bộ đồ thị dữ liệu khi màn hình hoặc xử lý chỉ cần một phần nhỏ.
- Phân trang hoặc giới hạn kết quả của truy vấn có thể trả về ngày càng nhiều bản ghi. Dùng thứ tự ổn định để tránh bản ghi lặp hoặc bị bỏ qua giữa các trang.
- Đưa lọc, gom nhóm và tính toán phù hợp xuống cơ sở dữ liệu; tránh tải nhiều dòng lên ứng dụng chỉ để lọc hoặc đếm.
- Kiểm tra kế hoạch thực thi và thời gian trên dữ liệu đủ lớn trước khi tối ưu truy vấn chậm. Không đoán hiệu năng từ số dòng mã.

## Ghi dữ liệu và transaction

- Gom những thay đổi phải thành công cùng nhau vào một transaction. Nếu một bước lỗi, toàn bộ thay đổi liên quan phải được hoàn tác.
- Giữ transaction ngắn. Không chờ tương tác người dùng hoặc gọi dịch vụ bên ngoài trong lúc giữ khóa dữ liệu.
- Khi nhiều yêu cầu có thể sửa cùng dữ liệu, dùng ràng buộc, khóa hoặc cập nhật có điều kiện để bảo vệ trạng thái. Không dựa vào chuỗi “đọc, tính, rồi ghi” thiếu kiểm soát cạnh tranh.
- Kiểm tra số dòng bị cập nhật khi thao tác yêu cầu bản ghi còn tồn tại hoặc còn ở trạng thái nhất định. Không coi một cập nhật 0 dòng là thành công mặc nhiên.
- Chọn thứ tự khóa nhất quán cho các thao tác đụng nhiều bản ghi để giảm nguy cơ deadlock. Chỉ thử lại transaction khi thao tác an toàn trước việc chạy lại.
- Tác dụng phụ bên ngoài cơ sở dữ liệu chỉ được phát sau khi transaction thành công; nếu cần bảo đảm không thất lạc, dùng cơ chế ghi nhận công việc trong cùng transaction.

## Ràng buộc và mô hình dữ liệu

- Dùng khóa chính, khóa ngoại, `NOT NULL`, `UNIQUE` và điều kiện kiểm tra để bảo vệ những bất biến có thể diễn đạt ở cơ sở dữ liệu. Kiểm tra ở ứng dụng vẫn cần thiết để trả lỗi dễ hiểu.
- Xác định rõ quan hệ, tính bắt buộc và hành vi khi xóa. Không để ORM tự quyết định xóa dây chuyền hoặc ghi đè quan hệ mà không có quy tắc đã được xem xét.
- Dùng kiểu dữ liệu và độ chính xác phù hợp với ý nghĩa giá trị. Giá trị cần chính xác tuyệt đối không được âm thầm đổi qua biểu diễn có thể làm tròn.
- Mọi ID tham chiếu và phạm vi truy cập phải được kiểm tra trước khi ghi; khóa ngoại chỉ bảo đảm bản ghi tồn tại, không tự bảo đảm người gọi có quyền dùng nó.
- Không sửa trực tiếp dữ liệu lịch sử hoặc sổ ghi bất biến khi quy tắc yêu cầu truy vết; thêm bản ghi điều chỉnh theo quy tắc nghiệp vụ.

## Chỉ mục và migration

- Tạo index từ mẫu truy vấn thực tế: cột lọc, nối, sắp xếp và điều kiện duy nhất. Xem thứ tự cột trong index nhiều cột theo cách truy vấn sử dụng chúng.
- Mỗi index tăng chi phí ghi và lưu trữ. Không thêm index cho mọi cột theo thói quen; đo hoặc kiểm tra kế hoạch thực thi để xác nhận lợi ích.
- Migration phải có thứ tự rõ ràng, triển khai được qua các môi trường và giữ dữ liệu hiện có. Với thay đổi phá vỡ, tách bước thêm cấu trúc, chuyển dữ liệu và bỏ cấu trúc cũ; kiểm tra dữ liệu trước khi siết ràng buộc.
- Trước khi áp dụng migration có thể mất dữ liệu hoặc khóa bảng lâu, đánh giá phạm vi ảnh hưởng, thời gian chạy và cách khôi phục. Không dựa vào rollback tự động để cứu một thay đổi đã xóa dữ liệu.
- Giữ mô hình ORM, migration và tài liệu schema nhất quán; thay đổi cấu trúc không hoàn tất nếu chỉ sửa một trong ba nơi.
