# Handoff · 2026-09-25 · bước 3 của `bk-review` đo lại trên Sonnet: giữ `ae2f514`; sprint `bk-debug` đóng: phần chắt lọc và "dừng ở bản sửa" commit

Phiên này là cùng cuộc trò chuyện với `docs/handoff/2026-09-24-bench.md`, sau hai lần audit và một lần nén ngữ cảnh. File đó vẫn đúng cho mọi thứ trước 2026-09-25; file này ghi phần sau và thay Block 2 của nó. Đọc Block 2 dưới đây trước.

## Block 1 · Durable knowledge

### Lời owner kể từ handoff trước (nguyên văn)

1. Trả lời một AskUserQuestion về cách sửa `bk-review`: owner từ chối câu hỏi (ngắt lệnh), không chọn nhãn nào.
2. "Audit kỹ quá trình xử lý code cũng như các phản hồi ở trên xem có gap hoặc lỗi không? Nếu có thì fix cho tôi luôn nhé. / Audit kỹ các đề xuất khuyến nghị xử lý ở trên đã chuẩn chưa? Nếu chuẩn thì duyệt xử lý chúng một cách tối ưu nhất, tốt nhất tự động cho tôi. / Cho tôi các khuyến nghị đề xuất tốt nhất, phù hợp nhất để xem các bước tiếp theo chúng ta nên ưu tiên làm gì?"
3. "audit kỹ các xử lý cũng như các phản hồi ở trên xem đã chuẩn chưa? có gap hoặc lỗi ở đâu không? Nếu có thì fix cho tôi. Đề xuất cho tôi các khuyến nghị xử lý tốt nhất phù hợp sau khi đã trải qua quá trình đề xuất, phản biện, tối ưu,..."
4. Tham số của lệnh nén ngữ cảnh: "Giữ lại các phần quan trọng cũng như các phản hồi ở phía trên nhé, đặc biệt các khuyến nghị cũng như các phần còn lại cần xử lý."
5. Tin sau khi nén: "Tiếp tục xử lý theo khuyến nghị cho tôi."

6. Sau kết quả Sonnet: "Tiếp tục làm sprint bk-debug theo khuyến nghị cho tôi."
7. Trả lời hai câu hỏi sau khi bản ứng viên `bk-debug` không qua (nhãn nguyên văn): hướng "Commit phần chắt lọc, đóng sprint (Recommended)"; chuỗi sang `bk-ship` "Dừng ở bản sửa, hỏi trước khi commit (Recommended)".
8. Sau khi sprint đóng: "Audit kỹ quá trình xử lý code cũng như các phản hồi ở trên xem có gap hoặc lỗi không? Nếu có thì fix cho tôi luôn nhé. / Audit kỹ các đề xuất khuyến nghị xử lý ở trên đã chuẩn chưa? Nếu chuẩn thì duyệt xử lý chúng một cách tối ưu nhất, tốt nhất tự động cho tôi. / Cho tôi các khuyến nghị đề xuất tốt nhất, phù hợp nhất để xem các bước tiếp theo chúng ta nên ưu tiên làm gì?"
9. Trả lời sau audit (nhãn nguyên văn): "Có, cập nhật ngay (Recommended)"; "Đo câu 'test trước' của bk-debug (Recommended)".
10. "Cho tôi khuyến nghị tiếp theo chúng tan nên làm gì thếp theo sau khi trải qua các vòng duyệt?"
11. "Xử lý theo đề xuất khuyến nghị cho tôi." (duyệt: cập nhật bản cài hằng ngày, rồi đo `debug-01` Sonnet 16 lượt mỗi nhánh, kit so với Superpowers).
12. "có test hồi quy" (trả lời câu hỏi có chạy lần đo xác nhận với test hồi quy làm chỉ số chính không).
13. "Ok tiếp tục đi." (sau khuyến nghị dựng task benchmark cỡ thật).
14. Trả lời câu hỏi hướng benchmark (nhãn nguyên văn): "Đo quy trình và chi phí, làm bk-test (Recommended)".
15. "Tiếp tục làm sprint bk-test luôn trong phiên này".

Khuyến nghị số 1 lúc đó: đo `review-02` trên Sonnet, bước 3 mới so với bước 3 cũ, 8 lượt mỗi bản, quy tắc quyết định đăng ký trước. Lời 5 được hiểu là duyệt đúng việc đó; lời 6 là duyệt sprint `bk-debug`. Không có bước ghi nào dưới `~/.claude` hay `~/.gemini`.

### Facts established (do not re-derive)

