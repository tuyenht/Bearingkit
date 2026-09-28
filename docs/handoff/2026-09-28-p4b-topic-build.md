# Handoff · 2026-09-28 · phiên P4b (cloud): `detect-stack` nêu file stack theo chủ đề — chỉ dựng, không đo

Tiếp nối `docs/handoff/2026-09-28-p4-step0-php-build.md` (Block 1 của nó vẫn đúng; Block 2 của nó vẫn đúng cho `p4-step0-scope` và `p4a-php`, Block 2 dưới đây thêm nhánh `p4b-topic-stackfiles` và thứ tự merge). Phiên cloud chạy theo lịch (Linux, Node 22), Opus; không phiên đo nào chạy, không Python nào chạy.

## Block 1 · Durable knowledge

### Lời owner (prompt của phiên, nguyên văn)

> Phiên P4b của Bearingkit, chạy trên cloud: CHỈ DỰNG, KHÔNG ĐO. Trả lời bằng tiếng Việt, ngắn gọn; cuối mỗi khối việc có hai danh sách tách rời "Đã xong" và "Còn lại". Tài liệu trong repo viết tiếng Anh như các spec hiện có.
>
> Đầu phiên: `git fetch origin`; `git switch -c p4b-topic-stackfiles origin/main` (làm việc trên nhánh mới này; KHÔNG commit vào `main`, KHÔNG động vào các nhánh `p4-step0-scope`, `p4a-php`); `git log --oneline -1` phải là `57361bd` hoặc mới hơn; `git status` sạch. Đọc theo thứ tự: `AGENTS.md`; `docs/handoff/2026-09-28-p4-step0-php-build.md` (Block 2 trước); câu 38 (b) trong `docs/specs/2026-09-12-d5-owner-questions.md`; `skills/bk-build/references/stacks/index.md` (mục "`sql.md` is not reached this way"); `skills/bk-build/SKILL.md` dòng 12; `scripts/detect-stack.cjs` (`stackFilesFor`, `detect`); `tests/detect-stack.test.cjs`; mục "Reach fix, registered before any session" trong `docs/specs/2026-09-26-stack-node-python-design.md` (mẫu cho một thay đổi reach có đăng ký đo). Lệch giữa prompt này và repo thì tin repo, và ghi lại chỗ lệch.
>
> Bối cảnh đã chốt (câu 38 (b), owner): trước khi đo `shell`, `detect-stack` phải nêu file stack theo chủ đề — `shell.md` khi dự án có `*.sh`/`*.ps1`, `sql.md` khi có migration hay `*.sql` — vì `sql.md` và `shell.md` hiện không có đường tới (profile không nêu; phiên đo trước cho thấy file không được nêu trong `stackFiles` thì không được đọc). Đây là đổi thiết kế có đo reach như `stackFiles`.
>
> Việc (theo thứ tự):
> 1. Spec MỚI `docs/specs/2026-09-28-topic-stackfiles-design.md`, viết TRƯỚC code: thiết kế (tín hiệu nào cho `sql.md`: file `*.sql`, thư mục migration thường gặp như `migrations/`, `database/migrations/`, `prisma/migrations/`, `db/migrate/`; cho `shell.md`: `*.sh`, `*.bash`, `*.ps1`; bỏ qua `.git`, `node_modules`, `vendor`, `dist`, `build`, `.venv` và thư mục ẩn; quét có giới hạn độ sâu hay số file, nêu con số và lý do; chỉ nêu file đang tồn tại, nên `shell.md` chưa viết thì chưa xuất hiện; có nên thêm một trường cho biết vì sao file được nêu hay không — chọn một, nêu phương án bị loại). Nêu rõ tác động lên các task đo đã đăng ký: fixture `review-03`, `review-04` có `migration.sql` (task của `bk-review`); fixture `php-01` trên nhánh `p4a-php` có `schema.sql`, nên hồ sơ của nó sẽ nêu thêm `sql.md` — nói phép đo `php-01` đọc kết quả thế nào nếu thay đổi này vào `main` trước (R của `php-01` là `php-laravel.md`; việc đọc `sql.md` chỉ báo, không có ngưỡng) và đề xuất thứ tự merge. Đăng ký phép đo reach TRƯỚC mọi phiên (không chạy phiên nào ở đây): task nào (dùng lại task có sẵn nếu hợp, hoặc mô tả task mới nhỏ; nói rõ vì sao), nhánh, số phiên (ít nhất thăm dò 2 phiên K, và guard 8 phiên nếu thăm dò đạt, như Reach fix), thanh merge (mở file ít nhất 4/8), guard lại `build-01` vì chữ `bk-build` đổi; ngân sách ghi "chưa đo". Vì chữ model đọc đổi, câu `sql.md` "not by the profile" trong `skills/bk-build/SKILL.md:12` và mục tương ứng của `stacks/index.md` được sửa trên nhánh này cho khớp hành vi mới — chỉ những câu đó, không câu nào khác dưới `skills/`; không viết `shell.md` (nguồn duy nhất của nó là Antigravity-Core, bản ghim chỉ có trên máy owner).
> 2. Code trong `scripts/detect-stack.cjs` + test trong `tests/detect-stack.test.cjs`, ĐỎ TRƯỚC rồi XANH: fixture tạm có `*.sql` → `stackFiles` có `sql.md`; có thư mục migration → có; `*.sql` chỉ nằm trong `node_modules`/`vendor` → không; có `*.sh` → không nêu `shell.md` (file chưa tồn tại) nhưng test cho thấy khi thư mục stacks giả có `shell.md` thì nêu (dùng tham số `dir` của `stackFilesFor` hay cách tương đương có sẵn); quét dừng ở giới hạn; mọi fixture trong `tests/fixtures/stacks/` vẫn cho profile như cũ ngoài phần thêm được nói trong spec. Không đổi output nào khác của profile.
> 3. Hai sửa nhỏ, mỗi sửa có test đỏ trước: (a) `evals/bench/build-01/build.cjs:114`, P6 dùng `\brevert\b` nên không bắt "reverting", "reverted", "going back", "rolling back"; sửa regex, thêm ca test trong test của `build-01`; ghi vào spec của `bk-build` (`docs/specs/2026-09-26-bk-build-design.md`) một dòng: kết quả P6 cũ có thể thấp hơn thực, chưa chấm lại (`evals/results/` chỉ có trên máy owner). (b) `evals/bench/py-01/mutants.cjs` đọc đỏ/xanh bằng regex trên output TAP; đổi sang mã thoát của `node --test` (khác 0 là đỏ), TAP chỉ để lấy lý do; không cần chạy mutants trên cloud nếu không có pytest — nói rõ, máy owner chạy lại.
> 4. Chạy `node --test --test-reporter=tap tests/*.test.cjs`. Trên cloud Linux có 5 test hỏng vì môi trường (orphan grace period của runner, bốn test của `bearingkit record`): so với cây sạch `origin/main` để chứng minh không do thay đổi này.
> 5. Rà độc lập TRƯỚC commit: agent Sonnet (`model: sonnet`) chỉ đọc, không đổi working tree, không chạy test hay bench: đối chiếu spec, code, test với câu 38 (b) và mẫu Reach fix (tín hiệu sai dương/âm, giới hạn quét, tác động lên task đã đăng ký, thanh đo, chữ `skills/` đổi đúng phạm vi). Cân nhắc phát hiện bằng bằng chứng, sửa, ghi kết quả rà vào spec.
> 6. Commit theo đường dẫn cụ thể (conventional commits, không dòng attribution, LF, không BOM) và push nhánh `p4b-topic-stackfiles`. KHÔNG sửa `docs/status.md` (máy owner sẽ sửa khi merge).
> 7. Viết handoff MỚI `docs/handoff/2026-09-28-p4b-topic-build.md` trên nhánh này (hai block như các handoff trước; chép nguyên văn prompt này vào Block 1) với resume prompt cho máy owner: chạy lại suite trên Windows ở nhánh này, chạy `evals/bench/py-01/mutants.cjs` (M00 xanh, M01–M16 đỏ), rồi đo reach theo đăng ký — sau phép đo Bước 0 và thứ tự merge spec đề xuất. Trước commit cuối làm hai phép thử độc lập bằng agent Sonnet chỉ đọc (rà độ đầy đủ so với prompt này; diễn tập khởi động lạnh từ resume prompt), sửa lỗ hổng, rồi dán nguyên `git status`.
>
> Luật: KHÔNG chạy `bearingkit bench` (kể cả `--dry-run`), không cài kit, không ghi ngoài repo, không chạy Python nào (kể cả `--version`, `python3 -c`), không sửa task `node-01`, `py-01`, `php-01` hay runner ngoài hai sửa ở bước 3. Phiên chính Opus; agent đọc hàng loạt và reviewer Sonnet. Brief của mọi agent cấm lệnh nền và cấm tìm ngoài repo (không `find /`), agent phải dừng mọi việc nền trước khi trả lời. Không in biến môi trường hay giá trị giống bí mật. Không trích số chưa kiểm (ghi "chưa đo"). Dừng ở 80% ngữ cảnh với handoff. Hành động theo khuyến nghị tốt nhất; rà lại trước khi làm, kiểm lại sau khi làm.

