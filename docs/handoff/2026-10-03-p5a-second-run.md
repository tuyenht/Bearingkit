# Handoff · 2026-10-03 · P5a: đóng băng lần hai và lượt guard thứ hai; hai ngưỡng trượt (G2 4/8; `domain-language.md` mở 0/8) → không merge, chờ owner

Cùng phiên Desktop (Opus 5.5) với `2026-10-03-p5a-driver.md` và `2026-10-03-p5a-guard-result.md`. Block 2 dưới đây thay Block 2 của hai file đó; Block 1 của chúng và của `2026-10-03-close.md` giữ nguyên làm hồ sơ. Kết quả đầy đủ: hai mục "Result of the guard run (2026-10-03)" và "Result of the second guard run (2026-10-03)" của `docs/specs/2026-10-02-bk-spec-design.md` **trên nhánh `p5a-bk-spec`**.

## Block 1 · Durable knowledge

### Lời owner (nguyên văn, sau các câu đã chép ở hai handoff trước của phiên)

- Sau báo cáo kết quả lượt một (ba đường đi: (a) đóng băng lần hai cho trần bốn câu rồi đo lại, khuyến nghị; (b) đóng P5a không merge; (c) đổi ngưỡng): "Audit kỹ các xử lý ở trên, tiếp tục theo khuyến nghị." Phiên chính hiểu là (a), một uỷ quyền theo khuyến nghị.

### Facts established (do not re-derive)

- **Đóng băng lần hai**: `075b05a` trên `p5a-bk-spec`. Sáu câu trong hai file (`skills/bk-spec/SKILL.md` bước 5; `references/brainstorming.md` luật 2 và 7): đếm lượt hỏi trước khi viết; một câu hỏi một quyết định (hai quyết định ghép trong một câu tính là hai; một quyết định nhiều lựa chọn là một); quá bốn thì giữ bốn câu đổi việc nhiều nhất, quyết định loại COUNCIL luôn nằm trong đó, phần còn lại ghi thành giả định kèm mặc định và độ tin cậy; trần giữ nguyên dù yêu cầu nói gì về câu hỏi. Đăng ký trước mọi phiên, ngưỡng không đổi. Rà độc lập hai lượt (không lỗi phải sửa; lỗ hổng "quyết định COUNCIL bị ghi thầm thành giả định" do reviewer bắt, đã vá trước khi đóng băng); suite 206/206.
- **Lượt guard thứ hai**, 2026-10-03 10:04–11:09 UTC, K-sau-2 `p5a-bk-spec@a025e53` (bằng `075b05a` ở mọi đường dẫn phiên nạp), K-trước `p5a-bk-spec-before@1951206`; 24 phiên, không phiên nào bị cắt hay dừng. Thăm dò reach: `bk-spec` 2/2. Phiên thử S: không lệnh gọi Skill nào bị từ chối. Cổng thử của ngày (hạt giống `gate-2026-10-03-2`): đạt. Hai người đọc khớp 168/168 ô hazard.

| | K-trước | K-sau-2 | S |
|---|---|---|---|
| H mỗi phiên | 7 ×8 | 7 ×8 | 7 7 6 6 7 7 7 7 |
| O1 / O2, mồi, G1 | 8 / 8, 0, 8 | 8 / 8, 0, 8 | 8 / 8, 0, 8 |
| **G2 (tối đa bốn câu)** | 2 | **4** | 2 |
| Số câu hỏi mỗi spec (số lớn hơn của hai người đọc) | 7 8 12 9 7 12 4 4 | 7 4 5 5 4 4 4 5 | 9 10 11 12 8 11 4 4 |
| G2 theo riêng một người đọc | A 2, B 2 | A 7, B 4 | A 2, B 2 |
| `brainstorming.md` / `domain-language.md` mở | 6 / 0 | 6 / **0** | 0 / 0 |
| Chi phí trung vị (USD) | 0,331 | 0,357 | 0,285 |

