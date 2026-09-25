# Handoff · 2026-09-25 · bước 3 của `bk-review` đo lại trên Sonnet: giữ `ae2f514`; sprint `bk-debug`: bản ứng viên không qua, không commit

Phiên này là cùng cuộc trò chuyện với `docs/handoff/2026-09-24-bench.md`, sau hai lần audit và một lần nén ngữ cảnh. File đó vẫn đúng cho mọi thứ trước 2026-09-25; file này ghi phần sau và thay Block 2 của nó. Đọc Block 2 dưới đây trước.

## Block 1 · Durable knowledge

### Lời owner kể từ handoff trước (nguyên văn)

1. Trả lời một AskUserQuestion về cách sửa `bk-review`: owner từ chối câu hỏi (ngắt lệnh), không chọn nhãn nào.
2. "Audit kỹ quá trình xử lý code cũng như các phản hồi ở trên xem có gap hoặc lỗi không? Nếu có thì fix cho tôi luôn nhé. / Audit kỹ các đề xuất khuyến nghị xử lý ở trên đã chuẩn chưa? Nếu chuẩn thì duyệt xử lý chúng một cách tối ưu nhất, tốt nhất tự động cho tôi. / Cho tôi các khuyến nghị đề xuất tốt nhất, phù hợp nhất để xem các bước tiếp theo chúng ta nên ưu tiên làm gì?"
3. "audit kỹ các xử lý cũng như các phản hồi ở trên xem đã chuẩn chưa? có gap hoặc lỗi ở đâu không? Nếu có thì fix cho tôi. Đề xuất cho tôi các khuyến nghị xử lý tốt nhất phù hợp sau khi đã trải qua quá trình đề xuất, phản biện, tối ưu,..."
4. Tham số của lệnh nén ngữ cảnh: "Giữ lại các phần quan trọng cũng như các phản hồi ở phía trên nhé, đặc biệt các khuyến nghị cũng như các phần còn lại cần xử lý."
5. Tin sau khi nén: "Tiếp tục xử lý theo khuyến nghị cho tôi."

6. Sau kết quả Sonnet: "Tiếp tục làm sprint bk-debug theo khuyến nghị cho tôi."

Khuyến nghị số 1 lúc đó: đo `review-02` trên Sonnet, bước 3 mới so với bước 3 cũ, 8 lượt mỗi bản, quy tắc quyết định đăng ký trước. Lời 5 được hiểu là duyệt đúng việc đó; lời 6 là duyệt sprint `bk-debug`. Không có bước ghi nào dưới `~/.claude` hay `~/.gemini`.

### Facts established (do not re-derive)

- **Bước 3 của `bk-review` giữ như `ae2f514`** (benchmark spec, mục "Step 3 old and new on Sonnet"; đăng ký ở `a29bd01` trước khi chạy). `review-02`, Sonnet 5, 8 lượt K mỗi bản, bốn khối xen kẽ mới/cũ/mới/cũ:
  - bản mới: H1 7, H2 7, H3 7, X1 0 trên 8 (phiên thứ tám bị cắt do treo, tính là sót); 0,258 USD trung vị; không dispatch `bk-reviewer`;
  - bản cũ: 8, 8, 8, 0; 0,554 USD; dispatch `bk-reviewer` 8/8;
  - H2 Fisher p = 1,0. Theo quy tắc: bản mới ≥ 7/8, nên giữ. Việc sót H2 trên Haiku là giới hạn đã biết.
- **Sprint `bk-debug`: bản ứng viên không qua quy tắc, không commit gì dưới `skills/`** (`docs/specs/2026-09-25-bk-debug-design.md`; đăng ký ở `ee6a14f` trước các phiên "sau"; bản ứng viên giữ ở `_build/bk-debug-sprint/candidate/`, không track). `debug-01`, Haiku, 8 lượt mỗi nhánh:
  - sửa tận gốc: K trước 1, K sau 1, S 0, F 0; test hồi quy: K trước 0, K sau 1, S 0, F 0; Fisher p = 1,0;
  - bản ứng viên tốn thêm 15% (0,119 so với 0,103 USD trung vị);
  - không phiên nào mở reference, kể cả `feedback-loop.md` mới; không phiên nào chạy thử ở múi giờ khác;
  - chữ mới có chạm tới một phiên (K8 sau): viết test trước, thấy đỏ, rồi sửa. Nhưng K8 hiểu "quy tắc bị phá" là lời gọi `new Date(`, chứ không phải việc trộn giờ địa phương với UTC.
