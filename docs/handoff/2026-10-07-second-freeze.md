# Handoff · 2026-10-07 · Đóng băng lần hai của `bk-plan` xong (`afa1a46`); việc kế: chỉnh bộ chạy cho bản chữ mới, chạy thử `--dry`, rồi lượt đo 32 phiên

Nhánh `main`. Cùng phiên Desktop với `2026-10-07-pilot-start.md`: Block 2 dưới đây thay phần "Next work" và "Resume prompt" của file đó; mọi sự thật khác ở các handoff trước vẫn đúng.

## Block 1 · What happened

1. **Đóng băng lần hai làm xong**, đúng luật của spec (mục "Decisions fixed before the data"): hai sửa, nộp một lần cho reviewer đối kháng (Opus, model khác phiên chính là Sonnet), hỏi từng sửa một. Cả hai được xét "GENERAL", "EDIT SET: ALL GENERAL": (1) bước 4 của `skills/bk-plan/SKILL.md` thêm "đếm danh sách trước khi viết, quá bốn thì giữ bốn câu mà trả lời sai tốn nhất"; (2) dòng cổng hot-path trỏ tới danh sách của bk-protocol, "however the change is described". Lưu ý của reviewer, đã ghi vào spec của nhánh: sửa 2 đổi một dòng mà K-trước cũng mang nguyên, nên **nếu P5 tăng ở lượt hai thì phần tăng đó đến từ sửa 2**, và dòng đã đăng ký "a difference carried by P2 or P5 alone is not laid to the new text" không áp cho P5 ở lượt hai; báo cáo lượt hai phải nói vậy khi trình ngưỡng chính. Một reviewer Sonnet mới rà commit: không lỗi phải sửa. Commit `afa1a46` trên `p5b-bk-plan` (đã push); suite trên nhánh: 229 test, 228 đạt, 0 trượt, 1 bỏ qua (kiểm O2 của `bench-py-01`, máy không có pytest; không liên quan `bk-plan`). Chưa có phiên đo nào chạy trên chữ mới.
2. **Lời owner giữa phiên** (nguyên văn trong nhật ký mục 10): ngữ cảnh là 1 triệu token nên mốc dừng là khoảng 80%, không phải 300 nghìn, và vẫn tự động; được tự `/clear` hoặc mở phiên mới để khỏi lẫn nội dung phase này sang phase khác; trần 70% của tuần không hợp lý: cứ làm nếu chưa có lời dừng, chỉ cảnh báo khi tuần trên 90%. Bộ nhớ đã sửa theo. **`docs/autopilot/state.md` chưa đổi**: các trần do owner commit (dòng 70% còn nguyên ở đó; phiên này theo lời owner).
3. **Tìm thấy trước khi chạy**: `evals/analysis/plan-run.cjs` trên nhánh cứng mã `FROZEN = 789662576f52…` (dòng 38) và `die` nếu nhánh `p5b-bk-plan` khác commit đó trong `skills/`, `hooks/`… (dòng 109 đến 111). Với bản chữ mới nó sẽ dừng ở bước kiểm. Phải chỉnh bộ chạy trỏ sang `afa1a46` (và mọi chỗ khác cứng mã `7896625`, kể cả test của nó) trước lượt đo. Đó là sửa bộ đo, không phải sửa đăng ký, nhưng đi qua cổng.

## Block 2 · Resume payload

### State (kiểm bằng git lúc đóng)

`main`: commit trên cùng chứa file này; đã push; cây sạch. `p5b-bk-plan` `afa1a46` (chữ lần hai); `7896625` (chữ lần một) và `p5b-bk-plan-before` `531ad2c` giữ nguyên. **`BARS_APPROVED` vẫn `true` trên nhánh `p5b-bk-plan`; bộ chạy chưa được chỉnh nên `plan-run.cjs` thật sẽ dừng ở bước kiểm; chưa chạy phiên đo nào, và không chạy dưới bất kỳ dạng nào trước khi Next work 1 qua cổng và `--dry` sạch.** Công tắc `RUN`. Thay đổi 1 đến 3 và 6 có hiệu lực; 4, 5 chưa. Khóa đã gỡ lúc đóng.

### Decisions waiting on the owner

Như `2026-10-07-pilot-start.md` (đề xuất sửa luật: A1, A3, B3, D1, E của owner; D4 đã rút theo lời owner), cộng: dòng trần của `state.md` theo lời owner mới (mốc dừng 80% ngữ cảnh, cảnh báo khi tuần trên 90%) chờ owner commit; xác nhận thay đổi 4 khi muốn.

### Next work

