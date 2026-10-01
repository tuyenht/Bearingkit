# Handoff · 2026-10-01 · phiên P4 (máy owner, tiếp): audit, so `shell.md` với nguồn đã bọc, cập nhật bản cài

Tiếp nối `docs/handoff/2026-10-01-p4d-shell.md` trong cùng một phiên Desktop (Opus 5.5): Block 1 của nó vẫn đúng; Block 2 được thay bằng Block 2 dưới đây.

## Block 1 · Durable knowledge

### Lời owner trong phần này của phiên (nguyên văn)

- Trả lời bốn câu chờ quyết của handoff trước (cập nhật bản cài; so `shell.md` với chính nguồn của nó qua bản bọc; lặp lại `shell-01`; toolchain C++): "Audit kỹ các xử lý cũng như các phản hồi ở trên cho tôi.
Cho tôi các khuyến nghị xử lý tốt nhất phù hợp nhé.
Đồng ý cả bốn, tiếp tục theo khuyến nghị."

### Facts established (do not re-derive)

- **Audit phần việc `shell.md`** (ghi trong `docs/specs/2026-10-01-stack-shell-design.md`, "Audit corrections"): hai chỗ nói quá nguồn. (1) Spec viết quy tắc quyền `"PowerShell"` là "dạng host ghi trong tài liệu": viết theo trí nhớ, không đọc tài liệu nào; dữ liệu cho thấy tool PowerShell được gọi 191 lần trong 34 phiên `shell-01`, bị từ chối 3 lần. (2) Các câu về PowerShell 7 trong `shell.md` chưa chạy (máy không có bản 7) và không có nguồn; đã đối chiếu với trang `about_Character_Encoding` của Microsoft (đọc 2026-10-01): khớp. Chưa đối chiếu tài liệu: câu `2>&1`, câu `&&` (đều đã chạy trên 5.1), và câu "ba trong H2–H5 là mặc định trên bản 7". Số liệu đo của lượt chính không sai chỗ nào (hai reviewer của phiên tự tính lại, khớp; lượt rà đóng phiên tính lại lần nữa, khớp).
- **Runner** (`scripts/bench.cjs`, `checkSources`): một nguồn không có manifest plugin được nạp qua bản bọc (`wraps: { clone, files }`): mã pin kiểm trên bản clone, mỗi bản sao phải bằng đúng blob ở HEAD của clone, bản bọc không được chứa file nào khác, manifest chỉ có `name`, `version`, `description`. Test trong `tests/bench.test.cjs`.
- **Bản bọc nguồn**: `node evals/bench/shell-01-src/wrap.cjs` dựng `_build/wrappers/antigravity-core-shell/` (không theo dõi bằng git; giấy phép của nguồn cấm công bố chữ của nó) từ blob ở pin `1774280`. Task `shell-01-src` = `shell-01` chỉ khác `id` và `sources`.
- **Kết quả so với nguồn đã bọc** (spec, "Result of the addendum"; một lệnh `--task shell-01-src --branches K,S --runs 8`, 16 phiên, `p4e-shell-source@9bd195b`, `dirty: false`): K H trung bình 5,625, S2 4,500, hoán vị hai phía p = 0,028, K trên. **Nguồn được đọc ở 0/8 phiên** (plugin và hai skill có trong `init` của cả tám phiên, không phiên nào gọi hay mở file) → theo đăng ký: nguồn được cài nhưng không được đọc, không phải bằng chứng về chữ của nó. **`shell.md` vẫn "chưa so với nguồn"**; không chữ nào được nói nó tốt hơn nguồn.
- S2 thực chất là phiên không có trợ giúp: không phân biệt được với sàn của lượt chính (p = 0,47, so qua hai lệnh khác nhau, chỉ mô tả). Chi phí trung vị K 0,393 so với S2 0,245 USD (khoảng 1,6 lần); token chưa so. Mô tả hai skill nguồn viết bằng tiếng Việt, prompt bằng tiếng Anh: có thể là một lý do, stream không cho thấy.
- **Lượt K thứ hai** (cùng ngày, vài giờ sau, task id khác): H 5 6 6 5 6 6 6 5 (5,625), H1 8/8, H3 5/8; lượt chính K-sau 5,750, H1 8/8, H3 6/8. Nhất quán; không phải lần lặp lại vào ngày khác.
- Mọi nhánh của mọi lượt đo đều nạp hai plugin của host (`agents-md`, `telemetry`), như nhau ở K, S, S2, F.
- **Merge** `p4e-shell-source` vào `main` → `e410f4d` (đã push); suite 192/192. **Bản cài hằng ngày `e410f4d`** ở cả scope user lẫn local, kho Antigravity làm mới, doctor sáu `ok` một `skip`, ghi nhớ máy cập nhật: cả ba theo câu có của owner ở trên.
- **Toolchain C++ (mục 4, chưa làm)**: owner đã nói có; việc tải và cài cần một câu xác nhận kèm chi tiết, nên phiên này chỉ chuẩn bị số: `winget show MSYS2.MSYS2` → phiên bản 20260611, bộ cài `msys2-x86_64-20260611.exe` từ `github.com/msys2/msys2-installer` (trang phát hành), 94.016.640 byte theo header HTTP; ổ C còn 47 GB trống (91% đã dùng). Dung lượng sau khi cài kèm `gcc`, `cmake`, `ninja` qua `pacman`, và việc có cần quyền admin không: chưa đo.
- Dữ liệu thô ở `evals/results/` (không theo dõi bằng git): thêm `2026-10-01-bench-shell-01-src-natural`.
- Hạn mức (`get_usage`): khung 5 giờ 28% trước 16 phiên, 42% sau khi ghi kết quả và merge (gồm phiên chính và reviewer); tuần 28% → 29%. Ngữ cảnh phiên chính 51%.