- **Ngưỡng**: trung vị H 7 (đạt); O1/O2 (đạt); mồi (đạt); G1 (đạt); **G2 4/8, cần 6/8 (trượt)**; `brainstorming.md` 6/8 (đạt); **`domain-language.md` 0/8, cần 4/8 (trượt)**; người đọc khớp 100% (đạt); guard hồi quy **chưa chạy**. Theo luật đã đăng ký: **không merge, không đóng băng lần ba khi owner chưa nói**.
- **Về trần bốn câu**: 7/8 spec của K-sau-2 liệt kê đúng bốn câu đánh số, một spec sáu; ba trong bảy spec đó trượt vì một mục vẫn ghép hai quyết định (hai spec: đặt lại một thứ "hay" giới hạn một thứ khác; spec thứ ba: một mốc biên và tương tác của nó với luật khác), người đọc B đếm là hai (đúng bảng tiêu chí), người đọc A đếm là một; luật đăng ký lấy số lớn hơn. Spec sáu câu cũng có một mục ghép, nên bốn trên tám spec mang mục ghép. Qua hai lượt, spec của K-sau có ít câu hỏi hơn K-trước cùng lượt (trung vị 5 so với 10,5; rồi 4,5 so với 7,5); không phép nào trong hai là phép thử đã đăng ký.
- **Sàn dịch giữa hai lượt** (cùng commit K-trước): G2 0/8 rồi 2/8; S 0/8 rồi 2/8.
- **`domain-language.md` thôi được mở**: ở lượt một, trên cùng một bản chữ, năm phiên K-sau đầu theo giờ (kết thúc 08:43–09:15 UTC) đều đọc file, ba phiên cuối (09:17–09:26) không; ở lượt hai không phiên nào đọc (0/8, thăm dò 0/2). Dòng "Read first" của `SKILL.md` giống nhau ở hai bản đóng băng, nhưng bước 5 và `brainstorming.md` thì khác: riêng lượt hai không tách được chữ khỏi giờ; chính lượt một, nơi chữ không đổi, mới chỉ ra nguyên nhân không nằm ở chữ. Một thay đổi theo giờ ở phía host hay model khớp với điều thấy được nhưng **chưa xác lập** (tiền lệ: `docs/handoff/2026-09-28-p4-step0-php-build.md`).
- **So với nguồn: chưa so** (3/8 phiên S gọi `superpowers:brainstorming`; cần 4/8).
- Bằng chứng trên nhánh: `evals/bench/spec-01/guard-2026-10-03/` (lượt một) và `evals/bench/spec-01/guard-2026-10-03-run2/` (lượt hai). Log của driver: `evals/results/spec-guard-log.txt` và `spec-guard-2-log.txt` (không theo dõi bằng git; bản sao nằm trong hai thư mục bằng chứng).
- Chi phí lượt hai theo hạn mức (`get_usage`): khung 5 giờ 0% → 19%, tuần 70% → 72% (ngay sau lượt đo; con số ở cuối file là lần đọc sau).
- Mọi commit đều qua rà độc lập (Sonnet, chỉ đọc) trước khi commit.

### Decisions taken

- Owner (theo khuyến nghị): đường (a) sau lượt một.
- Phiên chính: không chạy guard hồi quy sau khi ngưỡng trượt; không đóng băng lần ba.

### Rejected options (do not re-propose)

- Tự merge; đổi ngưỡng sau khi thấy dữ liệu; đóng băng lần ba không có lời owner.
- Coi chênh lệch số câu hỏi là kết quả đã đăng ký; nói gì về hơn kém so với nguồn.

### Lessons (candidate lines)

- Một reference có thể thôi được mở giữa chừng một lượt đo mà chữ không đổi: đọc reach theo thứ tự thời gian của phiên trước khi quy cho chữ.
- Ngưỡng dựa trên "số lớn hơn của hai người đọc" phạt câu hỏi ghép: chữ phải nói rõ một câu một quyết định, và ngay cả khi nói rõ, Sonnet vẫn ghép ở một nửa số spec.
- Sửa nhanh bằng `sed` trên file script làm hỏng tên hàm (`Object.keys` → `Object.keys2`): sửa script bằng Edit.

## Block 2 · Resume payload

### State (kiểm bằng git)

- `main`: commit trên cùng chứa file này; đã push; cây sạch.
- `p5a-bk-spec`: `03a20ce`, đã push, **chưa merge và không được merge** khi owner chưa quyết. Chữ dưới `skills/` bằng `075b05a` (`git diff --stat 075b05a p5a-bk-spec -- skills` rỗng). Bản đóng băng lần một là `f2237b0`.
- `p5a-bk-spec-before`: `1951206`, chỉ local. Các nhánh khác như `2026-10-03-close.md`.
- Không dấu `TEMPORARY`. Bản cài hằng ngày và kho Antigravity không đổi (`e410f4d`).

### Decisions waiting on the owner

1. **Đường đi tiếp của P5a** (cuối mục kết quả lượt hai trong spec):
   - (a) **khuyến nghị**: thôi đo P5a trên `spec-01`, giữ chữ trên nhánh, không merge, sang P5b. Lý do (là nhận định của phiên chính, không phải kết quả): hai lượt trên một yêu cầu đã cho thấy gần hết điều task này cho thấy được; đóng băng lần ba sẽ khớp chữ thêm vào một prompt và một cách đếm; ngưỡng `domain-language.md` không sửa được bằng chữ khi chưa rõ vì sao file thôi được mở.
   - (b) đóng băng lần ba (câu hỏi ghép; dòng "Read first" khó bỏ qua hơn) rồi đo lần ba: mỗi lượt tốn khoảng 20% khung 5 giờ và 2–4% tuần.
   - (c) merge theo quyết định của owner rằng ngưỡng đặt sai (ví dụ tính G2 theo cách đếm rộng hơn "bốn mục đánh số", hay bỏ ngưỡng reach): đổi luật đã đăng ký sau khi thấy dữ liệu, không khuyến nghị; nếu chọn, guard hồi quy chạy trước và câu hỏi về `module-design.md`, `prototyping.md` được hỏi trước khi merge.

