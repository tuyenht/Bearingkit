# Handoff · 2026-10-05 · P5b: fixture `plan-01` đã dựng, ba phiên sàn đã chạy và đã đọc mù: task **dùng được**; bước 3 chờ owner

Nhánh `main` · phiên Desktop (Opus 5.5) mở ngày 2026-10-05 bằng resume prompt của `2026-10-04-close.md`. Handoff này **tự đủ**: Block 2 dưới đây thay Block 2 của `2026-10-04-close.md`; Block 1 của file đó (P5a, công cụ đo của P5a, thiết kế P5b) giữ nguyên làm hồ sơ và vẫn đúng.

## Block 1 · Durable knowledge

### Lời owner trong phiên (nguyên văn, theo thứ tự)

1. Mở phiên: "Phiên tiếp của Bearingkit, máy owner, C:\Projects\Bearingkit (nhánh main, đầu là 79ac2aa hoặc một commit con của nó). Đọc docs/handoff/2026-10-04-close.md (Block 2 trước, rồi Block 1) và làm đúng mục "Resume prompt" của file đó. Nếu lệnh `git log -1 --diff-filter=A --name-only --format= -- docs/handoff/` in ra một file khác, đọc file đó trước, làm theo "Resume prompt" của nó và báo chỗ nó lệch với 2026-10-04-close.md; các câu "Đã chốt" dưới đây vẫn áp dụng, trừ khi file mới nói ngược, khi đó hỏi tôi. Lệch với repo thì tin repo và ghi lại. Con số hạn mức trong handoff đã cũ (tôi đã nâng gói từ x5 lên x20): chỉ tin get_usage.

Đã chốt, không hỏi lại:
1. Cho làm trọn "Next work" bước 2 của handoff, trên nhánh p5b-bk-plan, đúng thứ tự ghi ở đó, kể cả commit ghi mã băm SHA-256 của rubric.md và mục "Step 1 as built" vào spec trước phiên sàn đầu tiên: fixture plan-01 cùng hàm check của build.cjs, bảng tiêu chí hiệu chỉnh (rubric.md), công cụ đọc plan-readers.cjs và test của nó, ba phiên sàn (nhánh F, không plugin), rồi đọc mù bởi hai người đọc (A model sonnet, B model opus).
2. Trước ba phiên sàn: đọc get_usage, báo con số rồi chạy luôn, không cần chờ tôi (runner tự dừng ở 90% khung 5 giờ và 95% tuần).
3. Nếu runner tự dừng hoặc có phiên bị cắt: không chạy bù, không tính phiên đó là phiên sàn, vẫn đọc mù các phiên hoàn chỉnh để báo, nhưng không kết luận "dùng được" hay không. Nếu hai người đọc khớp dưới 90% trên 15 ô P1–P5 (ba plan, năm bẫy): làm theo luật trong spec (một cặp người đọc mới đọc lại, cặp đó quyết định), không cần hỏi, báo cả hai tỉ lệ khớp.
4. Xong, hoặc khi phải dừng theo mục 3, thì theo đúng thứ tự: ghi kết quả (hoặc trạng thái dở) vào spec trên nhánh; sang main viết handoff và docs/status.md; trước commit cuối làm hai phép thử độc lập như Luật yêu cầu (rà độ đầy đủ, diễn tập khởi động lạnh cho resume prompt) và sửa lỗ hổng; cập nhật bộ nhớ ngay sau commit cuối (handoff ghi rõ điều đó); dán nguyên git status; rồi dừng và báo tôi sàn làm gì và task có "dùng được" không theo luật đã chốt trong spec (P ≤ 3 trên 5 ở ít nhất 2/3 phiên sàn và O1 ở ít nhất 2/3), hoặc "chưa kết luận" nếu rơi vào mục 3. Không đổi luật đó sau khi thấy dữ liệu. Nếu không "dùng được" hoặc chưa kết luận: trình các đường đi tiếp kèm khuyến nghị, không tự chọn. Mọi commit vẫn qua rà độc lập trước khi commit.
5. Chưa làm khi tôi chưa bảo đi tiếp: cổng thử (gate) và các spec của nó, các phép kiểm bằng mã thuộc bước 3 của spec (hàm check của build.cjs ở mục 1 không thuộc nhóm này), chữ của skill bk-plan, mọi phiên K hay S.

Ghi bộ nhớ của phiên: có, chỉ trong thư mục bộ nhớ của dự án này, chỉ sửa bearingkit-status.md và dòng mục lục của nó trong MEMORY.md. Mọi ghi khác dưới ~/.claude hay ~/.gemini, cập nhật bản cài, cài phần mềm, xoá nhánh hay xoá dữ liệu đều cần tôi nói có."
2. Trong lúc ba phiên sàn chạy: "Audit kỹ các xử lý cũng như phản hồi ở tren. Cho tôi các khuyến nghị đề xuất tốt nhất phù hợp; cho tôi khuyến nghị nên xử lý tiếp theo thế nào nhé." Phiên chính trả lời bằng một bản audit (bốn lỗi quy trình, ba chỗ tự quyết) và khuyến nghị: để lượt đo chạy nốt, làm tiếp đúng thứ tự đã chốt, cộng ba việc bù (chạy lại suite, một reviewer mới rà hai lần sửa chưa ai đọc lại, từ đó mỗi commit một reviewer mới). Owner chưa trả lời bản audit đó; phiên chính làm theo khuyến nghị vì nó nằm trong lời "Đã chốt" và không đổi luật nào.