### Facts established (do not re-derive)

- **Thiết kế** (`docs/specs/2026-09-28-topic-stackfiles-design.md`): `topicsIn` quét theo chiều rộng, sắp xếp theo tên, đọc gốc và thư mục tới độ sâu 4, dừng sau 5.000 mục hoặc khi thấy cả hai chủ đề; bỏ qua `node_modules`, `vendor`, `dist`, `build` và mọi thư mục bắt đầu bằng dấu chấm; không theo symlink. `sql.md`: file `.sql`, thư mục `migrations` (mọi cấp), `migrate` ngay dưới `db`, `alembic`; `shell.md`: `.sh`, `.bash`, `.ps1`. So chữ thường. Chỉ nêu file tồn tại; thứ tự: file ngôn ngữ, `sql.md`, `shell.md`. Không thêm trường nào vào profile (bác trường `stackReasons`).
- **Tác động đo lường:** `sql.md:40` ("Parameterised, always") và `:42` ("one transaction") trùng hazard H2, H3 của `php-01` → nếu P4b vào `main` trước khi đo `php-01`, H2/H3 của K không còn quy được cho riêng `php-laravel.md`. Hồ sơ `review-03/main`, `review-04/branch` giờ nêu thêm `sql.md` (`bk-review` không có dòng `stackFiles`). `build-01`, `node-01`, `py-01`, `debug-01`, `test-01` và hồ sơ của chính repo (trên cây sạch) không đổi. Trên máy owner, `_build/upstream/` (không track) nằm trong giới hạn quét, nên hồ sơ của chính kit ở đó có thể nêu `sql.md`.
- **Xung đột merge dự kiến:** cả ba nhánh sửa `skills/bk-build/SKILL.md:12`; `p4a-php` và nhánh này sửa `stacks/index.md` (`p4-step0-scope` không).
- **Suite trên cloud** (mọi `tests/*.test.cjs` trừ `bench-py-01.test.cjs`, vì nó chạy `python -m pytest`; container có Python và pytest trên PATH nhưng phiên không chạy Python): nhánh 181 test, 175 pass, 5 fail, 1 skip; cây sạch `57361bd`, cùng các file: 177, 171, 5, 1. Năm test hỏng trùng tên (orphan grace period; bốn test `bearingkit record`) → môi trường.
- **`evals/bench/php-01/mutants.cjs` trên `p4a-php`** cũng đọc `# fail N` bằng regex (dòng 47); chưa sửa (ngoài phạm vi). Không làm sai kết quả khi dùng `--test-reporter=tap`, nhưng cùng điểm yếu.
- Mutants `py-01` không chạy trên cloud (phiên không chạy Python).

