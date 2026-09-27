# Handoff · 2026-09-26 · phiên P3a (cloud): chữ `node.md`, `python.md` và thiết kế đo

Branch **`claude/serene-franklin-3f3bb7`** (không phải `main`), đã push. Đọc file này trước khi tiếp tục. Handoff trước: `docs/handoff/2026-09-26-p2-bk-build-guard.md`; Block 1 của nó vẫn đúng, Block 2 của nó được thay bằng Block 2 dưới đây.

## Block 1 · Durable knowledge

### Lời owner mở phiên (nguyên văn)

"Phiên P3a của Bearingkit, chạy trên cloud: chỉ thiết kế và viết chữ, không đo. Đọc docs/handoff/2026-09-26-p2-bk-build-guard.md (Block 2 trước), rồi mục "Resume prompt" ở cuối file đó và làm theo phần "Luật", trừ các bước chỉ chạy được trên máy owner: doctor, claude plugin list, installed_plugins.json, get_usage, mọi phép đo bearingkit bench và việc cài kit; ghi rõ chúng thành việc của P3b. Việc: hai file stack node rồi python cho bk-build, theo docs/plans/2026-09-26-v03-roadmap.md. Viết thiết kế trong docs/specs/ gồm phép đo đăng ký trước (task, chỉ số, ngưỡng guard, Sonnet 5; phiên đo của task Python được chạy python -m pytest), cho một agent Sonnet chỉ đọc rà thiết kế và chữ; mỗi câu trong chữ phải có dòng nguồn đỡ, không viết theo fixture. Chọn model: phiên chính Opus, agent đọc hàng loạt và reviewer chạy Sonnet; brief agent cấm lệnh nền và cấm tìm ngoài repo. Không commit vào main; làm trên một nhánh riêng, push nhánh đó và viết handoff mới docs/handoff/<ngày>-p3a-stack-design.md, có resume prompt cho P3b chạy trên máy owner. Trả lời tôi bằng tiếng Việt, ngắn gọn, cuối mỗi khối việc có "Đã xong" và "Còn lại"."

### Facts established (do not re-derive)

- **Việc đã làm trên nhánh** (chưa có trên `main`):
  - `skills/bk-build/references/stacks/node.md` (46 dòng) và `python.md` (40 dòng);
  - `stacks/index.md`: hai hàng `node`, `python` thành "written", "five exist today", câu version card sửa theo;
  - `skills/bk-build/SKILL.md`: "(five of the eight exist)";
  - thiết kế và đăng ký đo: `docs/specs/2026-09-26-stack-node-python-design.md`, có bảng nguồn cho **từng câu** của hai file;
  - `docs/status.md` (ô §1, hàng file stack, mục 3 của §2) và dòng "Đang ở đâu" của roadmap.