### Facts established (do not re-derive)

**P5b, task `plan-01`** (spec `docs/specs/2026-10-03-bk-plan-design.md`, **chỉ trên nhánh `p5b-bk-plan`**; hai mục mới ở cuối, "Step 1 as built" và "Calibration result", và dòng Status mới ở đầu):
- **Bước 1 đã dựng** (`cd09d07`): `evals/bench/plan-01/` (`app/`, `build.cjs`, `task.json`, `rubric.md`), `evals/analysis/plan-readers.cjs`, `tests/plan-readers.test.cjs`, `tests/bench-plan-01.test.cjs`. Fixture: app của `spec-01` cộng `docs/specs/csat-rating.md` (sáu yêu cầu, yêu cầu thứ sáu là đổi tên `assignee_id` thành `owner_id`), `src/jobs/export-tickets.js` (ghi `exports/tickets.json`; chú thích đầu file và README nói nhóm tài chính đọc file đó) và test của nó.
- **Rubric đóng băng** trước mọi phiên (`f35ccc4`): SHA-256 `45fb37dcf23cd839b698f3b4384b58d370153aed0af77133b2d965c2b732a378`.
- **Ba phiên sàn** (nhánh F, Sonnet, một lệnh `bench`, thư mục kết quả `evals/results/2026-10-05-bench-plan-01-natural`, không theo dõi bằng git): `meta.json` ghi kit `p5b-bk-plan` ở `f35ccc4`, `dirty: false`, không `stopped`, `cut` rỗng. Không phiên nào bị cắt.
- **Đọc mù**: A model `sonnet`, B model `opus`, mỗi người một agent mới, brief đúng nguyên văn; **khớp 15/15 ô bẫy (100%)**, nên cặp đầu quyết định, không có cặp thứ hai.
- **Kết quả: DÙNG ĐƯỢC** theo luật đã chốt (P ≤ 3 ở 3/3 phiên, cần 2/3; O1 3/3, cần 2/3). Luật không đổi.

| Phiên | P | P1 | P2 | P3 | P4 | P5 | Câu hỏi | G1 | G2 | O1 | O2 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| F1 | 2 | có | có | không | không | không | 11 | có | không | có | có |
| F2 | 0 | không | không | không | không | không | 6 | có | không | có | có |
| F3 | 2 | có | có | không | không | không | 10 | có | không | có | có |

- **Sàn làm gì**: không plan nào giữ `assignee_id` trong file export hay nối bên đọc tài chính với việc đổi tên (P3 0/3); không plan nào nêu phase nào chặn phase nào (P4 0/3); không plan nào đòi rà độc lập cho phép kiểm tổ chức (P5 0/3). P1 và P2 đạt ở F1 và F3 **nhờ một lựa chọn của người đọc**: hai plan đó viết theo lớp, gần cuối có một danh sách "Build order"/"Sequencing" ghép test với hành vi, và cả hai người đọc lấy danh sách đó làm "đơn vị"; đọc theo tiêu đề thì cả ba plan có P = 0. Kết luận không đổi theo cách đọc nào. Số câu hỏi 11, 6, 10 (trần bốn câu trượt 3/3; câu thứ 11 của F1 là một ghi chú mà cả hai người đọc vẫn đếm).
- Ngoài các ô bẫy: C1 (mỗi đơn vị nêu lệnh kiểm) không đạt ở cả ba; chỗ duy nhất hai người đọc lệch nhau là C1 của F2 (A không, B có). F1 và F2 mỗi phiên gọi một sub-agent có sẵn để dò mã (Explore, general), F3 không. Mỗi phiên 170 đến 288 giây, 405.626 đến 991.907 token, 0,336 đến 0,666 USD (bảng đầy đủ trong mục "Calibration result" của spec). Bí danh `sonnet` và `opus` của công cụ Agent trỏ tới model nào không được ghi lại (công cụ không báo), như ở P5a.
- Kết quả này **không nói gì về kit hay về nguồn**: chưa phiên K hay S nào chạy. "Dùng được" chỉ nghĩa là sàn còn chỗ để phân biệt.
- Bằng chứng (trên nhánh): `evals/bench/plan-01/calibration-2026-10-05/` (khoá, hai bài đọc, ba plan).
- Chi phí đo bằng `get_usage`: khung 5 giờ 7% trước, 10% sau ba phiên và hai lượt đọc; tuần 2% rồi 3% (gồm cả việc khác của phiên).