### Decisions taken

- Mục 2 làm ngay hôm nay; mục 3 (lặp lại) **không** làm hôm nay vì định nghĩa của nó là "một ngày khác": lượt K thứ hai hôm nay chỉ được mô tả.
- Kết quả phụ lục không quyết định merge nào (ghi trước khi đo); nhánh merge sau khi rà.
- Cập nhật bản cài, kho Antigravity, ghi nhớ máy (owner nói có).

### Rejected options (do not re-propose)

- Chép chữ của hai skill nguồn vào repo để dựng bản bọc có theo dõi: giấy phép của nguồn cấm công bố.
- Gọi kết quả p = 0,028 là "tốt hơn nguồn": nguồn không được đọc.
- Coi lượt K thứ hai cùng ngày là lần lặp lại.

### Lessons (candidate lines)

- Cài một skill nguồn chưa đủ để so chữ: phải có số "nguồn được đọc" ghi trước, nếu không một nhánh không ai mở sẽ bị đọc nhầm thành "nguồn kém hơn".
- Câu về tài liệu của host hay về phiên bản không có trên máy phải có nguồn đọc trong phiên; viết theo trí nhớ là lỗi đã lặp lại ở lượt này.
- Bản sao từ working tree của một clone trên Windows không chắc bằng file đã commit (`core.autocrlf`): so với blob.

## Block 2 · Resume payload

### State

- `main` = `e410f4d` (merge `p4e-shell-source`) trở đi (commit đóng phiên đưa handoff này và `docs/status.md`). File stack 7/8; task benchmark 13.
- Bản cài hằng ngày và kho Antigravity ở `e410f4d`; `main` chỉ đi trước bằng commit tài liệu. Host cần khởi động lại để bản cài có hiệu lực.
- Nhánh đã nằm trong `main`, giữ lại, xoá cần owner nói có: `p4a-php`, `p4c-build-reach`, `p4b-topic-stackfiles`, `p4d-shell`, `p4e-shell-source` (`a6bb388`), `p4-runner-kit-rev` (chỉ local). Chỉ local, chỉ để đo: `p4d-shell-before` `13d2937` (kit như ở `fb45272`). Không merge: `p4-step0-scope` `303bebb` (cho P5); `claude/serene-franklin-3f3bb7` `6cb8427`.

