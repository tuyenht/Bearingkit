# Handoff · 2026-10-28 · vòng review hội tụ: `bk-review` có trần 3 vòng, vòng sau chỉ soi phần sửa, không lặp phát hiện; nhánh `feat/review-loop`, chưa đo vì đăng nhập của profile đo đã hết hạn; công tắc `PAUSE`

Phiên do owner mở bằng một brief dán vào (yêu cầu theo bài "How the Claude Code team does code review", 2026-10-15). **Trạng thái dự án và Resume prompt vẫn là của `docs/handoff/2026-10-28-cloud-merge.md`**, trừ đúng những chỗ Block 2 dưới đây ghi. Nhật ký: `docs/autopilot/decisions.md` mục 66. Thiết kế và đăng ký đo: `docs/specs/2026-10-28-bk-review-loop-design.md`.

## Block 1 · What happened

- `scripts/review-loop.cjs` (mới, 15 test đỏ trước rồi xanh, năm trong đó thêm sau hai vòng review độc lập; kiểm chứng phản cho từng sửa): giữ trạng thái vòng trong `.review-loop.md` ở gốc repo, cùng đường dẫn, cùng dòng exclude `/.review-loop.md` và cùng luật "commit mới mở vòng mới" với hook `~/.claude/hooks/review-loop.py` của owner (đọc theo lời owner nêu tên trong brief, chỉ ba file đó).
- `bk-review`: chạy script trước tiên; vòng 1 đủ sâu, vòng sau chỉ diff script in ra; không đăng lại phát hiện đã có; tối đa 3 vòng với thay đổi thường, hot path quá 3 chỉ khi owner nói; mỗi phát hiện ghi `file:line` · lớp lỗi. `review-lenses.md` mục 4, `bk-build` (vòng review chạy không cần hỏi), `executing.md` (hai vòng review mỗi task có trần), `bk-ship` (không stage file trạng thái), bản sao Antigravity mang script.
- Năm test case mới, ba bài benchmark `evals/bench/review-loop-01`…`-03` (luật chấm đăng ký trước khi chạy).
- Phiên hiệu chỉnh dừng ở lượt đầu: "OAuth session expired" trên `_build/profile/claude`.
- Suite một mình: xem thông điệp commit.

## Block 2 · Resume payload

### State

Như Block 2 của `docs/handoff/2026-10-28-cloud-merge.md`, trừ: nhánh `feat/review-loop` (đã đẩy) mang thay đổi này; `main` không đổi.

### Decisions waiting on the owner

1. Đăng nhập lại profile đo riêng (lệnh trong báo cáo của phiên), rồi cho chạy đợt đo đã đăng ký (khoảng 33 phiên, Sonnet 5.5).
2. Sau đo: merge `feat/review-loop` vào `main` hay không.
3. Vòng có nên sống qua một commit chỉ sửa phát hiện review không (spec, "Open for the owner").
4. Cài lại bản Antigravity (`bearingkit antigravity install`) sau merge, để bản sao có script mới.
5. Các mục chờ owner của handoff trước: không đổi.

### Open threads

- `tests/bench-node-01.test.cjs` (một lần, suite chạy cùng phiên đo) và `tests/bench-py-01.test.cjs` (một lần, suite chạy một mình: "a deadline longer than the scorer allows ends on its own, too late") đỏ rồi xanh khi chạy riêng; cả hai đo thời gian, không đụng file nào của thay đổi này.

### Live temporary bypasses

- none

### Next work

1. Chạy đợt đo theo spec (K-after và S trên cây này, K-before từ worktree `main` tại `fbac337`), ghi kết quả vào "Measured".

### Resume prompt

Resume prompt của `docs/handoff/2026-10-28-cloud-merge.md`, trừ: đọc thêm file này; checkout `feat/review-loop`; việc đầu tiên là đợt đo của `docs/specs/2026-10-28-bk-review-loop-design.md` khi owner đã đăng nhập lại `_build/profile/claude`.