- **Nguồn đọc được trên cloud**: bốn repo lấy bằng `git fetch --depth 1` đúng sha ghim trong `upstream/sources.json`, vào scratchpad (không vào repo): jeffallan/claude-skills `5e8b6b8`, cloudflare/skills `b052c32`, awesome-cursorrules `b044f95`, c0x12c/ai-toolkit `96b2c9d` (kiểm bằng `git rev-parse HEAD`).
- **tuyenht/Antigravity-Core ở sha ghim `1774280` không lấy được**: `git fetch` trả "not our ref". Vì vậy chữ chỉ dựa trên **5/26** hàng `node` và **7/22** hàng `python`; 21 + 15 hàng của Antigravity-Core **chưa đọc** (không phải bị loại). **Đính chính sau audit:** câu trước đây ở đây ("history bị viết lại hoặc pin sai") là sai. `upstream/sources.json` đã ghi: commit ghim được lấy ngày 2026-09-18 từ repo local của owner vào `_build/upstream/tuyenht_Antigravity-Core`; remote công khai chỉ có `1c744167` cũ hơn. Fetch từ cloud thất bại là đúng dự kiến.
- **Hai agent Sonnet đọc nguồn** (chỉ đọc, cấm lệnh nền, cấm tìm ngoài repo và thư mục nguồn): 41 hàng ứng viên cho `node`, 58 cho `python`. Phiên chính mở lại từng dòng được trích và đối chiếu. Hai bảng nằm trong scratchpad, không track; phần cần giữ đã chép vào bảng nguồn của spec.
- **Chỗ duy nhất kit tự thêm, không có dòng nguồn**: tên API Node `crypto.timingSafeEqual` (nguồn Cloudflare ghi `crypto.subtle.timingSafeEqual` của Web Crypto). Ghi rõ trong spec.
- **Reviewer độc lập (Sonnet, chỉ đọc, không Python)** mở mọi dòng được trích. Xác nhận: mọi câu có dòng nguồn, không chép gần nguyên văn từ Spartan (không licence), không câu nào mang danh từ của task, số hàng và số `detect-stack` khớp. Hai điểm should-fix:
  - trích dẫn "bare `gather` starts all" chỉ vào ví dụ semaphore: **đã sửa** (thêm `async-patterns.md:22-24`);
  - N1/Y1 cho vòng tuần tự (peak 1) qua, đề xuất ngưỡng peak ≥ 2: **bác**, vì file chỉ nói "có giới hạn", không nói "chạy song song"; đòi peak ≥ 2 là chấm một luật file không có. Thay vào đó: báo peak theo lớp (1, 2–199, không giới hạn) và nếu sàn tuần tự 2/3 phiên hiệu chỉnh thì kết luận N1 không phân biệt được.
- **Suite trên cloud**: 174 test, 168 pass, 5 fail, 1 skip — **giống hệt trên cây sạch** (`git stash`), nên không do thay đổi này. Năm test hỏng là của môi trường Linux cloud: orphan sau kill (`not ok 75`) và bốn test ghi state (`150`–`153`). Trên máy owner suite là 174/174 (P2); P3b chạy lại.
- **Node trên cloud** là v22.22.2; máy owner v25.3.0 (P2). `detect-stack` trên repo kit: `javascript`, không framework, `npm`, guardrail `npm test`.

### Decisions taken

- **Chữ viết trước, task chọn sau từ chính các câu của chữ.** Nhờ vậy task không thể nắn chữ; đổi lại task chỉ đo chữ trên chính địa bàn của nó (ghi ở "Limits").
- **Đăng ký hai task** `node-01` (N1 giới hạn đồng thời, N2 stdout chỉ có dữ liệu, N3 deadline mạng) và `py-01` (Y1 giới hạn fan-out, Y2 deadline, Y3 timestamp có múi giờ); chỉ số chính là tổng 0–3; X là chỉ số đối chứng (một luật file đó không có); R đo việc phiên có mở file stack hay không. Hiệu chỉnh, luật merge, guard, ngân sách: spec.
- **S** là nguồn cài như khi phát hành: `fullstack-dev-skills` (jeffallan) cho cả hai, cộng `cloudflare` cho `node-01`. Spartan và awesome-cursorrules không nạp được dạng plugin, nên S không có chúng, và spec ghi rõ.
- **Chữ không vào `main` trước khi đo đạt luật merge** (luật "đo trước khi commit văn bản model đọc"; nhánh riêng theo lời owner).

### Rejected options (do not re-propose)

- **Chỉ đối chiếu với fixture như ba file cũ.** Owner yêu cầu phép đo đăng ký.
- **Một task cho cả hai file.** Hai file không chung câu nào; fixture hai ngôn ngữ sẽ đo việc định tuyến qua `index.md` hơn là chữ.
- **Chấm bằng grep diff.** Cách này thưởng cho từ vựng của chữ.
- **Scorer tĩnh cho `py-01`** (grep `Semaphore`, `timeout`, `UTC`). Nó chấm chữ, không chấm hành vi.
- **Ngưỡng peak ≥ 2 cho N1/Y1** (lý do ở trên).
- **Câu "Use ES module syntax"** (awesome-cursorrules): repo kit là CommonJS, và `javascript-pro` bảo theo hệ module của dự án.
- **Mẫu catch-log-`return null` của `javascript-pro`**, và mẫu trả `{"error": "timeout"}` của `python-pro`: ngược với luật lỗi phải lan ra.

