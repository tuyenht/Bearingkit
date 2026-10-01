# Handoff · 2026-10-02 · phiên P4 (máy owner, tiếp): audit hai quyết định và resume prompt

Tiếp nối `docs/handoff/2026-10-01-toolchain-rep-prep.md` trong cùng một phiên Desktop (Opus 5.5): Block 1 của nó vẫn đúng trừ chỗ ghi dưới đây; Block 2 của nó (kể cả lệnh chạy driver không tham số) được thay bằng Block 2 dưới đây.

## Block 1 · Durable knowledge

### Lời owner trong phần này của phiên (nguyên văn)

- "Audit kỹ các xử lý cũng như các phản hồi ở trên.
2 quyết định trên, hãy audit kỹ rồi cho tôi khuyến nghị tốt nhất phù hợp.
Audit kỹ "Resume prompt" (nên thực hiện qua loop kiểm tra kỹ, chắc chắn rồi trả kết quả cho tôi)."

### Facts established (do not re-derive)

- **Lỗi tìm thấy và đã sửa**: `evals/analysis/shell-rep-run.cjs` mặc định chạy cả phép so "gọi bằng lệnh" ở mọi vòng, trong khi theo Addendum 2 phép so đó không được chạy sau khi phiên thử không cho dấu nào. Driver giờ bắt buộc một chế độ: `replicate` (chỉ K-trước và K-sau, 16 phiên, log `shell-rep-log.txt`, không cần quyết định nào thêm) hoặc `source` (chỉ lời gọi biến thể `command` và phiên mốc, trên `main`, 17 phiên, log `shell-src-log.txt`; chưa được dùng). Không tham số thì in cách dùng và thoát, không chạy gì.
- **Công cụ tính**: `evals/analysis/shell-rep-tally.cjs [tên log] [thư mục kết quả]` đọc log của driver; `evals/analysis/shell-src-tally.cjs <tên thư mục>` đọc một thư mục kết quả của một lệnh `bench`, cả biến thể `natural` lẫn `command` (đã sửa mẫu tên file), và đếm "nguồn được đọc" (lời gọi `Skill` của bản bọc, hoặc lệnh đọc file của nó).
- **Phiên thử, xem lại**: stream không chứa chữ nào của skill nguồn, không có lời gọi `Skill`, câu trả lời không nhắc tới skill. Điều đó chứng minh được ít: stream không ghi phần chữ được chèn vào lượt người dùng, và bốn khối suy nghĩ đều rỗng. Chênh lệch token lượt đầu là dấu hiệu duy nhất, và có thể chỉ là phần cố định của mọi lệnh gạch chéo.
- **Khuyến nghị cũ của phiên bị rút lại (1)**: handoff trước khuyên "đồng ý phần sửa luật (ngưỡng token)". Sau audit: không nên. Đề xuất B (spec, mục "Audit of 2026-10-02"): `commands` của task chỉ là chữ đặt trước prompt, nên đặt một câu thường bảo dùng skill ("Use the antigravity-core-shell:powershell-windows skill for this task." cho S2, "Use the bearingkit:bk-build skill for this task." cho K); phiên làm theo sẽ gọi tool `Skill`, stream ghi lại, và luật "nguồn được đọc" của phụ lục đầu (ít nhất 4/8) áp dụng nguyên vẹn. Không cần ngưỡng token, phiên mốc hay phiên hiệu chuẩn. Chưa đo: skill được nêu tên có được gọi qua tool không (cần một phiên thử).
- **Khuyến nghị cũ bị rút lại (2)**: handoff trước khuyên làm `c-cpp` trước P5 "để đóng mục 8 file stack". Sau audit: P5 trước. `bk-spec` và `bk-plan` chạy ở mọi việc làm tính năng; `c-cpp.md` không có dự án thật nào trên máy để đối chiếu; đếm 8/8 không phải lý do đủ. Điểm cộng của `c-cpp`: nguồn của nó gồm `cpp-pro` của `fullstack-dev-skills` (mã 590 trong bảng phân loại), nên nhánh S sẽ là nguồn thật, khác `shell.md`. Yếu tố quyết định: owner có viết C/C++ thường xuyên không.
- **Ngày**: lúc viết handoff này giờ máy là 2026-10-02 khoảng 01:00 (UTC+7), UTC còn là 2026-10-01. Driver kiểm cả hai ngày ở chế độ `replicate`, nên lần lặp lại chạy được **từ 07:00 giờ máy ngày 2026-10-02**.
- Roadmap hàng P4 và dòng 7: `c-cpp` không còn "hoãn" (toolchain đã cài, chờ thiết kế).
- Không phiên đo nào chạy trong phần này. `skills/`, `hooks/`, `scripts/`, `agents/` không đổi kể từ `e410f4d`; bản cài hằng ngày `e410f4d` vẫn khớp.