**Nợ trước bước 3** (một reviewer mới tìm ra sau khi rubric đã đóng băng; không mục nào đổi một ô chấm của lần hiệu chỉnh này; đã ghi trong spec):
- Rubric: chưa nói khi một plan có hai cách chia (theo tiêu đề và theo danh sách thứ tự) thì cái nào là "đơn vị"; P3 chưa xử trường hợp hoãn bỏ field cũ vì lý do không liên quan bên đọc, chữ "bước cuối **và** chờ bên đọc" lệch với "hoặc" của bảng, và chưa nói bên đọc phải được nêu ở đâu. Rubric sửa ở bước 3 nhận mã băm mới và ba plan sàn được đọc lại bằng nó (đã đăng ký).
- `build.cjs` `check`: `git status` đọc có dò đổi tên nên một file nguồn bị chuyển vào `docs/` sẽ che mất đường dẫn cũ; danh sách file đã commit đọc không có `-z` và không kiểm mã thoát.

**Suite**: trên nhánh có 213 test (206 của `main` cộng 7 mới). 213/213 hai lần đầu phiên; sau ba phiên sàn, bốn lượt chạy đầy đủ đều có test nhạy tải trượt (`bench-node-01`, `bench-py-01`, một lần thêm một test của `tests/evals.test.cjs`; lượt cuối 212/213), máy lúc đó có tải nền (CPU khoảng 36% lúc nghỉ). Từng file trượt chạy riêng đều xanh. **Không có lượt xanh đầy đủ nào trên commit cuối của nhánh.** Trên `main`: 206/206 đầu phiên, `main` không đổi mã.

**Chung**: `AGENTS.md`, `CLAUDE.md` không đổi. Không có `.claude/lessons.log`. Owner đã nâng gói (x5 lên x20): con số hạn mức trong các handoff cũ không còn dùng được, chỉ tin `get_usage`.

### Decisions taken

- Owner (lời mở phiên): năm điểm "Đã chốt" ở trên; ghi bộ nhớ của phiên: có, chỉ `bearingkit-status.md` và dòng mục lục của nó.
- Phiên chính, ghi trong spec trước mọi phiên: phiên không để lại plan thì không có P và không tính là phiên có P ≤ 3 (chỉ làm "dùng được" khó hơn); `O2` tính cả file phiên commit chồng lên fixture; thêm `tests/bench-plan-01.test.cjs` (handoff trước chỉ nêu test của công cụ đọc); giới hạn 900 giây, 60 lượt như `spec-01`.
- Phiên chính: sáu chỗ nợ ở trên (bốn của rubric, hai của `check`) để lại cho bước 3 thay vì sửa ngay, vì rubric đã đóng băng và ba plan đã chấm theo nó.

### Rejected options (do not re-propose)

- Sửa rubric sau khi đã đóng băng và trước khi đọc; dừng lượt đo giữa chừng để sửa quy trình; đổi luật "dùng được" hay cách đếm ô khớp sau khi thấy dữ liệu.
- Coi P1, P2 "đạt" của F1, F3 là sàn đã biết chia lát dọc: nó phụ thuộc cách chọn đơn vị.
- Các mục "Rejected options" của `2026-10-04-close.md` vẫn nguyên.

### Lessons (candidate lines)

Không có `.claude/lessons.log` trong repo (đã kiểm), nên không hỏi.

- Một rubric nói "đơn vị của plan" phải nói luôn khi plan có hai cách chia thì lấy cái nào; cả hai người đọc đã phải tự chọn và ghi chú.
- Chuỗi lệnh `test | grep && git commit` không dừng khi test đỏ (mã thoát là của `grep`): chạy suite thành một lệnh riêng, đọc kết quả, rồi mới commit.
- Mỗi vòng rà một agent mới; agent được gọi lại bị neo vào vòng trước và bỏ sót chỗ mình đã đề nghị.
- Test fixture gọi `check` (chạy suite lồng) nhiều lần làm suite chung nặng thêm: mỗi phép khẳng định gọi một lần.
- Lệnh heredoc nhiều dòng trong bash của máy này hỏng vì dấu nháy: script ghi bằng Write, đúng như Luật.

### Lỗi quy trình trong phiên (báo owner)

Commit `cd09d07` đi qua sau một lượt suite đỏ (212/213, `bench-node-01`; file đó chạy riêng xanh ngay sau); ba sửa một dòng cuối của rubric và `build.cjs`, và đoạn "Fixed now" của spec, được commit trước khi có ai đọc lại (một reviewer mới đọc lại sau đó: đoạn spec và thay đổi test sạch, rubric và `check` còn sáu chỗ nợ ở trên); ba vòng rà đầu dùng cùng một agent; vài lần sửa file bằng script ghi ra file thay vì Edit; một lần thử heredoc (hỏng, không ghi gì). Không lỗi nào chạm dữ liệu đo: rubric đóng băng trước phiên đầu, `meta.json` sạch.

## Block 2 · Resume payload

