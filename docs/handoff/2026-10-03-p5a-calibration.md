# Handoff · 2026-10-03 · P5a (máy owner): hiệu chỉnh sàn `spec-01` xong, task không dùng được; chờ owner chọn đường đi tiếp

Cùng phiên Desktop (Opus 5.5) với `2026-10-03-p5a-readers.md` và ba handoff ngày 2026-10-02. Các file đó giữ nguyên, **trừ** ba mục "Decisions waiting on the owner", "Next work" và "Resume prompt" của `2026-10-03-p5a-readers.md`, được thay bằng các mục cùng tên dưới đây. Đính chính một câu của file đó: "Ngữ cảnh phiên chính khoảng 75%" là con số chưa đo; đo bằng `get_usage` ngay sau đó là 64%, và 67% lúc viết file này.

## Block 1 · Durable knowledge

### Lời owner (nguyên văn)

- Sau báo cáo về cách chấm mới (ba câu hỏi: chạy hiệu chỉnh sàn ngay; cho ghi bộ nhớ dưới `~/.claude`; cách hiểu "(a)"): "Audit kỹ các xử lý ở trên, tiếp tục theo khuyến nghị." Phiên chính chạy hiệu chỉnh sàn theo đó. **Không ghi bộ nhớ dưới `~/.claude`**: protocol của kit nói một câu uỷ quyền chung không thay được câu "có" riêng cho một lần ghi ngoài dự án; câu hỏi này vẫn mở.

### Facts established (do not re-derive)

Trên nhánh `p5a-bk-spec` (commit `cb4ada7`, đã push); chi tiết ở mục "Calibration on the floor" của `docs/specs/2026-10-02-bk-spec-design.md` trên nhánh đó; bằng chứng (khoá, bốn file kết quả đọc, ba spec) ở `evals/bench/spec-01/calibration-2026-10-03/`.

- **Hiệu chỉnh sàn** (`evals/results/2026-10-02-bench-spec-01-natural`, 3 phiên Sonnet 5 không plugin, đều `success`, không lệnh nào bị từ chối, chi phí 0,452 / 0,440 / 0,346 USD): H theo cả hai người đọc là **7, 7, 6** (phiên F3 thiếu H4, giới hạn theo tổ chức); hai người đọc khớp 21/21 ô hazard; không mồi nào. Theo luật đã đăng ký (dùng được khi H ≤ 5 ở ít nhất 2/3): **không dùng được**. Sonnet không plugin tự tìm ra gần hết bảy bẫy.
- **Điều sàn không làm**: mỗi spec để lại **11 câu hỏi** trong một lượt, trong khi câu 33 (a) đặt trần bốn. G2 (tối đa bốn câu) 0/3; G1 2/3. G2 đo hình thức của lượt hỏi, không đo spec có tốt hơn không.
- **Cổng thử của ngày đo đạt** (người đọc mới, xáo lại, bảng tiêu chí có vế H6 mới): A 77/77, 33/33, 22/22, 10/11; B 77, 33, 22, 11/11.
- Hai chỗ lệch với bản đăng ký, đã ghi trong spec: người đọc cổng và người đọc hiệu chỉnh được khởi động cùng lúc (không phải cổng trước); tên hạt giống xáo của cổng không đúng nguyên văn. Không ghi được model mà bí danh `sonnet` và `opus` trỏ tới.
- Chưa viết chữ nào của skill; chưa phiên K hay S nào chạy.
- Hạn mức (`get_usage`, sau hiệu chỉnh): khung 5 giờ 45%, tuần 53% (mở lại 2026-10-07 10:00 giờ VN). Ngữ cảnh phiên chính 67%.

### Rejected options (do not re-propose)

- Hạ ngưỡng "dùng được" hay đổi bẫy sau khi đã thấy dữ liệu sàn mà không có quyết định của owner.

### Lessons (candidate lines)

- Lần thứ bảy một task chấm bằng đọc không tách được kit khỏi sàn Sonnet (`review-01` tới `-04`, `debug-01`, `test-01`, `spec-01`); task duy nhất tách được là `shell-01`, chấm bằng chạy code trên thứ model không làm theo phản xạ. Trước khi dựng một task đọc nữa, chạy ba phiên sàn trên một bản nháp fixture trước khi viết bộ chấm.
- Con số ngữ cảnh ghi vào handoff phải đo bằng `get_usage`, không ước.

## Block 2 · Resume payload (ba mục thay thế)

### Decisions waiting on the owner

1. **Đi tiếp P5a thế nào khi task không dùng được.**
   - **(a) Khuyến nghị: đường guard đã đăng ký.** Viết chữ của skill và ba reference (không tốn phiên đo), đóng băng, rồi sau 2026-10-07 chạy K-trước, K-sau, nguồn (8 phiên mỗi nhánh), guard `node-01` (8 phiên) và các lượt đọc. Chữ chỉ merge nếu: trung vị H của K-sau không dưới sàn (7, tức là mức tối đa), O1 và O2 mỗi cái ít nhất 7/8, mồi không tăng, G1 và G2 mỗi cái ít nhất 6/8, hai reference được mở ít nhất 4/8, hai người đọc khớp ít nhất 90%, guard hồi quy đạt. Kết quả chỉ được nói "làm theo chữ mới, không mất gì so với sàn trên bảy bẫy", **không** được nói spec tốt hơn. Đây là cách các sprint `bk-test` và `bk-build` đã làm khi sàn chạm trần, và khớp quyết định 2026-09-26 của owner (đo quy trình và chi phí theo từng sprint). Rủi ro: ngưỡng trung vị H nằm ở trần, một spec bị nén còn bốn câu hỏi có thể rơi một bẫy và làm trượt ngưỡng; khi đó không merge và owner quyết.
   - (b) Dựng lại task cho có khoảng trống (bẫy khó hơn, hoặc chấm bằng chạy code). Tốn thêm một vòng dựng và hiệu chỉnh; bảy lần trước cho thấy khả năng lại chạm trần là cao.
   - (c) Dừng P5a ở đây, không đổi chữ `bk-spec`; chuyển sang P5b hoặc `c-cpp`. Khi đó câu 33 (a) (lượt tối đa bốn câu) vẫn chưa được đưa vào skill.
