# Handoff · 2026-09-26 · phiên P2: fixture `build-01`, hiệu chỉnh, guard, `major-upgrade.md`

Branch `main` · working tree sạch sau commit cuối · đã push. Đọc file này trước khi tiếp tục. Phiên này nối tiếp phiên P1 trong cùng cuộc trò chuyện. Handoff trước: `docs/handoff/2026-09-26-p1-bk-build-design.md`; Block 2 của nó được thay bằng Block 2 dưới đây.

## Block 1 · Durable knowledge

### Lời owner sau khi đóng P1 (nguyên văn)

1. "Audit kỹ các phản hồi cũng như các chỉnh sửa ở phía trên kỹ cho tôi nhé.
   Sau khi hoàn thành yêu cầu trên, thực hiện yêu cầu theo khuyến nghị: Đồng ý D1 không cắt, tiếp tục P2."
2. Chọn trong câu hỏi sau hiệu chỉnh: "Guard, nới quyền (Recommended)".
3. "Trường hợp hết hạn mức, tôi muốn đổi sang chạy theo cái này (Cloud session)", kèm ảnh chụp thẻ "Cloud session credits": còn $247 trên $250, hết hạn 2:59 PM GMT+7 ngày 5 tháng 11.
4. "Tôi chọn Opus 5.5 nhưng tuỳ vào tình trạng, tính chất công việc mà bạn sẽ tự động điều phối các Model phù hợp, tôt nhất cho các task cho tôi nhé."
5. "Lưu ý và luôn ghi nhớ rằng, yêu cầu "Tôi chọn Opus 5.5 nhưng tuỳ vào tình trạng, tính chất công việc mà bạn sẽ tự động điều phối các Model phù hợp, tôt nhất cho các task cho tôi nhé." là áp dụng toàn bộ, toàn cục cho mọi dự án đấy nhé."
6. Chọn trong câu hỏi cài hằng ngày: "Có (Recommended)".

### Facts established (do not re-derive)

- **Audit sau P1**:
  - `f3bfad7` được xác minh là commit của phiên "Owner-migration phase 2 activation" (tìm trong transcript của phiên đó);
  - hai lỗi của đoạn đăng ký đã sửa trước khi có phiên đo: danh sách chỉ số báo kèm thiếu H; khoảng chi phí ghi 0,13–0,34 USD, đúng là 0,11–0,77 USD tính cả `review-01` (`a2af919`).
- **D1 đã chốt**: owner đồng ý không cắt (`1552e75`, ghi trong `docs/specs/2026-09-26-kit-cost-split.md`).
- **Fixture `build-01`** (`evals/bench/build-01/`):
  - thư viện ngày vendor hai bản, có ba thay đổi cài sẵn;
  - phần chấm gồm `baselineFirst`, `commitAttempts`, `asksApproval` trong `scripts/lib/bench-score.cjs`; `check(dst, raw)` nhận stream, và `scripts/bench.cjs` truyền stream cho mọi task;
  - test là `tests/bench-build-01.test.cjs`, thấy đỏ trước (thiếu module), rồi xanh;
  - suite hiện là 174/174.
- **Rà soát độc lập fixture và phần chấm** (Sonnet), chạy sau commit `aed9bb7`. Như vậy là **sai luật "rà soát độc lập trước commit"**; phiên đã nhận sai và rà ngay, trước mọi phiên đo. Các điểm tìm ra đã sửa trong `2bf769f`:
  - O2 chỉ đọc chỗ `require`/`import`;
  - H nhận cả dạng câu khẳng định;
  - xoá bản v1 cũ là dọn dẹp, còn sửa v1 tại chỗ vẫn tính;
  - P4, P5, H có trong báo cáo.
  Mỗi bản sửa có đối chứng: test mới đỏ trên phần chấm cũ, xanh trên phần chấm mới.
- **Hiệu chỉnh trên sàn** (`evals/results/2026-09-26-bench-build-01-natural/`, 3 phiên F):
  - theo chữ quy tắc, P1 1/3, nên task dùng được;
  - đọc bằng mắt, F1 và F2 đã định chạy test trước khi sửa (`cat … && npm test`, `cat …; npm test`), nhưng profile từ chối (lệnh ghép, `npm` không có trong danh sách cho phép), nên theo ý định là 3/3;
  - O1 3/3 (O1: dòng CSV ngày `01/02/2026` vẫn nhập thành 2 tháng 1).
  Phiên dừng và hỏi owner (`38e5a87`).
