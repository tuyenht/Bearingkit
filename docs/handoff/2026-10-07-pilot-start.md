# Handoff · 2026-10-07 · Thay đổi 6 có hiệu lực; thí điểm P5b sẵn sàng bắt đầu từ bước đóng băng lần hai (chưa làm)

Nhánh `main`. Cùng phiên Desktop với `2026-10-06-autopilot-session-2.md`. File này là phần nối thêm: Block 2 dưới đây thay phần "Decisions waiting", "Next work" và "Resume prompt" của file đó; Block 1 và Block 2 của `2026-10-06-autopilot-rules.md` và `2026-10-06-p5b-run-result.md` vẫn đúng (số liệu lượt đo `plan-01`: file sau, không lặp ở đây).

## Block 1 · What happened

1. Owner đọc bản phản biện và viết, nguyên văn trong spec (mục "The owner's confirmation of change 6"): xác nhận thay đổi 6; thí điểm không chờ bước 3; lượt đo lại giữ đăng ký cũ, 32 phiên; ngưỡng dừng 300 nghìn token vào bộ nhớ; xoá `spec213.txt`; và (tin thứ hai) "Giữ nguyên thay đổi 6. sleep do tôi chủ động, nay tôi không sleep nữa." Hai tin được chép vào spec sau khi tin thứ hai đến, vì tin đầu còn xin phiên rà lại trước.
2. Commit `301a0da` (đã push, ba vòng rà: vòng 1 và 2 có lỗi phải sửa, vòng 3 sạch; thông điệp commit kể các lỗi): spec ghi "Confirmed: 6, 2026-10-07."; bước 4 không chờ bước 3, bước 3 đi sau bước 4; mục C của đề xuất ghi là đã được owner quyết; nhật ký mục 9. Thay đổi 4 và 5 vẫn chưa xác nhận. Dòng Status của spec vẫn ghi "steps 2 to 4 not started" dù bước 2 đã chạy: biết và ghi ở mục 9, sửa theo mục D1 của đề xuất (của owner).
3. Bộ nhớ: ngưỡng dừng 300 nghìn token đã vào `context-stop-threshold.md`. `spec213.txt` không còn trong Temp (owner đã xoá).
4. Trả lời câu hỏi mở ở handoff trước: các lần máy ngủ là do owner chủ động; owner sẽ không sleep máy trong lượt chạy. Điểm 4 của phản biện (máy ngủ là rủi ro lớn nhất) vì thế đã giảm, không biến mất: lệnh Sleep của chính owner, nắp máy, mất điện vẫn cắt được; sau mỗi vòng vẫn đọc log nguồn.

## Block 2 · Resume payload

### State (kiểm bằng git lúc đóng)

`main`: commit trên cùng chứa file này; đã push; cây sạch. `p5b-bk-plan` `2cdf4d5` (chữ `bk-plan` đóng băng ở `7896625`), `p5b-bk-plan-before` `531ad2c`, không đổi. **`BARS_APPROVED` vẫn `true` trên nhánh `p5b-bk-plan`; từ nay `plan-run.cjs` chỉ được chạy ở bước chạy, sau khi bước đóng băng lần hai qua cổng, không sớm hơn.** Công tắc `RUN`. Khóa đã gỡ. Thay đổi 1 đến 3 và 6 có hiệu lực; 4 và 5 chưa.

### Decisions waiting on the owner

1. Đề xuất `docs/specs/2026-10-06-autopilot-amendments.md` vẫn chờ, trừ C (đã quyết). Mục "owner commits" còn lại: A1, A3, B3, D1, D4, E; mục "gate" (A2, B1/B2, D2, D5) để một phiên sau làm qua cổng.
2. Xác nhận thay đổi 4 (merge theo luật) khi muốn: một dòng gõ nêu rõ số.

### Next work (một phase mỗi phiên; phiên tới chỉ làm bước 1)