### Lessons (candidate lines; `.claude/lessons.log` chưa tồn tại, nên không ghi)

- RULE | Python | WHEN kiểm môi trường cloud THEN không gọi bất kỳ lệnh Python nào, kể cả `python3 -c 1` NOT "kiểm nhanh xem có Python không" | **phiên này đã chạy `python3 -c 1 2>/dev/null` một lần** trong lệnh liệt kê đầu phiên, trái luật "không Python (cấm cả `--version`)"; lệnh vô ích, không in gì, không lặp lại | 2026-09-26
- RULE | nguồn | WHEN pin trong `upstream/sources.json` không fetch được THEN đọc trường `local` của nguồn đó trước khi gọi là phát hiện, và báo số hàng chưa đọc NOT kết luận history bị viết lại | P3a gọi "not our ref" của Antigravity-Core là phát hiện, trong khi `sources.json` đã ghi pin chỉ có ở bản local; audit của owner bắt được | 2026-09-26
- RULE | agent kiểm tra | WHEN brief cấm Python THEN kiểm lời tự khai của agent sau khi nó trả lời NOT tin brief là đủ | reviewer audit (Sonnet) tự khai đã chạy `python3 -c "print(1)"` dù brief cấm; không đổi file, không mạng | 2026-09-26
- RULE | commit | WHEN hook dừng phiên đòi commit trong lúc reviewer còn chạy THEN chờ reviewer NOT commit trước | lặp lại bài học `aed9bb7`; phiên này đã chờ | 2026-09-26

## Block 2 · Resume payload

### State

- Nhánh `claude/serene-franklin-3f3bb7`, đã push. `main` không đổi (`43e4b37`).
- Chưa làm trên cloud, **là việc đầu tiên của P3b**: `doctor` (sáu `ok`), `claude plugin list`, version kit trong `installed_plugins.json` cả hai scope (`83467cb`), `get_usage`, suite trên Windows (phải 174/174), mọi `bearingkit bench`, cài kit.
- Chưa có fixture, scorer, test fixture của `node-01` hay `py-01`.

### Decisions waiting on the owner

**Cả ba đã chốt 2026-09-26 sau khi đóng P3a** (owner, nguyên văn: "Đồng ý cả ba khuyến nghị."), thành câu 35 của `docs/specs/2026-09-12-d5-owner-questions.md`. Owner cũng đã `git fetch` và `git switch` sang nhánh trên máy mình (cây sạch). Bản trình trước đó:

1. **Python trong scorer và test fixture của `py-01`** (COUNCIL). Ngoại lệ hiện tại chỉ cho phiên đo. Scorer (O1, O2, Y1–Y3, X) và test fixture (đỏ rồi xanh trên bản port tham chiếu) phải chạy `python -m pytest` và `python -m stock` trên fixture. **Khuyến nghị: mở rộng ngoại lệ cho scorer và test fixture của `py-01`**, chỉ trên fixture, chỉ qua `python -m`. Nếu không, `py-01` không dựng được và `python.md` nằm lại trên nhánh.
2. **Antigravity-Core** (COUNCIL, vì là repo khác): pin `1774280` chỉ có ở bản local `_build/upstream/tuyenht_Antigravity-Core` (không có trên GitHub). P3b cho một agent Sonnet đọc 36 hàng từ bản đó, nếu nó đúng pin; nếu không, hỏi owner đổi pin hay đọc HEAD. Câu nào thêm vào hai file từ đó phải qua reviewer trước mọi phiên đo.
3. **Tách P3b / P3c**: khuyến nghị P3b chỉ `node-01`, P3c `py-01` (mỗi task tối đa 32 phiên nếu đo đủ).