### Decisions taken

- Tách driver thành hai chế độ không dùng chung vòng: lần lặp lại đứng riêng; lý do "cùng điều kiện host" của Addendum 2 được bỏ, ghi trong spec.
- Ghi đề xuất B vào spec bên cạnh đề xuất A; không cái nào có hiệu lực.

### Rejected options (do not re-propose)

- Chạy phép so "gọi bằng lệnh gạch chéo" như đã đăng ký: cổng của nó đã trượt.
- Làm `c-cpp` trước P5 chỉ để đạt 8/8.

### Lessons (candidate lines)

- Khi một cổng đăng ký trượt, kiểm ngay công cụ chạy có còn làm việc bị cổng đó cấm không.
- Trước khi dựng một phép đo gián tiếp (token), tìm cách làm cho điều cần biết hiện ra trực tiếp trong dữ liệu (lời gọi `Skill`).
- Resume prompt phải được một phiên lạ "chạy thử trên giấy" từng lệnh; lượt kiểm đầu tìm ra mười chỗ, trong đó một công cụ không đọc được chính loại file mà prompt bảo dùng.

## Block 2 · Resume payload

### State

- `main`: commit trên cùng chứa file handoff này; `114181d` nằm trong lịch sử. Bản cài hằng ngày và kho Antigravity ở `e410f4d`, khớp `main` ở mọi thư mục kit; doctor sáu `ok`, một `skip`.
- File stack 7/8; `c-cpp` chưa có (toolchain ở `C:\msys64\ucrt64\bin`, không trong PATH).
- Lượt đo thứ hai của `shell-01`: lần lặp lại đã đăng ký và sẵn sàng (chế độ `replicate`); phép so với chữ của nguồn chờ owner chọn B, A, hoặc bỏ.
- Nhánh: đã nằm trong `main`, giữ lại, xoá cần owner nói có: `p4a-php`, `p4c-build-reach`, `p4b-topic-stackfiles`, `p4d-shell`, `p4e-shell-source`, `p4f-shell-replicate`, `p4-runner-kit-rev` (chỉ local). Chỉ local, để đo: `p4d-shell-before` `13d2937`. Không merge: `p4-step0-scope` `303bebb`; `claude/serene-franklin-3f3bb7` `6cb8427`.

### Decisions waiting on the owner

1. **So `shell.md` với chữ của nguồn bằng cách nào**: (B, khuyến nghị) câu thường bảo dùng skill ở cả hai nhánh, đếm lời gọi `Skill`; (A) lệnh gạch chéo với ngưỡng token và phiên hiệu chuẩn; (C) bỏ, giữ "chưa so với nguồn".
2. **Thứ tự**: (khuyến nghị) lần lặp lại `shell-01` → P5 → `c-cpp`; hoặc `c-cpp` trước P5 nếu owner viết C/C++ thường xuyên.

### Open threads

