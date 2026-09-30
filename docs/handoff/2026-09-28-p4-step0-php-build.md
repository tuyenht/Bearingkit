# Handoff · 2026-09-28 · phiên P4 (máy owner): Bước 0 và phần dựng không đo của `php-laravel`

Tiếp nối `docs/handoff/2026-09-27-p3c-py01-guard.md` (Block 1 của nó vẫn đúng; Block 2 được thay bằng Block 2 dưới đây). Phiên Desktop, Opus 5.5; không phiên đo nào chạy.

## Block 1 · Durable knowledge

### Lời owner trong phiên này (nguyên văn)

- Prompt mở phiên: nguyên văn resume prompt của handoff trước (`docs/handoff/2026-09-27-p3c-py01-guard.md`, mục Resume prompt), bắt đầu "Phiên P4 của Bearingkit (bắt đầu bằng Bước 0), trên máy owner, `C:\Projects\Bearingkit`." và kết thúc "Trả lời bằng tiếng Việt, cuối mỗi khối việc có "Đã xong" và "Còn lại"."
- Ba câu hỏi sau Bước 0, owner chọn cả ba "(Recommended)": "Duyệt cả hai dòng (Recommended)", "Sau khi reset tuần (Recommended)", "Có, làm phần không đo (Recommended)".
- "Hiện tại danh cách có nhiều phiên không còn dùng nữa, có cần phải đóng chúng bớt đi không?\nTiếp tục xử lý theo khuyến nghị cho tôi nhé." — rồi câu hỏi lưu trữ: "Có, lưu trữ cả 17 (Recommended)".

### Facts established (do not re-derive)

- **Bước 0** (`docs/specs/2026-09-28-stack-rule-timing.md`, script `evals/analysis/stack-rule-timing.cjs`, đọc `evals/results/` không tốn phiên đo): 31 phiên K mở file stack. Giả thuyết "chạm tối thiểu đè luật file stack" chỉ đứng một phần — 2/12 phiên trượt deadline nói rõ "out of scope / pre-existing". Yếu tố rõ hơn là **lúc đọc**: `py-01` đọc sau khi `bk-build` bắt đầu 7/8 đạt deadline, đọc trong `bk-spec` 1/7 (Fisher p = 0,010, mô tả); 15 phiên đọc trong `bk-spec` rồi vào `bk-build`, **0** đọc lại; sửa client dùng chung 12/14 so với 7/17 (p = 0,024).
- **Hai lần chạy `node-01` (8/8 rồi 1/8) là hai điều kiện, không phải hai lần rút:** 18 phiên K ngày 2026-09-27 tới 04:56 UTC gọi skill không `args`, 26 phiên từ 08:09 UTC đều có `args` (trước đó 3/164). Văn bản kit, host `2.1.281`, model `claude-sonnet-5`, 38 skill, 31 tool giống hệt; nguyên nhân nằm ngoài repo, chưa thấy. Chỉ so các nhánh chạy xen kẽ.
- **Sửa `bk-build`** (owner duyệt): đọc lại `stackFiles` trước lần sửa đầu kể cả khi `bk-spec` đã đọc, liệt kê luật áp dụng; luật stack áp dụng cho phần thêm mới là một phần của kế hoạch, sửa ở code dùng chung thì nêu trong báo cáo. Commit `70e3354` trên nhánh `p4-step0-scope` (đã push), chưa vào `main`. Phép đo đã đăng ký: K-mới, K-cũ, S, 8 mỗi nhánh trên `node-01` và `py-01`, cộng guard `build-01`, 56 phiên; chạy sau khi tuần reset.
- **P4a `php-laravel`** (`docs/specs/2026-09-28-stack-php-laravel-design.md`, nhánh `p4a-php`): `php-laravel.md` viết từ nguồn ghim (jeffallan `php-pro`, `laravel-specialist`; awesome-cursorrules `laravel-php-83`, `laravel-tall-stack`; Antigravity-Core `laravel.md`), mỗi câu một hàng nguồn, hai reviewer Sonnet (chữ; phần dựng). Task `php-01`: PHP thuần + SQLite, lệnh `transfer`; hazard H1 `strict_types` trong file mới, H2 tham số ràng buộc (kho `O'Hare`), H3 một transaction (trigger từ chối ghi ở mỗi bên); câu Laravel "không đo". Test fixture xanh (khoảng 2 phút), 18/18 đột biến scorer đỏ (M10, M11 xanh ở lần đầu → thêm hai ca cho X). `detect-stack` tự nêu `php-laravel.md` trong `stackFiles` khi file tồn tại.
- **Máy owner:** `php` 8.2.30 (winget `PHP.PHP.8.2`, có `pdo_sqlite`); không `composer`. Dưới `node --test`, `spawn('php', ['<file>'])` báo EPERM, còn `php -r` và `php -f <file>` chạy; ngoài test runner cả hai chạy. Scorer dùng `php -f <script> -- <args>` (cùng `$argv`). Nguyên nhân chưa tìm ra.
- **Phiên cũ:** 17 phiên Bearingkit đã lưu trữ (đảo ngược được), không phiên nào đang chạy, không worktree.
- Hạn mức: tuần 86% lúc đầu phiên (con số ghi trong spec Bước 0), 88% lần đọc cuối; 5 giờ 13% lần đọc cuối (reset 2026-09-30 03:00 UTC); ngữ cảnh 39%.

