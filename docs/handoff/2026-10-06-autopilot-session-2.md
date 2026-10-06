# Handoff · 2026-10-06 · Phiên tự lái 2: advisor đọc luật, phép thử giữ máy thức, đề xuất sửa luật (chưa áp dụng gì)

Nhánh `main`. Phiên 2 của luật tự lái, owner mở bằng tay. File này là phần nối thêm của `2026-10-06-autopilot-rules.md`: Block 2 của file đó vẫn đúng trừ những chỗ dưới đây. Số liệu của lượt đo `plan-01` và của P5b: `2026-10-06-p5b-run-result.md`, không lặp ở đây.

## Block 1 · What happened

1. **Đầu phiên**: công tắc `RUN`, cây sạch, `main`, `p5b-bk-plan` ở `2cdf4d5`, `doctor` sáu `ok` một `skip`, suite 206/206 (chạy một mình), tuần 25%, năm giờ 18%, ngữ cảnh 9%. **Chín tiến trình `node.exe` đang sống là máy chủ MCP của Playwright và chrome-devtools, không phải bench hay driver**: lần kiểm điều kiện dừng ở đầu phiên sau cũng sẽ thấy chúng; đọc dòng lệnh (`Get-CimInstance Win32_Process`) trước khi kết luận.
2. **Việc 1, advisor đọc luật** (Fable, một lần, đúng như mục 7 của nhật ký; lý do: mục 7 đã chốt gọi một lần ở phiên này). Năm lỗ mới, đều đã vào đề xuất: một sửa chỉ ghi sự kiện không có đường đi; tiêu chí bước 2 thiếu điều kiện tiên quyết; tin nhắn do agent khác gửi vào phiên (`send_message`) không phân biệt được bằng vai; trần 300 nghìn token là một trần nên thuộc owner; reviewer chưa có danh sách file luật phải đọc.
3. **Việc 2, phép thử giữ máy thức** (bước 2 của spec): 15:35:40Z đến 16:21:04Z, 45 phút 24 giây, năm đoạn chờ foreground 9 phút, owner rời máy. Không có sự kiện ngủ (Kernel-Power 42/107) trong khoảng; khoảng hở nhịp tim lớn nhất 30 giây trên 95 nhịp; truy vấn tìm lại năm lần ngủ trong 48 giờ trước (đối chứng dương). **Nhưng điều kiện để một lần đạt có nghĩa không có**: thời gian ngủ nhàn rỗi của máy là 0 (không bao giờ), cả cắm điện lẫn pin; công cụ keep-awake của app không có trong phiên. Và **cả năm lần ngủ của 48 giờ trước đều ghi "Sleep Reason: Application API"**: do một chương trình hoặc lệnh Sleep gọi, không do ngưỡng nhàn rỗi; kéo dài từ 24 phút đến 7 giờ 49 phút. Chưa biết chương trình nào. Hệ quả: lần ngủ của lượt `plan-01` chưa chứng minh được là lỗi giữ máy thức, và yêu cầu nguồn không chặn nổi một lệnh Sleep tường minh. Chi tiết trong đề xuất.
4. **Việc 3, đề xuất sửa luật**: `docs/specs/2026-10-06-autopilot-amendments.md` (trạng thái "proposal, nothing applied"): ba việc của thay đổi 5, ba điểm vòng sáu, câu hỏi bước 4 có chờ bước 3 không, năm điểm của advisor, trần 300 nghìn, dòng `AGENTS.md` ngắn hơn (166 từ thay vì 235; không test hay hook nào đọc dòng đó). Mỗi mục ghi ai commit. Không file luật nào bị sửa.

## Block 2 · Resume payload

### State (kiểm bằng git lúc đóng)

`main`: commit trên cùng chứa file này; đã push; cây sạch. `p5b-bk-plan` `2cdf4d5`, không đổi; **`BARS_APPROVED` vẫn `true` trên nhánh đó: không chạy `plan-run.cjs`**. Khóa `docs/autopilot/.lock` đã gỡ lúc đóng. Công tắc `RUN`. Thay đổi 4, 5, 6 chưa có hiệu lực.

### Decisions waiting on the owner