- **Bước 3 của `bk-review` giữ như `ae2f514`** (benchmark spec, mục "Step 3 old and new on Sonnet"; đăng ký ở `a29bd01` trước khi chạy). `review-02`, Sonnet 5, 8 lượt K mỗi bản, bốn khối xen kẽ mới/cũ/mới/cũ:
  - bản mới: H1 7, H2 7, H3 7, X1 0 trên 8 (phiên thứ tám bị cắt do treo, tính là sót); 0,258 USD trung vị; không dispatch `bk-reviewer`;
  - bản cũ: 8, 8, 8, 0; 0,554 USD; dispatch `bk-reviewer` 8/8;
  - H2 Fisher p = 1,0. Theo quy tắc: bản mới ≥ 7/8, nên giữ. Việc sót H2 trên Haiku là giới hạn đã biết.
- **Sprint `bk-debug` đóng** (`docs/specs/2026-09-25-bk-debug-design.md`). Bản ứng viên đầu, đổi các bước trong thân, không qua quy tắc (đăng ký `ee6a14f`) và không commit; nó được giữ ở `_build/bk-debug-sprint/candidate/`, không track. Theo lựa chọn của owner, chỉ commit phần chắt lọc (`references/feedback-loop.md`, câu xếp hạng giả thuyết ở phase 3) và dòng Next step "dừng ở bản sửa". Phần này được đăng ký lại ở `0bfa671` và đo trước commit: Haiku thử commit 0/8 (trước 3/8, p = 0,2), `visible`/`kept` 8/8; Sonnet thử commit 0/4, sửa tận gốc 4/4, test hồi quy 4/4. Mọi câu trả lời đều đề nghị commit thay vì tự làm. Bản ứng viên đầu, `debug-01`, Haiku, 8 lượt mỗi nhánh:
  - sửa tận gốc: K trước 1, K sau 1, S 0, F 0; test hồi quy: K trước 0, K sau 1, S 0, F 0; Fisher p = 1,0;
  - bản ứng viên tốn thêm 15% (0,119 so với 0,103 USD trung vị);
  - không phiên nào mở reference, kể cả `feedback-loop.md` mới; không phiên nào chạy thử ở múi giờ khác;
  - chữ mới có chạm tới một phiên (K8 sau): viết test trước, thấy đỏ, rồi sửa. Nhưng K8 hiểu "quy tắc bị phá" là lời gọi `new Date(`, chứ không phải việc trộn giờ địa phương với UTC.
- **`debug-01` trên Sonnet, chấm test hồi quy** (benchmark spec, mục "`debug-01` on Sonnet"; đăng ký ở `991cc25`), 8 lượt mỗi nhánh:
  - kit 8/8, Superpowers 4/8 (p = 0,077), sàn 0/8; sửa tận gốc 8/8 ở mọi nhánh; không nhánh nào tự commit;
  - 6/8 test của kit được viết sau khi sửa, rồi mới thấy đỏ trên code cũ bằng `git stash`; theo quy tắc, kết luận "kit hơn sàn" bị giữ lại;
  - cả 4 test của Superpowers đều viết trước khi sửa;
  - chi phí kit 0,330 USD, bằng 1,4 lần nguồn và 2,5 lần sàn.
- **Bước 4 của `bk-debug` nay là "Regression test before the fix"** (đăng ký `8c51c47`, đo trước commit):
  - Sonnet thấy test đỏ trước khi sửa 8/8 (trước 2/8, p = 0,007); test hồi quy, sửa tận gốc, `visible` và `kept` đều 8/8; không tự commit; chi phí 0,261 USD (trước 0,330);
  - guard Haiku đạt: test hồi quy 5/8, sửa tận gốc 1/8;
  - so với nguồn: 8/8 so với 4/8 (p = 0,077), không hơn trên task này.
- **`debug-01` Sonnet, 16 lượt mỗi nhánh, kit so với Superpowers** (đăng ký `0506d55`):
  - thấy test đỏ trước khi sửa 14/16 so với 8/16, p = 0,054, **không khác rõ** theo quy tắc;
  - test hồi quy 16/16 so với 9/16 (p = 0,007), nhưng đây không phải chỉ số đăng ký, nên chỉ là manh mối cho lần đo đăng ký sau;
  - sửa tận gốc 16/16 mỗi bên; chi phí ngang nhau (0,259 so với 0,258 USD).
  - Bộ đếm là `seenRedFirst` trong `scripts/lib/bench-score.cjs`, có test, đã kiểm tay hai phiên.
