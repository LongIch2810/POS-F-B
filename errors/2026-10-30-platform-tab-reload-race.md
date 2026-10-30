# Reload mutation cũ ghi đè cursor tab mới

Trạng thái: đã sửa, UI regression test/build local đạt.

- Triệu chứng: Trang sau tab Chủ quán gửi cursor Cửa hàng, API trả422.
- Tái hiện: ở Stores trang1, mở lại store khi request chờ; chuyển Owners và tải xong OWNER cursor; mutation cũ resolve rồi reload Store ghi đè nextCursor dùng chung.
- Nguyên nhân đã xác minh: closure reload giữ activeTab/cursor cũ và cập nhật state chung ngoài effect có cleanup. Regression test trên TSX hiện tại thất bại đúng STORE_RELOAD_CURSOR thay OWNER_NEXT_CURSOR trước sửa.
- Sửa: gom reload/retry/mutation refresh về effect tải danh sách có cleanup, trigger bằng reloadVersion; bỏ cập nhật async riêng.
- Kiểm chứng: qa-evidence/20261030-platform-tab-race/run.md, red-reproduced.log → ui-tests.log10/10; UI build đạt.
- Task: tasks/completed/2026-10-30-fix-platform-tab-race.md; commit nền53d794b, working tree dirty. Chưa browser thật/CI.