### State (kiểm bằng git lúc đóng)

- `main`: commit trên cùng chứa file này; đã push; cây sạch (`git status` cuối phiên dán trong câu trả lời đóng phiên). So với `79ac2aa`, `main` chỉ thêm file này và đổi `docs/status.md`.
- `p5b-bk-plan`: `2834037`, đã push. Ba commit của phiên: `cd09d07` (bước 1), `f35ccc4` (mã băm và "Step 1 as built"), `2834037` (kết quả, bằng chứng, test nhẹ hơn). `git diff --stat main p5b-bk-plan -- skills hooks scripts agents` rỗng: không chữ nào của skill đổi.
- `p5a-bk-spec`: `0beac4d`, đã push, **không merge**, không đổi trong phiên.
- Chỉ local, để đo: `p5a-bk-spec-before` `1951206`, `p4d-shell-before` `13d2937`.
- Nhánh đã nằm trong `main`, giữ lại, xoá cần owner nói có: `p4a-php`, `p4c-build-reach`, `p4b-topic-stackfiles`, `p4d-shell`, `p4e-shell-source`, `p4f-shell-replicate`, `p4g-shell-source-b`, `p4h-shell-source-skill-rule`, `p4-runner-kit-rev` (chỉ local). Không merge: `p4-step0-scope` (cho P5c), `claude/serene-franklin-3f3bb7`.
- Fixture đã dựng ngoài repo ở `C:/Projects/.bearingkit-evals/bench/plan-01` (lệnh `bench` dựng lại mỗi lần chạy).
- Bộ nhớ dự án (ngoài repo): `bearingkit-status.md` và dòng mục lục của nó được cập nhật **ngay sau commit cuối của phiên này**, theo câu "có" của owner **cho phiên này**; phiên sau muốn ghi thì cần câu "có" mới.
- `AGENTS.md`, `CLAUDE.md` không đổi. Không dấu `TEMPORARY`/`REMOVE` sống trong file phiên này đụng tới.
- Bản cài hằng ngày và kho Antigravity ở `e410f4d`, không đổi trong phiên; `doctor` đầu phiên: sáu `ok`, một `skip`.

### Decisions waiting on the owner

1. **Cho làm bước 3 của thứ tự trong spec P5b** (trên nhánh `p5b-bk-plan`): rubric sửa bốn chỗ nợ (mã băm mới, ba plan sàn đọc lại bằng nó), hai chỗ sửa của `check`, các plan của cổng thử (gate) kèm các trường hợp gần trượt, lệnh `gate` của công cụ đọc và test, rồi cho hai người đọc qua cổng. Khuyến nghị: **có**. Lý do: task đã qua hiệu chỉnh với sàn 2, 0, 2 trên 5; chi phí bước 3 là một lượt đọc cổng và một lượt đọc lại ba plan (ước dưới 2% khung 5 giờ theo số đo hôm nay, chưa đo cho bước này). Sau bước 3 phiên dừng và báo; chữ của skill (bước 4) và mọi phiên K, S (bước 5) vẫn chờ một câu riêng, trừ khi owner cho đi liền.
2. **Bốn cách đọc của rubric sửa** (mỗi cái đổi cái gì đạt một bẫy, nên là quyết định của owner; một câu "có" cho câu 1 mà không nói gì thêm được hiểu là duyệt cả bốn khuyến nghị dưới đây, và phiên sau ghi rõ như vậy vào spec):
   - (a) Đơn vị của một plan có hai cách chia: lấy cách chia **chứa các bước, file và phép kiểm** (nơi công việc được mô tả), không lấy danh sách thứ tự tóm tắt; áp cho mọi mục dùng "đơn vị": P1, P2, P4 và C1. Hệ quả: F1 và F3 của sàn nhiều khả năng thành P1, P2 không đạt khi đọc lại. Khuyến nghị: có (đúng ý bảng bẫy: "no phase is one layer").
   - (b) P3, bỏ field cũ được hẹn theo ngày hay "sau này" mà không chờ bên đọc, dù hẹn trong plan hay ngoài plan: **không đạt**. "Để ngoài plan" chỉ đạt khi lý do là bên đọc, hoặc khi plan giữ field vì bên đọc đã nêu tên và im lặng hẳn về chuyện bỏ (luật im lặng của rubric đã đóng băng, giữ nguyên). Khuyến nghị: có.
   - (c) P3, chữ "bước cuối và chờ bên đọc": giữ cả hai vế như bảng bẫy và rubric đã đóng băng, chỉ nói rõ "bước cuối" là bước cuối **của việc đổi tên** (các phase khác của tính năng đứng sau nó vẫn được). Đây là làm rõ, không nới. Khuyến nghị: có.
   - (d) P3, bên đọc phải được nêu tên **gắn với file export hoặc với việc đổi tên**, ở bất kỳ chỗ nào của plan; nêu tài chính chỉ như một tiền lệ cho file khác thì không tính. Khuyến nghị: có.
