# Handoff · 2026-10-28 · vòng review hội tụ: `bk-review` có trần 3 vòng, vòng sau chỉ soi phần sửa, không lặp phát hiện; đã đo và vào `main` theo lời owner; công tắc `PAUSE`

Phiên do owner mở bằng một brief dán vào (yêu cầu theo bài "How the Claude Code team does code review", 2026-10-15). **Trạng thái dự án và Resume prompt vẫn là của `docs/handoff/2026-10-28-cloud-merge.md`**, trừ đúng những chỗ Block 2 dưới đây ghi. Nhật ký: `docs/autopilot/decisions.md` mục 66. Thiết kế và đăng ký đo: `docs/specs/2026-10-28-bk-review-loop-design.md`.

## Block 1 · What happened

- `scripts/review-loop.cjs` (mới, 15 test đỏ trước rồi xanh, năm trong đó thêm sau hai vòng review độc lập; kiểm chứng phản cho từng sửa): giữ trạng thái vòng trong `.review-loop.md` ở gốc repo, cùng đường dẫn, cùng dòng exclude `/.review-loop.md` và cùng luật "commit mới mở vòng mới" với hook `~/.claude/hooks/review-loop.py` của owner (đọc theo lời owner nêu tên trong brief, chỉ ba file đó).
- `bk-review`: chạy script trước tiên; vòng 1 đủ sâu, vòng sau chỉ diff script in ra; không đăng lại phát hiện đã có; tối đa 3 vòng với thay đổi thường, hot path quá 3 chỉ khi owner nói; mỗi phát hiện ghi `file:line` · lớp lỗi. `review-lenses.md` mục 4, `bk-build` (vòng review chạy không cần hỏi), `executing.md` (hai vòng review mỗi task có trần), `bk-ship` (không stage file trạng thái), bản sao Antigravity mang script.
- Năm test case mới, ba bài benchmark `evals/bench/review-loop-01`…`-03` (luật chấm đăng ký trước khi chạy).
- Phiên hiệu chỉnh đầu dừng vì đăng nhập hết hạn; owner đăng nhập lại. Phiên hiệu chỉnh thứ hai cho thấy bộ chấm theo từng gạch đầu dòng tách gạch con khỏi tiêu đề, nên ba bài này chấm theo mục (`score.cjs`, `f153a17`), trước mọi phiên được tính.
- Đợt đo (33 phiên, Sonnet 5.5, 08:57–09:20Z), đọc từng câu trả lời: (a) kit mới review sau build 3/3, nguồn 0/3, kit cũ 0/3; (b, c) đọc: kit mới 3/3, nguồn 0/3, kit cũ 0/3 (script: 2/3, 0/3, 0/3); (d) dừng ở trần: kit mới 3/3, nguồn 0/3, kit cũ 0/3 theo đọc, nhưng luật đăng ký chấm 0/3 cả ba vì decoy X3 đặt sai (lỗi fixture, ghi trong spec, không sửa luật sau dữ liệu); khả năng tìm lỗi `review-02`: 9/9 cả kit mới lẫn kit cũ. Chi tiết và những gì không được nói: spec, "Measured".
- Theo lời owner ("Audit kỹ… thực hiện xử lý theo các khuyến nghị"), phiên tự kiểm: (1) ở bài (a) một phiên kit không chạy được script vì gộp lệnh rồi bị chặn đường dẫn kit; `bk-review` nay bảo chạy script thành một lệnh riêng, không chạy được thì nói rõ và giữ `.review-loop.md` bằng tay (chưa đo riêng); (2) bài `review-loop-04` sửa decoy đặt sai của bài 03, đăng ký trước (`103f286`), đo 9 phiên: kit mới không mở vòng 4 ở 3/3 (nguồn 0/3, kit cũ 0/3); theo luật đăng ký kit mới 1/3 vì 2/3 phiên vẫn nêu lỗi sắp xếp tại chỗ dưới mục "chưa chấm".
- Suite một mình: xem thông điệp commit.

## Block 2 · Resume payload

### State

Như Block 2 của `docs/handoff/2026-10-28-cloud-merge.md`, trừ: `main` có thêm các commit của nhánh `feat/review-loop` (fast-forward từ `fbac337`); nhánh vẫn còn trên origin, không xóa.

### Decisions waiting on the owner

1. Đã quyết (2026-10-28): merge vào `main`; khi chạm trần được nêu lỗi thấy trong đoạn chưa review, ghi "chưa review", không chấm.
3. Đã quyết (2026-10-28, mục 71): vòng không sống qua commit, commit mới vẫn mở vòng mới. Khi mỗi lần sửa là một commit, bộ điều phối giữ số vòng và các phát hiện đã đăng rồi chuyển cho reviewer kế tiếp (`executing.md` bước 5, chưa so với nguồn). Giới hạn còn lại: nhánh được review trong khi tác giả đẩy commit sửa mà không có bộ điều phối thì không có trần và không có bộ nhớ chống lặp từ file.
4. Làm mới bản Antigravity ở kho `~/.bearingkit/antigravity/plugins/bearingkit`. Không có bản toàn cục dưới `~/.gemini`, nên lệnh cũ `bearingkit antigravity install` là sai. `doctor` vẫn báo phần script và `skills/` lệch; lệnh đúng: `node C:\Projects\Bearingkit\bin\bearingkit.cjs install --host antigravity`.
5. Các mục chờ owner của handoff trước: không đổi.

### Open threads

- `tests/bench-node-01.test.cjs` (một lần, suite chạy cùng phiên đo) và `tests/bench-py-01.test.cjs` (một lần, suite chạy một mình: "a deadline longer than the scorer allows ends on its own, too late") đỏ rồi xanh khi chạy riêng; cả hai đo thời gian, không đụng file nào của thay đổi này.

### Live temporary bypasses

- none

### Next work

1. Không còn việc của thay đổi này; Next work của handoff trước không đổi.

### Resume prompt

Resume prompt của `docs/handoff/2026-10-28-cloud-merge.md`, trừ: đọc thêm file này; checkout `feat/review-loop`; thay đổi này đã vào `main`; không còn việc dở.
