# Quy tắc bảo mật chung

Áp dụng cho mọi phần của dự án, không phụ thuộc ngôn ngữ hay công nghệ. Thông số xác thực và quyền riêng của sản phẩm nằm trong `docs/architecture/auth.md`, `docs/BUSINESS_RULES.md` và `docs/api-spec.md`.

## Secret và thông tin xác thực

- Xem mật khẩu, token, khóa ký, khóa mã hóa, thông tin kết nối và khóa truy cập dịch vụ là secret. Không ghi secret thật vào mã nguồn, file cấu hình mẫu, dữ liệu kiểm thử, tài liệu, ảnh chụp màn hình hoặc lịch sử thay đổi.
- Cấp secret qua cơ chế quản lý bí mật được dự án chấp nhận. Chỉ người và thành phần cần dùng mới được đọc; mỗi môi trường dùng secret riêng và quyền tối thiểu.
- Không in secret ra log, thông báo lỗi hoặc phản hồi. Nếu cần nhận diện khi điều tra, dùng mã tham chiếu hoặc giá trị đã che phù hợp; không ghi nguyên token hay khóa.
- Secret phải sinh bằng nguồn ngẫu nhiên an toàn cho mục đích bảo mật, có cách thu hồi và thay thế. Khi nghi bị lộ, thu hồi hoặc xoay vòng ngay, kiểm tra phạm vi ảnh hưởng và xóa bản sao lộ ở nơi có thể xóa. Xóa khỏi file hiện tại không làm secret trong lịch sử hết hiệu lực.
- Mật khẩu người dùng chỉ lưu bằng thuật toán băm mật khẩu có chi phí phù hợp; không lưu nguyên văn hoặc mã hóa có thể giải ngược để xác thực.

## Thông tin cá nhân và dữ liệu nhạy cảm

- Chỉ thu thập, lưu và trả những trường cần cho mục đích đã xác định. Phân biệt dữ liệu công khai, nội bộ, cá nhân và secret trước khi chia sẻ hoặc xuất dữ liệu.
- Kiểm tra quyền theo người gọi, hành động và từng bản ghi trước khi đọc, sửa, xuất hoặc gửi dữ liệu. Dữ liệu nhạy cảm không tự trở thành công khai chỉ vì một màn hình hoặc báo cáo cần một phần của nó.
- Che hoặc bỏ thông tin cá nhân khỏi log, thông báo lỗi, dữ liệu thử nghiệm và công cụ theo dõi khi giá trị đầy đủ không cần thiết. Không dùng dữ liệu thật của người dùng ở môi trường thử nghiệm nếu chưa có cách bảo vệ phù hợp.
- Bảo vệ dữ liệu khi truyền và khi lưu theo mức độ nhạy cảm; bản sao lưu và bản xuất phải chịu cùng giới hạn truy cập. Giữ dữ liệu trong thời gian cần thiết theo chính sách đã được chốt, rồi xóa hoặc ẩn danh an toàn.
- Trước khi thêm một trường cá nhân hoặc luồng chia sẻ mới, xác định ai được xem, vì sao cần, nơi dữ liệu đi tới và cách xử lý khi không còn cần.

## Phân quyền và ranh giới tin cậy

- Mặc định từ chối khi thiếu danh tính, quyền hoặc ngữ cảnh cần thiết. Kiểm tra quyền ở phía xử lý đáng tin cậy cho **mọi** thao tác; ẩn nút trên giao diện không thay thế kiểm tra quyền.
- Kiểm tra phạm vi của mọi ID và quan hệ do người gọi gửi. Một ID hợp lệ hoặc bản ghi tồn tại không có nghĩa người gọi được truy cập bản ghi đó.
- Không tin giá, vai trò, phạm vi dữ liệu, trạng thái hoặc kết quả tính do client gửi khi máy chủ phải tự xác định chúng. Kiểm tra lại ngay trước khi tạo tác dụng phụ để tránh điều kiện thay đổi giữa lúc đọc và ghi.
- Tài khoản và thành phần hệ thống chỉ được cấp quyền đủ cho công việc của mình. Thay đổi quyền phải có hiệu lực theo quy tắc sản phẩm và không mở đường vượt qua ranh giới dữ liệu.

## Đầu vào, đầu ra và file

- Giới hạn kích thước và kiểm tra kiểu, định dạng, phạm vi, trường cho phép của dữ liệu đầu vào tại ranh giới hệ thống. Kiểm tra dữ liệu hợp lệ không thay thế kiểm tra quyền.
- Dùng tham số hoặc cơ chế tương đương khi đưa dữ liệu vào truy vấn hay lệnh; mã hóa đầu ra theo nơi hiển thị. Không ghép dữ liệu không tin cậy thành câu lệnh hoặc nội dung thực thi.
- Với file tải lên, giới hạn loại và kích thước, kiểm tra nội dung thực thay vì tin tên file hoặc loại do client khai, đặt tên lưu trữ do hệ thống tạo và chỉ cho người có quyền truy cập.
- Lỗi trả cho người dùng đủ để sửa thao tác nhưng không lộ secret, thông tin cá nhân không cần thiết, cấu trúc nội bộ hoặc dữ liệu của người khác.

## Log, kiểm tra và sự cố

- Ghi sự kiện bảo mật đủ để truy vết ai làm gì, khi nào và kết quả, nhưng không ghi secret hoặc toàn bộ dữ liệu cá nhân. Làm sạch dữ liệu không tin cậy trước khi đưa vào log.
- Kiểm tra cả trường hợp bị từ chối: thiếu quyền, ID ngoài phạm vi, đầu vào độc hại hoặc quá lớn, thao tác lặp và token không còn hợp lệ.
- Khi phát hiện lộ secret hoặc dữ liệu cá nhân, hạn chế truy cập, thu hồi thông tin xác thực bị ảnh hưởng, giữ chứng cứ cần thiết và báo cho người phụ trách theo quy trình sự cố; không tự công bố chi tiết nhạy cảm.
