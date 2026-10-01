# Handoff · 2026-09-30 · phiên P4 (máy owner, tiếp): đo Bước 0, sửa hai lỗ hổng đo trước khi đo

Tiếp nối `docs/handoff/2026-09-28-p4-step0-php-build.md` (Block 1 của nó vẫn đúng; Block 2 được thay bằng Block 2 dưới đây) và `git show origin/p4b-topic-stackfiles:docs/handoff/2026-09-28-p4b-topic-build.md` (phiên cloud P4b). Cùng phiên Desktop, Opus 5.5, sau khi hạn mức tuần reset.

## Block 1 · Durable knowledge

### Lời owner trong phần này (nguyên văn)

- "Tiếp theo chúng ta nên làm gì? Nếu sử dụng được Claude  cloud thì tốt thì tôi có còn nhiều hạng ngạch với nó." → câu hỏi mở cloud: "Có, mở ngay (Recommended)".
- "Audit kỹ cho tôi, xem tôi cần phải làm gì bây giờ nhé. Chạy prompt cloud như thế nào? đã chạy chưa hay cần tôi phải copy rồi mở session mới để chạy nó?"
- "cloud đã chạy mà sao tôi không thấy tiền cdedit giảm?" (ảnh: $235 of $250 left)
- "Thình hình thế nào rồi? Bây giờ chúng ta nên làm gì tiếp theo?"
- "Audit kỹ cho tôi các phản hồi, các xử lý cũng như nội dung prompt ở trên. Bây giờ đã reset limit rồi, tôi nên làm gì thì tốt và phù hợp nhất? cho tôi các khuyến nghị tốt nhất phù hợp." → "Có, thêm 8 phiên S (Recommended)", "Anh mở phiên mới, dán resume prompt (Recommended)".
- "Audit kỹ cho tôi các phản hồi, các xử lý cũng như nội dung prompt ở trên. \nTôi nên làm gì thì tốt và phù hợp nhất? cho tôi các khuyến nghị tốt nhất phù hợp."
- "Xử lý theo khuyến nghị cho tôi." → sau Bước 0: "Giữ trên nhánh, đo dòng code dùng chung sau ở P5 (Recommended)", "Anh mở phiên mới với resume prompt (Recommended)".

### Facts established (do not re-derive)

- **Phiên cloud P4b** (routine `trig_01PyYmcokJRNHnPqhE7rcga4`, chạy một lần 09:30–09:51 UTC 2026-09-28, Opus, connector đã gỡ): nhánh `p4b-topic-stackfiles`; Bước A kiểm trên Windows (184/184, đột biến `py-01` M00 xanh M01–M16 đỏ). **Routine cloud dùng credit cloud, không dùng hạn mức gói:** ảnh của owner lúc phiên P4b đang chạy (khoảng 09:44 UTC 2026-09-28; phiên chạy 09:30–09:51) ghi "$235 of $250 left", ảnh 2026-09-30 ghi "$222 of $250 left"; giữa hai ảnh không có phiên cloud nào khác của dự án (nhật ký routine), nên khoảng $13 được gán cho phiên P4b (21 phút, Opus, một reviewer Sonnet) — ảnh $235 có thể chưa phản ánh phần đang chạy. Credit hết hạn 2026-11-05 14:59 GMT+7 (theo cả hai ảnh); việc dựng không cần đo nên đẩy lên cloud.
- **Hai lỗ hổng đo tìm ra khi audit, sửa trước mọi phiên:** (1) profile đo chỉ cho `Read(//c/Projects/Bearingkit/skills/**)` và `stackFiles` trỏ vào checkout đang chạy → không nhánh K nào được chạy từ worktree; mọi nhánh chạy từ checkout chính, `git switch` giữa các vòng (`d45c61b`, `fde8f8b`). (2) runner không ghi kit chạy từ nhánh nào → `kitRevision` ghi `kit: {branch, commit, dirty}` vào `meta.json` và dòng đầu `results.md` (`889e4a3` trên `main`, merge vào `p4-step0-scope` ở `77c357a`).
- **Guard P4b có thêm 8 S xen kẽ** theo lời owner (`0554c1a`), 26 phiên.
- **Kết quả Bước 0** (`git show origin/p4-step0-scope:docs/specs/2026-09-28-stack-rule-timing.md`, mục Results; 48 phiên, 2026-09-30): deadline gộp K-mới 9/16, K-cũ 4/16, S 0/16; **p chính = 0,149 → không merge**, sửa `bk-build` ở lại nhánh (quyết định owner, `303bebb`); guard `build-01` không chạy (thanh chính đã trượt). K-mới so với nguồn p = 0,0008. O1, O2 16/16 mọi nhánh. Từng task (mô tả): `node-01` 5/8 so với 1/8, p = 0,119; `py-01` 4/8 so với 3/8, p = 1,0. Manh mối: không phiên nào đọc lại file khi vào `bk-build` (0/11); K-mới sửa client dùng chung 6/8 (`node-01`) và 3/8 (`py-01`), K-cũ 2/8 và 0/8; ở `node-01` cả 5 lượt đạt của K-mới đều sửa client, ở `py-01` chỉ 1/4. 31/32 phiên K có `args`; không phiên S nào gọi skill nguồn; một câu "out of scope" trong 19 lượt trượt (K-cũ). Driver đo và script tổng hợp: `evals/analysis/step0-run.cjs` (mỗi vòng kiểm cây sạch, diff kit rỗng, `meta.kit` đúng nhánh và không bẩn; dừng ở lỗi đầu tiên hay khi runner tự dừng) và `evals/analysis/step0-tally.cjs` (tách nhánh theo `meta.kit`); lúc đo chúng chạy từ scratchpad, đưa vào repo khi đóng phiên, script tổng hợp chạy lại cho đúng các số trên.
- **Chi phí đo** (`get_usage`): 24 phiên `node-01` ≈ 14% cửa sổ 5 giờ và 2 điểm tuần (4% → 6%); cả phần đo cộng phiên chính và các reviewer: tuần 4% → 10% (không tách riêng được phần `py-01`); phiên K ≈ 0,47 USD, S ≈ 0,31 USD (trung vị). Một bản trước của handoff này ghi "48 phiên ≈ 4 điểm tuần" — là ngoại suy, đã sửa khi đóng phiên.
- Hạn mức lần đọc cuối (đóng phiên): 5 giờ 52%, tuần 10%; ngữ cảnh phiên 69%.