1. Đọc `docs/specs/2026-10-06-autopilot-amendments.md` và nói nhận hay không từng mục; các mục "owner commits" (A1, A3, B3, C, D1, D4, E) do owner commit.
2. **Có biết chương trình nào gọi Sleep không?** (một lần Sleep chọn bằng tay, công cụ của hãng, một tác vụ). Ngủ lúc 12:13 ở cả hai ngày 05 và 06/10 là hình mẫu đáng chú ý, chưa tra thêm.
3. Xác nhận thay đổi 4 và 6 (như cũ): với A1 được nhận, bằng chính commit của owner.

### Open threads

- Bước 2 đã chạy; kết quả chỉ nằm trong đề xuất và handoff này, **chưa ghi vào spec** (mục D1 của đề xuất giải thích vì sao).
- Chưa tìm ra nguyên nhân các lần ngủ "Application API".
- `c-cpp` (mục 7 lộ trình, P4): chưa làm, để phiên sau, đề xuất thiết kế rồi chờ owner (thay đổi thiết kế là COUNCIL).
- Các luồng mở của `2026-10-06-p5b-run-result.md` vẫn nguyên; P5b chờ thay đổi 6.

### Live temporary bypasses

Không có.

### Next work

1. (Có điều kiện: chỉ khi owner đã quyết đề xuất.) Các mục "gate" (A2, B1/B2 một mục nhật ký, D2, D5), mỗi commit một reviewer mới, và advisor cho phần sửa spec.
2. `c-cpp`: đề xuất thiết kế file stack và task, rồi chờ owner.
3. Thí điểm P5b chỉ khi thay đổi 6 được xác nhận.

### Resume prompt

"Phiên tiếp của Bearingkit, máy owner, `C:\Projects\Bearingkit`. Trước mọi việc: đọc `docs/autopilot/state.md` (không phải `RUN` thì chỉ báo cáo và dừng), rồi `docs/specs/2026-10-06-autopilot-design.md`, rồi `docs/autopilot/decisions.md` (mục 7 và 8), rồi `docs/specs/2026-10-06-autopilot-amendments.md`. CẢNH BÁO: trên nhánh `p5b-bk-plan` cờ `BARS_APPROVED` là `true`; không chạy `evals/analysis/plan-run.cjs`. Rồi `docs/handoff/2026-10-06-autopilot-session-2.md` (Block 2 trước), rồi Block 2 của `docs/handoff/2026-10-06-autopilot-rules.md` (vẫn đúng), và khối "Luật" ở `docs/handoff/2026-09-26-p3b-node-guard.md` (vẫn áp dụng, trừ những điểm "What this changes" thay). Đầu phiên, mỗi lệnh một mình: `git status` (sạch, `main`); `git fetch origin`; `git rev-parse p5b-bk-plan` (`2cdf4d5…`); `node bin/bearingkit.cjs doctor` (sáu `ok`, một `skip`); `get_usage` (tuần trên 70% thì báo và dừng); suite `node --test tests/*.test.cjs` (206/206). Chín `node.exe` của Playwright và chrome-devtools là bình thường. Thay đổi 4, 5, 6 chưa có hiệu lực; không đóng, đóng băng, đăng ký hay chạy gì cho `bk-plan` trên `plan-01`; không mở P5c. Việc làm được ngay: Next work của handoff, theo thứ tự, mỗi commit qua cổng (suite; reviewer mới mỗi commit, tối đa năm vòng; sau khi rà chỉ chép câu của reviewer). Sửa `AGENTS.md`, mục do owner giữ, trần: chỉ đề xuất, owner commit. Mỗi phiên dừng ở khoảng 300 nghìn token ngữ cảnh. Trả lời bằng tiếng Việt; cuối mỗi khối việc có "Đã xong" và "Còn lại"; đóng phiên bằng handoff, dòng phiên trong nhật ký, `git status` dán nguyên."

### Hạn mức và ngữ cảnh lúc đóng (đo bằng `get_usage`)

Năm giờ 3%, tuần 27% (mở lại 2026-10-07 10:00 giờ VN), ngữ cảnh phiên chính 128.618 token (13%), dưới điểm dừng 300 nghìn.