### Decisions taken (trong phạm vi prompt)

- Task đo reach: dùng lại `php-01` (task `bk-build`, việc SQL, `schema.sql` ở gốc), đọc `reach(raw, 'sql')` từ stream lưu sẵn, không sửa task. Bác `review-03/04` (đo `bk-review`, không yêu cầu sửa), bác task mới `sql-01` (tốn dựng và hiệu chỉnh cho cùng câu hỏi reach).
- Thanh: thăm dò 2 K (`sql.md` mở ≥ 1/2), guard 8 K: `sql.md` mở ≥ 4/8, O1 và O2 của `php-01` mỗi cái ≥ 7/8, H trung vị không dưới trung vị hiệu chỉnh F của `php-01`; guard lại `build-01` (8 K; O1 8/8, O2 và O3 ≥ 7/8, P3 ≥ 7/8). 18 phiên; ngân sách chưa đo.
- Thứ tự merge đề xuất: `p4-step0-scope` → `p4a-php` (đo và quyết trên `main` đó) → rebase nhánh này, suite, đo, merge.
- P6 `build-01`: "go back" chỉ tính ở dạng "go back to / means / is" (sau rà độc lập).

### Rejected options (do not re-propose)

- Trường `stackReasons` trong profile; báo lần quét bị cắt (cùng chi phí, câu "by subject matter" đã phủ).
- Đo reach `sql.md` trên `review-03/04` hoặc task mới.
- Viết `shell.md` trên cloud (nguồn Antigravity-Core chỉ có trên máy owner).