### Open threads

- Vì sao `domain-language.md` thôi được mở từ khoảng 09:15 UTC ngày 2026-10-03: chưa xác lập. Ảnh hưởng tới mọi phép đo reach của reference về sau: đọc theo thứ tự thời gian.
- Guard hồi quy của `bk-spec` chưa chạy: nợ trước mọi lần merge.
- So với nguồn chưa làm được ở chế độ tự nhiên (0/8 rồi 3/8 phiên S nạp skill nguồn).
- Các luồng mở của `2026-10-03-close.md` còn nguyên.

### Live temporary bypasses

Không có.

### Next work

1. Chờ owner chọn (a), (b) hay (c).
2. Nếu (a): ghi quyết định vào spec trên nhánh và `docs/status.md`; rồi đề xuất P5b (`bk-plan`; phạm vi đã duyệt ở `docs/handoff/2026-10-02-shell-replicated-source.md`, "Decisions waiting", điểm 1–5), chờ owner trước khi dựng gì; bài học áp dụng: ba phiên sàn trên bản nháp fixture trước khi viết bộ chấm, và đọc reach theo thời gian.
3. Sau đó P5c, `c-cpp`: mỗi cái đề xuất rồi chờ owner.

### Resume prompt

"Phiên tiếp của Bearingkit, máy owner, `C:\Projects\Bearingkit`. Đọc `docs/handoff/2026-10-03-p5a-second-run.md` (Block 2 trước, rồi Block 1), khối "Luật" ở `docs/handoff/2026-09-26-p3b-node-guard.md` (áp dụng nguyên văn; ngoại lệ đã chốt: người đọc B của `spec-01` dùng Opus), `docs/status.md`, và hai mục kết quả của spec trên nhánh (`git show p5a-bk-spec:docs/specs/2026-10-02-bk-spec-design.md`, từ "Result of the guard run (2026-10-03)" tới hết). Nền cũ hơn: `docs/handoff/2026-10-03-close.md`. Lệch với repo thì tin repo và ghi lại. Đầu phiên, mỗi lệnh chạy một mình: `git status` (sạch, `main`); `git fetch origin`; `git log --oneline -3`; `git rev-parse p5a-bk-spec` (`03a20ce…` hoặc mới hơn); `git diff --stat 075b05a p5a-bk-spec -- skills` (rỗng); `git rev-parse p5a-bk-spec-before` (`1951206…`, chỉ có trên máy owner); `node bin/bearingkit.cjs doctor` (sáu `ok`, một `skip`); hạn mức và ngữ cảnh bằng `get_usage` (nạp bằng ToolSearch `select:mcp__ccd_session_mgmt__get_usage`). P5a đã đo hai lượt trên `spec-01`: lượt hai trượt hai ngưỡng (G2 4/8, cần 6/8; `domain-language.md` mở 0/8, cần 4/8); không merge, không đo lại, không đổi ngưỡng, không đóng băng lần ba nếu owner chưa nói. Bằng chứng trên nhánh: `evals/bench/spec-01/guard-2026-10-03/` và `guard-2026-10-03-run2/`. Guard hồi quy chưa chạy, còn nợ trước mọi lần merge chữ của `bk-spec`. Việc đang chờ owner: chọn (a) thôi đo P5a, giữ chữ trên nhánh, sang P5b (khuyến nghị); (b) đóng băng lần ba rồi đo lần ba; (c) merge theo quyết định đổi ngưỡng. Chưa có câu trả lời thì hỏi, không tự làm. Mọi ghi dưới `~/.claude` hay `~/.gemini` (trừ `bearingkit-status.md` và dòng mục lục của nó trong bộ nhớ dự án, owner đã cho phép), cập nhật bản cài, cài phần mềm, xoá nhánh hay dữ liệu đều cần owner nói có. Trả lời bằng tiếng Việt, cuối mỗi khối việc có "Đã xong" và "Còn lại"."

### Hạn mức và ngữ cảnh lúc viết (đo bằng `get_usage`)

Khung 5 giờ 20% (mở lại 22:10 giờ VN ngày 2026-10-03), tuần 72% (mở lại 2026-10-07 10:00 giờ VN), ngữ cảnh phiên chính 39%.