- Lần lặp lại `shell-01` chưa chạy. `shell.md` chưa so với chữ của nguồn. File, việc nêu trong hồ sơ và `detect-stack` chưa tách được.
- Ba câu còn dựa trên trí nhớ, liệt kê ở mục "Audit corrections" của spec `shell-01` (câu `2>&1`, câu `&&`, và "ba trong H2–H5 là mặc định trên PowerShell 7").
- Addendum 2 của spec vẫn mô tả driver chạy lời gọi `command` mỗi vòng; mục "Audit of 2026-10-02" ở cuối spec đính chính.
- Mọi luồng mở của `docs/handoff/2026-10-01-toolchain-rep-prep.md`, `2026-10-01-shell-source-audit.md` và `2026-10-01-p4d-shell.md` vẫn mở.

### Next work

1. Lần lặp lại `shell-01` (không chờ quyết định nào): Việc 2 của Resume prompt.
2. Theo câu trả lời 1 của owner: đăng ký và đo phép so với nguồn (B hoặc A), hoặc ghi "bỏ".
3. Theo câu trả lời 2: P5 rồi `c-cpp`, hoặc ngược lại; cả hai bắt đầu bằng đề xuất (COUNCIL) rồi chờ.

### Resume prompt

"Phiên tiếp của Bearingkit sau P4, trên máy owner, `C:\Projects\Bearingkit`. Đọc theo thứ tự: `docs/handoff/2026-10-02-audit-resume.md` (Block 2 trước); khối "Luật" trong lời owner ở `docs/handoff/2026-09-26-p3b-node-guard.md` (một đoạn bắt đầu bằng "Luật:", áp dụng nguyên văn; nó đầy đủ hơn bản tóm tắt cuối prompt này); `docs/specs/2026-10-01-stack-shell-design.md`: mục "Measurement, registered before any session", "Main run", "Addendum: against the source, registered before any session" (chứa luật "nguồn được đọc", gọi là "phụ lục đầu" dưới đây), "Addendum 2", "The trial, and an amendment…" và "Audit of 2026-10-02"; `docs/status.md`. Lệch với repo thì tin repo, và ghi lại.

Đầu phiên, theo thứ tự: `git status` (sạch, nhánh `main`); `git fetch origin`; `git log --oneline -5` (một trong các commit trên cùng chứa `docs/handoff/2026-10-02-audit-resume.md`, hoặc mới hơn; `114181d` nằm trong lịch sử); `node bin/bearingkit.cjs doctor` (sáu `ok`, một `skip`); đọc hạn mức bằng công cụ `get_usage` của ứng dụng (không phải lệnh shell); `claude plugin list` (mã in ra là mã commit; đúng khi `git diff --stat <mã đó> main -- skills hooks scripts agents` rỗng); suite `node --test --test-reporter=tap tests/*.test.cjs` (192/192; `bench-node-01` nhạy tải: nếu chỉ nó trượt thì chạy riêng file đó); `git rev-parse --short p4d-shell-before` (phải là `13d2937`; nhánh này chỉ có trên máy owner); `node evals/bench/shell-01-src/wrap.cjs` nếu thư mục `_build/wrappers/antigravity-core-shell/` không còn; thư mục `_build/profile/claude` phải có (profile đo, chỉ có trên máy owner; không `cd` vào, không in file của nó).

Việc 1, hỏi owner hai câu của "Decisions waiting on the owner" trong một lần, kèm khuyến nghị (B; lặp lại → P5 → `c-cpp`). Không chờ câu trả lời để làm Việc 2.