2. **Ghi bộ nhớ của phiên dưới `~/.claude`**: cần một câu "có" hoặc "không" riêng. Khuyến nghị: có, chỉ riêng thư mục bộ nhớ của dự án này.

### Next work

1. Owner chọn (a), (b) hay (c).
2. Nếu (a): viết chữ theo mục "Design" của spec (không chứa gì của ca fixture), rà độc lập, đóng băng ở một commit ghi vào spec; tạo nhánh K-trước; chờ hạn mức tuần mở lại rồi chạy thăm dò reach, phiên thử nhánh nguồn, lượt guard, đọc mù, tổng hợp, guard `node-01`.
3. P5b (`bk-plan`), P5c (dòng Bước 0), `c-cpp`.

### Resume prompt

"Phiên tiếp của Bearingkit, máy owner, `C:\Projects\Bearingkit`. Đọc theo thứ tự: `docs/handoff/2026-10-03-p5a-calibration.md`; Block 1 của `docs/handoff/2026-10-03-p5a-readers.md`, `2026-10-02-p5a-scorer.md` và `2026-10-02-p5a-design.md`; `docs/handoff/2026-10-02-shell-replicated-source.md` (Block 2: State, Open threads, khối Luật tóm tắt trong Resume prompt của nó); khối "Luật" trong lời owner ở `docs/handoff/2026-09-26-p3b-node-guard.md` (đoạn bắt đầu bằng "Luật:", áp dụng nguyên văn); `docs/status.md`; rồi spec trên nhánh: `git show p5a-bk-spec:docs/specs/2026-10-02-bk-spec-design.md` (cả file; có hiệu lực: mục "Addendum: scoring by blind reading" và mục "Calibration on the floor"; mục "Design" là nội dung chữ sẽ viết). Lệch với repo thì tin repo, và ghi lại.

Đầu phiên, mỗi lệnh chạy một mình: `git status` (sạch, nhánh `main`); `git fetch origin`; `git log --oneline -5` (commit trên cùng chứa handoff trên, hoặc mới hơn); `git log --oneline -3 p5a-bk-spec` (`cb4ada7` hoặc mới hơn); `node bin/bearingkit.cjs doctor` (sáu `ok`, một `skip`); hạn mức và ngữ cảnh bằng công cụ `get_usage` (không có thì hỏi owner con số; không ước); `claude plugin list` (đúng khi `git diff --stat <mã in ra> main -- skills hooks scripts agents` rỗng); trên nhánh `p5a-bk-spec`: suite `node --test --test-reporter=tap tests/*.test.cjs` chạy một mình (206/206; `bench-node-01` và `bench-py-01` nhạy tải). Kiểm tiến trình bằng `Get-CimInstance Win32_Process` qua PowerShell; máy không có `wmic`.

Việc: mục "Decisions waiting on the owner". Không chạy phiên đo nào và không viết chữ của skill trước khi owner chọn, trừ khi owner đã chọn trong lời mở phiên. Nếu owner chọn (a): làm đúng "Next work" bước 2 trên nhánh `p5a-bk-spec` (không merge `main` vào nhánh; kết quả ghi vào spec trên nhánh; handoff và `docs/status.md` viết trên `main`); mọi phiên đo chờ sau 2026-10-07 hoặc khi owner bảo chạy; trước mỗi lượt đọc chạy cổng thử với người đọc mới, cổng xong mới khởi động người đọc của lượt đo; người đọc A model `sonnet`, B model `opus`, brief nguyên văn trong spec, thư mục đọc ngoài repo. Nếu (b) hoặc (c): bắt đầu bằng một đề xuất ngắn rồi chờ.

Không làm lại: `shell-01`; thiết kế P5a; fixture, bảng tiêu chí và cổng thử của `spec-01`; hiệu chỉnh sàn.

Luật (tóm tắt): như khối tóm tắt trong Resume prompt của `2026-10-02-shell-replicated-source.md`, cộng: mọi ghi dưới `~/.claude`, kể cả thư mục bộ nhớ của phiên, cần một câu có riêng; script có dấu `\` hay backtick không chạy qua `node -e` trong bash; con số ngữ cảnh và hạn mức phải đo, không ước; không `rm` ngoài repo. Trả lời bằng tiếng Việt, cuối mỗi khối việc có "Đã xong" và "Còn lại"."

### Lỗi quy trình trong phần này của phiên (báo owner)

- Ghi "ngữ cảnh khoảng 75%" vào handoff trước mà không đo (thật ra 64%), và lấy đó làm lý do dừng.
- Khởi động người đọc cổng và người đọc hiệu chỉnh cùng lúc, trái thứ tự đã đăng ký (cổng trước).
- Phần ghi kết quả hiệu chỉnh được một reviewer rà (không có lỗi phải sửa); bảy chỗ nên sửa được áp dụng và commit không qua vòng rà thứ hai. Handoff này được commit sau khi phiên chính tự đối chiếu với spec, không qua reviewer.
