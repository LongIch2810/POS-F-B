# Quy tắc làm việc với Git

Áp dụng cho mọi thay đổi trong repository. Mục tiêu là giữ lịch sử dễ xem, không mất công việc của người khác và có thể truy ra lý do của mỗi thay đổi.

## Nhánh và phạm vi

- Tính năng mới hoặc sửa lỗi trong mã ứng dụng làm trên nhánh riêng, đặt tên ngắn gọn theo mục đích. Kiểm tra nhánh hiện tại và trạng thái working tree trước khi bắt đầu.
- Trước khi bắt đầu viết hoặc sửa code trên một nhánh, luôn `fetch` từ `origin`, kiểm tra nhánh hiện tại, upstream, trạng thái working tree và chênh lệch với remote. Nếu nhánh có upstream, cập nhật bằng `git pull --ff-only` trước khi làm việc; khi tạo nhánh mới, bắt đầu từ nhánh cơ sở đã cập nhật. Nếu chưa có upstream, không thể fast-forward, có thay đổi chưa commit có nguy cơ bị ảnh hưởng hoặc không kết nối được remote, dừng cập nhật và làm rõ tình trạng trước khi tiếp tục; không tự stash, ghi đè hoặc viết lại lịch sử.
- Đặt tên nhánh theo `<loại>/<mô-tả-ngắn>`: dùng chữ thường, số và dấu `-` trong phần mô tả. Chọn `feat/`, `fix/`, `refactor/`, `docs/`, `test/`, `ci/` hoặc `chore/` theo mục đích chính; ví dụ `feat/sprint-1-auth`, `fix/pb02-review-findings`, `refactor/backend-frontend-structure`. Không tái sử dụng một nhánh cho nhiều việc không liên quan.
- Giữ thay đổi đúng phạm vi yêu cầu. Không trộn sửa lỗi, đổi định dạng và refactor không liên quan vào cùng một thay đổi nếu có thể tách rõ.
- Tôn trọng file đã sửa sẵn trong working tree. Không ghi đè, reset hoặc đưa thay đổi của người khác vào commit của mình khi chưa hiểu nguồn gốc.

## Commit

- Trước khi commit, xem cả danh sách file và diff thực tế; chỉ stage những file thuộc thay đổi của mình. Không dùng lệnh stage toàn bộ khi working tree có thay đổi không liên quan.
- Mỗi commit thể hiện một thay đổi có mục đích rõ và giữ repository ở trạng thái hợp lệ. Thông điệp commit nói **đã đổi gì và vì sao** bằng lời ngắn gọn.
- Dùng dạng `<type>(<scope>): <mô tả>` (có thể bỏ `(scope)` khi thay đổi trải nhiều phần). `type` là `feat`, `fix`, `refactor`, `docs`, `test`, `ci` hoặc `chore`; `scope` nêu phần được sửa như `api`, `ui`, `infra`. Viết mô tả ngắn bằng tiếng Anh, bắt đầu bằng động từ, không thêm dấu chấm cuối câu; ví dụ `fix(api): reject invalid login body` hoặc `ci: run migrations before tests`. Nếu lý do hoặc tác động chưa rõ từ tiêu đề, ghi thêm trong phần thân commit.
- Không commit secret, thông tin cá nhân thật, file tạm, kết quả build hoặc dependency được tạo tự động nếu dự án không chủ động theo dõi chúng. Nếu secret đã vào lịch sử, thu hồi hoặc xoay vòng nó; chỉ xóa ở commit sau không đủ.
- Chạy kiểm tra phù hợp trước khi coi commit sẵn sàng review; ghi rõ kiểm tra nào chưa chạy và lý do.

## Review và tích hợp

- Đưa thay đổi ra review trước khi merge. Mô tả mục đích, phần đã đổi, cách kiểm tra và rủi ro còn lại để người review có thể xác nhận kết quả.
- Khi có conflict, đọc ý nghĩa cả hai phía và giải quyết theo hành vi mong muốn. Sau đó xem diff và chạy lại kiểm tra liên quan; không chọn toàn bộ một phía theo thói quen.
- Không tự push khi chưa được yêu cầu. Không tự merge thay đổi của mình trước khi được review theo quy trình dự án.
- Không viết lại lịch sử đã chia sẻ hoặc ép cập nhật nhánh từ xa. Nếu cần hủy một thay đổi đã chia sẻ, ưu tiên commit đảo ngược để giữ dấu vết.

## Thao tác có nguy cơ mất dữ liệu

- Trước khi xóa nhánh, bỏ thay đổi, dọn file chưa theo dõi hoặc chuyển đổi lịch sử, xác định chính xác file và commit bị ảnh hưởng. Không chạy lệnh xóa hàng loạt trên một working tree chưa kiểm tra.
- Khi một thao tác bị gián đoạn, kiểm tra trạng thái Git và hoàn tất hoặc hủy thao tác đó trước khi làm việc tiếp; không chồng thêm thao tác khác lên trạng thái dở dang.