Việc 2, lần lặp lại `shell-01` (đã đăng ký ở Addendum 2, không cần quyết định nào thêm). Điều kiện: ngày theo giờ máy lẫn theo UTC đều khác 2026-10-01 (driver tự dừng nếu không; trên máy owner, UTC+7, tức từ 07:00 ngày 2026-10-02); đang ở nhánh `main`, cây sạch; đã đọc `get_usage`; không lệnh `bench` nào khác đang chạy. Nếu chưa tới giờ đó thì chờ; trong lúc chờ có thể làm phần chuẩn bị của Việc 3 (viết và rà phần đăng ký), và phép so với nguồn của Việc 3 không bị ràng buộc ngày. Chạy nền: `node evals/analysis/shell-rep-run.cjs replicate` (bốn vòng; mỗi vòng K-trước ×2 trên `p4d-shell-before` và K-sau ×2 trên `main`, đổi thứ tự mỗi vòng; 16 phiên; ước 40–60 phút theo nhịp của lượt đầu, chưa đo; log `evals/results/shell-rep-log.txt`). **Trong lúc driver chạy, không sửa file, không commit, không `git switch`, không đọc spec hay skill trong checkout**: driver tự chuyển nhánh và khoảng nửa thời gian checkout nằm ở `p4d-shell-before`; mọi việc khác chờ dòng `DONE replicate`. Nếu driver dừng: dòng cần đọc là dòng `STOP …` cuối cùng của log (các dòng `STOP` cũ vẫn nằm lại sau mỗi lần chạy lại). Chạy `git status` và `git branch --show-current`: cây sạch mà chưa ở `main` thì `git switch main`; cây không sạch (driver khi đó để nguyên checkout ở nhánh của lần gọi gần nhất) thì đưa `git status` cho owner xem trước khi bỏ bất cứ thay đổi nào. Nếu dòng lệnh ngay trước `STOP` có `STOPPED=…` (runner tự dừng vì hạn mức): đọc lại `get_usage` và chờ khung hạn mức mở lại rồi mới chạy lại; nếu lý do là một phiên "outlived its kill" (tiến trình sót) thì báo owner trước. Nếu log không có `DONE replicate` mà cũng không có dòng `STOP` mới (driver bị tắt: hết phiên, khởi động lại máy, lỗi không bắt): kiểm không còn tiến trình `claude` hay `node` của lượt đo, chạy `git status`, đưa checkout về `main` như trên, rồi chạy lại từ vòng có `round N of 4 start` mà chưa có `complete`. Sửa nguyên nhân rồi chạy lại: nếu dòng `STOP` đứng sau một dòng `round N of 4 start` thì `node evals/analysis/shell-rep-run.cjs replicate N` (vòng dở không được tính, vòng chạy lại thay nó); nếu driver dừng trước vòng nào (ngày, nhánh, kit) thì chạy lại `… replicate` không kèm số. Xong: `node evals/analysis/shell-rep-tally.cjs` (nhóm K-before và K-after; dòng "replication … p ="; hai dòng còn lại in `p = null` là đúng ở chế độ này); đọc lệnh bị từ chối bằng mắt (trường `permission_denials` của sự kiện `result` trong mỗi file `*.raw.jsonl` của các thư mục ghi trong log); ghi kết quả vào cuối spec thành mục "Result of the replication" theo đúng câu chữ đã đăng ký ("replicated" khi p ≤ 0,05 với K-sau trên; ngược lại "did not replicate", và khi đó `docs/status.md` cùng handoff ghi điều này ngay cạnh kết quả đầu); rà độc lập (reviewer Sonnet tự tính lại từ `evals/results/`) trước commit; commit theo đường dẫn, push.