### Decisions taken

- Bước 0: hai dòng `bk-build` và phép đo 56 phiên (owner duyệt); đo sau reset tuần.
- P4a và Bước 0 ở hai nhánh riêng, để merge độc lập; phiên đo `php-01` chạy sau phép đo Bước 0 và dùng `bk-build` mà phép đo đó để lại trên `main`.
- Trên đường guard của `php-01`, so với nguồn (K và S xen kẽ trong một lệnh `bench`) được đăng ký cùng guard.
- O1/H2 của `php-01`: "không đổi gì khác" là bảng `stock`, không phải mọi bảng (bảng log riêng của phiên là thiết kế hợp lệ).

### Rejected options (do not re-propose)

- Chỉ thêm câu phạm vi vào `bk-build` (khớp 2/12 phiên trượt); chỉ thêm đọc lại (để nguyên xung đột ở code dùng chung); chuyển luật sang tiêu chí của `bk-spec` (đổi thêm một skill phải đo riêng).
- Fixture Laravel (không có `composer`); chấm H1/typing/readonly bằng grep.
- Xoá các phiên cũ (chỉ lưu trữ).

### Lessons (candidate lines)

- RULE | so sánh phiên đo | WHEN hai lần chạy cùng kit cho kết quả khác xa THEN so dấu hiệu hành vi phía host (ví dụ `args` của Skill) trước khi gọi là dao động NOT kết luận "không lặp lại" | `node-01` 8/8 rồi 1/8 trùng bước ngoặt `args` 0/18 → 26/26 | 2026-09-28
- RULE | test biến thể | WHEN tạo biến thể code bằng thay chuỗi THEN khẳng định chuỗi nguồn có mặt NOT `.replace` im lặng | một biến thể `php-01` không đổi gì vì lệch thụt lề | 2026-09-28

## Block 2 · Resume payload

### State

- `main` = `81a81a3` + commit tài liệu đóng phiên này (handoff, status). Nhánh `p4-step0-scope` (`70e3354`, đã push): hai dòng `bk-build`, spec Bước 0, script phân tích. Nhánh `p4a-php` (`e540fbc`, đã push; suite 182/182): `php-laravel.md`, `index.md` (php "written"), `SKILL.md` "six of the eight", spec P4a, task `php-01`, test.
- Cài hằng ngày vẫn `beb258c` hai scope; kho Antigravity chưa đổi.

### Decisions waiting on the owner

- Không có. (Cài toolchain C++ cho `c-cpp` vẫn chờ owner, câu 38 (c).)

### Open threads