### Decisions waiting on the owner

1. **Tải và cài MSYS2 cho `c-cpp`** (owner đã đồng ý mục này; cần một câu xác nhận cho đúng lệnh): `winget install --id MSYS2.MSYS2 -e` tải `msys2-x86_64-20260611.exe` (94.016.640 byte, khoảng 90 MiB, từ trang phát hành GitHub của MSYS2), rồi trong shell UCRT64: `pacman -S --needed mingw-w64-ucrt-x86_64-gcc mingw-w64-ucrt-x86_64-cmake mingw-w64-ucrt-x86_64-ninja` (dung lượng chưa đo; `winget` có thể hỏi quyền admin). Khuyến nghị: owner tự chạy hai lệnh này (cài phần mềm ngoài dự án), rồi phiên sau kiểm bằng `g++ --version`, `cmake --version`.
2. So chữ `shell.md` với chữ của nguồn bằng biến thể `command` (ép gọi skill ở cả hai nhánh): 16 phiên. Khuyến nghị: làm cùng lượt lặp lại bên dưới.
3. Lặp lại `shell-01` (K-sau, K-trước, 8 phiên mỗi nhánh) vào một ngày khác: đã đồng ý, chưa làm.

### Open threads

- `shell.md` chưa so với chữ của nguồn; kết quả lượt chính chưa lặp lại vào ngày khác; file, việc nêu trong hồ sơ và `detect-stack` chưa tách được.
- Ba chỗ của `shell.md` và spec còn dựa trên trí nhớ (xem Facts, mục audit); câu về quyền `"PowerShell"` trong phần đăng ký của spec vẫn nguyên chữ cũ, phần "Audit corrections" đính chính nó.
- `evals/analysis/shell-run.cjs` còn so K-trước với `main` và dùng tên nhánh `p4d-shell`: phải sửa (mốc `fb45272`, nhánh K-sau mới) và rà trước khi lặp lại.
- Mọi luồng mở của `docs/handoff/2026-10-01-p4d-shell.md` vẫn mở.

### Next work

1. Owner trả lời mục 1 và 2 ở trên.
2. Ngày khác: lặp lại `shell-01` (và, nếu owner đồng ý mục 2, biến thể `command` cho K và S2), đăng ký trước, sửa driver, rà, đo.
3. P5 (`bk-spec` + `bk-plan`): `docs/plans/2026-09-26-v03-roadmap.md` hàng P5, `docs/handoff/2026-09-30-p4-step0-measured.md`; bắt đầu bằng đề xuất (COUNCIL).

### Resume prompt

"Phiên tiếp của Bearingkit sau P4, trên máy owner, `C:\Projects\Bearingkit`. Đọc theo thứ tự: `docs/handoff/2026-10-01-shell-source-audit.md` (Block 2 trước); khối "Luật" trong lời owner ở `docs/handoff/2026-09-26-p3b-node-guard.md` (áp dụng nguyên văn); `docs/specs/2026-10-01-stack-shell-design.md` (từ "Measurement, registered before any session" tới hết); `docs/handoff/2026-10-01-p4d-shell.md` (Block 1); `docs/plans/2026-09-26-v03-roadmap.md` (hàng P5); `docs/status.md`. Lệch với repo thì tin repo, và ghi lại.

Đầu phiên: `git status`, `git fetch origin`, `git log --oneline -1` trên `main` (`e410f4d` hoặc commit đóng phiên sau nó), `node bin/bearingkit.cjs doctor` (sáu `ok`), `get_usage`, `claude plugin list` (mã in ra là mã commit; đúng khi `git diff --stat <mã đó> main -- skills hooks scripts agents` rỗng), suite `node --test --test-reporter=tap tests/*.test.cjs` (192/192; `bench-node-01` nhạy tải: nếu chỉ nó trượt thì chạy riêng file đó), `node evals/bench/shell-01-src/wrap.cjs` nếu `_build/wrappers/antigravity-core-shell/` không còn.