Việc 3, theo câu trả lời 1 của owner.
- Nếu B: nhánh mới từ `main`. Viết vào spec một phụ lục đăng ký trước mọi phiên: phép thử, ba kết cục và dự đoán lấy nguyên của Addendum 2; cụm "invoked by command" trong mọi câu chữ đổi thành "both told to use their skill"; cổng "một phiên thử có dấu nhìn thấy" của Addendum 2 bỏ, thay bằng luật "nguồn được đọc" của phụ lục đầu (gọi qua tool `Skill` hoặc đọc file của bản bọc, ít nhất 4/8); ba dấu cũ giữ làm "được làm theo", đếm và báo, không ngưỡng. Sửa `commands` trong `evals/bench/shell-01-src/task.json` thành hai câu ghi ở mục "Audit of 2026-10-02" (runner ghép `commands[nhánh]` trước prompt khi chạy `--variants command`). Không cần sửa công cụ tính: `node evals/analysis/shell-src-tally.cjs <tên thư mục kết quả>` đã đọc được thư mục biến thể `command`, in "source read: N of M" (đã đăng ký) và "source followed (described): N of M" (ba dấu). Rà độc lập; commit; merge vào `main`; push. Mọi lệnh `bench` dưới đây chạy từ `main`, cây sạch, sau khi đọc `get_usage`, không lệnh `bench` nào khác cùng lúc, và không đụng checkout khi nó đang chạy; sau mỗi lệnh kiểm `meta.json` của thư mục kết quả (`kit.branch` là `main`, `kit.dirty: false`). Tên thư mục kết quả là thư mục chứa file `results.md` ở dòng `results:` mà lệnh in ra (đã có sẵn một thư mục phiên thử cũ `2026-10-01-bench-shell-01-src-command`; đừng đọc nhầm nó). Phiên thử: `node bin/bearingkit.cjs bench --task shell-01-src --config-dir C:/Projects/Bearingkit/_build/profile/claude --variants command --branches S --runs 1`, rồi `shell-src-tally.cjs` trên thư mục của nó: "source read: 1 of 1" thì đi tiếp; "0 of 1" thì dừng và báo owner. Đi tiếp: `node bin/bearingkit.cjs bench --task shell-01-src --config-dir C:/Projects/Bearingkit/_build/profile/claude --variants command --branches K,S --runs 8` (16 phiên xen kẽ, chạy nền), `shell-src-tally.cjs` trên thư mục đó. Báo cả những gì luật không định trước: nhánh K được bảo dùng `bk-build` có gọi tool `Skill` không và H của nó so với K tự nhiên của lượt chính (mô tả, không phép thử); phiên S2 nào đọc file skill thay vì gọi tool (luật vẫn tính là "được đọc"). Đọc lệnh bị từ chối bằng mắt, ghi kết quả vào spec, rà, commit, push.
- Nếu A: phương án này **chưa đủ để chạy ngay**; phần đã có là `node evals/analysis/shell-rep-run.cjs source` (17 phiên, trên `main`, không đụng lần lặp lại) và `node evals/analysis/shell-rep-tally.cjs shell-src-log.txt` (in token lượt đầu của nhóm cmd-S2 và phiên mốc). Còn thiếu, phải đề xuất và rà trước khi đo: (1) ghi câu đồng ý của owner vào spec thay chữ "PROPOSED"; (2) phiên hiệu chuẩn: một task mới `evals/bench/shell-01-src-bash/` (bản sao của `shell-01-src` gồm cả `build.cjs`, chỉ khác `id` và `commands.S` = `/antigravity-core-shell:bash-linux`), lệnh `--task shell-01-src-bash --variants command --branches S --runs 1`, và một cách đọc token lượt đầu của phiên đó (chưa công cụ nào in nó cho một thư mục không có trong log: lấy `usage` của sự kiện `assistant` đầu tiên trong `raw.jsonl`, hoặc mở rộng tally); (3) ngưỡng của phép hiệu chuẩn (hai file lệch 581 byte) viết vào spec trước khi chạy.
- Nếu C: ghi một dòng vào spec và `docs/status.md`, không đo.

Việc 4, theo câu trả lời 2: P5 (`docs/plans/2026-09-26-v03-roadmap.md` hàng P5; `docs/handoff/2026-09-30-p4-step0-measured.md` cho manh mối Bước 0 trên nhánh `p4-step0-scope`) hoặc `c-cpp` (nguồn: các hàng có mã 590, 1166, 1475 trong `docs/specs/2026-09-26-bk-build-idea-classification.md`; toolchain: mục "Installed" của `docs/compat/2026-09-27-cpp-toolchain-windows.md`, gọi bằng cách đặt `C:\msys64\ucrt64\bin` lên đầu PATH của riêng lệnh đó; mẫu spec và task là `shell-01`). Cả hai bắt đầu bằng một đề xuất (COUNCIL) rồi chờ owner; không dựng gì trước khi được duyệt.