### Lessons (candidate lines)

- RULE | chạy suite trên cloud | WHEN một test gọi interpreter mà luật phiên cấm THEN loại đúng file đó khỏi lệnh và so với cây sạch cùng tập file NOT chạy cả suite rồi coi là ngoại lệ | `bench-py-01.test.cjs` chạy `python -m pytest` khi có Python trên PATH | 2026-09-28
- RULE | test đỏ trước khi tách hàm | WHEN logic cần test nằm inline THEN tách hàm với logic cũ, viết test, thấy đỏ đúng lý do, rồi mới sửa NOT sửa và tách cùng lúc | P6 và `verdict` phiên này | 2026-09-28

## Block 2 · Resume payload

### State

- Nhánh `p4b-topic-stackfiles` (đã push; từ `57361bd`): `3b1ef11` (detect-stack + spec + chữ `skills/`), `a78c527` (P6 `build-01`), `43478b3` (mutants `py-01`), cộng commit handoff này. `main`, `p4-step0-scope`, `p4a-php` không đổi. `docs/status.md` chưa sửa (sửa khi merge).

### Decisions waiting on the owner

- Không có mới. Nếu lúc đo `php-01` chưa lên `main` (chưa đo, hoặc `php-laravel.md` ở lại nhánh): dừng và hỏi owner, không chạy từ nhánh trộn.

### Open threads

- `php-01/mutants.cjs` đọc TAP bằng regex như `py-01` trước đây; sửa cùng cách khi owner cho phép đụng `php-01`.
- Kết quả P6 cũ của `build-01` có thể thấp hơn thực; chưa chấm lại.
- Mọi luồng mở của `docs/handoff/2026-09-28-p4-step0-php-build.md` vẫn mở.

### Live temporary bypasses

- Không có.

### Next work

1. Đo Bước 0 (theo handoff `2026-09-28-p4-step0-php-build.md`), merge hay không.
2. `php-01` trên `main` lúc đó; quyết `php-laravel.md`.
3. Rebase nhánh này lên `main` (sửa tay `SKILL.md:12`, `index.md`), suite, mutants `py-01`, rồi đo reach P4b theo spec (2 K `php-01` → 8 K → 8 K `build-01`), merge nếu đạt, sửa `docs/status.md`.
4. P4b nửa sau: viết `shell.md` từ Antigravity-Core ghim, task `shell` với thăm dò reach riêng.

### Resume prompt

"Phiên P4b tiếp (máy owner) của Bearingkit, `C:\Projects\Bearingkit`. Đọc theo thứ tự: `git show origin/p4b-topic-stackfiles:docs/handoff/2026-09-28-p4b-topic-build.md` (Block 2 trước); `git show origin/p4b-topic-stackfiles:docs/specs/2026-09-28-topic-stackfiles-design.md` (mục "Effect on tasks already registered" và "Measurement, registered before any session"); handoff `git show origin/main:docs/handoff/2026-09-28-p4-step0-php-build.md` (khối Luật của nó áp dụng nguyên văn); spec `php-01`, `docs/specs/2026-09-28-stack-php-laravel-design.md` (trên `main` nếu `p4a-php` đã merge, không thì `git show origin/p4a-php:…`): mục "Branches, calibration, and the bar" và kết quả hiệu chỉnh F được ghi vào đó — trung vị H của F là sàn cho guard P4b. Lệch với repo thì tin repo, và ghi lại.