### Decisions taken

- Sửa `bk-build` của Bước 0 ở lại nhánh; đo riêng dòng "luật stack trong code dùng chung" ở P5.
- `php-01` đo trên `main` hiện tại (không có sửa Bước 0), trong phiên mới.

### Rejected options (do not re-propose)

- Merge sửa Bước 0 dù p = 0,149. Đo lại ngay bản chỉ có dòng code dùng chung trước `php-01`.
- Chạy nhánh K từ worktree.

### Lessons (candidate lines)

- RULE | đo nhiều nhánh K | WHEN so hai bản kit THEN chạy cả hai từ checkout chính, đổi nhánh giữa các vòng, và ghi nhánh/commit vào kết quả NOT worktree hay thứ tự thư mục | profile chỉ đọc `skills/` ở checkout chính; `meta.json` không ghi kit | 2026-09-30
- RULE | con số chi phí | WHEN báo hạn mức một phép đo THEN ghi số đọc từ `get_usage` trước và sau, nói rõ gộp những gì NOT nhân tỷ lệ từ một phần | "48 phiên ≈ 4 điểm" là ngoại suy, số đo được là 4% → 10% gộp cả phiên chính | 2026-09-30
- RULE | công cụ đo | WHEN một phép đo chạy bằng script tự viết THEN đưa script vào repo cùng kết quả NOT để trong scratchpad | driver Bước 0 suýt mất cùng phiên | 2026-09-30
- RULE | rà độc lập | WHEN sửa theo góp ý của reviewer THEN vẫn cho rà bản sửa trước commit NOT commit ngay vì "chỉ làm đúng góp ý" | ba lần trong phiên này (`d45c61b`, `fde8f8b`, `a6dfcc2`), đều rà bù không lỗi | 2026-09-30

## Block 2 · Resume payload

### State

- `main` = `fc7247d` trở đi (handoff này, rồi commit đóng phiên đưa hai script `evals/analysis/step0-*.cjs` vào repo). Nhánh chờ: `p4-step0-scope` `303bebb` (không merge, giữ cho P5); `p4a-php` `e540fbc` (`php-laravel.md`, `php-01`, chưa đo); `p4b-topic-stackfiles` `0554c1a` (chưa đo, sau `php-01`).
- Cài hằng ngày `beb258c` hai scope; doctor sáu `ok` (2026-09-30).

### Decisions waiting on the owner

- Cài toolchain C++ cho `c-cpp` (câu 38 (c)).

### Open threads