- **Rà soát độc lập bản chữ trước guard** (Sonnet). Hai câu viết theo fixture chứ không theo nguồn (cấm sửa code vendor; bước pilot có điều kiện) đã được sửa lại theo nguồn trước mọi phiên guard.
- **Guard** (`evals/results/2026-09-26-bench-build-01-natural-2/`, 8 phiên K, Sonnet 5, 31 tool):
  - O1, O2, O3, P3 đều 8/8, nên theo quy tắc bản chữ được commit;
  - P1 8/8, P2 8/8 (sàn 1/3), P6 7/8 đọc bằng mắt (6 theo chấm, vì regex không bắt "Going back means reverting");
  - P5 0/8, H 0/8;
  - 8/8 phiên gọi `bk-build` và mở `major-upgrade.md`;
  - chi phí trung vị 0,279 USD, gấp 1,9 lần sàn (0,146, sàn chạy với quyền hẹp hơn).
- **Bảy absorb của `bk-build` đã port hết**: bốn từ Superpowers (`executing.md`, trước đây) và ba dòng kiểm kê 213, 214, 224 của `code-modernization` (`major-upgrade.md`, `faedb82`), với `NOTICE` và `derived`; `tests/skills.test.cjs` canh cả ba, và đỏ khi thiếu `derived` (đối chứng trong phiên).
- **Bản cài hằng ngày**: `83467cb` ở cả scope user lẫn local, kiểm trong `installed_plugins.json`. `claude plugin update bearingkit@bearingkit` chạy không kèm `--scope` trong thư mục dự án chỉ cập nhật scope local; scope user cần `--scope user`.
- **Kho Antigravity** đã làm mới; `doctor` sáu `ok`.

### Decisions taken

- **Sprint `bk-build` đóng.**
  - Commit `references/major-upgrade.md` (36 dòng), dòng "Read first" và dòng Sources trong `SKILL.md`, `NOTICE`, `derived` (`faedb82`).
  - Kết quả ghi trong `docs/specs/2026-09-26-bk-build-design.md` (`83467cb`).
  - Không có câu "tốt hơn nguồn": nhánh S chưa chạy.
- **Nới quyền cho mọi nhánh của `build-01`** theo lựa chọn của owner (lời 2): thêm `npm test`, `npm run test`, `cat`, `ls`, `grep`, `head`, `tail`.
- **Quy tắc chọn model là toàn cục** (lời 4, 5): ghi vào `~/.claude/CLAUDE.md`, mục "Model routing (all projects)". Memory dự án chỉ giữ phần riêng: model của benchmark theo đăng ký, reviewer chạy Sonnet.
- **Hết hạn mức thì chuyển sang cloud session** (lời 3): chỉ phần việc không đo; benchmark vẫn chạy local. Ghi ở memory `cloud-session-fallback.md`. Chuyển phiên vẫn hỏi owner một câu.

### Rejected options (do not re-propose)

- **Đo đủ 29 phiên với quyền cũ.** Chỉ số chính khi đó đo xem lệnh có lọt luật quyền không, không đo quy trình.
- **Hiệu chỉnh lại với quyền mới.** Theo ý định, sàn đã đạt 3/3, nên rất có thể lại rơi vào guard; tốn thêm 3 phiên.
- **Câu "không sửa code vendor" và pilot có điều kiện trong `major-upgrade.md`.** Viết theo fixture, không có dòng nguồn nào đỡ.
- **Chạy benchmark trên cloud session.** Khác host, thiếu `_build/` không track; chưa kiểm được phiên `claude -p` lồng nhau.

### Lessons (candidate lines for the lessons log; `.claude/lessons.log` chưa tồn tại, nên không ghi)

- RULE | benchmark | WHEN một chỉ số quy trình đọc từ stream THEN hiệu chỉnh xong phải đọc bằng mắt các lần trượt, tìm lệnh bị từ chối NOT tin số chấm | P1 của sàn 1/3 theo chấm, 3/3 theo ý định | 2026-09-26
- RULE | commit | WHEN mã chấm hay fixture mới xong THEN rà độc lập trước commit NOT commit rồi mới rà | `aed9bb7` commit trước khi rà | 2026-09-26
- RULE | viết chữ skill | WHEN viết bản chữ sẽ đo trên một fixture THEN mỗi câu phải có dòng nguồn đỡ NOT thêm câu khớp chỉ số của fixture | reviewer bắt hai câu | 2026-09-26
- RULE | agent kiểm tra | WHEN giao việc cho agent chỉ đọc THEN brief cấm lệnh nền và cấm tìm ngoài repo, và khi thông báo nói agent "còn việc nền" thì dừng nó và dọn tiến trình NOT bỏ qua thông báo | sau khi đóng P2, agent rà độ đầy đủ để `find / -iname installed_plugins.json` chạy 1 giờ 26 phút và đọc một file ngoài brief; owner phát hiện, phiên đã dừng agent và tắt tiến trình | 2026-09-26
- RULE | cài hằng ngày | WHEN cập nhật plugin THEN luôn ghi `--scope user` và `--scope local` NOT lệnh không có scope | lệnh không scope chỉ cập nhật local | 2026-09-26