Bước A (không tốn phiên đo, làm ngay được): `git fetch origin`; `git switch p4b-topic-stackfiles`; `git log --oneline -5` (đầu là commit handoff, rồi `43478b3`, `a78c527`, `3b1ef11`); suite đầy đủ `node --test --test-reporter=tap tests/*.test.cjs` trên Windows (phải xanh hết, gồm `bench-py-01` với pytest; trên cloud 5 test hỏng vì môi trường); `node evals/bench/py-01/mutants.cjs <thư mục tạm trong _build>`: M00 GREEN, M01–M16 RED (một dòng NO RESULT là bị kill do timeout, chạy lại riêng mutant đó).

Bước B (đo, chỉ SAU phép đo Bước 0 và SAU khi `php-01` đã đo và quyết trên `main`, đúng thứ tự merge của spec): rebase `p4b-topic-stackfiles` lên `main` lúc đó, giải xung đột `skills/bk-build/SKILL.md:12`: lấy dòng của `main` (câu Bước 0 "— again, even if bk-spec already read it — and list the rules…" nếu đã merge, và số file stack của `main`, ví dụ "six of the eight"), rồi chỉ thay câu `` `sql.md` is opened by subject matter — a query, a migration, a schema — not by the profile. `` bằng câu `sql.md`/`shell.md` của nhánh này (`git show 3b1ef11 -- skills/bk-build/SKILL.md`); `stacks/index.md`: giữ hàng `php` và các số của `main`, lấy hàng `shell.md` và mục "`sql.md` is reached by what the tree holds" của nhánh này; suite xanh; `node scripts/detect-stack.cjs <fixture php-01 đã dựng>` phải nêu `php-laravel.md` rồi `sql.md`. Rồi: 2 K `php-01` (`sql.md` mở ≥ 1/2, đọc bằng `reach(raw, 'sql').file` của `scripts/lib/bench-score.cjs` trên mỗi `*-K*.raw.jsonl`) → 8 K `php-01` (thanh: `sql.md` ≥ 4/8, O1 và O2 ≥ 7/8, H trung vị không dưới trung vị F của `php-01`) → 8 K `build-01` (O1 8/8, O2, O3, P3 ≥ 7/8); `get_usage` trước mỗi lô; không hai lệnh `bench` cùng lúc; báo cột `args`. Đạt cả hai thì merge vào `main` và sửa `docs/status.md`; không thì giữ nhánh, báo owner. Nếu `php-01` chưa lên `main`: dừng, hỏi owner.

Luật: như khối Luật đã nêu; phiên đo Sonnet 5; rà độc lập trước mọi commit; handoff mới, chép nguyên văn lời owner; dừng ở 80% ngữ cảnh với handoff; khi đóng phiên làm hai phép thử độc lập, rồi dán nguyên `git status`. Trả lời bằng tiếng Việt, cuối mỗi khối việc có "Đã xong" và "Còn lại"."

### Đánh giá độc lập lần đóng phiên này

- **Rà độ đầy đủ** (Sonnet, chỉ đọc): các bước 1–6 và Luật khớp; `main`, `p4-step0-scope`, `p4a-php` không bị đụng; `docs/status.md` không đổi; `skills/` chỉ đổi hai đoạn đã nêu; không `shell.md`; commit conventional, không attribution; 11 file LF, không BOM; mọi dòng trích (`SKILL.md:12`, `sql.md:40/42`, `bench-php-01.test.cjs:89`, `bench-score.cjs:256`) đúng. Must-fix: phần đóng phiên còn trống, handoff chưa commit → mục này và commit cuối. Should-fix: số suite là tự báo (reviewer không chạy test); khớp nội bộ (thêm đúng 4 test). Reviewer tự nhận đã chạy vài lệnh chỉ đọc ngoài danh sách cho phép (`find .`, `od`, `git status`); không ghi, không lộ gì.
- **Diễn tập khởi động lạnh** (Sonnet, chỉ đọc): 6/6 câu trả lời đúng, kèm `file:line`. Lỗ hổng, đã sửa trong resume prompt: sàn H của F `php-01` nằm trong spec `php-01` chưa có trong danh sách đọc (đã thêm); handoff Bước 0 cần `origin/main:` (đã thêm); cách giải xung đột `SKILL.md:12` quá gọn (đã viết rõ câu nào giữ, câu nào thay). Ghi nhận không sửa: `stackFilesFor` và `topicsIn` không export, chỉ tới được qua `opts.stacksDir`/`opts.scan` của `detect`.
