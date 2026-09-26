# Chi phí của kit tách theo phần · phân tích chỉ đọc · 2026-09-26

Status: ANALYSIS, **owner đồng ý khuyến nghị không cắt, 2026-09-26** (nguyên văn: "Đồng ý D1 không cắt, tiếp tục P2."). Trả lời Decisions waiting 1 của `docs/handoff/2026-09-26.md`. Cách làm đã chốt: phân tích chỉ đọc trên các stream đã có, không chạy phiên mới; đề xuất cắt sau, cắt là COUNCIL. Phiên: P1 của `docs/plans/2026-09-26-v03-roadmap.md`.

## Câu hỏi

Trên Sonnet, kit tốn khoảng gấp 2 sàn cho cùng kết quả (`debug-01`, `test-01`). Phần nào của khoản đó là **phần nền**, tức cái kit trả ở mọi phiên dù làm gì: protocol nạp đầu phiên, danh sách skill, chữ `SKILL.md` và reference được đọc, lệnh `detect-stack`? Phần nào là **hành vi**, tức các lượt công cụ kit khiến model làm thêm (viết test, chạy test, cố ý làm hỏng code)?

## Cách đo

- Script: `_build/cost-split/cost-split.cjs` (không track), chạy trên các thư mục `evals/results/2026-09-25-bench-debug-01-natural*`, `2026-09-26-bench-test-01-natural*`, `2026-09-25-bench-review-02-natural`, `2026-09-25-bench-review-04-natural`; chỉ các nhánh Sonnet (bỏ thư mục `-haiku`).
- Mỗi lần gọi API trong stream có `usage` (input, ghi cache, đọc cache, output). Chi phí mô hình = tổng có trọng số theo tỉ lệ bảng giá (input 1, ghi cache 1,25, đọc cache 0,1, output 5), nhân giá input Sonnet.
- **Hiệu chỉnh:** tỉ lệ chi phí mô hình trên `total_cost_usd` mà CLI báo nằm trong khoảng 0,80–1,14 (trung vị theo nhóm). Các tỉ phần dưới đây vì vậy là **ước tính, sai số cỡ ±20%**. Số USD tuyệt đối được co lại theo `total_cost_usd` của từng phiên.
- Phân bổ:
  - **tiền tố**: ngữ cảnh ở lần gọi đầu, gồm prompt hệ thống của host, định nghĩa công cụ, và với kit là protocol cùng danh sách skill; nó được đọc lại ở mọi lần gọi sau;
  - mỗi phần ngữ cảnh thêm vào sau một lần gọi (kết quả công cụ và output) được quy cho loại công cụ của lần gọi đó: `Skill`, đọc chữ skill hay reference, `detect-stack`, hoặc việc thật; phần đó tốn một lần ghi rồi một lần đọc ở mỗi lần gọi sau.

## Kết quả (trung vị theo nhóm)

| Nhóm | n | Lần gọi API | Tiền tố (token) | USD (CLI) | USD tiền tố | USD chữ skill + reference + detect | USD việc + output |
|---|---|---|---|---|---|---|---|
| debug-01 F (sàn) | 8 | 9,5 | 33.108 | 0,131 | 0,098 | 0,000 | 0,031 |
| debug-01 K (kit) | 40 | 16 | 37.535 | 0,273 | 0,198 | 0,010 | 0,067 |
| debug-01 S (Superpowers) | 32 | 13 | 37.026 | 0,270 | 0,173 | 0,027 | 0,067 |
| test-01 F | 3 | 8 | 33.099 | 0,164 | 0,110 | 0,000 | 0,054 |
| test-01 K | 8 | 11,5 | 37.528 | 0,339 | 0,203 | 0,022 | 0,118 |
| review-02 K | 3 | 10 | 37.582 | 0,279 | 0,153 | 0,054 | 0,072 |
| review-04 F | 3 | 6 | 33.223 | 0,190 | 0,090 | 0,000 | 0,100 |

Trung vị không cộng dồn chính xác; các phép tách dưới đây là xấp xỉ.

Nhóm `debug-01 K` gộp 40 phiên từ sáu thư mục chạy các bản chữ `bk-debug` khác nhau: bản phát hành trước sprint, bản ứng viên và bản đã commit (`docs/specs/2026-09-25-bk-debug-design.md`). Nhóm này là chi phí của kit qua sprint đó, không phải của một bản chữ. Nhóm F của `debug-01` chỉ có 8 phiên, lấy từ thư mục đầu.

Phần chi phí không khớp với `total_cost_usd` (tỉ lệ 0,80 ở `test-01 K`) được chia đều theo tỉ phần khi co lại. Nếu phần thiếu đó là việc của agent con, vốn không nằm trong stream chính, thì nó thuộc phần hành vi, và phần nền còn nhỏ hơn con số ở dưới.

## Tách khoản chênh kit − sàn