Luật (tóm tắt, không thay bản đầy đủ): được đọc dưới `~/.claude` và `~/.gemini` nhưng không in bí mật và không đọc file credentials; mỗi bước ghi dưới hai thư mục đó, sửa repo khác, xoá, lưu trữ hay cài phần mềm thì hỏi owner một câu có, gom câu hỏi; không Python ngoài phạm vi câu 35, phiên chính và reviewer cấm cả `--version`; không thử lệnh bằng `--help`; cài kit chỉ từ marketplace, luôn `--scope user` và `--scope local`, và chỉ sau khi owner nói có; lệnh đưa owner chạy viết cho PowerShell 5.1, lệnh của shell khác thì bọc lại; script đọc output `node --test` ép `--test-reporter=tap`; script nhiều dòng ghi ra file bằng Write, chữ có regex, backtick hay dấu `\` sửa bằng công cụ Edit; đọc hạn mức và báo trước mỗi phép đo, runner tự dừng ở 90%; không hai lệnh `bench` cùng lúc; đăng ký phép đo trước mọi phiên, và đổi một luật đã đăng ký sau khi thấy dữ liệu là quyết định của owner; ít nhất 8 lượt mỗi nhánh được so và báo p; manh mối từ chỉ số phụ phải đo xác nhận trên phiên mới; so token chỉ giữa phiên cùng số tool; đo trước khi commit văn bản model đọc vào `main`; ghi skill nào thật sự được gọi và nguồn có được đọc không; không nói "tốt hơn nguồn" khi nguồn không được đọc hay nhánh so không phải nguồn; câu về tài liệu của host hay phiên bản không có trên máy phải có nguồn đọc trong phiên; rà độc lập trước mọi commit, kể cả bản sửa theo góp ý của reviewer, reviewer không đổi working tree và không chạy phiên đo; phiên chính Opus, agent đọc hàng loạt và reviewer Sonnet, phiên đo Sonnet 5; brief của mọi agent cấm lệnh nền, cấm ghi file, cấm gọi mạng và cấm tìm ngoài repo; hết hạn mức thì hỏi owner chuyển phần việc không đo sang cloud session; commit theo đường dẫn cụ thể, conventional commit, không dòng attribution, push sau mỗi thay đổi; handoff là file mới, chép nguyên văn lời owner; `docs/status.md` thay đúng ô, không chèn đoạn "Trước đó…", dưới ~15 KB; dừng ở 80% ngữ cảnh với handoff; khi đóng phiên làm hai phép thử độc lập (rà độ đầy đủ, diễn tập khởi động lạnh), sửa lỗ hổng, rồi dán nguyên `git status`. Trả lời bằng tiếng Việt, cuối mỗi khối việc có "Đã xong" và "Còn lại"."

### Live temporary bypasses

Không có.

### Đánh giá độc lập lần đóng phiên này

Vòng lặp kiểm tra resume prompt, mỗi vòng một agent Sonnet mới, chỉ đọc, "chạy thử trên giấy" từng lệnh so với repo:

- **Vòng 1**: mười lỗi. Sai thật: bước tính kết quả của phương án B (công cụ không đọc được thư mục biến thể `command`, và công cụ kia chỉ đọc log của driver). Thiếu: cảnh báo không đụng checkout khi driver đang chạy; `status.md` còn chữ cũ; phương án A dùng chế độ chạy lại cả lần lặp lại; ước lượng thời gian thấp; cách nhận ra commit đóng phiên dễ gãy; chỗ đọc lệnh bị từ chối; `get_usage` là công cụ của ứng dụng; task hiệu chuẩn thiếu `build.cjs`; tóm tắt luật thiếu mấy dòng. Đã sửa cả mười (sửa mã: `shell-src-tally.cjs`, tách chế độ driver, tham số tên log của tally).
- **Lượt rà mã và spec song song** (reviewer Sonnet): không lỗi phải sửa; hai chỗ chữ trong spec (phương án B đổi gì của Addendum 2; stream không ghi chữ được chèn nên "không thấy chữ của nguồn" chứng minh được ít), đã sửa; kiểm kiểm tra chế độ nên đứng trước các cổng, đã sửa.
- **Vòng 2** (agent khác): đường chính (Việc 2 và phương án B) được xác nhận từng bước: driver không tham số chỉ in cách dùng; cổng ngày, hai phép `git diff` kit, thứ tự lời gọi, kiểm số phiên, định dạng log và regex của tally khớp; hai câu của phương án B có nguyên văn trong spec; `shell-src-tally.cjs` đọc được cả hai loại thư mục và in đúng "source read: 0 of 1" trên phiên thử. Còn năm điểm: phương án A chưa đủ công cụ (giờ ghi rõ là chưa chạy ngay được và thiếu gì); cách xử lý khi driver dừng (dòng `STOP` cuối, dừng trước vòng nào, cây không sạch); nhãn "chưa đo" cho ước lượng thời gian; mục này còn trống. Đã sửa cả năm.
- **Vòng 3** (agent khác): đường chính được xác nhận lại (driver không tham số chỉ in cách dùng; vòng chạy lại được tính một lần; dòng `STOP` cũ không làm mất vòng hoàn chỉnh sau đó; danh sách "còn thiếu" của phương án A đúng với mã). Mười điểm nhỏ, đã sửa: ba dấu "được làm theo" chưa có công cụ in cho một thư mục (đã thêm vào `shell-src-tally.cjs`); driver bị tắt không để lại `STOP`; dừng vì hạn mức; tên thư mục phiên thử (đã có một thư mục cũ cùng loại); lệnh 16 phiên thiếu phần đầu và điều kiện chạy; danh sách đọc thiếu mục chứa luật "nguồn được đọc"; chữ "nhánh đang đo" chưa chính xác; `git log -3`; chưa nói làm gì khi chưa tới 07:00; dòng này còn trống.
- **Vòng 4** (agent của vòng 3 xác nhận phần vừa sửa): cả mười chỗ sửa đều có và đúng với mã; `shell-src-tally.cjs` chạy trên hai thư mục cũ in đúng hai dòng của nhánh S ("source followed (described): 0 of 1", "source read: 0 of 1"; và 0 of 8); **không còn lỗi nào trên đường chính** (Việc 1, Việc 2, Việc 3 phương án B). Hai điểm chữ cuối (dòng `results:` chỉ tới file `results.md`; dòng này), đã sửa. Không kiểm được trong cả bốn vòng: `claude plugin list`, số suite, `get_usage`, và mọi thứ chỉ thấy khi chạy thật (driver ở chế độ `replicate`, một phiên có nêu tên skill).
- Phương án A không nằm trên đường chính và được ghi rõ là chưa chạy ngay được.

### Lỗi quy trình trong phiên (báo owner)

- Driver được commit ở `97f5bd4`/`e1823e7` chạy mặc định một phép so mà đăng ký đã cấm; ba lượt rà trước đó không thấy; tìm ra ở lượt audit này, sửa trước khi có phiên nào chạy.
- Hai khuyến nghị của handoff trước (đồng ý ngưỡng token; `c-cpp` trước P5) đưa ra khi chưa xét đủ phương án; rút lại ở đây.
- `shell-src-tally.cjs` không đọc được thư mục biến thể `command` dù lượt đo dự kiến dùng biến thể đó; tìm ra ở vòng kiểm đầu của resume prompt, đã sửa.