Việc: (1) hỏi owner hai câu của "Decisions waiting" (toolchain: owner tự chạy hay cho phép phiên chạy đúng hai lệnh đã ghi; biến thể `command`). (2) Nếu hôm nay là ngày khác 2026-10-01: lặp lại `shell-01`. Phụ lục đăng ký trước mọi phiên trong spec `shell-01`: K-sau = `main` hiện tại, K-trước = kit như ở `fb45272`, tức nhánh local `p4d-shell-before` `13d2937`, kiểm bằng `git diff fb45272 p4d-shell-before -- skills hooks agents scripts/detect-stack.cjs` rỗng (nếu `skills/`, `hooks/`, `agents/` của `main` đã đổi sau `ffa9b91` thì dừng và đề xuất lại định nghĩa K-trước), 8 phiên mỗi nhánh xen kẽ theo vòng. Chưa có đăng ký nào cho lần lặp lại trong spec: viết nó vào spec trước mọi phiên (phép thử: H, K-sau so với K-trước, hoán vị hai phía; "lặp lại được" khi p ≤ 0,05 với K-sau trên). Trước khi chạy phải sửa và rà: `evals/analysis/shell-run.cjs` (dòng 16–17 tên hai nhánh, K-sau là `main`; dòng 32 mốc so `main` → `fb45272`; bỏ lời gọi S và F ở vòng lặp; file log mới, không dùng lại `evals/results/shell-log.txt` vì tally lấy lần cuối của mỗi số vòng) và `evals/analysis/shell-tally.cjs` (nhãn theo tên nhánh mới ở dòng 32; tham số thư mục hiệu chỉnh và các hàng S, F không còn cần). Nếu owner đồng ý biến thể `command` (Sonnet 5, thư mục kết quả riêng): `--variants command` trên `shell-01-src`, lệnh của K là `/bearingkit:bk-build`, của S2 là `/antigravity-core-shell:powershell-windows` (thêm khoá `S` vào `commands` của `task.json`; `promptFor` ở `scripts/bench.cjs` ghép lệnh trước prompt), 8 phiên mỗi nhánh, kèm số "nguồn được đọc" và ngưỡng 4/8 như phụ lục trước; trước đó phải sửa hai tally (chúng chỉ khớp tên file `natural-…`, file của biến thể này tên `…-command-…`) và xem một phiên thử để biết stream ghi một lệnh gạch chéo thế nào (có thể không có lời gọi tool `Skill`, khi đó luật đếm "nguồn được đọc" phải viết lại trước khi đo). Rà độc lập trước commit và trước phiên đầu. (3) Sau đó P5, bắt đầu bằng đề xuất rồi chờ. `get_usage` trước mỗi lô; không hai lệnh `bench` cùng lúc; sau mỗi lệnh kiểm `meta.json`; đọc lệnh bị từ chối bằng mắt; báo skill được gọi.

