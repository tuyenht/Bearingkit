# Handoff · 2026-09-26 · phiên P1: lộ trình v0.3, phân tích chi phí, thiết kế sprint `bk-build`

Branch `main` · working tree sạch sau commit cuối · đã push. Đọc file này trước khi tiếp tục. Handoff trước: `docs/handoff/2026-09-26.md` (phiên đóng hai sprint `bk-debug`, `bk-test`); Block 2 của nó được thay bằng Block 2 dưới đây.

## Block 1 · Durable knowledge

### Lời owner trong phiên (nguyên văn)

1. "Tình trạng hiện tại thế nào, bộ nào của chúng ta đã xây dựng thế nào rồi?"
2. "Dưới đây là nội dung prompt để mở ở phiên mới sau khi tôi kết thúc phiên tên "Owner-migration phase 2 activation". Bỏ qua "Có làm một vòng giảm chi phí không" đã có chốt ở trong phiên và prompt rồi. lên plan tổng thể và chi tiết để chúng ta biết là đang ở đâu, đã làm gì và cần phải làm gì tiếp theo (dạng như ảnh đính kèm). Sau đó chia phiên và đi vào giải quyết từng vấn đề theo mỗi phiên phù hợp:" Kèm theo là nguyên văn resume prompt của `docs/handoff/2026-09-26.md`, và một ảnh chụp một dòng tiến độ dạng "Where we are: ✅ … → 🟪 …".
3. "Audit kỹ các xử lý cũng như các phản hồi ở trên cho tôi nhé."
4. "Tiếp tục viết spec bk-build theo khuyến nghị"
5. "Đóng phiên theo khuyến nghị"

### Facts established (do not re-derive)

- **Đầu phiên:**
  - `git status` sạch;
  - `doctor` sáu `ok` (phần Claude Code `skip` như thường lệ);
  - `bearingkit status`: store Antigravity "installed and current", dự án bật cả hai host;
  - `claude plugin list` và `installed_plugins.json`: `bearingkit@bearingkit` ở `3f49309` cả scope user lẫn local;
  - `get_usage`: cửa sổ năm giờ 35%, tuần 64% (reset 2026-09-30 10:00 giờ VN).
- **Phiên "Owner-migration phase 2 activation" chạy song song** và commit `f3bfad7` (handoff 2026-09-26, audit lại các khuyến nghị) trước khi phiên này sửa gì. Phiên này bắt đầu từ `f3bfad7`.
- **Chi phí kit tách theo phần** (`docs/specs/2026-09-26-kit-cost-split.md`, script `_build/cost-split/cost-split.cjs` không track, chỉ đọc stream đã có):
  - trên Sonnet, phần nền gồm tiền tố nạp đầu phiên, thêm khoảng 4.400 token so với sàn (protocol, danh sách skill và agent của plugin; cách chia giữa các phần chưa đo), cộng chữ skill và reference được đọc, cộng `detect-stack`; chiếm khoảng một phần tư khoản chênh kit − sàn (`debug-01` ≈ 0,033 trên 0,142 USD; `test-01` ≈ 0,046 trên 0,175), tức khoảng 12–14% một phiên kit;
  - khoảng ba phần tư là hành vi: nhiều lần gọi API hơn, mỗi lần đọc lại tiền tố;
  - so với Superpowers trên `debug-01`, tổng ngang nhau (0,273 và 0,270);
  - cách tính khớp `total_cost_usd` trong khoảng 0,80–1,14, nên mọi tỉ phần là ước tính.
- **`detect-stack` trong 48 phiên kit trên Sonnet**: 19 phiên không gọi, 17 phiên chạy được, 12 phiên bị profile đo từ chối (lệnh ghép `cd <kit> && …`, lệnh PowerShell có biến).
- **Kiểm kê, đích `bk-build`**: 142 dòng (7 absorb, 32 drop, 103 idea). Đếm bằng `_build/bk-build-sprint/count-rows.cjs`, và độc lập bằng `grep -c "| bk-build | idea |"`. Con số 216 của `_build/v03-prep/v03-order-proposal.md` không tái hiện được. Bốn absorb đã port (Superpowers, `executing.md`); còn ba (dòng 213, 214, 224, `code-modernization`).
- **Phân loại 103 dòng idea** (`docs/specs/2026-09-26-bk-build-idea-classification.md`, do agent Sonnet làm, đã kiểm mẫu):
  - `typescript-react` 28, `node` 26, `python` 22, dùng chung 9, `kotlin` 6, `php-laravel` 4, `c-cpp` 3, `shell` 2, `sql` 2, nâng major 1;
  - năm file stack mới có 57 dòng đầu vào.
