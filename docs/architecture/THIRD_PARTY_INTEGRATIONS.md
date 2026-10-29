# Tích hợp bên thứ ba: chuyển khoản qua SePay và VietQR

> **Trạng thái:** Định hướng tích hợp, chưa triển khai. MVP hiện cho thu ngân xác nhận chuyển khoản thủ công (BR-33); tự xác nhận qua webhook là phần mở rộng tùy chọn. Tài liệu này chưa thay thế đặc tả thanh toán trong `specs/` hay thay đổi quy tắc MVP.

Khi người dùng chọn chuyển khoản, VietQR có thể hiển thị mã QR chứa tài khoản nhận, số tiền và nội dung chuyển khoản. SePay có thể gửi webhook giao dịch đến API để đối chiếu với đơn. Việc hiển thị QR **không chứng minh** đã nhận tiền; chỉ xử lý thanh toán sau khi xác minh và đối chiếu giao dịch theo đặc tả được chốt.

## SePay (thanh toán chuyển khoản)

- **Mục đích:** nhận thông báo chuyển khoản để đối chiếu đơn khi người dùng chọn phương thức này.
- **Môi trường:** phát triển và kiểm thử bằng **SePay Webhooks Test mode**, không dùng tiền thật. Cấu hình dự kiến qua `SEPAY_ENV`; giá trị hợp lệ và cách ánh xạ sang Test/Live cần chốt trước khi triển khai. Tài khoản ngân hàng, webhook, API Access và giao dịch Test mode tách biệt Live. Đây là Test mode của **SePay Webhooks**, không mặc nhiên là Sandbox của Cổng thanh toán SePay. [Tài liệu Test mode](https://developer.sepay.vn/vi/tien-ich-khac/test-mode).
- **Biến môi trường dự kiến:** `SEPAY_ENV`, `SEPAY_WEBHOOK_SECRET` cho HMAC-SHA256; `SEPAY_API_KEY` nếu triển khai gọi SePay API. Giá trị lấy từ cấu hình bí mật của môi trường, không commit. Test và Live dùng thông tin xác thực riêng. [Xác thực webhook](https://developer.sepay.vn/vi/sepay-webhooks/xac-thuc).
- **Kiểm thử:** trong Dashboard SePay bật Test mode, tạo tài khoản và webhook Test mode, sau đó dùng **Mô phỏng giao dịch** với số tiền và nội dung chuyển khoản thử; kiểm tra webhook đến URL đã cấu hình và kết quả đối chiếu. Chưa có script giả lập webhook trong repository. [Cách mô phỏng giao dịch](https://developer.sepay.vn/vi/tien-ich-khac/test-mode/mo-phong-giao-dich).
- **Webhook dự kiến:** `POST /payments/sepay/webhook` (khi triển khai API, tuân theo base path `/api/v1`). Bắt buộc xác thực chữ ký HMAC-SHA256 trên **raw body**, kiểm tra timestamp chống phát lại, và xử lý lặp theo mã giao dịch SePay. Chỉ đối chiếu đơn khi tài khoản nhận, mã đơn và số tiền hợp lệ; việc đổi trạng thái đơn phải tuân theo transaction và idempotency của hệ thống. Hợp đồng request/response và cách phân biệt tenant/branch cần đặc tả riêng. [Xác thực webhook](https://developer.sepay.vn/vi/sepay-webhooks/xac-thuc), [bảo mật webhook](https://developer.sepay.vn/vi/sepay-webhooks/bao-mat).
- **Khác Live đã xác nhận:** Test mode chỉ nhận giao dịch mô phỏng, tài nguyên và API Access tách biệt; webhook Test mode chấp nhận HTTP hoặc chứng chỉ tự ký, còn Live yêu cầu HTTPS và chứng chỉ hợp lệ. Bộ xác thực HMAC và luồng gửi webhook dùng chung. [Tổng quan Test mode](https://developer.sepay.vn/vi/tien-ich-khac/test-mode), [tạo webhook Test mode](https://developer.sepay.vn/vi/tien-ich-khac/test-mode/tao-webhook).
- **Trước khi go-live:** chỉ sau khi đã chốt đặc tả và kiểm thử, cấp secret/cấu hình Live riêng, đăng ký URL webhook Live, kiểm tra HTTPS và thực hiện một giao dịch giá trị nhỏ để đối chiếu đầu cuối. Không chuyển môi trường chỉ bằng cách sửa `SEPAY_ENV` khi các điều kiện trên chưa hoàn tất.
- **Cấm:** tắt xác thực webhook kể cả ở Test mode của dự án, commit key/secret, hoặc tự chuyển sang Live.

## VietQR (sinh mã QR chuyển khoản)

- **Mục đích:** tạo QR cho đơn khi người dùng chọn chuyển khoản; QR chỉ mã hóa thông tin chuyển tiền, không xác nhận thanh toán.
- **Cách dùng dự kiến:** VietQR [Quick Link](https://www.vietqr.io/qr-dong) trả ảnh QR qua URL và không yêu cầu API key. Nếu sau này dùng [API tạo QR](https://www.vietqr.io/generate) thì cần `x-client-id` và `x-api-key`; chưa chọn API này và chưa có `VIETQR_API_KEY` trong ứng dụng.
- **Input:** mã ngân hàng/BIN, số tài khoản nhận, `amount` nguyên đồng và nội dung chuyển khoản (`addInfo`). Giá trị tiền phải lấy từ tổng do server tính; tài khoản nhận phải thuộc cấu hình đã được quản lý, không lấy tùy ý từ browser.
- **Ràng buộc mã đối chiếu:** nội dung chuyển khoản dùng `invoices.invoice_code` đúng dạng `HD-` + 8 ký tự `A-Z`/`0-9` (BR-75), không dùng UUID. Mã duy nhất toàn hệ thống, do server sinh và được định nghĩa trong [thiết kế DB](../DESIGN_DB_POS_SYSTEM.md). Webhook SePay chỉ khớp đơn khi mã, tài khoản nhận và số tiền hợp lệ; không tự suy đoán đơn từ nội dung gần giống. Khi đổi format, phải đổi đồng bộ phần tạo QR và phần đọc webhook. `addInfo` của [API VietQR](https://www.vietqr.io/generate) giới hạn 25 ký tự, nên mã 11 ký tự này nằm trong giới hạn đó.
- **Khi lỗi tạo/hiển thị QR:** chưa chốt có hiển thị thông tin chuyển khoản thủ công hay báo lỗi. Quyết định này phải nằm trong đặc tả luồng thanh toán trước khi nối UI thật.

## Quyết định cần chốt trước khi triển khai

1. Có bật tự xác nhận SePay cho chuyển khoản hay giữ xác nhận thủ công theo MVP; trạng thái đơn trong lúc chờ webhook, timeout và trường hợp tiền đến muộn.
2. Quy tắc khớp số tiền, giao dịch thiếu/thừa, trùng hoặc không tìm thấy đơn.
3. Cấu hình tài khoản nhận theo store/branch, quyền quản lý cấu hình và cách webhook xác định đúng tenant.
4. Cách xử lý khi VietQR không khả dụng và cách đối soát khi webhook không đến.

Các quyết định nghiệp vụ trên cần được người dùng chốt, cập nhật [quy tắc nghiệp vụ](../BUSINESS_RULES.md) và đặc tả thanh toán trong `specs/` trước khi viết mã.