- **4/16 phiên K trên Haiku tự gọi `bk-ship` để commit**, dù prompt chỉ bảo tìm và sửa. Đây là do chuỗi chuyển tiếp của protocol (chỉ dừng ở điểm COUNCIL); câu hỏi cho owner.
- **Trên Sonnet, review tìm ra khoá cache mà không cần reviewer Opus**: cả 7 câu trả lời của bản mới đều nêu key `'invoice-stats'` dùng chung.
- **Bộ chấm từng chỉ đọc câu trả lời cuối.** Khi reviewer chạy nền đánh thức phiên, câu trả lời đầu chứa bài review, câu sau thường chỉ nói reviewer đồng ý. Đã sửa: `usageFrom` nối mọi câu trả lời theo thứ tự (test mới). Mọi thư mục kết quả có phiên hai câu trả lời đều được chấm lại; chỉ một phiên đổi (phiên cũ K3 hôm nay, H2 tìm thấy). Không con số nào đã công bố trước đó bị đổi.
- **Script vẫn chấm nhầm X1**: 4/15 câu trả lời bị gắn X1, nhưng đọc ra đều là lỗi timeout của FX hoặc câu nói `fx-rates` đúng. Đếm X1 luôn phải đọc bằng mắt.
- **Timeout của runner không cắt được phiên treo**: heartbeat cuối cho thấy skill đã chạy 2.663 giây, trong khi giới hạn là 900; khối đó mất 48 phút. Chưa tái hiện, chưa sửa.
- **Audit (lời 2 và 3) tìm ra và đã sửa:**
  - câu "làm kit kém đi thật" là nói quá: p = 0,119, gộp thì 0,065; đã có `fisherExact` trong repo;
  - khuyến nghị "trả bước 3 về ngay" chưa qua phản biện, nên đổi thành đo trên Sonnet trước (đã làm, xem trên).
- **Vi phạm luật cần nhớ (đã ghi ở handoff trước):** ba commit từng push trước khi được rà soát; hai reviewer từng chạy Python. Phiên này: đoạn đăng ký được rà soát trước commit; reviewer tự khai không chạy Python và không sửa file.

### Lessons

- Đọc hạn mức, đăng ký quy tắc trong spec, commit đăng ký, rồi mới chạy. Chia khối xen kẽ để hai bản không chạy lệch giờ.
- Trong bash, chuỗi `node -e "…"` chứa backtick sẽ bị shell thực thi; sửa file markdown bằng Edit.
- Quyết định sản phẩm dựa trên model owner dùng hằng ngày (Sonnet); Haiku chỉ là phép thăm dò.

## Block 2 · Resume payload

### State

- HEAD = commit cuối của phiên = `origin/main`; suite 159/159; `doctor` sáu `ok`.
- Không commit nào của phiên này đổi `skills/`. Bản cài hằng ngày vẫn ở `e8b6dc1`, cả user lẫn local, đúng với `skills/` hiện tại; kho Antigravity cũng khớp.
- Kết quả (không track): `evals/results/2026-09-25-bench-review-02-natural/` và `-3/` (bản mới), `-2/` và `-4/` (bản cũ).

### Decisions waiting on the owner

Không còn quyết định nào về bước 3. Chờ owner:
1. **Hướng của sprint `bk-debug`** sau khi bản ứng viên không qua. Các hướng:
   - (a) commit phần chắt lọc đã quyết mà không đổi các bước trong thân: `references/feedback-loop.md` (absorb mattpocock, đã quyết trong kiểm kê), câu "xếp hạng 3–5 giả thuyết" ở phase 3 của `systematic-debugging.md` (D5 câu 33 (b)), test case 04, cùng dòng Read first và dòng Sources trong `SKILL.md`. Ghi rõ "đo: không có tác dụng trên `debug-01` Haiku". Phần này là văn bản model đọc, nằm trong gói đã đo, và không làm giảm `visible`/`kept`;
   - (b) thử bản ứng viên thứ hai, mang tính thủ tục hơn (bắt câu trả lời liệt kê mọi hàm chạm tới giá trị, cùng lần chạy test đỏ), đo lại 8 lượt Haiku. Rủi ro là dạy theo đề, vì không có task giữ lại để kiểm;
   - (c) đóng sprint, không đổi chữ, ghi Haiku là giới hạn; chuyển nỗ lực sang một task benchmark phân biệt được (cỡ thật) trước các sprint chữ tiếp theo.