3. **"Các phép kiểm bằng mã" của bước 3**: spec không nói đó là gì. Khuyến nghị: không viết bộ chấm bẫy bằng luật (ở `spec-01` bộ chấm đó không dùng được sau hai vòng rà); phần mã của bước 3 chỉ gồm hai chỗ sửa của `check` và lệnh `blind-gate`, `gate` của `plan-readers.cjs`, kèm test. Im lặng được hiểu là đồng ý.
4. Bốn chỗ phiên chính tự quyết (mục "Decisions taken", dòng thứ hai): owner có thể bác; không bác thì giữ.

### Open threads

- Bảng đăng ký đầy đủ của lượt đo (F, S, K-trước, K-sau, tám phiên mỗi nhánh, phép thử hoán vị, guard hồi quy) chưa viết: spec nói nó được viết thành một addendum trước mọi phiên K; trong "Next work" nó thuộc bước 5, không thuộc bước 3.
- P1 và P2 chỉ phân biệt được nếu rubric sửa chốt "đơn vị" là gì; theo cách đọc chặt, sàn là 0, 0, 0 và cả năm bẫy đều còn chỗ.
- So với nguồn ở P5b nhiều khả năng ra "chưa so với nguồn" (`to-tickets` đặt `disable-model-invocation: true`).
- Suite nhạy tải khi máy bận: cần một lượt xanh đầy đủ, chạy một mình lúc máy rảnh, trước khi bất cứ thứ gì của nhánh vào `main`.
- `docs/status.md` sát trần "khoảng 15 KB": lần cập nhật sau lại phải thay ô.
- Các luồng mở cũ: "Open threads" của `2026-10-04-close.md` (chữ `bk-spec` trên `p5a-bk-spec` và ba việc nợ trước khi merge; vì sao `domain-language.md` thôi được mở) và của `2026-10-03-close.md`, `2026-10-02-close.md`.

### Live temporary bypasses

Không có.

### Next work