- Giới hạn của `php-01` cần nhớ khi đọc kết quả: H2 có thể bão hoà ở sàn (code sẵn có đã dùng prepared statement), và đường `refuseError` của scorer không có test canh (spec P4a, mục Limits và "Review of the build").
- Nguyên nhân EPERM của `php <file>` dưới `node --test` chưa tìm ra (scorer đã tránh bằng `-f`).
- Bước ngoặt `args` ngày 2026-09-27: nguyên nhân ngoài repo chưa thấy; báo cột `args` ở mọi lần đo sau.
- Mọi luồng mở gom trong handoff `2026-09-27-p3c-py01-guard.md` (Open threads) vẫn mở, trừ "S của `node-01` và `py-01` chưa chạy" (đã chạy 2026-09-27/28).
- File tạm do test fixture PHP để lại trong thư mục temp của hệ thống ở lần chạy đầu (trước khi thêm dọn dẹp): vài file `stock*`; chưa xoá (xoá cần owner).

### Live temporary bypasses

- Không có.

### Next work

0. Sau khi tuần reset (2026-09-30 03:00 UTC): đo Bước 0 theo `docs/specs/2026-09-28-stack-rule-timing.md` (56 phiên; `get_usage` trước mỗi lô). Đạt thì merge `p4-step0-scope` vào `main`; không đạt thì giữ trên nhánh, báo owner.
1. Rebase `p4a-php` lên `main` lúc đó; rồi `php-01` theo spec: 2 K thăm dò reach, 3 F hiệu chỉnh, rồi guard (K và S xen kẽ) hoặc so đầy đủ.
2. P4b: `detect-stack` nêu file theo chủ đề (câu 38 (b)) — **đã dựng trên cloud cùng ngày**, nhánh `p4b-topic-stackfiles` (đã push; Bước A đã kiểm trên máy owner: 184/184, đột biến `py-01` đúng); đọc `git show origin/p4b-topic-stackfiles:docs/handoff/2026-09-28-p4b-topic-build.md` và làm Bước B của nó SAU mục 1 (đo 26 phiên: guard có thêm 8 S xen kẽ theo lời owner 2026-09-30, `0554c1a`; `sql.md` trùng hazard H2/H3 của `php-01`, nên nhánh này chỉ vào `main` sau khi `php-01` đã đo). Rồi `shell.md` và task `shell`.
3. P4c `c-cpp` theo quyết định cài toolchain của owner.

### Resume prompt

"Phiên P4 tiếp (đo) của Bearingkit, trên máy owner, `C:\Projects\Bearingkit`, sau khi hạn mức tuần reset (2026-09-30 03:00 UTC). Đọc theo thứ tự: `docs/handoff/2026-09-28-p4-step0-php-build.md` (Block 2 trước); khối "Luật" trong lời owner ở `docs/handoff/2026-09-26-p3b-node-guard.md` (áp dụng nguyên văn); `docs/specs/2026-09-28-stack-rule-timing.md` (đăng ký đo Bước 0; chỉ có trên nhánh `p4-step0-scope`: `git show origin/p4-step0-scope:docs/specs/2026-09-28-stack-rule-timing.md`); `docs/specs/2026-09-28-stack-php-laravel-design.md` (đăng ký đo `php-01`; chỉ có trên nhánh `p4a-php`, đọc cùng cách); `docs/specs/2026-09-26-bk-build-design.md` (mục "The owner's choice after calibration": thanh guard `build-01` mà phép đo Bước 0 dùng lại); `docs/status.md` (trên `main`). Lệch với repo thì tin repo, và ghi lại.

Đầu phiên: `git status`, `git log --oneline -1` trên `main`, `git log --oneline -3 origin/p4-step0-scope origin/p4a-php`, `node bin/bearingkit.cjs doctor` (sáu `ok`), `get_usage` (tuần phải đã reset), `claude plugin list` (bearingkit `beb258c` hai scope), suite `node --test tests/*.test.cjs` trên `main` (180/180) và trên `p4a-php` (182: thêm hai test `php-01`).