## Block 2 · Resume payload

### State

- HEAD = `origin/main`. Working tree sạch sau commit đóng phiên. Suite 174/174. `doctor` sáu `ok`.
- Bản cài hằng ngày `83467cb` ở cả hai scope. Anh cần khởi động lại Claude Code để nạp bản mới.
- Kết quả đo (không track): `evals/results/2026-09-26-bench-build-01-natural/` (hiệu chỉnh) và `…-natural-2/` (guard).
- Không track, còn dùng được: `_build/bk-build-sprint/`, `_build/cost-split/`.

### Decisions waiting on the owner

**Cả ba đã chốt 2026-09-26 sau khi đóng P2** (owner, nguyên văn: "Chốt D2, D3, D4 theo khuyến nghị"), thành câu 34 của `docs/specs/2026-09-12-d5-owner-questions.md`: D2 không đưa vào protocol; D3 `bk-close --verify` ở P6; D4 một lượt chấp nhận Antigravity ngắn ở P7, đã duyệt trước. Bản trình trước đó:


1. **D2: có đưa ngoại lệ "không tự commit" vào `bk-protocol` không.** Số liệu mới:
   - `build-01` Sonnet: kit 0/8, sàn 0/3;
   - cộng các số trước: Sonnet chưa phiên nào tự commit; Haiku trên `debug-01` kit 0/8 sau dòng "dừng ở bản sửa".
   Khuyến nghị: không đưa vào protocol, vì trên Sonnet không có vấn đề để sửa và protocol đã sát trần ký tự. Xem lại nếu Haiku thành model hằng ngày.
2. **D3: bước đánh giá độc lập cho `bk-close`.** Khuyến nghị: có, dạng tuỳ chọn `--verify`, ở P6.
3. **D4: đo Antigravity.** Nay có bốn skill đã đổi: `bk-review`, `bk-debug`, `bk-test`, `bk-build`. Cần câu duyệt riêng; dự kiến P7.

### Open threads

- **Chấm P6** không bắt "reverting" hay "going back". Sửa trước lần đo `build-01` kế tiếp, có test; lần này đã đọc bằng mắt.
- **So với nguồn trên `build-01`** chưa chạy (nhánh S), nên `bk-build` vẫn là "chưa so" theo luật của owner.
- **Các luồng mang từ `docs/handoff/2026-09-26-p1-bk-build-design.md`**:
  - bẫy X1 trên `review-02`;
  - ba điểm của `bk-review`;
  - timeout của runner;
  - task lỗi chỉ lộ khi chạy code, và diff lớn hơn một bậc: chưa dựng;
  - B10; B12 (cú pháp quyền PowerShell chưa xác minh); B15 (auto-update chưa thấy chạy ở scope local, nên vẫn cập nhật tay cả hai scope);
  - lệnh nền không rõ lúc đóng phiên 2026-09-26;
  - (14) LSP và context7;
  - gỡ Superpowers và `fullstack-dev-skills`;
  - push `a0cda92` của repo KB;
  - `detect-stack` bị profile từ chối (sửa cùng lần đổi protocol kế tiếp, có đo).

### Đánh giá độc lập lần đóng phiên này (Sonnet, chỉ đọc)

- Rà độ đầy đủ so với transcript: 9/10. Đã bổ sung trạng thái bảy absorb và nghĩa của O1.
- Diễn tập khởi động lạnh: 12/12 câu đúng, kèm `file:line`. Đã bổ sung mô tả repo kit là dự án Node CommonJS, vì agent đoán nhầm là TypeScript.

### Live temporary bypasses

- Không có. Kiểm bằng `git diff --name-only 3d83241..HEAD` cộng file này, `docs/status.md` và plan: không file nào chứa marker `TEMPORARY` hay `REMOVE`.
- Bước 5 của `bk-close`: lời 1 là nghi thức audit thường trực. Không có cụm sửa sai nào theo `correction-cues.md`. `.claude/lessons.log` chưa tồn tại, nên không ghi gì.