- `php-01/mutants.cjs` còn đọc `# fail N` bằng regex (sửa như `py-01` khi đụng `php-01`).
- EPERM của `php <file>` dưới `node --test` (scorer đã tránh bằng `-f`).
- Script `stack-rule-timing.cjs` không đọc `meta.kit`; tách K-cũ/K-mới theo thư mục.
- Nhánh local `p4-runner-kit-rev` đã merge vào `main` (`889e4a3`), còn để lại; nhánh remote cũ `claude/serene-franklin-3f3bb7` (`6cb8427`) cũng còn. Xoá cần owner nói có; không ảnh hưởng gì.
- Ghi nhớ máy (`~/.claude/projects/…/memory/`) đã cập nhật trỏ tới handoff này; nó không theo máy khác — repo là nguồn thật.
- Mọi luồng mở của hai handoff 2026-09-28 vẫn mở.

### Next work

1. `php-01` (spec: `git show origin/p4a-php:docs/specs/2026-09-28-stack-php-laravel-design.md`): merge `main` vào `p4a-php`, suite, rồi 2 K thăm dò → 3 F hiệu chỉnh → guard `--branches K,S --runs 8` hoặc so đầy đủ theo spec; merge nếu đạt.
2. P4b Bước B (26 phiên) sau khi `php-01` đã quyết trên `main`.
3. `shell.md` từ Antigravity-Core ghim (máy owner), task `shell`.
4. P5 (`bk-spec` + `bk-plan`), gồm đo riêng dòng code dùng chung của Bước 0 (theo khuyến nghị owner đã chọn: bỏ dòng "đọc lại" không ai làm theo; đăng ký đủ phiên mỗi bên cho hiệu ứng cỡ đã thấy).

### Resume prompt

"Phiên P4 tiếp (đo `php-01`) của Bearingkit, trên máy owner, `C:\Projects\Bearingkit`. Đọc theo thứ tự: `docs/handoff/2026-09-30-p4-step0-measured.md` (Block 2 trước); khối "Luật" trong lời owner ở `docs/handoff/2026-09-26-p3b-node-guard.md` (áp dụng nguyên văn); `git show origin/p4a-php:docs/specs/2026-09-28-stack-php-laravel-design.md` (mục Measurement, Task `php-01`, As built, các mục review); `docs/status.md`. Lệch với repo thì tin repo, và ghi lại.

Đầu phiên: `git status`, `git fetch origin`, `git log --oneline -1` trên `main`, `node bin/bearingkit.cjs doctor` (sáu `ok`), `get_usage`, `claude plugin list` (bearingkit `beb258c` hai scope), suite `node --test --test-reporter=tap tests/*.test.cjs` trên `main` (181/181).

Bước 1: `git switch p4a-php`; `git merge --no-edit main` (spec `php-01` ghi "rebased on `main`… the rebase is recorded"; dùng merge thay vì rebase vì nhánh đã push; nếu không có xung đột thì nội dung các file như nhau — ghi điều này cùng mã commit merge vào mục kết quả của spec); suite trên `p4a-php` (183: thêm hai test `php-01`; test `php-01` mất khoảng 2 phút); `node bin/bearingkit.cjs bench --task php-01 --config-dir C:\Projects\Bearingkit\_build\profile\claude --branches F,S,K --dry-run`. Mọi phiên đo chạy từ checkout chính với nhánh cần đo được checkout (không worktree: profile chỉ cho `Read` dưới `C:/Projects/Bearingkit/skills/**`); trước mỗi lệnh `bench` cây sạch, và sau đó kiểm `meta.json` của thư mục kết quả có `kit.branch` đúng và `kit.dirty: false`.

Bước 2, theo spec `php-01`: 2 phiên K thăm dò (`--branches K --runs 2`, `p4a-php` checkout; `php-laravel.md` mở ≥ 1/2 thì tiếp, đọc `Rfile` trong `check.json`; 0/2 thì dừng và báo owner); 3 phiên F hiệu chỉnh (`--branches F --runs 3`); task dùng được nếu H ≤ 1 ở ít nhất 2/3 và O1 ở ít nhất 2/3. Không dùng được → guard: một lệnh `--branches K,S --runs 8`, thanh chỉ đọc K (O1, O2 mỗi cái ≥ 7/8, H trung vị không dưới trung vị F, file mở ≥ 4/8), so với nguồn bằng kiểm hoán vị, "tốt hơn nguồn" chỉ khi p ≤ 0,05. Dùng được → so đầy đủ: F thêm 5, S, K-trước (`main` checkout) và K-sau (`p4a-php` checkout) 8 mỗi nhánh, K-trước và K-sau xen kẽ theo vòng `--runs 2` như Bước 0 (mẫu: `evals/analysis/step0-run.cjs`, chép và đổi task/nhánh, đưa bản mới vào repo; cách chạy mang từ Bước 0, spec `php-01` không ghi — ghi lại khi báo kết quả); thanh: H của K-sau cao hơn K-trước với p ≤ 0,05 (kiểm hoán vị), O2 ≥ 7/8, O1 của K-sau không thấp hơn K-trước, file mở ≥ 4/8. Các cột thời điểm đọc file (không thanh) lấy bằng `git show origin/p4-step0-scope:evals/analysis/stack-rule-timing.cjs` (script chỉ có trên nhánh đó và không đọc `meta.kit`: tự tách K-trước/K-sau theo `kit.branch` của từng thư mục). So với nguồn: K-sau với S, cùng phép thử. `get_usage` trước mỗi lô; không hai lệnh `bench` cùng lúc; báo cột `args` và skill được gọi; đọc lệnh bị từ chối bằng mắt trước khi kết luận. Đạt thanh → merge `p4a-php` vào `main` (`--no-ff`), cập nhật `docs/status.md`; không → giữ nhánh, hỏi owner. Rồi hỏi owner trước khi cập nhật cài hằng ngày và kho Antigravity. P4b (26 phiên) để phiên sau nếu ngữ cảnh không đủ.