Bước 1: đo Bước 0 đúng như đăng ký (mọi nhánh chạy từ checkout chính `C:\Projects\Bearingkit`, KHÔNG từ worktree — profile đo chỉ cho `Read` dưới `C:/Projects/Bearingkit/skills/**`, sửa đăng ký 2026-09-30 ở `d45c61b`; vòng K-cũ: `git switch main`, `--branches K --runs 2`; vòng K-mới và S: `git switch p4-step0-scope`, `--branches K,S --runs 2`; `--config-dir` tuyệt đối `C:\Projects\Bearingkit\_build\profile\claude`; mỗi task bốn vòng mỗi bên, xen kẽ, K-cũ trước: `node-01`, rồi `py-01`, rồi guard `build-01` 8 K-mới; mọi sửa trên nhánh commit trước mỗi lần `git switch`; trước mỗi vòng K-cũ `git diff main -- skills/ hooks/ agents/ scripts/` phải rỗng, trước mỗi vòng K-mới cùng lệnh so với `p4-step0-scope`; cùng luật chạy cho `php-01` và P4b sau này; không hai lệnh `bench` cùng lúc; `get_usage` trước mỗi vòng); mỗi thư mục kết quả tự ghi nhánh và commit của kit vào `meta.json` (`kit`, runner `889e4a3`, đã merge vào `p4-step0-scope` ở `77c357a`) — gán K-cũ/K-mới theo trường đó, không theo thứ tự thư mục, và `kit.dirty` phải là `false`; chạy `evals/analysis/stack-rule-timing.cjs` (có trên nhánh `p4-step0-scope`) chỉ trên các thư mục của lần đo này (script mặc định quét mọi thư mục `node-01`/`py-01`, gồm cả lượt 2026-09-26/27: chép hay trỏ nó vào một thư mục chỉ chứa các lượt mới); báo p gộp và từng task; đạt thanh thì merge. Bước 2: rebase `p4a-php` lên `main`, suite xanh, rồi `php-01`: 2 K thăm dò (mở `php-laravel.md` ≥ 1/2 thì tiếp), 3 F hiệu chỉnh, rồi nhánh spec quyết.

Luật (tóm tắt; bản đầy đủ là khối Luật nói trên): không Python ngoài phạm vi câu 35, phiên chính và reviewer cấm cả `--version`; mỗi bước ghi dưới `~/.claude`/`~/.gemini`, sửa repo khác, xoá, lưu trữ hay cài phần mềm thì hỏi owner một câu có, gom câu hỏi; cài kit chỉ từ marketplace, luôn `--scope user` và `--scope local`; script đọc output `node --test` ép `--test-reporter=tap`; rà độc lập trước mọi commit; phiên chính Opus, agent đọc hàng loạt và reviewer Sonnet, phiên đo Sonnet 5; brief của mọi agent cấm lệnh nền và cấm tìm ngoài repo; ít nhất 8 lượt mỗi nhánh được so và báo p; ghi skill nào thật sự được gọi và cột `args`; commit theo đường dẫn cụ thể; handoff là file mới, chép nguyên văn lời owner; `docs/status.md` thay đúng ô, dưới ~15 KB; dừng ở 80% ngữ cảnh với handoff; khi đóng phiên làm hai phép thử độc lập (rà độ đầy đủ, diễn tập khởi động lạnh), sửa lỗ hổng, rồi dán nguyên `git status`. Trả lời bằng tiếng Việt, cuối mỗi khối việc có "Đã xong" và "Còn lại"."

### Đánh giá độc lập lần đóng phiên này

- **Rà độ đầy đủ** (Sonnet, chỉ đọc): mọi số và mã commit khớp nguồn (31, 2/12, 7/8 vs 1/7, 12/14 vs 7/17, 15/0, 18 đột biến, `70e3354`, `e540fbc`, hai nhánh có trên `origin`; 182 test = 180 + 2 test `php-01`); lời owner khớp mục "Owner's decision" của hai spec; `status.md` 11.402 byte, chỉ đổi ô cần đổi. Should-fix: hai giới hạn của `php-01` chưa có trong Block 2 → đã thêm vào Open threads. Không kiểm được từ repo: số phiên đã lưu trữ và hạn mức (trạng thái ngoài repo).
- **Diễn tập khởi động lạnh** (Sonnet, chỉ đọc): 7/7 câu đúng kèm `file:line`. Lỗ hổng: hai spec 2026-09-28 không có trên `main` (resume prompt đã được sửa trỏ `git show origin/<nhánh>:…`); 86% và 88% lệch (đã ghi rõ là hai lần đọc); thanh guard `build-01` không nằm trong danh sách đọc (đã thêm).