### Open threads

- Tất cả luồng của `docs/handoff/2026-09-26-p2-bk-build-guard.md` (Open threads) vẫn mở: chấm P6 không bắt "reverting"; nhánh S của `build-01` chưa chạy; bẫy X1 `review-02`; ba điểm `bk-review`; timeout runner; B10, B12, B15; LSP và context7; gỡ Superpowers và `fullstack-dev-skills`; push `a0cda92` của repo KB; `detect-stack` bị profile từ chối.
- **Gỡ `fullstack-dev-skills` khỏi bản cài hằng ngày đụng S của P3b**: S nạp bản ghim qua `--plugin-dir`, không dùng bản cài, nên không chặn; nhưng đừng gỡ bằng cách xoá `_build/upstream/jeffallan_claude-skills`.
- Năm test hỏng trên Linux cloud (75, 150–153): không phải lỗi của nhánh; nếu cần chạy suite trên cloud lâu dài thì là việc riêng.

### Đánh giá độc lập lần đóng phiên này

- Reviewer thiết kế và chữ: ở trên.
- Diễn tập khởi động lạnh từ resume prompt: kết quả ghi ở cuối file (mục "Cold start").
- Rà độ đầy đủ so với transcript: **không làm**. Agent con của phiên cloud không đọc được transcript phiên chính (brief cấm đọc file output của agent và ngoài repo). Phần bù: mọi con số trong file này đều trỏ tới file hoặc lệnh kiểm được.

### Live temporary bypasses

- Không có. Không file nào của nhánh chứa `TEMPORARY` hay `REMOVE`.

### Next work (P3b, trên máy owner)

1. Đầu phiên như Resume prompt dưới.
2. Câu 35 đã chốt. Kiểm `git -C _build/upstream/tuyenht_Antigravity-Core rev-parse HEAD` bằng `1774280…`; đúng thì một agent Sonnet đọc 36 hàng (21 `node`, 15 `python`, danh sách trong `docs/specs/2026-09-26-bk-build-idea-classification.md`), không đúng thì dừng và hỏi. Câu mới nào vào hai file phải có dòng nguồn và qua reviewer trước mọi phiên đo. `py-01` để P3c.
3. Dựng `evals/bench/node-01/` đúng đăng ký: `build.cjs`, `app/`, `task.json`, phần chấm riêng của task (server giả, N1–N3, O1, X) trong `check()` của `evals/bench/node-01/build.cjs` như `build-01`; chỉ phần đọc stream dùng chung (R: skill gọi, file stack mở) vào `scripts/lib/bench-score.cjs`, có test; test fixture trong `tests/` đỏ trước rồi xanh (cây gốc xanh; bản port tuần tự không deadline trượt N3; bản port `Promise.all` trượt N1; bản tham chiếu qua cả ba). Rà độc lập **trước** commit. Tạo trước bản cloudflare/skills ở `b052c32` trong `_build/upstream/cloudflare_skills` (chưa có trên máy). `node bin/bearingkit.cjs bench --task node-01 --config-dir _build/profile/claude --branches F,S,K --runs 1 --dry-run` phải in kế hoạch có ba nhánh và không báo `sources not as released` (khi đúng pin, runner không in gì về nguồn).
4. Hiệu chỉnh ba phiên F; đọc bằng mắt mọi lệnh bị từ chối; quyết usable hay guard theo spec.
5. Đo theo nhánh đã quyết. F, S, K-after chạy từ `C:\Projects\Bearingkit` (nhánh này). K-before chạy từ một worktree của nhánh local tạo từ nhánh này với phần `skills/` của P3a revert lại (không dùng worktree của `main`: `main` chưa có `evals/bench/node-01/`); trước phiên đầu, `git diff main -- skills/ hooks/ agents/` ở đó phải rỗng; `--config-dir` trỏ tuyệt đối về `C:\Projects\Bearingkit\_build\profile\claude`. Xen kẽ K-before và K-after theo lượt `--runs 2`, bốn vòng mỗi bên, K-before trước; không chạy hai lệnh bench cùng lúc (chung thư mục fixture). Đạt luật merge thì đưa riêng `node.md` vào `main` (hàng `python` của `index.md` giữ "not written yet", `SKILL.md` ghi "four of the eight"), push `main`, cập nhật cài hằng ngày từ marketplace cả `--scope user` và `--scope local`, làm mới kho Antigravity, `doctor`.

