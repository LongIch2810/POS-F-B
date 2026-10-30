# Điều cần nhớ qua các phiên

## Nghiệm thu cần chứng cứ gốc đầy đủ

- Áp dụng: Khi kiểm tra hoặc báo hoàn thành tiêu chí nghiệm thu.
- Bài học: Đối chiếu từng vế của spec/docs đã chốt với mã/UI cuối, tình huống kiểm tra và artifact gốc; mở lại ảnh, log, request/response và trạng thái DB khi cần để xác nhận đúng commit và kết quả. Không suy diễn từ test pass, ảnh đơn lẻ hay chứng cứ phiên bản cũ; không dựng chứng cứ từ trí nhớ. Thiếu hoặc mâu thuẫn thì ghi **chưa xác minh**, để trống tiêu chí và chạy lại để thu chứng cứ thật.
- Căn cứ: Yêu cầu người dùng trong phiên 2026-10-29; quy tắc “Bằng chứng thực thi QA” trong `AGENTS.md`.

## Dùng skill khi làm đặc tả POS

- Áp dụng: Khi phỏng vấn, tạo, sửa hoặc rà soát đặc tả chức năng hay endpoint POS, kể cả khi việc viết spec là một bước trong task triển khai.
- Bài học: Chủ động đọc và áp dụng `.agents/skills/create-pos-spec/SKILL.md` trước khi làm spec; đối chiếu tài liệu, trình bản nháp, hỏi các quyết định còn mở và chỉ ghi vào `specs/` sau khi đã chốt. Thông tin có sẵn không thay thế bước rà và chốt.
- Căn cứ: Người dùng nhắc kiểm tra việc dùng skill khi lập `specs/platform.md` ngày 2026-10-30; phần mô tả và quy trình của `.agents/skills/create-pos-spec/SKILL.md`.