Phần tiền tố thêm của kit so với sàn là khoảng 4.400 token. Đó là những gì kit nạp vào đầu phiên: protocol, danh sách skill và agent của plugin. Cách chia 4.400 token này giữa các phần đó chưa đo, tức khoảng 12% tiền tố của kit.

| | debug-01 | test-01 |
|---|---|---|
| Chênh K − F | 0,142 | 0,175 |
| Nền: tiền tố to hơn, ở cùng số lần gọi (0,198 × 4,4/37,5; 0,203 × 4,4/37,5) | ≈ 0,023 | ≈ 0,024 |
| Nền: chữ skill, reference, `detect-stack` | ≈ 0,010 | ≈ 0,022 |
| **Nền cộng lại** | **≈ 0,033 (≈ 23% khoản chênh, ≈ 12% một phiên kit)** | **≈ 0,046 (≈ 26%, ≈ 14%)** |
| Hành vi: nhiều lần gọi hơn, mỗi lần đọc lại tiền tố | ≈ 0,077 | ≈ 0,069 |
| Hành vi: kết quả công cụ và output nhiều hơn | ≈ 0,036 | ≈ 0,064 |
| **Hành vi cộng lại** | **≈ 0,113 (≈ 77%)** | **≈ 0,133 (≈ 76%)** |

So với Superpowers trên `debug-01`: tổng ngang nhau (0,273 và 0,270), tiền tố gần bằng (37,5k và 37,0k token). Kit đọc ít chữ skill hơn (0,010 so với 0,027) nhưng gọi API nhiều hơn (16 so với 13).

## Quan sát phụ, chưa phải kết luận

- `detect-stack`: trong 48 phiên kit trên Sonnet (`debug-01`, `test-01`), 19 phiên không gọi nó, 17 phiên chạy được, 12 phiên bị từ chối (11 phiên mọi lần gọi đều bị từ chối, 1 phiên chỉ một phần). 12 phiên đó chia thành 11/40 ở `debug-01` và 1/8 ở `test-01`. Lý do từ chối là luật quyền của profile đo: lệnh ghép `cd <kit> && …`, lệnh PowerShell có biến môi trường. Đó là luật quyền của profile cách ly, không phải lỗi của script; nhưng protocol ghi "run once per session from the project root" mà model thường `cd` vào thư mục kit. Chi phí của nó nhỏ (xem bảng), đây là chuyện đúng/sai, không phải chuyện tiền.
- Mọi phiên trong bảng đều đã thấy 31 công cụ: dòng "Every session saw 31 tools" có trong `results.md` của cả mười thư mục đã dùng, nên so token là hợp lệ theo luật của owner.

## Đề xuất (không làm; cắt là COUNCIL)

**Khuyến nghị: không cắt phần nền lúc này.** Lý do:
- Cắt hết phần nền của kit cũng chỉ bớt khoảng 12–14% một phiên. Cận này hơi thấp, vì lượt gọi `Skill` và lượt gọi `detect-stack` tự thêm một lần gọi API, mà chi phí của lần gọi đó bị tính vào dòng "nhiều lần gọi hơn". Một lần cắt thực tế, chẳng hạn một phần ba protocol (khoảng 750 trong khoảng 2.250 token), bớt khoảng 1–2% (0,023 × 750/4.400 ≈ 0,004 USD trên 0,273), nhỏ hơn độ tản giữa các phiên (K `debug-01` từ 0,203 tới 0,373 USD), nên đo cũng không thấy được.
- Protocol đã sát trần ngân sách ký tự và đang ngang Superpowers.

Rủi ro chính: khoảng ba phần tư chi phí thêm là hành vi. Trên `debug-01`, hành vi đó gồm test hồi quy 16/16 so với 0/8 của sàn. Trên `test-01`, gồm chứng minh test có thể đỏ ở 8/8 phiên so với 0/3. Cắt phần hành vi là cắt đúng thứ được đo là giá trị.

Việc nên làm thay vì cắt:
1. Trong sprint `bk-build` (P2), đăng ký chi phí theo từng bước của hành vi: số lần gọi API, số lần chạy test, số file chạm ngoài mức cần. Có số đó mới biết bước nào tốn mà không đổi kết quả.
2. Dòng `detect-stack` trong protocol: một bản chữ rõ hơn ("chạy `node "<kit>/scripts/detect-stack.cjs"` ngay trong thư mục dự án, không `cd`") là ứng viên. Nó đổi văn bản model đọc, nên phải đo trước khi commit. Nên gom vào lần đổi protocol kế tiếp, không mở một vòng riêng.

Phương án đã loại:
- Cắt protocol ngay để giảm tiền: lợi nhỏ hơn độ nhiễu, còn rủi ro định tuyến thì đã đo là có (mọi hàng router đều được canh bằng prompt kích hoạt).
- Bỏ bước cố ý làm hỏng code của `bk-test`: đó là phần làm nên kết quả 8/8.