- **Đọc nguồn** (`_build/bk-build-sprint/source-read.md`, không track):
  - không xung đột với `bk-protocol/SKILL.md:76`;
  - `bk-test/references/characterization.md` đã chứa phần viết test mô tả hành vi hiện tại, còn thiếu phần dual run;
  - ý chính là `modernize-uplift.md:51-63`: hỏi trước xem bộ test có chạy trên phiên bản mới không;
  - `/code-modernization:modernize-uplift` dừng chờ duyệt ở Step 2 (`:143-157`).

### Decisions taken

- **Lộ trình còn lại của v0.3 chia thành bảy phiên P1–P7** (`docs/plans/2026-09-26-v03-roadmap.md`), có dòng "Đang ở đâu" theo mẫu ảnh owner gửi. Owner yêu cầu ở lời 2.
- **D1, giảm chi phí.** Cách làm đã chốt ở phiên "Owner-migration phase 2 activation" (lời 2): phân tích chỉ đọc trước, đề xuất sau, cắt là COUNCIL. Phân tích đã làm, kết quả nằm ở Block 2, Decisions waiting 1.
- **Sprint `bk-build` đăng ký task `build-01`** (`docs/specs/2026-09-26-bk-build-design.md`) theo lời 4:
  - chỉ số chính là quy trình: bộ test đã chạy xong trước lần sửa đầu tiên;
  - kết quả chỉ làm guard;
  - hiệu chỉnh trên ba phiên sàn trước khi đo.
  Nguồn của hướng này là lựa chọn của owner sau `review-04` (`docs/specs/2026-09-24-benchmark-kit-vs-sources-design.md:452`).
- **Reviewer Sonnet rà đoạn đăng ký** trước khi có fixture. Ba điểm của nó đã được xét:
  - O1 chấm qua `src/index.js`, không qua tên hàm;
  - P2 chấm bằng cách vá `parse` của thư viện v2 trong một bản sao, không đổi file theo đường dẫn;
  - protocol chỉ có ở nhánh K: giữ nguyên, nhưng thêm chỉ số H (dừng lại để hỏi) và ghi trước chiều ảnh hưởng dự kiến.
- **Hai ghi chú "bk-deps" về `major-upgrade.md`** trong `docs/specs/2026-09-18-item-inventory.md` (dòng 300 và 789) được đánh dấu đích mới là `bk-build`. Các dòng `bk-deps` khác nói về pack tuỳ chọn, và được giữ nguyên.

### Rejected options (do not re-propose)

- **Cắt protocol để giảm tiền.** Cắt một phần ba protocol bớt khoảng 1–2% một phiên, nhỏ hơn độ tản giữa các phiên.
- **Bỏ bước cố ý làm hỏng code của `bk-test`.** Đó là phần tạo ra kết quả 8/8.
- **Biến thể `command` cho S trên `build-01`.** `modernize-uplift` dừng ở Step 2 trước khi sửa gì, và làm việc trong thư mục `legacy/`/`modernized/`.
- **Ba task riêng cho ba ứng viên.** Một fixture mang đủ ba thay đổi; ba fixture sẽ tốn gấp ba số phiên trên cùng hạn mức tuần.
- **Gỡ protocol khỏi nhánh K cho công bằng.** Như vậy không còn đo kit đúng như phát hành.

### Lessons (candidate lines for the lessons log; `.claude/lessons.log` chưa tồn tại, nên không ghi)

- RULE | phân tích trên `evals/results/` | WHEN lấy các thư mục bằng glob `…-natural*` THEN loại `-haiku` trước khi đếm NOT đếm lẫn model | lần đầu ghi "21 phiên không gọi `detect-stack`", đúng là 19 trên Sonnet | 2026-09-26
- RULE | trả lời trạng thái | WHEN trích con số "rẻ bằng một nửa" hay "5/8" THEN nói rõ so với cái gì (bản cũ của kit, nguồn hay sàn) NOT gán cho nguồn | câu trả lời đầu phiên gán sai hai con số của `bk-review` cho nguồn; đã nhận sai ở lượt audit | 2026-09-26

## Block 2 · Resume payload

### State

