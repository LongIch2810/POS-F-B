# PB-01 local API

Yêu cầu: Node.js 22, Docker Desktop và Docker Compose. Chưa có endpoint đăng nhập hoặc UI nối API.

1. Tạo `POS_INFRA/.env.local` từ `.env.example` và đặt username, mật khẩu ngẫu nhiên, tên DB. Không commit file này.
2. Ở gốc repo chạy `docker compose --env-file POS_INFRA/.env.local -f POS_INFRA/compose.local.yml up -d --wait`.
3. Trong `POS_API/`, chạy `npm ci`. Đặt `DATABASE_URL` trỏ đến DB local, cùng ba biến `BOOTSTRAP_ADMIN_USERNAME`, `BOOTSTRAP_ADMIN_FULL_NAME`, `BOOTSTRAP_ADMIN_PASSWORD` (mật khẩu tối thiểu 12 ký tự). Giá trị phải là secret riêng của môi trường, không dùng ví dụ cố định.
4. Chạy `npm run migration:run`, sau đó `npm run start`. Gọi `GET http://localhost:3000/api/v1/health` để kiểm tra. Sau khi admin đầu tiên được tạo, có thể bỏ ba biến bootstrap ở lần chạy sau.
5. Chạy `npm test` với `DATABASE_URL` của DB local. Test tạo và xóa **database thử riêng** có tên `pos_pb01_test_<ngẫu nhiên>`; tài khoản DB local cần quyền `CREATE DATABASE`.

API không tự chạy migration. Đừng dùng `schema:sync`; thay đổi schema phải có migration. Docker Compose này chỉ phục vụ phát triển local, chưa phải cấu hình production.