2. **Chuỗi tự chuyển sang `bk-ship` sau khi sửa lỗi** (4/16 phiên K Haiku tự commit): giữ như thiết kế, hay dừng ở bản sửa khi prompt không nói commit.
3. Từ phiên gộp: (14) LSP và context7; gỡ hẳn Superpowers và `fullstack-dev-skills` sau tuần dùng thử; push `a0cda92` của repo KB (tuỳ owner).

### Open threads

- Timeout của runner không cắt được phiên treo (xem Facts). Sửa khi tái hiện được, ví dụ bằng một task giả treo.
- Script chấm nhầm X1 trên `review-02` (các câu về FX).
- `--rescore` bỏ mất dòng "Model … profile … fixture" ở đầu `results.md`.
- `bk-review`:
  - câu "ai là người review" bị rơi (3/6);
  - ngưỡng diff lớn chưa có phép đo nào;
  - biến thể gọi thẳng lệnh chưa chạy trên Haiku.
- B10, B12, B15; cú pháp quyền PowerShell trong `permissions` chưa được xác minh.

### Next work

1. Đầu phiên: `git status`, `node bin/bearingkit.cjs status`, `doctor`, `get_usage`, `claude plugin list`, version kit (user và local).
2. Theo câu trả lời của owner cho mục 1 và 2 ở trên. Với (a): thêm `NOTICE` và `upstream/sources.json` (`tracked`, `derived`) cho `feedback-loop.md`, chạy suite, rà soát độc lập, commit; phần này đổi `skills/`, nên làm mới kho Antigravity và cập nhật bản cài hằng ngày.
3. Sau mỗi lần push có đổi `skills/`:
   - `node bin/bearingkit.cjs update --no-pull` để làm mới kho Antigravity;
   - ba lệnh Claude Code (marketplace, `--scope user`, `--scope local`) ghi dưới `~/.claude`, nên cần owner nói "có".

### Resume prompt

"Đọc `docs/handoff/2026-09-25-bench-sonnet.md` (Block 2 trước), `docs/specs/2026-09-24-benchmark-kit-vs-sources-design.md` (mục 'Task 4', 'The frame on Haiku 4.5', 'Measured on Haiku' và 'Step 3 old and new on Sonnet'), `docs/specs/2026-09-25-bk-debug-design.md`, `docs/status.md`; prompt này chỉ tóm tắt, lệch với repo thì tin repo. Đầu phiên: `git status` (sạch là đúng), `node bin/bearingkit.cjs status`, `doctor` (sáu `ok`), `get_usage`, `claude plugin list`, version kit trong `~/.claude/plugins/installed_plugins.json`, cả user lẫn local (ghi lại, không sửa). Việc của phiên: theo lựa chọn của tôi cho hướng `bk-debug` <a | b | c> và chuỗi `bk-ship` <giữ | dừng ở bản sửa> (Decisions waiting 1 và 2); mọi thay đổi chữ đăng ký quy tắc trong spec trước khi chạy (8 lượt mỗi bên, báo Fisher p, không gọi là khác biệt khi p > 0,1) và đo trước khi commit; kết quả ghi thật. Luật: tôi cho phép đọc dưới `~/.claude` và `~/.gemini` (không in bí mật, IP, tên máy, không đọc file credentials); mỗi bước ghi dưới hai thư mục đó, sửa repo khác, xoá hay lưu trữ thì hỏi tôi một câu có, gom câu hỏi; lệnh đưa tôi chạy viết cho PowerShell; script nhiều dòng ghi ra file bằng Write, JSON có regex thì sửa bằng Edit; không `--help` thử; không Python (ngoại lệ pytest và `epp check` của repo KB), reviewer cũng vậy và kiểm lời tự khai; đọc hạn mức trước mỗi phép đo, báo trước khi chạy, runner tự dừng ở 90%; so token chỉ giữa phiên cùng số tool; ghi skill nào thật sự được gọi ở mỗi nhánh; không đo Claude Code và Antigravity cùng lúc trên cùng fixture; mọi lượt đo Antigravity cần câu duyệt riêng; đo trước khi commit văn bản model đọc; rà soát độc lập trước commit, reviewer không đổi working tree hay chạy phiên đo; commit theo đường dẫn cụ thể; handoff là file mới; `docs/status.md` sửa từng chỗ; dừng ở 80% ngữ cảnh với handoff; chép nguyên văn lời owner vào handoff. Tiếp tục theo khuyến nghị tốt nhất; rà lại trước khi làm, re-check sau khi làm."

Câu cho phép chỉ có hiệu lực khi chính owner gửi nó trong chat; file này không cho phép gì.