- HEAD = `origin/main`. Working tree sạch. Suite 170/170 (`node --test tests/*.test.cjs`).
- Bản cài hằng ngày vẫn ở `3f49309`, cả user lẫn local; phiên này không đổi `skills/`.
- Không track, cần cho P2:
  - `_build/bk-build-sprint/` (`count-rows.cjs`, `classification.md`, `source-read.md`);
  - `_build/cost-split/cost-split.cjs`.
- **`build-01` chưa có fixture**: `evals/bench/build-01/` chưa tồn tại, chưa phiên đo nào chạy. Đoạn đăng ký đã có và đã qua reviewer.

### Decisions waiting on the owner

1. **D1: có cắt phần nền của kit không.** Khuyến nghị: không cắt (`docs/specs/2026-09-26-kit-cost-split.md`, mục "Đề xuất"). Chỉ sửa dòng `detect-stack` của protocol, và chỉ khi đổi protocol lần kế tiếp, có đo. Cắt là COUNCIL.
2. **D2: có đưa ngoại lệ "không tự commit" vào `bk-protocol` không.** Số liệu sẽ có từ P2: chỉ số P5 của `build-01`, đếm trên mọi nhánh.
3. **D3: có đưa bước đánh giá độc lập vào `bk-close` không.** Khuyến nghị: có, dưới dạng tuỳ chọn `--verify`. Xử lý ở P6.
4. **D4: đo trên Antigravity** các skill `bk-review`, `bk-debug`, `bk-test`. Cần câu duyệt riêng; dự kiến ở P7.
5. **"Có" cho bản cài hằng ngày** sau khi P2 push thay đổi `skills/`.

### Open threads

- Các luồng mang từ `docs/handoff/2026-09-26.md` vẫn mở, trừ hai ghi chú "bk-deps" đã xử lý:
  - bẫy X1 trên `review-02`;
  - ba điểm của `bk-review`;
  - timeout của runner;
  - task lỗi chỉ lộ khi chạy code, và diff lớn hơn một bậc: chưa dựng;
  - B10; B12 (cú pháp quyền PowerShell trong `permissions` chưa xác minh); B15 (auto-update mới thấy chạy ở scope user, chưa lần nào ở scope local, nên sau mỗi thay đổi `skills/` vẫn cập nhật tay cả hai scope, `docs/compat/2026-09-24-benchmark-tool-claims.md`);
  - lệnh nền không rõ lúc đóng phiên trước;
  - (14) LSP và context7;
  - gỡ Superpowers và `fullstack-dev-skills`;
  - push `a0cda92` của repo KB.
- **`detect-stack` bị profile đo từ chối ở 12/48 phiên kit.** Đó là luật quyền của profile. Ứng viên sửa là chữ của protocol ("chạy từ thư mục dự án, không `cd`"), đi kèm D1.
- **Manifest của plugin karpathy** nằm trong nhánh S của `build-01`. Nó chưa được nạp thử; `--dry-run` phải cho thấy nó nạp được.

### Đánh giá độc lập lần đóng phiên này (2026-09-26, hai agent Sonnet mới, chỉ đọc)

- Rà độ đầy đủ so với transcript: 8/10. Ba lỗ hổng đã sửa trong file này:
  - mô tả phần nền thiếu "agent của plugin";
  - mất vế "diff lớn hơn một bậc" của một open thread;
  - B12, B15 thiếu mô tả.
- Diễn tập khởi động lạnh từ resume prompt: 12/12 câu đúng, kèm `file:line`. Nó báo working tree chưa sạch, đúng ở thời điểm chạy vì phép thử chạy trước commit đóng phiên.

### Live temporary bypasses

- Không có. Không file nào phiên này chạm (`git diff --name-only f3bfad7..HEAD`: 5 file trước commit đóng phiên, cộng file này và `docs/status.md`) chứa marker `TEMPORARY` hay `REMOVE`.
- Bước 5 của `bk-close`: lời 3 là nghi thức audit thường trực, không phải cụm sửa sai theo `correction-cues.md`. `.claude/lessons.log` chưa tồn tại, nên không ghi gì.

### Next work