Luật (tóm tắt; bản đầy đủ là khối Luật nói trên): không Python ngoài phạm vi câu 35, phiên chính và reviewer cấm cả `--version`; mỗi bước ghi dưới `~/.claude`/`~/.gemini`, sửa repo khác, xoá, lưu trữ hay cài phần mềm thì hỏi owner một câu có, gom câu hỏi; cài kit chỉ từ marketplace, luôn `--scope user` và `--scope local`; script đọc output `node --test` ép `--test-reporter=tap`; script nhiều dòng ghi ra file, chữ có backtick hay dấu `\` sửa bằng công cụ Edit; rà độc lập trước mọi commit, kể cả bản sửa theo góp ý của reviewer; phiên chính Opus, agent đọc hàng loạt và reviewer Sonnet, phiên đo Sonnet 5; brief của mọi agent cấm lệnh nền và cấm tìm ngoài repo; ít nhất 8 lượt mỗi nhánh được so và báo p; ghi skill nào thật sự được gọi và nguồn có được đọc không; không nói "tốt hơn nguồn" khi nguồn không được đọc hay nhánh so không phải nguồn; câu về tài liệu của host hay phiên bản không có trên máy phải có nguồn đọc trong phiên; commit theo đường dẫn cụ thể; handoff là file mới, chép nguyên văn lời owner; `docs/status.md` thay đúng ô, dưới ~15 KB; dừng ở 80% ngữ cảnh với handoff; khi đóng phiên làm hai phép thử độc lập (rà độ đầy đủ, diễn tập khởi động lạnh), sửa lỗ hổng, rồi dán nguyên `git status`. Trả lời bằng tiếng Việt, cuối mỗi khối việc có "Đã xong" và "Còn lại"."

### Live temporary bypasses

Không có.

### Đánh giá độc lập lần đóng phiên này

- **Rà độ đầy đủ** (Sonnet, chỉ đọc): không có lỗi phải sửa. Mọi mã commit và nhánh khớp git, không commit chưa push, `git diff p4e-shell-source main` rỗng; tự tính lại: K 5,625, S2 4,500, p = 0,0275, nguồn được đọc 0/8 (plugin và hai skill có trong `init` của cả tám phiên S), S2 so với F p = 0,467, Fisher H1 0,077 và 0,282, chi phí 0,393 và 0,245, 191 lời gọi PowerShell với 3 lần bị từ chối trong 34 phiên, `agents-md` và `telemetry` ở mọi `init`: khớp; `status.md` chỉ thay ô, 13 KB, 13 task, doctor sáu `ok` một `skip`; không chỗ nào nói `shell.md` tốt hơn nguồn; mục toolchain không khẳng định đã tải hay cài gì. Should-fix, đã sửa: "khoảng 90 MB" (đúng là 94,0 MB thập phân, 89,7 MiB). Ghi nhận: reviewer này đã ghi một file tạm ngoài repo rồi xoá, và gọi `git ls-remote` (chỉ đọc), trái lời dặn "không ghi file"; repo không đổi. Không kiểm được: số suite, `claude plugin list`, hạn mức, dung lượng ổ đĩa, lời owner so với chat.
- **Diễn tập khởi động lạnh** (Sonnet, chỉ đọc): 6/6 câu trả lời được kèm `file:line`, gồm đúng những gì được và không được nói về `shell.md`. Lỗ hổng, đã sửa trong resume prompt: lần lặp lại chưa có đăng ký trong spec (giờ ghi rõ phải viết trước); các dòng cần sửa của driver và tally; file log phải mới; lệnh S2 thiếu dấu `/`; hai tally không đọc được tên file của biến thể `command`; chưa biết stream ghi một lệnh gạch chéo thế nào nên luật "nguồn được đọc" có thể phải viết lại; điều kiện dựng K-trước rối (giờ là một phép `git diff`).

### Lỗi quy trình trong phiên (báo owner)

- Test cho `checkSources` viết sau khi sửa mã (không đỏ trước); phần "đỏ" là cùng ca đó chạy trên runner của `main` (từ chối một bản bọc chính xác), ghi trong spec.
- Bản nháp đầu của phần kết quả phụ lục viết "đây là phép so mà luật của owner yêu cầu" dù nguồn không được đọc; reviewer bắt được, sửa trước commit.
- Commit merge `e410f4d` không có lượt rà riêng (nội dung bằng đúng nhánh đã rà; suite 192/192 trên `main` trước khi push).
- Hai script sửa file có dấu `\` lại dừng ở kiểm tra "không khớp đúng một lần" (không ghi gì); sửa bằng công cụ Edit.
