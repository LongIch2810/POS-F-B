# Chứng cứ đối chiếu khi đóng Sprint 2

Đây là hồ sơ đọc lại CI/artifact ngày 30/10/2026, không phải một lần chạy test hoặc browser mới. Không sửa các output QA lịch sử.

## CI/runner độc lập

- [Run 40999585144](https://github.com/LongIch2810/POS-Food-And-Beverage/actions/runs/40999585144), commit `9cc329977949482966115ef9506434151bb88068`, nhánh master, event push, conclusion success.
- [Metadata run/jobs/steps](ci-run-40999585144.json) lấy bằng `gh run view 40999585144 --repo LongIch2810/POS-Food-And-Beverage --json databaseId,headSha,headBranch,event,status,conclusion,url,createdAt,updatedAt,jobs`.
- [Log backend job 123880597589](ci-backend-123880597589.log) lấy bằng `gh api repos/LongIch2810/POS-Food-And-Beverage/actions/jobs/123880597589/logs --allow-escape-sequences`. Backend build/migration/test 7 pass, 0 fail, 0 skipped; npm audit thành công.
- [Log frontend job 123880597865](ci-frontend-123880597865.log) lấy bằng `gh run view 40999585144 --repo LongIch2810/POS-Food-And-Beverage --job 123880597865 --log`. Frontend typecheck/build/test 10 pass, 0 fail, 0 skipped; npm audit thành công.

Output CLI được xuất UTF-8 bằng Out-File, giữ nội dung runner kể cả mã màu ANSI. Không in token hoặc cấu hình bí mật. Lượt tải backend đầu qua cache của gh báo zip không hợp lệ; đã lấy trực tiếp endpoint job logs, không sửa cache hay suy diễn từ log trống. Cờ allow-escape-sequences chỉ cho phép lưu mã màu gốc vào file.

## Chứng cứ local đã mở lại

- qa-evidence/20261030-platform-tab-race/: QA matrix cuối, log UI 10/10, B1 hash source/container, browser B2 race API thật, B3 chọn store ngoài 20 option đầu/cấp OWNER, B4 modal/storage/reload, A5 giữ mật khẩu khi list GET503 mô phỏng và retry200; DB before/after liên quan.
- qa-evidence/2026-10-30-103643-4db3149-module-structure/: run refactor, final-test.log, final-comparison.json; backend 7/7 và metadata/migration không đổi trước/sau refactor.
- SHA256 screen hiện tại khớp source/container đã QA: `75ef00dd3fd5e6c0704c7290a88c0e237665e9f43ead44f97a6a629edbbb9117`. `git diff --quiet 4db3149 HEAD -- POS_UI` exit 0 tại HEAD `9cc3299`, nên CI và hồ sơ đóng sprint dùng UI đã nghiệm thu.
- Kiểm tra tồn đọng môi trường chỉ đọc: thư mục QA tạm và chứng chỉ được ghi ở errors/2026-10-29-qa-temp-cleanup-blocked.md vẫn tồn tại ngày 30/10; không xóa trong task đóng sprint.

CI không chạy browser E2E/production. Kết luận sản phẩm vẫn là phạm vi local đã được Product Owner chấp nhận; không dùng CI unit/integration để thay cho chứng cứ browser hoặc nghiệm thu phần vận hành chưa triển khai.

## Kiểm tra hồ sơ đóng sprint

[closure-checks.json](closure-checks.json) được lệnh kiểm tra xuất trực tiếp: CI đúng SHA/run, hai job/steps thành công, số test khớp log; source ứng dụng không đổi; screen khớp hash browser đã nghiệm thu; các liên kết nội bộ đã dẫn tồn tại. Task ghi lệnh/phạm vi kiểm tra tài liệu; không coi file này là một lần test ứng dụng mới.
