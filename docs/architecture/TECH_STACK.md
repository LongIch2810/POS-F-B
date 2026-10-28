# Tech stack hiện dùng

File này ghi **công nghệ đã có trong mã hoặc cấu hình repository**; phiên bản chuẩn nằm trong manifest/lockfile. Kiến trúc mục tiêu và thành phần dự kiến xem [ARCHITECTURE.md](ARCHITECTURE.md). Cập nhật file này cùng thay đổi thêm, bỏ hoặc thay framework, thư viện trực tiếp hay công nghệ hạ tầng; không ghi công nghệ mới chỉ vì đang cân nhắc.

## Backend — `POS_API/`

| Công nghệ | Vai trò hiện tại |
| --- | --- |
| Node.js 22, TypeScript 5 | Runtime và ngôn ngữ; build bằng `tsc` |
| NestJS 11, Express | API HTTP, module/controller/guard/exception filter |
| PostgreSQL 17, `pg`, TypeORM 0.3 | Dữ liệu, truy vấn, transaction và migration |
| `bcryptjs` | Hash và kiểm tra mật khẩu |
| `jsonwebtoken` | Ký và xác minh access JWT |
| `@nestjs/passport`, `passport`, `passport-local` | Passport local strategy cho đăng nhập |
| `cookie-parser`, `cookie` | Đọc Cookie request và tạo Set-Cookie response |
| `class-validator`, `class-transformer` | Xác thực DTO request với NestJS `ValidationPipe` |
| `@nestjs/swagger` | Sinh OpenAPI và Swagger UI chỉ trong development |

## Frontend — `POS_UI/`

| Công nghệ | Vai trò hiện tại |
| --- | --- |
| React 18, React DOM 18, TypeScript 5 | UI demo chạy với dữ liệu mô phỏng trong browser |
| Vite 6, plugin React | Dev server và build UI |
| `lucide-react` | Icon giao diện |

UI demo chưa nối với API PB-02; luồng thật thuộc PB-13.

## Infrastructure — `POS_INFRA/`

| Công nghệ | Vai trò hiện tại |
| --- | --- |
| Docker Compose | Khởi chạy PostgreSQL local từ `compose.local.yml` |
| PostgreSQL 17 container | Database phát triển và kiểm thử local |

Reverse proxy, TLS, image production, backup và Redis/BullMQ chưa có cấu hình triển khai trong repository. Chúng là kiến trúc dự kiến hoặc chỉ thêm khi có nhu cầu được chốt.

## Kiểm thử và công cụ

Backend dùng `node:test`, `@nestjs/testing`, TypeScript build, test HTTP qua `fetch` và database PostgreSQL riêng cho test tích hợp. Frontend dùng Vite build và TypeScript typecheck (`tsc --noEmit`). CI tự động hóa bằng GitHub Actions (`.github/workflows/ci.yml`) chạy kiểm thử độc lập cho cả backend và frontend kèm dịch vụ PostgreSQL container. Dependency được khóa trong `POS_API/package-lock.json` và `POS_UI/package-lock.json`. Bằng chứng các lần chạy nằm trong `qa-evidence/`.