1. **Chỉnh bộ chạy cho bản chữ mới** (một commit trên `p5b-bk-plan`, qua cổng: suite; reviewer mới mỗi commit; vì đây là bộ đo của một lượt đo có số đăng ký, thêm reviewer đối kháng): `FROZEN` sang `afa1a46…` đủ 40 ký tự; mọi chỗ cứng mã `7896625` còn lại (grep cả `evals/analysis/` và `tests/`); thư mục bằng chứng của lượt hai riêng (không ghi đè `evals/bench/plan-01/run-2026-10-06/`; tên đề nghị `run-2026-10-07`); không đổi con số, ngưỡng, rubric, người đọc, mô hình, cách phân tích. Rồi `node evals/analysis/plan-run.cjs --dry`: phải sạch.
2. **Lượt đo 32 phiên** (đăng ký giống hệt lượt đầu; chỉ commit chữ và phiên khác): chạy từng vòng bằng một lệnh, giữ lượt trả lời sống (chờ từng đoạn dưới 10 phút), đọc log nguồn Windows (Kernel-Power 42/107) sau mỗi vòng; không bắt đầu một vòng khi khung 5 giờ trên 80%; tuần: theo `state.md` như nó đang ghi (dừng ở 70%) cho tới khi owner commit dòng mới hoặc nói khác trong phiên đó (lúc viết tuần là 38%); gọi công cụ giữ máy thức của app nếu có; owner đã nói không sleep máy. Mỗi vòng khoảng 6 điểm của khung 5 giờ; cả lượt đo khoảng 6 điểm tuần (lượt đầu).
3. Sau lượt đo: đọc kết quả theo đăng ký (chấm, tổng hợp: các script trên nhánh), ghi vào spec của nhánh, báo owner; qua cả hai ngưỡng thì merge là của owner; trượt thì đo đóng, chữ ở lại nhánh. Rồi phiên kiểm toán, rồi `c-cpp`, rồi các mục "gate" của đề xuất.

### Resume prompt

"Phiên tiếp của Bearingkit, máy owner, `C:\Projects\Bearingkit`. Trước mọi việc: đọc `docs/autopilot/state.md` (không phải `RUN` thì chỉ báo cáo và dừng), rồi `docs/specs/2026-10-06-autopilot-design.md` cả file, rồi `docs/autopilot/decisions.md` (mục 7 đến 10), rồi `docs/handoff/2026-10-07-second-freeze.md` (Block 2 trước), `docs/handoff/2026-10-06-p5b-run-result.md` và khối "Luật" ở `docs/handoff/2026-09-26-p3b-node-guard.md`. Đầu phiên, mỗi lệnh một mình: `git status` (sạch, `main`); `git fetch origin`; `git rev-parse p5b-bk-plan` (`afa1a46…`); `node bin/bearingkit.cjs doctor` (sáu `ok`, một `skip`); `get_usage`; suite `node --test tests/*.test.cjs` (206/206); đọc dòng lệnh của mọi `node.exe` trước khi coi là bench (Playwright và chrome-devtools là bình thường); khóa `docs/autopilot/.lock` trước mọi ghi. Mốc dừng và các trần theo lời owner trong nhật ký mục 10: dừng ở khoảng 80% ngữ cảnh rồi chuyển giao (chuỗi tự xoá chưa thử khi viết dòng này: nếu phiên trước đã thử, đọc kết quả ở handoff của nó; khóa `.lock` được gỡ trước khi xoá); không bắt đầu đo khi khung 5 giờ trên 80%; trần tuần theo `state.md` (70%) cho tới khi owner commit dòng mới hoặc nói khác trong phiên đó. Thay đổi 6 có hiệu lực; 4 và 5 chưa. `plan-run.cjs` chỉ được chạy thật sau khi Next work 1 qua cổng và `--dry` sạch. Mỗi commit qua cổng (suite; reviewer mới mỗi commit, tối đa năm vòng; bước nặng thêm reviewer đối kháng; sau khi rà chỉ chép câu của reviewer). Sửa `AGENTS.md`, các mục owner giữ, dòng trần của `state.md`: chỉ đề xuất, owner commit. Trả lời bằng tiếng Việt; cuối mỗi khối việc có "Đã xong" và "Còn lại"; đóng phiên bằng handoff, dòng phiên trong nhật ký, `git status` dán nguyên."

### Hạn mức và ngữ cảnh lúc đóng

Đọc bằng `get_usage` lúc viết: khung 5 giờ 28% (mở lại 02:10Z), tuần 38% (mở lại 2026-10-07 10:00 giờ VN); ngữ cảnh phiên chính 281.075 token trên cửa sổ 1 triệu (28%).