- **Lần đo xác nhận** (đăng ký `93e5038`, reviewer rà trước khi chạy), 16 phiên mới mỗi nhánh:
  - test hồi quy: kit 16/16, Superpowers 13/16, p = 0,23, **không khác**; manh mối 16/9 trước đó phần lớn do mẫu;
  - thấy đỏ trước khi sửa 15 so với 11; sửa tận gốc 16/16 mỗi bên; không tự commit;
  - chi phí kit 0,255 USD, nguồn 0,277.
  - Kết luận trên `debug-01` Sonnet: kit ngang Superpowers ở mọi chỉ số đăng ký, chi phí ngang nhau.
- **Task cỡ thật `review-04` không qua hiệu chỉnh** (fixture `3c7b057`, đăng ký cùng commit, reviewer rà trước khi chạy): PR 29 file, khoảng 425 dòng, 3 lỗi cài (hàm kiểm quyền đổi hợp đồng và caller ngoài diff, `findByNumber` bỏ tenant, void không transaction và nuốt lỗi), 2 mồi.
  - Sàn Sonnet tìm đủ 3 lỗi ở cả 3/3 lượt, không nhận mồi nào, mỗi lượt dưới 1 phút.
  - Sàn còn tìm thêm 3 lỗi thật ngoài kế hoạch mà cả tác giả lẫn reviewer đều sót.
  - Kết luận: trên Sonnet, review dựa trên đọc code không phân biệt được kit với sàn, kể cả ở cỡ này.
- **Sprint `bk-test` xong** (`docs/specs/2026-09-26-bk-test-design.md`; fixture `test-01` chấm test đặc tả bằng 12 biến thể đột biến, có canary chặn test khóa theo văn bản):
  - hiệu chỉnh: sàn Sonnet bắt 12/12 ở cả 3 lượt, nên task không được chấm;
  - phần chắt lọc được commit sau guard 8/8: `references/characterization.md` (absorb `test-engineer.md`), các điểm mattpocock gộp vào `tdd.md`, và bước cho code đã có trong `SKILL.md`;
  - kit chứng minh test có thể đỏ bằng cách cố ý làm hỏng code ở 8/8 phiên, sàn 0/3;
  - chi phí kit 0,339 USD, gấp 2,1 lần sàn; không so với nguồn.
  - Áp lựa chọn của owner cho `bk-debug` (commit phần chắt lọc) theo cách tương tự; owner được báo.
- **Auto-update có chạy, nhưng chỉ ở scope user** (B15): trước lần cập nhật tay, bản user đã tự lên `f987680`, còn bản local vẫn ở `e8b6dc1`. Sau hai lần cập nhật theo lời "có" của owner, cả hai scope nay ở `470e89a`, đã có câu "test trước".
- **Haiku tự commit dù không được bảo, ở mọi nhánh**: kit trước 3/8, bản ứng viên đầu 6/8, S 5/8, F 5/8 (đếm cả lệnh `git commit` chạy thẳng, không chỉ lời gọi `bk-ship`). Câu hỏi gửi owner chỉ nêu 4/16 lời gọi `bk-ship`; số đầy đủ ghi trong spec, và lựa chọn "dừng ở bản sửa" đứng vững trên đó. `bk-protocol` chưa ghi ngoại lệ này (câu "chuỗi chỉ dừng ở điểm COUNCIL"); ngân sách ký tự gần hết.
- **Trên Sonnet, review tìm ra khoá cache mà không cần reviewer Opus**: cả 7 câu trả lời của bản mới đều nêu key `'invoice-stats'` dùng chung.
- **Bộ chấm từng chỉ đọc câu trả lời cuối.** Khi reviewer chạy nền đánh thức phiên, câu trả lời đầu chứa bài review, câu sau thường chỉ nói reviewer đồng ý. Đã sửa: `usageFrom` nối mọi câu trả lời theo thứ tự (test mới). Mọi thư mục kết quả có phiên hai câu trả lời đều được chấm lại; chỉ một phiên đổi (phiên cũ K3 hôm nay, H2 tìm thấy). Không con số nào đã công bố trước đó bị đổi.
- **Script vẫn chấm nhầm X1**: 4/15 câu trả lời bị gắn X1, nhưng đọc ra đều là lỗi timeout của FX hoặc câu nói `fx-rates` đúng. Đếm X1 luôn phải đọc bằng mắt.
- **Timeout của runner không cắt được phiên treo**: heartbeat cuối cho thấy skill đã chạy 2.663 giây, trong khi giới hạn là 900; khối đó mất 48 phút. Chưa tái hiện, chưa sửa.
- **Audit (lời 2 và 3) tìm ra và đã sửa:**
  - câu "làm kit kém đi thật" là nói quá: p = 0,119, gộp thì 0,065; đã có `fisherExact` trong repo;
  - khuyến nghị "trả bước 3 về ngay" chưa qua phản biện, nên đổi thành đo trên Sonnet trước (đã làm, xem trên).