### Resume prompt

"Phiên P3b của Bearingkit, trên máy owner, trong `C:\Projects\Bearingkit`, nhánh `claude/serene-franklin-3f3bb7` (owner đã `git switch` và `git pull`, HEAD `f39726d` hoặc mới hơn). Đọc `docs/handoff/2026-09-26-p3a-stack-design.md` (Block 2 trước), rồi `docs/specs/2026-09-26-stack-node-python-design.md` (đăng ký đo, đã qua reviewer và đính chính sau audit), `skills/bk-build/references/stacks/node.md`, `docs/specs/2026-09-26-bk-build-design.md` và `evals/bench/build-01/` (mẫu fixture và scorer), `docs/status.md`. Prompt này chỉ tóm tắt; lệch với repo thì tin repo.

Đầu phiên: `git status` (sạch, đúng nhánh), `git log --oneline -1`, `node bin/bearingkit.cjs status`, `node bin/bearingkit.cjs doctor` (sáu `ok`), `get_usage`, `claude plugin list`, version kit trong `~/.claude/plugins/installed_plugins.json` cả user lẫn local (`83467cb`; ghi lại, không sửa), suite `node --test tests/*.test.cjs` (174/174 trên Windows), `Get-Command python` (không chạy Python), `git -C _build/upstream/tuyenht_Antigravity-Core rev-parse HEAD` (phải bắt đầu `1774280`), `git -C _build/upstream/jeffallan_claude-skills rev-parse HEAD` (phải bắt đầu `5e8b6b8`).

Đã chốt, không hỏi lại: D1–D4 (câu 34 của `docs/specs/2026-09-12-d5-owner-questions.md`); câu 35 (Python trong scorer và test fixture `py-01` qua `python -m`; Antigravity-Core đọc từ `_build/upstream/tuyenht_Antigravity-Core` nếu đúng pin `1774280`, không đúng thì dừng và hỏi; P3b chỉ `node-01`, `py-01` để P3c); gọn `docs/status.md`; đăng ký đo của spec P3a (task, chỉ số, ngưỡng, Sonnet 5, cách chạy K-before và xen kẽ); việc bác ngưỡng peak ≥ 2.

Việc của phiên, theo thứ tự: (1) một agent Sonnet đọc 36 hàng Antigravity-Core (21 `node`, 15 `python`) từ bản local; câu nào thêm vào `node.md` hay `python.md` phải có dòng nguồn, ghi vào bảng nguồn của spec, và qua reviewer Sonnet trước mọi phiên đo. (2) Dựng `evals/bench/node-01/` đúng đăng ký; test fixture trong `tests/` đỏ trước rồi xanh; rà độc lập trước commit. (3) Clone cloudflare/skills ở `b052c32` vào `_build/upstream/cloudflare_skills`; `node bin/bearingkit.cjs bench --task node-01 --config-dir _build/profile/claude --branches F,S,K --runs 1 --dry-run` phải in kế hoạch có ba nhánh và không báo `sources not as released` (khi đúng pin, runner không in gì về nguồn). (4) Hiệu chỉnh ba phiên F; đọc bằng mắt mọi lệnh bị từ chối; quyết usable hay guard theo spec. (5) Đo theo nhánh spec quyết: F, S, K-after từ checkout này; K-before từ worktree của một nhánh local bằng nhánh này trừ phần `skills/` của P3a (không dùng worktree của `main`, vì `main` chưa có `node-01`), `git diff main -- skills/ hooks/ agents/` ở đó phải rỗng, `--config-dir` tuyệt đối về `C:\Projects\Bearingkit\_build\profile\claude`; K-before và K-after xen kẽ theo lượt `--runs 2`, bốn vòng mỗi bên, K-before trước; không bao giờ chạy hai lệnh bench cùng lúc. (6) Ghi kết quả vào spec. Đạt luật merge thì đưa riêng `node.md` vào `main` (hàng `python` của `index.md` giữ "not written yet", `SKILL.md` ghi "four of the eight"), push `main`, cập nhật cài hằng ngày từ marketplace, làm mới kho Antigravity, `doctor`. Không đạt thì để trên nhánh và hỏi tôi. Khi đóng phiên, làm hai phép thử độc lập (rà độ đầy đủ so với transcript; diễn tập khởi động lạnh), sửa lỗ hổng trước commit cuối, rồi dán nguyên `git status`.