1. Chờ owner trả lời câu 1 ở "Decisions waiting" (hoặc owner đã trả lời trong lời mở phiên).
2. Khi có: `git switch p5b-bk-plan`, đọc cả spec (`docs/specs/2026-10-03-bk-plan-design.md`: "Measurement" mục Order, bảng bẫy, "Step 1 as built", "Calibration result" và danh sách "Owed before step 3"), rồi theo thứ tự:
   - Trước hết ghi vào spec (mục mới "Step 3", cùng commit với mã băm mới của rubric ở dưới) lời owner nguyên văn và cách phiên hiểu nó: duyệt câu nào trong bốn câu chờ, sửa câu nào. Câu "có" đó không gồm việc ghi bộ nhớ của phiên.
   - Sửa `evals/bench/plan-01/rubric.md` theo bốn cách đọc (a) đến (d) ở "Decisions waiting" câu 2, đúng như owner đã duyệt hoặc đã sửa; mỗi cách đọc kèm một ví dụ. Không đổi gì khác về nội dung của một bẫy; nếu khi viết thấy cần, nêu ra cho owner, không tự làm.
   - Sửa `check` của `build.cjs` (hai chỗ nợ: `git status` thêm `--no-renames`; danh sách file đã commit đọc với `-z` hoặc `-c core.quotePath=false` và kiểm mã thoát) kèm test có thể trượt.
   - Viết các plan của cổng thử `evals/bench/plan-01/gate/g01.md`, … với `expected.json` (mỗi plan: P1 đến P5, C1, `questions`, `numbered`, `recommended`; không có `plan` hay `note`; các ô mong đợi do người viết cổng định, reviewer rà trước khi đọc), mẫu là `evals/bench/spec-01/gate/` (11 spec ở đó). Tối thiểu mười plan: một plan tham chiếu đạt cả năm bẫy với tối đa bốn câu hỏi đánh số có khuyến nghị; năm biến thể, mỗi cái trượt đúng một bẫy; ba trường hợp gần trượt (phase đầu tên "rating end to end" nhưng chỉ thêm bảng, lấy từ mục "Limits" của spec; "báo cho tài chính" mà vẫn đổi tên trong file export, lấy từ rubric; plan viết theo lớp có danh sách thứ tự ghép test ở gần cuối, lấy từ ba plan sàn); một plan có hơn bốn câu hỏi không đánh số. C1 có trong `expected.json` nhưng không thuộc luật đạt của cổng (nó là mục "reported").
   - Thêm `blind-gate` và `gate` vào `plan-readers.cjs` theo mẫu `spec-readers.cjs`, kèm test; bỏ dòng so với bộ chấm theo luật của mẫu (`plan-01` không có bộ chấm đó).
   - **Luật đạt của cổng, ghi vào spec trước khi đọc** (mẫu `spec-01`, hằng `GATE_RULE`): mỗi người đọc sai tối đa một plan trên mỗi mục (P1 đến P5, `numbered`, `recommended`), số câu hỏi đúng trừ tối đa hai plan; cả hai người đọc đều phải đạt.
   - Suite trên nhánh (213 cộng test mới; `node --test tests/*.test.cjs`) chạy thành một lệnh riêng lúc máy rảnh, đọc kết quả rồi mới commit; chỉ các file nhạy tải trượt (`bench-node-01`, `bench-py-01`, và đã một lần `tests/evals.test.cjs`) thì chạy riêng từng file đó, ghi đúng như vậy. Rà độc lập: mỗi commit một reviewer Sonnet **mới**, chỉ đọc; sửa theo góp ý thì thêm một reviewer mới nữa; sau hai vòng mà còn lỗi phải sửa thì dừng và báo owner. Commit; push. Ghi mã băm mới của rubric và luật đạt của cổng vào spec (commit riêng) trước khi đọc.
   - Đọc `get_usage`, báo con số rồi chạy luôn (đọc cổng không phải phiên `bench`), trừ khi khung 5 giờ trên 80%: khi đó hỏi owner. Hai người đọc mới (A `sonnet`, B `opus`, mỗi người một agent mới) đọc cổng: thư mục đọc ngoài repo (thư mục nháp của phiên), file khoá nằm cạnh thư mục đọc, không nằm trong nó; hạt giống `plan-01-gate-<YYYY-MM-DD>`; một câu trả lời không phải đúng các dòng JSON thì bị `reading` từ chối: bỏ agent đó, gọi một agent mới cùng model với cùng brief, ghi vào spec là có một câu trả lời bị loại; brief là đoạn trích dẫn ở dòng 149 của `docs/specs/2026-10-02-bk-spec-design.md` (mục "Addendum: scoring by blind reading"), nguyên văn, chỉ thay "spec"/"specs" bằng "plan"/"plans" và `s01.md` bằng `p01.md`; lưu trả lời nguyên văn thành `.jsonl`.
   - **Cổng trượt** (một người đọc không đạt luật): dừng, ghi kết quả vào spec, báo owner với các đường đi tiếp; không sửa rubric hay plan của cổng rồi đọc lại khi owner chưa nói.
   - **Cổng đạt**: một cặp người đọc mới nữa đọc lại ba plan sàn bằng rubric mới (`blind` trên `2026-10-05-bench-plan-01-natural`, hạt giống `2026-10-05-bench-plan-01-natural-reread`; nếu thư mục kết quả đó không còn, ba plan nằm nguyên văn trong `evals/bench/plan-01/calibration-2026-10-05/*.plan.md`, chép tay dưới tên trung tính và ghi lệch đó vào spec). Lần đọc này không mở lại kết luận "dùng được" (đã đăng ký). Khớp dưới 90% trên 15 ô: một cặp mới đọc lại (cùng bản sao mù, hạt giống không đổi), cặp đó quyết định, báo cả hai tỉ lệ (luật của spec, áp cho cả lần đọc lại).
   - **Mọi đường dừng sớm** (cổng trượt, hai vòng rà còn lỗi, hạn mức) vẫn kết thúc như đường đủ: trạng thái dở ghi vào spec, handoff và `docs/status.md` trên `main`, hai phép thử đóng phiên, rồi báo owner.
   - Chép khoá và các bài đọc (`key.json`, `reading-A.jsonl`, `reading-B.jsonl`) vào `evals/bench/plan-01/gate/` và `calibration-<YYYY-MM-DD>-reread/`; ghi kết quả vào spec; rà; commit; push; handoff (file mới) và `docs/status.md` trên `main`; hai phép thử đóng phiên; **hỏi owner câu "có" cho việc ghi bộ nhớ của phiên trước commit cuối** (nếu lời mở phiên chưa cho); **dừng và báo owner**.
3. Sau bước 3, mỗi cái chờ owner: bước 4 (chữ của `bk-plan` và `references/vertical-slices.md`, đóng băng ở một commit), bước 5 (addendum đăng ký đầy đủ viết trước mọi phiên K, driver, thăm dò reach, lượt đo xen kẽ), bước 6 (guard hồi quy).
4. Sau P5b: P5c (dòng Bước 0), `c-cpp`: mỗi cái đề xuất rồi chờ owner.

### Resume prompt

"Phiên tiếp của Bearingkit, máy owner, `C:\Projects\Bearingkit`. Đọc theo thứ tự: `docs/handoff/2026-10-05-p5b-calibration.md` (Block 2 trước, rồi Block 1); khối "Luật" trong lời owner ở `docs/handoff/2026-09-26-p3b-node-guard.md` (đoạn bắt đầu bằng "Luật:", áp dụng nguyên văn; ngoại lệ đã chốt: người đọc B dùng Opus); `docs/status.md`; spec P5b trên nhánh, cả file: `git show p5b-bk-plan:docs/specs/2026-10-03-bk-plan-design.md`. Khi cần chi tiết của P5a hay thiết kế P5b: Block 1 của `docs/handoff/2026-10-04-close.md`. Lệch với repo thì tin repo, và ghi lại.