Luật (tóm tắt; bản đầy đủ là khối Luật nói trên): không Python ngoài phạm vi câu 35, phiên chính và reviewer cấm cả `--version`; mỗi bước ghi dưới `~/.claude`/`~/.gemini`, sửa repo khác, xoá, lưu trữ hay cài phần mềm thì hỏi owner một câu có, gom câu hỏi; cài kit chỉ từ marketplace, luôn `--scope user` và `--scope local`; script đọc output `node --test` ép `--test-reporter=tap`; rà độc lập trước mọi commit, kể cả bản sửa theo góp ý của reviewer; phiên chính Opus, agent đọc hàng loạt và reviewer Sonnet, phiên đo Sonnet 5; brief của mọi agent cấm lệnh nền và cấm tìm ngoài repo; ít nhất 8 lượt mỗi nhánh được so và báo p; ghi skill nào thật sự được gọi; commit theo đường dẫn cụ thể; handoff là file mới, chép nguyên văn lời owner; `docs/status.md` thay đúng ô, dưới ~15 KB; dừng ở 80% ngữ cảnh với handoff; khi đóng phiên làm hai phép thử độc lập (rà độ đầy đủ, diễn tập khởi động lạnh), sửa lỗ hổng, rồi dán nguyên `git status`. Trả lời bằng tiếng Việt, cuối mỗi khối việc có "Đã xong" và "Còn lại"."

### Đánh giá độc lập lần đóng phiên này

- **Rà độ đầy đủ** (Sonnet, chỉ đọc): mọi mã commit và nhánh khớp `origin`; 16 `meta.json` đúng `kit`, `dirty: false`; đếm lại 9/16, 4/16, 0/16 và p = 0,1489 từ `check.json`; tóm tắt `php-01` khớp spec `p4a-php`; `status.md` 11.410 byte, chỉ đổi ba dòng. Must-fix: mục này trống → đã điền. Should-fix: thiếu p từng task, số sửa client, `args`, S không gọi skill, câu out-of-scope → đã thêm vào Facts; thiếu phần đề xuất cho P5 → đã thêm vào Next work. Không kiểm được trong repo: số suite, hạn mức, doctor, bản cài, lời owner.
- **Diễn tập khởi động lạnh** (Sonnet, chỉ đọc): 7/7 câu đúng kèm `file:line`. Lỗ hổng, đã sửa: merge thay rebase chưa giải thích (đã ghi lý do và yêu cầu ghi vào spec); thanh của đường so đầy đủ chưa nêu (đã chép); script cột thời điểm đọc chỉ có trên `p4-step0-scope` (đã trỏ). Agent tự báo một lần `git ls-remote` trái brief (chỉ đọc, vô hại). Ghi nhận không sửa: "`main` = commit của handoff này" đúng sau commit.
- **Audit đóng phiên theo `bk-close`** (sau `fc7247d`, theo yêu cầu owner): bốn nhánh làm việc (`main`, `p4-step0-scope`, `p4a-php`, `p4b-topic-stackfiles`) trùng `origin`, không commit chưa push; không dấu `TEMPORARY`/`REMOVE` trong file đụng tới; không `.claude/lessons.log` nên không ghi bài học tự động. Hai lỗi sửa: con số chi phí "48 phiên ≈ 4 điểm tuần" là ngoại suy (sửa theo `get_usage`); driver và script tổng hợp chỉ nằm trong scratchpad (đưa vào `evals/analysis/`). Các chỗ sửa này được rà độc lập trước commit.