- **Vi phạm luật cần nhớ (đã ghi ở handoff trước):** ba commit từng push trước khi được rà soát; hai reviewer từng chạy Python. Phiên này: đoạn đăng ký được rà soát trước commit; reviewer tự khai không chạy Python và không sửa file.

### Lessons

- Fixture cài lỗi luôn kéo theo lỗi phụ của chính tính năng đó (ở đây: trạng thái VOID mới mà route `pay` không chặn). Sàn Sonnet tìm ra chúng, còn tác giả và reviewer thì sót; hiệu chỉnh trên sàn là bước bắt buộc.
- Một manh mối p = 0,007 từ chỉ số phụ đã không tái lập được trên dữ liệu mới (16/9 thành 16/13). Luôn chạy xác nhận trên phiên mới trước khi nói "hơn".
- Đoạn đăng ký của lần đo 16 lượt được commit (`0506d55`) trước khi có reviewer rà, trái luật; reviewer rà bổ sung trước commit kết quả.
- Chọn chỉ số chính trước khi chạy và giữ nó: lần này chỉ số phụ (test hồi quy) đạt ngưỡng còn chỉ số chính thì không; không được đổi sang chỉ số phụ sau khi đã thấy dữ liệu.
- Bộ đếm thấy test đỏ phải nhận mọi đường dẫn `node --test` tự chạy (kể cả `test-*.js` ở thư mục gốc) và mọi cách ghi file (Edit, Write, chuyển hướng shell), nhưng không nhầm `2>&1` là ghi file. Bản đầu đếm thiếu 3 phiên Haiku; bản rộng đầu tiên lại đếm thừa 1 phiên Sonnet. Mỗi bộ nhận diện cần được đối chiếu tay trên một phiên.
- Đếm hành vi theo định nghĩa đầy đủ ngay từ đầu. Lần đầu tôi chỉ đếm lời gọi `bk-ship`, nên thấy "4/16"; số thật là Haiku tự commit ở mọi nhánh (3/8 tới 6/8). Reviewer bắt được lỗi này trước khi đo.
- Reviewer Sonnet vẫn chạy Python dù bị cấm (lần này là `python3 --version`); prompt phải cấm cả dạng đó, và luôn kiểm lời tự khai.
- Trong audit, lớp phòng thủ timeout được viết trước test, trái thứ tự test trước; test và đối chứng âm được thêm ngay sau đó.

- Đọc hạn mức, đăng ký quy tắc trong spec, commit đăng ký, rồi mới chạy. Chia khối xen kẽ để hai bản không chạy lệch giờ.
- Trong bash, chuỗi `node -e "…"` chứa backtick sẽ bị shell thực thi; sửa file markdown bằng Edit.
- Quyết định sản phẩm dựa trên model owner dùng hằng ngày (Sonnet); Haiku chỉ là phép thăm dò.

## Block 2 · Resume payload

### State

- HEAD = commit cuối của phiên = `origin/main`; suite 170/170; `doctor` sáu `ok`.
- Commit cuối của phiên đổi `skills/bk-debug/`. Bản cài hằng ngày Claude Code vẫn ở `e8b6dc1`, **cũ hơn** `skills/`: cần owner nói "có" để chạy ba lệnh cập nhật (marketplace, `--scope user`, `--scope local`). Kho Antigravity được làm mới bằng `update --no-pull` sau khi push (không cần hỏi).
- Kết quả (không track): `review-02` Sonnet ở `evals/results/2026-09-25-bench-review-02-natural/` và `-3/` (bản mới), `-2/` và `-4/` (bản cũ); `debug-01` ở `…-debug-01-natural-haiku/` (trước, K S F), `-haiku-2/` (bản ứng viên đầu), `-haiku-3/` và `…-debug-01-natural/` (gói đã commit, Haiku và Sonnet).

### Decisions waiting on the owner

Chờ owner:
1. **Cập nhật bản cài hằng ngày**: commit của sprint `bk-test` đổi `skills/`, nên bản cài ở `470e89a` đã cũ; ba lệnh ghi dưới `~/.claude` cần owner nói "có".
2. **Bước kế tiếp: mục (6) `bk-build`** của thứ tự v0.3 (absorb `major-upgrade.md`; bước 1 phân loại khoảng 200 dòng stack), đo quy trình và chi phí so với nguồn trên Sonnet theo lựa chọn 14 của owner. Sprint `bk-test` đã xong.
3. **Ngoại lệ "không tự commit" trong `bk-protocol`** cho mọi skill: đổi thiết kế, protocol gần hết ngân sách ký tự, cần đo định tuyến; owner quyết.
4. Từ phiên gộp: (14) LSP và context7; gỡ hẳn Superpowers và `fullstack-dev-skills` sau tuần dùng thử; push `a0cda92` của repo KB (tuỳ owner).