Đầu phiên, mỗi lệnh chạy một mình: `git status` (sạch, nhánh `main`); `git fetch origin` (không báo commit mới nào trên `main`, `p5b-bk-plan`, `p5a-bk-spec`; có thì đọc trước); `git log -1 --diff-filter=A --name-only --format= -- docs/handoff/` (in ra `docs/handoff/2026-10-05-p5b-calibration.md`; in ra file khác thì đọc file đó trước và báo chỗ lệch); `git rev-parse p5b-bk-plan` (`2834037…` hoặc mới hơn); `git diff --stat main p5b-bk-plan -- skills hooks scripts agents` (rỗng); `git rev-parse p5a-bk-spec` (`0beac4d…`); `node bin/bearingkit.cjs doctor` (sáu `ok`, một `skip`); hạn mức và ngữ cảnh bằng công cụ `get_usage` (nạp bằng ToolSearch `select:mcp__ccd_session_mgmt__get_usage`; không có thì hỏi owner con số, không ước; con số trong các handoff cũ không dùng được, owner đã nâng gói); suite trên `main` chạy một mình, thành một lệnh riêng (206/206; `bench-node-01` và `bench-py-01` nhạy tải: chỉ chúng trượt thì chạy riêng hai file đó; trên nhánh `p5b-bk-plan` là 213). Trước mọi lệnh `bench`, kiểm không còn tiến trình `bench` hay driver nào sống, bằng `Get-CimInstance Win32_Process` qua một file `.ps1` viết mới trong thư mục nháp của phiên (không có sẵn trong repo; lọc dòng lệnh theo `bench`, `spec-guard-run`, `.bearingkit-evals`; đối chứng dương: script tự tìm thấy chính nó, kết quả mong đợi là 0 tiến trình khác); máy không có `wmic`. Bước 3 không chạy lệnh `bench` nào.

Đã đóng, không làm lại: P5a trên `spec-01` (không đo lại, không đổi ngưỡng, không merge nếu owner chưa nói). P5b bước 1 và bước 2: fixture `plan-01` đã dựng, rubric đóng băng, ba phiên sàn đã chạy (không phiên nào bị cắt) và đã đọc mù (khớp 15/15): **task dùng được** theo luật đã chốt (P 2, 0, 2 trên 5; O1 3/3). Không chạy lại ba phiên sàn, không đổi luật đó, không nói gì về kit hay nguồn từ kết quả này.

Việc đang chờ owner (mục "Decisions waiting on the owner", bốn câu): cho làm bước 3; bốn cách đọc (a) đến (d) của rubric sửa; "các phép kiểm bằng mã" là gì; bốn chỗ phiên trước tự quyết. Nếu lời mở phiên của owner chưa nói có cho bước 3: hỏi, không làm. Một câu "có" không nói gì thêm được hiểu là duyệt khuyến nghị của cả bốn câu chờ (trong câu 2 là cả bốn cách đọc (a) đến (d)); nó không gồm việc ghi bộ nhớ của phiên; ghi cách hiểu đó vào spec ở bước đầu của "Next work" 2. Khi đã có: làm "Next work" bước 2 của handoff này đúng thứ tự trên nhánh `p5b-bk-plan`; các điểm dừng nằm ngay trong đó (cổng trượt, hai vòng rà còn lỗi, khung 5 giờ trên 80%); xong thì dừng và báo. Chữ của skill `bk-plan` và mọi phiên K hay S chờ một câu riêng của owner. Năm điểm "Đã chốt" của lời mở phiên 2026-10-05 chỉ áp cho bước 1 và 2, không tự kéo sang bước 3.