### Next work

1. **Đầu phiên:** `git status`, `node bin/bearingkit.cjs status`, `doctor`, `get_usage`, `claude plugin list`, và version kit trong `installed_plugins.json` (phải là `83467cb` ở cả hai scope; ghi lại, không sửa).
2. **P3**, theo `docs/plans/2026-09-26-v03-roadmap.md`: file stack `node` rồi `python`.
   - Đầu vào: 26 và 22 dòng trong `docs/specs/2026-09-26-bk-build-idea-classification.md`.
   - `node` đối chiếu version card với chính repo kit. Repo kit là dự án Node CommonJS thuần, không TypeScript: `package.json` ghi `engines.node >=20`, không có dependency nào; mã nằm ở `scripts/*.cjs` và `bin/`; test chạy bằng `node --test`. Máy này chạy Node v25.3.0 (đo 2026-09-26). Phần TypeScript và React đã thuộc `typescript-react.md`.
   - Theo công thức sprint: spec, chữ, test fixture stack (`tests/fixtures/stacks`), đo trước khi commit văn bản model đọc, rà độc lập trước commit.
   - Chọn model theo mục "Model routing" của `~/.claude/CLAUDE.md`.
3. **Sau P3:** P4, gồm `php-laravel`, `shell`, `c-cpp`.

### Resume prompt

"Đọc `docs/handoff/2026-09-26-p2-bk-build-guard.md` (Block 2 trước), rồi `docs/plans/2026-09-26-v03-roadmap.md` (đang ở P3), `docs/specs/2026-09-26-bk-build-idea-classification.md` (dòng `node` và `python`), `skills/bk-build/references/stacks/` (ba file có sẵn làm mẫu, và `index.md`), `docs/specs/2026-09-26-bk-build-design.md` (sprint gần nhất làm mẫu), `docs/status.md`. Prompt này chỉ tóm tắt; lệch với repo thì tin repo.

Đầu phiên: `git status` (sạch là đúng), `node bin/bearingkit.cjs status`, `doctor` (sáu `ok`), `get_usage`, `claude plugin list`, version kit trong `~/.claude/plugins/installed_plugins.json` cả user lẫn local (`83467cb`; ghi lại, không sửa).

Việc của phiên (P3): hai file stack `node` rồi `python` theo công thức sprint; thiết kế trước, rà độc lập trước commit, đo trước khi commit văn bản model đọc; mỗi câu trong chữ phải có dòng nguồn đỡ, không viết theo fixture. Khi đóng phiên, làm hai phép thử độc lập (rà độ đầy đủ so với transcript; diễn tập khởi động lạnh từ resume prompt), sửa lỗ hổng trước commit cuối, rồi dán nguyên `git status`.

Luật: tôi cho phép đọc dưới `~/.claude` và `~/.gemini` (không in bí mật, IP, tên máy, không đọc file credentials); mỗi bước ghi dưới hai thư mục đó, sửa repo khác, xoá hay lưu trữ thì hỏi tôi một câu có, gom câu hỏi; lệnh đưa tôi chạy viết cho PowerShell; script nhiều dòng ghi ra file bằng Write, JSON có regex thì sửa bằng Edit; không `--help` thử; không Python (ngoại lệ pytest và `epp check` của repo KB), reviewer cũng vậy (cấm cả `--version`) và kiểm lời tự khai; đọc hạn mức trước mỗi phép đo, báo trước khi chạy, runner tự dừng ở 90%; so token chỉ giữa phiên cùng số tool; ghi skill nào thật sự được gọi ở mỗi nhánh; không đo Claude Code và Antigravity cùng lúc trên cùng fixture; mọi lượt đo Antigravity cần câu duyệt riêng; ít nhất 8 lượt mỗi nhánh và báo p; manh mối từ chỉ số phụ phải đo xác nhận trên phiên mới; đo trước khi commit văn bản model đọc; rà soát độc lập trước commit, reviewer không đổi working tree hay chạy phiên đo; commit theo đường dẫn cụ thể; không bao giờ cài kit từ checkout local (chỉ từ GitHub marketplace), cập nhật cài hằng ngày luôn ghi `--scope user` và `--scope local`; hết hạn mức thì hỏi tôi chuyển phần việc không đo sang cloud session; handoff là file mới; `docs/status.md` sửa từng chỗ; dừng ở 80% ngữ cảnh với handoff; chép nguyên văn lời owner vào handoff. Tiếp tục theo khuyến nghị tốt nhất; rà lại trước khi làm, re-check sau khi làm."
