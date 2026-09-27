# Handoff · 2026-09-27 · phiên P3b, phần 2: đường tới file stack, guard lại, `node.md` vào `main`

Tiếp nối `docs/handoff/2026-09-26-p3b-node-guard.md` (cùng phiên; Block 1 của nó vẫn đúng, Block 2 của nó được thay bằng Block 2 dưới đây). Nhánh làm việc `claude/serene-franklin-3f3bb7`, đã push; `main` ở `01ae83b`, đã push.

## Block 1 · Durable knowledge

### Lời owner trong phần này (nguyên văn)

- "Adit kỹ các xử lý cũng như các phản hồi ở trên cho tôi.\nXử lý theo khuyến nghị tốt nhất phù hợp cho tôi."
- "Tiếp theo chúng ta cần làm gì?"
- "Tự động xử lý tiếp tho tôi với các khuyến nghị tốt nhất phù hợp nhé."
- Ba câu hỏi gom (cập nhật cài hằng ngày; làm mới kho Antigravity; xoá `p3b-k-before` và worktree): owner chọn cả ba "(Recommended)" — "Có, cập nhật", "Có, làm mới", "Có, xoá".

### Facts established (do not re-derive)

- **Tự audit** (commit `98658f3`): lời "đã đọc đủ 36 hàng Antigravity-Core" là nói quá — agent đọc trọn 6 file, còn lại theo tiêu đề; phiên chính quét 139 dòng dạng luật và các mục "Best Practices", không thấy câu mới; spec ghi đúng phương pháp và giới hạn. Kiểm thêm: `doctor` FAIL lúc đó đúng bốn file của nhánh; không phiên đo nào đọc scorer; F không gọi skill.
- **Sửa đường tới file** (commit `5d8d24d`, reviewer Sonnet: không có must-fix): `detect-stack` thêm `stackFiles` (file stack ánh xạ theo `stacks/index.md`, đường dẫn tuyệt đối, chỉ file có thật); `bk-build`: "Before the first edit, read each file the profile lists under `stackFiles`."; `bk-spec` thêm một dòng đọc các file đó. Test đỏ rồi xanh.
- **Lỗi scorer phát hiện ở phiên thăm dò** (commit `4c0ce4d`): `reach()` đọc lệnh chạy xong nhưng thoát mã 1 thành "refused" (chữ "permission" trong `**/permissions/**` của profile). Sửa: lỗi bắt đầu "Exit code N" là đã chạy. Test đỏ rồi xanh.
- **Thăm dò 2 phiên K**: `node.md` mở 2/2 → guard.
- **Guard `node-01` lại, 8 phiên K** (`evals/results/2026-09-27-bench-node-01-natural-2/`): O1 8/8, O2 8/8, N = 3 ở 8/8 (sàn 2), `node.md` mở 8/8, N3 8/8 (trước đó 0/8). So với guard đầu (không đăng ký, chỉ mô tả): p = 0,00016; không tách được phần của `stackFiles` với phần của chữ.
- **Guard `build-01` lại, 8 phiên K** (`evals/results/2026-09-27-bench-build-01-natural/`): O1, O2, O3, P3 đều 8/8 → vẫn giữ; `node.md` mở 6/8; chi phí trung vị 0,300 USD (trước 0,279).
- **`main` `01ae83b`**: `node.md`, `stackFiles`, dòng của `bk-build`/`bk-spec`, `index.md` (hàng `python` "not written yet", "four exist today"), `SKILL.md` "four of the eight", task `node-01` và scorer, tài liệu. Suite trên worktree `main`: 176 pass, 1 skip (test cần `_build/upstream`). `python.md` không có trên `main`.
- **Bản cài hằng ngày**: `01ae83b` ở scope user và local (`claude plugin marketplace update bearingkit`, `claude plugin update … --scope user` và `--scope local`); `claude plugin list` xác nhận. Kho Antigravity làm mới từ worktree `main` (`update --host antigravity --no-pull`); `doctor` sáu `ok`, một `skip`. Cần khởi động lại host để bản cài mới có hiệu lực.
- Nhánh `p3b-k-before` và worktree của nó đã xoá (owner đồng ý); worktree tạm `_build/worktrees/main` xoá ở cuối phiên, sau khi đồng bộ tài liệu sang `main`.
- **Marker của kho Antigravity** (`~/.bearingkit/antigravity/plugins/bearingkit/.bearingkit-copy`) ghi nguồn là `C:ProjectsBearingkit_buildworktreesmain` (worktree đã xoá). Nội dung kho là `main` `01ae83b`, và rule của kho ghi kit root là chính kho, nên kho vẫn chạy đúng; marker chỉ để `doctor` đối chiếu. Hệ quả: `doctor` chạy từ checkout này báo **2 FAIL** ("marker names this kit" và "skills/ matches this checkout"), cả hai dự kiến. Hết khi làm mới kho từ `C:ProjectsBearingkit` lúc checkout đó ở `main` (hỏi owner trước: ghi ra ngoài repo).
- Hạn mức lần đọc cuối trước guard `build-01`: 5 giờ 10%, tuần 76%.