1. **Bước đóng băng lần hai của P5b** (bước 4 của spec; thí điểm). Theo spec: chỉ cho phép nếu **mọi sửa là quy tắc chung** (không một chữ của fixture; không câu nào chỉ để qua một hazard; reviewer của bước nặng được hỏi đúng câu đó, từng sửa một; bộ sửa nộp một lần; không sửa lời rồi hỏi lại; một "không" kết thúc nỗ lực, đo đóng, chữ nằm yên trên nhánh, chưa merge). Hai chỗ trượt đã có tên (handoff `2026-10-06-p5b-run-result.md`): trần bốn câu hỏi (G2 5/8) và rà độc lập cho phép kiểm tổ chức (P5 2/8 ở cả hai nhánh). Rủi ro cần nói thẳng cho reviewer: sửa để khớp chính hai chỗ này là sửa theo task này. Làm trên nhánh `p5b-bk-plan` (hoặc nhánh con), một commit mới, `7896625` giữ nguyên. Bước nặng: thêm reviewer đối kháng, model khác nếu có. Không chạy phiên đo nào ở phiên này.
2. **Lượt đo lại** (phiên riêng, chỉ khi bước 1 qua): đăng ký giống hệt lượt đầu (task `plan-01`, fixture, rubric, người đọc, ngưỡng, số, model, cách phân tích); chỉ commit chữ và phiên khác; 32 phiên; mỗi vòng giữ lượt trả lời sống, đọc log nguồn Windows (Kernel-Power 42/107) sau mỗi vòng; không bắt đầu khi khung 5 giờ trên 80% hoặc tuần trên 70%; gọi công cụ giữ máy thức của app nếu có; nhắc owner không sleep máy. Chi phí lượt đầu: khoảng 6 điểm tuần. Kết quả trượt lần hai: đo đóng, chữ nằm trên nhánh; qua chỉ ở lần hai: merge là của owner, và chỉ nói "trên task này".
3. Sau thí điểm: phiên kiểm toán đọc thí điểm trước mọi việc khác; rồi `c-cpp` (đề xuất thiết kế, chờ owner), rồi các mục "gate" của đề xuất sửa luật.

### Resume prompt

"Phiên tiếp của Bearingkit, máy owner, `C:\Projects\Bearingkit`. Trước mọi việc: đọc `docs/autopilot/state.md` (không phải `RUN` thì chỉ báo cáo và dừng), rồi `docs/specs/2026-10-06-autopilot-design.md` cả file (nhất là "The owner's confirmation of change 6", "Decisions fixed before the data" và "Steps"), rồi `docs/autopilot/decisions.md` (mục 7, 8, 9). Rồi `docs/handoff/2026-10-07-pilot-start.md` (Block 2 trước), `docs/handoff/2026-10-06-p5b-run-result.md` (sự thật về lượt đo và hai chỗ trượt) và khối "Luật" ở `docs/handoff/2026-09-26-p3b-node-guard.md`. Đầu phiên, mỗi lệnh một mình: `git status` (sạch, `main`); `git fetch origin`; `git rev-parse p5b-bk-plan` (`2cdf4d5`); `node bin/bearingkit.cjs doctor` (sáu `ok`, một `skip`); `get_usage` (tuần trên 70% thì báo và dừng); suite `node --test tests/*.test.cjs` (206/206); đọc dòng lệnh của mọi `node.exe` trước khi coi là bench (chín cái của Playwright và chrome-devtools là bình thường); khóa `docs/autopilot/.lock` trước mọi ghi. Thay đổi 6 có hiệu lực; 4 và 5 chưa: không merge theo luật, không tạo tác vụ theo lịch, không mở P5c. Phiên này chỉ làm bước đóng băng lần hai (Next work 1), không chạy phiên đo nào; `plan-run.cjs` chưa được chạy. Nếu không có bộ sửa nào toàn là quy tắc chung, hoặc reviewer nói "không" với một sửa: P5b đóng, chữ nằm yên trên nhánh, chưa merge (bước 4 của spec). Tối đa hai lượt chạy một chữ trên một task, từ trước đến nay. Mỗi commit qua cổng (suite; reviewer mới mỗi commit, tối đa năm vòng; bước nặng thêm reviewer đối kháng; sau khi rà chỉ chép câu của reviewer). Sửa `AGENTS.md`, mục do owner giữ, trần: chỉ đề xuất, owner commit. Dừng ở khoảng 300 nghìn token ngữ cảnh. Trả lời bằng tiếng Việt; cuối mỗi khối việc có "Đã xong" và "Còn lại"; đóng phiên bằng handoff, dòng phiên trong nhật ký, `git status` dán nguyên."

### Hạn mức và ngữ cảnh lúc đóng (đo bằng `get_usage`)

Khung 5 giờ 18%, tuần 30% (lúc 22:00 giờ VN ngày 06/10; mở lại 07/10 10:00 giờ VN), ngữ cảnh phiên chính khoảng 205 nghìn token, dưới điểm dừng 300 nghìn.