Luật: tôi cho phép đọc dưới `~/.claude` và `~/.gemini` (không in bí mật, IP, tên máy, không đọc file credentials); mỗi bước ghi dưới hai thư mục đó, sửa repo khác, xoá hay lưu trữ thì hỏi tôi một câu có, gom câu hỏi; lệnh đưa tôi chạy viết cho PowerShell; script nhiều dòng ghi ra file bằng Write, JSON có regex thì sửa bằng Edit; không `--help` thử; không Python (ngoại lệ: pytest và `epp check` của repo KB; các phiên đo của task Python, được chạy `python -m pytest` trên fixture qua quyền của task; scorer và test fixture của `py-01`, qua `python -m`, owner đã nói có ở câu 35), phiên chính và reviewer cũng vậy (cấm cả `--version`) và kiểm lời tự khai; đọc hạn mức trước mỗi phép đo, báo trước khi chạy, runner tự dừng ở 90%; so token chỉ giữa phiên cùng số tool; ghi skill nào thật sự được gọi ở mỗi nhánh; không đo Claude Code và Antigravity cùng lúc trên cùng fixture; mọi lượt đo Antigravity cần câu duyệt riêng; ít nhất 8 lượt mỗi nhánh và báo p; manh mối từ chỉ số phụ phải đo xác nhận trên phiên mới; đo trước khi commit văn bản model đọc vào `main`; rà soát độc lập trước commit, reviewer không đổi working tree hay chạy phiên đo; brief của mọi agent cấm lệnh nền và cấm tìm ngoài repo (không `find /`), agent phải dừng mọi việc nền trước khi trả lời, và thông báo nào nói agent "còn việc nền" thì dừng agent đó và kiểm tiến trình sót; phiên chính Opus, agent đọc hàng loạt và reviewer Sonnet, phiên đo Sonnet 5; commit theo đường dẫn cụ thể; không bao giờ cài kit từ checkout local (chỉ từ GitHub marketplace), cập nhật cài hằng ngày luôn ghi `--scope user` và `--scope local`; hết hạn mức thì hỏi tôi chuyển phần việc không đo sang cloud session; handoff là file mới; `docs/status.md` thay đúng ô, không chèn đoạn "Trước đó…", giữ dưới khoảng 15 KB (§7 của file đó); dừng ở 80% ngữ cảnh với handoff; chép nguyên văn lời owner vào handoff. Tiếp tục theo khuyến nghị tốt nhất; rà lại trước khi làm, re-check sau khi làm."

### Cold start

Diễn tập (Sonnet, chỉ đọc, chỉ bắt đầu từ resume prompt): 12/12 câu đúng, mỗi câu kèm `file:line`. Hai lỗ hổng đã vá trước commit cuối: số dòng `python.md` thiếu trong Facts; chỗ đặt scorer của `node-01` còn bỏ ngỏ (nay: `check()` trong `build.cjs` của task, phần đọc stream dùng chung vào `bench-score.cjs`). Không thấy mâu thuẫn giữa handoff, spec và `docs/status.md`.