### Decisions taken

- `stackFiles` trong profile thay vì sửa router hay dùng hook (lý do trong spec, mục "Reach fix").
- Merge `node.md` và phần sửa đường đi vào `main` theo luật đăng ký (hai guard đạt, file được đọc).

### Rejected options (do not re-propose)

- Chỉ sửa `bk-build` (6/8 phiên không tới nó); dòng router trong protocol (hết chỗ, 6.485/6.500); hook chèn file stack.

### Lessons (candidate lines)

- RULE | đo file tham chiếu | WHEN một skill chỉ trỏ tới file tham chiếu THEN cho công cụ phiên chắc chắn chạy (ở đây `detect-stack`) nêu đường dẫn file NOT trông vào skill được gọi | `node.md` 0/8 → 8/8 | 2026-09-27
- RULE | báo cáo agent | WHEN agent đọc hàng loạt nói "đã đọc" THEN hỏi phương pháp (đọc trọn hay theo tiêu đề) trước khi viết "đã đọc đủ" NOT chép nguyên kết luận | Antigravity-Core 36 hàng | 2026-09-27

## Block 2 · Resume payload

### State

- `main` `01ae83b` (4/8 file stack). Nhánh `claude/serene-franklin-3f3bb7` có thêm `python.md` và các commit tài liệu; đã push.
- Cài hằng ngày `01ae83b` cả hai scope; kho Antigravity khớp `main`.

### Decisions waiting on the owner

- Không có.

### Open threads

- **P3c `py-01`**: dựng fixture và scorer theo spec (Python qua `python -m`, câu 35); `stackFiles` sẽ nêu `python.md` khi phiên chạy từ nhánh. Kiểm reach bằng 2 phiên thăm dò trước.
- S của `node-01` chưa chạy (MCP Cloudflare).
- `npm` không có trên PATH máy owner: guardrail `npm test` không chạy được ở đây.
- Mọi luồng mở của handoff P3a vẫn mở.

### Live temporary bypasses

- Không có.

### Next work

1. P3c: `py-01` trên nhánh (hạn mức tuần reset 2026-09-30 03:00 UTC; đo đầy đủ có thể phải chờ).
2. P4: ba file stack còn lại (`php-laravel`, `c-cpp`, `shell`).

### Resume prompt

"Phiên P3c của Bearingkit, trên máy owner, `C:\Projects\Bearingkit`, nhánh `claude/serene-franklin-3f3bb7`. Đọc `docs/handoff/2026-09-27-p3b-reach-merge.md` (Block 2 trước), rồi `docs/specs/2026-09-26-stack-node-python-design.md` (mục "Task `py-01`", "Reach fix", "Results"), `skills/bk-build/references/stacks/python.md`, `evals/bench/node-01/` (mẫu fixture và scorer), `docs/status.md`. Lệch với repo thì tin repo.

Đầu phiên: `git status`, `git log --oneline -1`, `node bin/bearingkit.cjs doctor` (trên nhánh này 2 FAIL là dự kiến: marker của kho Antigravity ghi worktree tạm đã xoá, và `skills/` của kho khớp `main` chứ không khớp nhánh — xem Facts), `get_usage`, suite `node --test tests/*.test.cjs` (177/177 trên nhánh; trên `main` 176 + 1 bỏ qua khi không có `_build/upstream`), `claude plugin list` (bearingkit `01ae83b` hai scope).

Đã chốt: câu 35 (Python trong scorer và test fixture `py-01` qua `python -m`), câu 36 (và cập nhật 2026-09-27), đăng ký đo trong spec.

Việc: dựng `py-01` đúng đăng ký, test fixture đỏ rồi xanh, rà độc lập trước commit; 2 phiên thăm dò reach; hiệu chỉnh ba phiên F; đo theo nhánh spec quyết; đạt thì đưa riêng `python.md` vào `main` qua worktree của `main`, hỏi owner trước khi cập nhật cài hằng ngày và kho Antigravity. Luật như lời owner mở phiên P3b (chép nguyên văn trong `docs/handoff/2026-09-26-p3b-node-guard.md`)."

### Đánh giá độc lập lần đóng phần này

- **Diễn tập khởi động lạnh** (Sonnet, chỉ đọc): 8/8 câu đúng kèm `file:line`. Nêu: tài liệu chưa commit (dự kiến, hết sau commit này); con số test nhánh/`main` (đã ghi rõ trong resume prompt).
- **Rà độ đầy đủ** (Sonnet, chỉ đọc; không đọc được transcript, rà theo lời owner và repo): mọi số khớp. Hai must-fix, cùng một gốc: worktree tạm chưa xoá lúc rà (xoá ở cuối phiên), và `doctor` báo 2 FAIL chứ không phải 1 (marker kho ghi worktree tạm) — đã ghi vào Facts và resume prompt. Một should-fix bị bác sau khi kiểm: `node.md` mở ở `build-01` là 6/8 theo `reach()`, không phải 7/8 — ở phiên 8 tên file chỉ nằm trong output của `detect-stack`, không có lệnh nào mở nó.