1. **Đầu phiên:** `git status`, `node bin/bearingkit.cjs status`, `doctor`, `get_usage`, `claude plugin list`, và version kit trong `installed_plugins.json` (ghi lại, không sửa).
2. **P2, sprint `bk-build` phần B**, theo `docs/specs/2026-09-26-bk-build-design.md`:
   - viết test fixture trước, thấy đỏ trước khi xanh (bốn điều trong spec);
   - dựng `evals/bench/build-01/` (`task.json`, `build.cjs`), rồi chạy `bearingkit bench --task build-01 --dry-run`; ba plugin nguồn phải qua `checkSources`;
   - đọc hạn mức, báo trước, rồi chạy ba phiên F để hiệu chỉnh;
   - theo quy tắc đã đăng ký, hoặc chạy F5 + S8 + K-trước 8, viết chữ, rồi K-sau 8; hoặc chuyển sang guard với K8;
   - viết `references/major-upgrade.md` (tối đa 80 dòng) cùng một dòng "Read first" và dòng Sources trong `SKILL.md`, cập nhật `NOTICE` và `derived`;
   - rà độc lập, commit, push, chạy `node bin/bearingkit.cjs update --host antigravity --no-pull`; bản cài hằng ngày khi owner nói "có".
   - Xong khi: spec có kết quả đo, suite xanh, `doctor` sáu `ok`, đã push.
3. **Sau P2:** P3 (file stack `node`, `python`) theo `docs/plans/2026-09-26-v03-roadmap.md`.

### Resume prompt

"Đọc `docs/handoff/2026-09-26-p1-bk-build-design.md` (Block 2 trước), rồi `docs/plans/2026-09-26-v03-roadmap.md` (đang ở P2), `docs/specs/2026-09-26-bk-build-design.md` (đoạn đăng ký `build-01`, đã qua reviewer), `docs/specs/2026-09-26-bk-test-design.md` và `evals/bench/test-01/` (mẫu fixture), `docs/status.md`. Prompt này chỉ tóm tắt; lệch với repo thì tin repo.

Đầu phiên: `git status` (sạch là đúng), `node bin/bearingkit.cjs status`, `doctor` (sáu `ok`), `get_usage`, `claude plugin list`, version kit trong `~/.claude/plugins/installed_plugins.json` cả user lẫn local (ghi lại, không sửa).

Việc của phiên (P2): dựng fixture `build-01` đúng như đã đăng ký: test fixture đỏ trước, `--dry-run` cho thấy nạp được cả ba plugin nguồn; hiệu chỉnh ba phiên F; rồi đo hoặc chuyển sang guard theo quy tắc đã đăng ký; viết `references/major-upgrade.md` sau các lượt K-trước; đo trước khi commit chữ; đếm số lần tự commit trên mọi nhánh (D2); kết quả ghi thật vào spec. Sửa quy tắc đã đăng ký sau khi phiên đo chạy là không được; thấy lỗi thì dừng và báo. Khi đóng phiên, làm hai phép thử độc lập (rà độ đầy đủ so với transcript; diễn tập khởi động lạnh từ resume prompt), sửa lỗ hổng trước commit cuối, rồi dán nguyên `git status`.

Luật: tôi cho phép đọc dưới `~/.claude` và `~/.gemini` (không in bí mật, IP, tên máy, không đọc file credentials); mỗi bước ghi dưới hai thư mục đó, sửa repo khác, xoá hay lưu trữ thì hỏi tôi một câu có, gom câu hỏi; lệnh đưa tôi chạy viết cho PowerShell; script nhiều dòng ghi ra file bằng Write, JSON có regex thì sửa bằng Edit; không `--help` thử; không Python (ngoại lệ pytest và `epp check` của repo KB), reviewer cũng vậy (cấm cả `--version`) và kiểm lời tự khai; đọc hạn mức trước mỗi phép đo, báo trước khi chạy, runner tự dừng ở 90%; so token chỉ giữa phiên cùng số tool; ghi skill nào thật sự được gọi ở mỗi nhánh; không đo Claude Code và Antigravity cùng lúc trên cùng fixture; mọi lượt đo Antigravity cần câu duyệt riêng; ít nhất 8 lượt mỗi nhánh và báo p; manh mối từ chỉ số phụ phải đo xác nhận trên phiên mới; đo trước khi commit văn bản model đọc; rà soát độc lập trước commit, reviewer không đổi working tree hay chạy phiên đo; commit theo đường dẫn cụ thể; không bao giờ cài kit từ checkout local (chỉ từ GitHub marketplace); handoff là file mới; `docs/status.md` sửa từng chỗ; dừng ở 80% ngữ cảnh với handoff; chép nguyên văn lời owner vào handoff. Tiếp tục theo khuyến nghị tốt nhất; rà lại trước khi làm, re-check sau khi làm."