Luật (tóm tắt, không thay bản đầy đủ; bản đầy đủ là lời owner và rộng hơn `AGENTS.md` ở một điểm: cho đọc dưới hai thư mục dưới đây): đọc dưới `~/.claude` và `~/.gemini` được, không in bí mật, IP hay tên máy, không đọc file credentials; mọi ghi dưới hai thư mục đó (kể cả bộ nhớ của phiên: câu "có" của owner ở phiên trước chỉ cho phiên đó), sửa repo khác, xoá, lưu trữ, cài phần mềm, cập nhật bản cài (chỉ từ marketplace, không bao giờ từ checkout local, luôn `--scope user` và `--scope local`) đều cần owner nói một câu có riêng, gom câu hỏi; hết hạn mức thì hỏi owner trước khi chuyển phần việc không đo sang cloud session; so token chỉ giữa phiên cùng số tool; agent phải dừng mọi việc nền trước khi trả lời; không Python; không thử lệnh bằng `--help`; lệnh đưa owner chạy viết cho PowerShell 5.1; script nhiều dòng ghi ra file bằng Write (không heredoc), sửa bằng Edit; đọc hạn mức và báo trước mỗi phép đo; không hai lệnh `bench` cùng lúc, không đụng checkout khi một lệnh đang chạy, kiểm `meta.json` sau mỗi lệnh (đúng nhánh, đúng mã, `dirty: false`, không `stopped`, `cut` rỗng); đăng ký phép đo trước mọi phiên, đổi luật đã đăng ký sau khi thấy dữ liệu là quyết định của owner; ít nhất 8 lượt mỗi nhánh và báo p; ghi skill nào thật sự được gọi; không nói "tốt hơn nguồn" khi chưa có dữ liệu; đo trước khi commit văn bản model đọc vào `main`; mọi phép kiểm "không có gì" cần đối chứng dương; rà độc lập (Sonnet, chỉ đọc, **mỗi commit một agent mới**) trước mọi commit, kể cả sau khi sửa theo góp ý; suite chạy thành lệnh riêng, không nối với lệnh commit; phiên chính Opus, agent đọc hàng loạt và reviewer Sonnet, phiên đo Sonnet 5; brief của agent cấm lệnh nền, cấm ghi file, cấm mạng, cấm tìm ngoài repo, cấm Python; commit theo đường dẫn cụ thể, conventional commit, không dòng attribution, push sau mỗi thay đổi; handoff là file mới, chép nguyên văn lời owner; `docs/status.md` thay đúng ô, dưới ~15 KB; dừng ở 80% ngữ cảnh với handoff; khi đóng phiên làm hai phép thử độc lập (rà độ đầy đủ, diễn tập khởi động lạnh), sửa lỗ hổng, dán nguyên `git status`. Trả lời bằng tiếng Việt, cuối mỗi khối việc có "Đã xong" và "Còn lại"."

### Hạn mức và ngữ cảnh lúc đóng (đo bằng `get_usage`)

Khung 5 giờ 10% (mở lại khoảng 15:00 giờ VN ngày 2026-10-05), tuần 3% (mở lại 2026-10-07 10:00 giờ VN), ngữ cảnh phiên chính 24% lúc viết file này. Gói đã nâng: các con số tuần của handoff cũ không so được với số này.

### Đánh giá độc lập lần đóng phiên này

- **Rà độ đầy đủ** (Sonnet, agent mới, chỉ đọc): không lỗi phải sửa. Khớp: mọi mã commit, đầu nhánh và trạng thái đã push; ba commit của nhánh; phép `git diff` rỗng trên `skills hooks scripts agents`; mã băm rubric so với spec; `meta.json`; bảng kết quả, số câu hỏi và 15/15 so với hai bài đọc; phần mô tả P3 so với ba plan; mọi luồng mở và câu chờ của `2026-10-04-close.md` đều được mang sang hoặc trỏ tới; không dấu `TEMPORARY`/`REMOVE` sống, không bí mật. Hai chỗ nên sửa, đã sửa: số chỗ nợ ghi "năm" trong khi là sáu; bảng thiếu C1, chỗ lệch duy nhất của hai người đọc, sub-agent của F1 và F2, thời lượng và chi phí. Ghi chú để lại: hàng 7 và mục 1 của `docs/status.md` chưa nhắc `plan-01` (task chỉ có trên nhánh; dòng "Cập nhật" đã nói). Agent tự khai đã nối lệnh git với `grep`, `sed`, `head`, `wc` (chỉ đọc, ngoài danh sách cho phép).
- **Diễn tập khởi động lạnh, vòng một** (Sonnet, agent mới, chỉ đọc): sáu nhóm lỗ hổng, đã sửa cả: không có luật dừng khi cổng trượt, khi lần đọc lại khớp dưới 90% hay khi rà mãi còn lỗi; ai quyết các chỗ sửa rubric (giờ là bốn cách đọc (a) đến (d) trình owner kèm khuyến nghị); "các phép kiểm bằng mã" không ai định nghĩa (giờ là một câu chờ owner); số và loại plan của cổng, khoá của `expected.json`, luật đạt; brief của người đọc nằm ở đâu, hạt giống; mấy chỗ lệch nhỏ (đếm "ba"/"bốn", addendum thuộc bước nào, lệnh kiểm commit trên cùng, file `.ps1` không có trong repo, câu "có" cho bộ nhớ, luật suite trên nhánh, thư mục kết quả không theo dõi bằng git).
- **Vòng hai** (Sonnet, agent mới khác, chỉ đọc): còn sáu chỗ, đã sửa cả, không chạy vòng ba: cách đọc (c) nới bảng bẫy mà không nói (giờ giữ nguyên hai vế, chỉ làm rõ "bước cuối của việc đổi tên") và chọi với (b); các đường dừng sớm không nói phải viết handoff; câu "có" trần duyệt cái gì và ghi ở đâu; (a) chưa nói khi cả hai cách chia đều có nội dung và chưa nói áp cho P4, C1; thiếu lệnh chạy suite; chi tiết của cổng (câu trả lời hỏng, chỗ để khoá, định dạng ngày, tên file bài đọc, khoá của `expected.json`). Agent tự khai đã đọc một file kết quả lệnh nằm ngoài repo vì đầu ra của `git show` bị cắt (chỉ đọc).