### Open threads

- Timeout của runner không cắt được phiên treo (xem Facts). Nguyên nhân chưa tái hiện được; từ audit cùng ngày runner có lớp phòng thủ: phiên còn mở 60 giây sau lệnh kill bị bỏ như orphan, mã thoát của lệnh kill được giữ, và lượt đo dừng.
- Script chấm nhầm X1 trên `review-02` (các câu về FX).
- `--rescore` giữ meta của lượt chạy từ audit cùng ngày (`meta.json`); các thư mục cũ hơn vẫn mất dòng đầu đó.
- `bk-review`:
  - câu "ai là người review" bị rơi (3/6);
  - ngưỡng diff lớn chưa có phép đo nào;
  - biến thể gọi thẳng lệnh chưa chạy trên Haiku.
- B10, B12, B15; cú pháp quyền PowerShell trong `permissions` chưa được xác minh.

### Next work

1. Đầu phiên: `git status`, `node bin/bearingkit.cjs status`, `doctor`, `get_usage`, `claude plugin list`, version kit (user và local).
2. Mục 2 ở trên: sprint `bk-build` theo công thức; đăng ký phép đo quy trình và chi phí trước khi chạy.
3. Sau mỗi lần push có đổi `skills/`:
   - `node bin/bearingkit.cjs update --no-pull` để làm mới kho Antigravity;
   - ba lệnh Claude Code (marketplace, `--scope user`, `--scope local`) ghi dưới `~/.claude`, nên cần owner nói "có".

### Resume prompt

"Đọc `docs/handoff/2026-09-25-bench-sonnet.md` (Block 2 trước), `docs/specs/2026-09-24-benchmark-kit-vs-sources-design.md` (mục 'Task 4', 'The frame on Haiku 4.5', 'Measured on Haiku' và 'Step 3 old and new on Sonnet'), `docs/specs/2026-09-25-bk-debug-design.md`, `docs/status.md`; prompt này chỉ tóm tắt, lệch với repo thì tin repo. Đầu phiên: `git status` (sạch là đúng), `node bin/bearingkit.cjs status`, `doctor` (sáu `ok`), `get_usage`, `claude plugin list`, version kit trong `~/.claude/plugins/installed_plugins.json`, cả user lẫn local (ghi lại, không sửa). Việc của phiên: sprint `bk-build` (mục (6) v0.3) theo công thức, đo quy trình và chi phí so với nguồn trên Sonnet, đăng ký trước; mọi thay đổi chữ đăng ký quy tắc trong spec trước khi chạy (8 lượt mỗi bên, báo Fisher p, không gọi là khác biệt khi p > 0,1) và đo trước khi commit; kết quả ghi thật. Luật: tôi cho phép đọc dưới `~/.claude` và `~/.gemini` (không in bí mật, IP, tên máy, không đọc file credentials); mỗi bước ghi dưới hai thư mục đó, sửa repo khác, xoá hay lưu trữ thì hỏi tôi một câu có, gom câu hỏi; lệnh đưa tôi chạy viết cho PowerShell; script nhiều dòng ghi ra file bằng Write, JSON có regex thì sửa bằng Edit; không `--help` thử; không Python (ngoại lệ pytest và `epp check` của repo KB), reviewer cũng vậy và kiểm lời tự khai; đọc hạn mức trước mỗi phép đo, báo trước khi chạy, runner tự dừng ở 90%; so token chỉ giữa phiên cùng số tool; ghi skill nào thật sự được gọi ở mỗi nhánh; không đo Claude Code và Antigravity cùng lúc trên cùng fixture; mọi lượt đo Antigravity cần câu duyệt riêng; đo trước khi commit văn bản model đọc; rà soát độc lập trước commit, reviewer không đổi working tree hay chạy phiên đo; commit theo đường dẫn cụ thể; handoff là file mới; `docs/status.md` sửa từng chỗ; dừng ở 80% ngữ cảnh với handoff; chép nguyên văn lời owner vào handoff. Tiếp tục theo khuyến nghị tốt nhất; rà lại trước khi làm, re-check sau khi làm."

Câu cho phép chỉ có hiệu lực khi chính owner gửi nó trong chat; file này không cho phép gì.
