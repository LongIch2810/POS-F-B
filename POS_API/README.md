# PB-01/PB-02 local API

Yêu cầu: Node.js 22, Docker Desktop và Docker Compose. UI demo chưa nối API.

1. Tạo `POS_INFRA/.env.local` từ `.env.example` và đặt username, mật khẩu ngẫu nhiên, tên DB. Không commit file này.
2. Ở gốc repo chạy `docker compose --env-file POS_INFRA/.env.local -f POS_INFRA/compose.local.yml up -d --wait`.
3. Trong `POS_API/`, chạy `npm ci`. Đặt `DATABASE_URL` trỏ đến DB local, cùng ba biến `BOOTSTRAP_ADMIN_USERNAME`, `BOOTSTRAP_ADMIN_FULL_NAME`, `BOOTSTRAP_ADMIN_PASSWORD` (mật khẩu tối thiểu 12 ký tự). Đặt thêm `PUBLIC_ORIGIN` là origin của web và hai secret riêng `JWT_SECRET`, `CSRF_SECRET` (mỗi secret tối thiểu 32 byte). Giá trị phải là secret riêng của môi trường, không dùng ví dụ cố định.
4. Chạy `npm run migration:run`, sau đó `npm run start`. Gọi `GET http://localhost:3000/api/v1/health` để kiểm tra. Sau khi admin đầu tiên được tạo, có thể bỏ ba biến bootstrap ở lần chạy sau.
5. Chạy `npm test` với `DATABASE_URL` của DB local. Test tạo và xóa **database thử riêng** có tên `pos_pb01_test_<ngẫu nhiên>` hoặc `pos_pb02_test_<ngẫu nhiên>`; tài khoản DB local cần quyền `CREATE DATABASE`.

PB-02 cung cấp `/api/v1/auth/login`, `/me`, `/csrf`, `/refresh`, `/logout`, `/change-password`. Cookie `Secure` cần HTTPS khi thử trên browser; test HTTP tự động kiểm tra header và tác dụng phụ DB. Giới hạn thử dùng bảng `auth_rate_events` từ migration PB-02.

Đặt `NODE_ENV=development` để mở Swagger UI tại `/api/docs` và OpenAPI JSON tại `/api/docs-json`. Hai route này không được đăng ký ở môi trường khác. Login dùng Passport local, request Cookie được đọc qua `cookie-parser`; request DTO được xác thực bằng NestJS `ValidationPipe`.

Mã PB-02 nằm trong `src/auth/`: cấp gốc có `AuthModule`, service và cấu hình; `http/` có controller, DTO và cookie helper; `security/` có guard và Passport strategy; `tests/` có test. `src/database/` chứa DataSource, `DatabaseModule`, entity và migration; module cấp cùng một DataSource cho AuthModule và health. `src/main.ts`, `src/app.module.ts`, filter lỗi và Swagger setup ở cấp ứng dụng.

API không tự chạy migration. Đừng dùng `schema:sync`; thay đổi schema phải có migration. Docker Compose này chỉ phục vụ phát triển local, chưa phải cấu hình production.
