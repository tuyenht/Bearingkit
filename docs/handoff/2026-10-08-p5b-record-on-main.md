# Handoff · 2026-10-08 · P5b đóng: bản chữ `bk-plan` ở `main` (`8a74217`), hồ sơ đo (spec, công cụ, bằng chứng) cũng đã về `main`; bản cài hằng ngày chưa cập nhật; công tắc vẫn `PAUSE`; việc kế: P5c

Nhánh `main`. Cùng phiên với `2026-10-07-bk-plan-merged.md` (phiên 4, đoạn cuối). Block 2 dưới đây thay Block 2 của file đó; Block 1 của nó và của ba handoff ngày 2026-10-07 trước nó vẫn là hồ sơ.

## Block 1 · What happened

Lời owner trong đoạn này (nguyên văn): "Audit kỹ các xử lý ở trên, tiếp tục theo khuyến nghị.\nTiếp tục xử lý tự động với khuyến nghị tốt nhất phù hợp đi; đừng dừng lại hỏi tôi nữa."

Phiên đọc đó là một câu chung, không nêu đích danh việc nào, nên chỉ làm việc trong repo, cộng thêm và hoàn tác được, theo khuyến nghị của phiên: **đưa hồ sơ P5b từ nhánh về `main`** (235 file, giống nhánh từng byte, trừ spec có thêm một mục đóng: spec `docs/specs/2026-10-03-bk-plan-design.md`, ba công cụ `evals/analysis/plan-*.cjs`, task `evals/bench/plan-01/` kèm bằng chứng hai lượt đo và guard, bốn file test), thêm một mục đóng ở cuối spec. Suite 229/229. Chi tiết và cách đọc lời owner: nhật ký mục 18. Không làm theo câu chung đó: cập nhật bản cài, xóa nhánh, ghi `RUN`, sửa `AGENTS.md` hay luật tự lái.

Kiểm lại sau merge: `bearingkit doctor` trên `main` nay báo `FAIL  antigravity copy of skills/ matches this checkout`: đúng với việc bản cài và kho Antigravity chưa có bản chữ mới (do `8a74217`, không phải do commit của hồ sơ).

## Block 2 · Resume payload

### State (kiểm bằng git lúc đóng)

`main`: commit trên cùng chứa file này; đã push; cây sạch. Trên `main` có: bản chữ `bk-plan` của `afa1a46` (từ `8a74217`) và toàn bộ hồ sơ P5b. Công tắc **`PAUSE`** (từ `4bb6fa2`); chỉ owner ghi `RUN`. `p5b-bk-plan` ở `3ece22d`: **không xóa nhánh này**: `tests/plan-run.test.cjs` đọc ba commit: `7896625` và `afa1a46` chỉ tới được qua nó, `531ad2c` qua nó và qua nhánh cục bộ `p5b-bk-plan-before`; xóa nhánh `p5b-bk-plan` thì suite trượt. `evals/analysis/plan-run.cjs` (ở `main` và ở nhánh) giữ `BARS_APPROVED = true` làm hồ sơ: **không chạy nó**; từ `main` nó tự thoát, từ nhánh `p5b-bk-plan` nó sẽ khởi động một lượt thứ ba mà luật cấm. Bản cài hằng ngày và kho Antigravity vẫn ở `e410f4d`. Bộ đếm "sessions since the last audit": 4 theo mục 15 (owner có thể nói lần kiểm toán của mục 17 thay phiên kiểm toán riêng: khi đó là 1); mục 1 đến 17 và thay đổi của mục 18 đều đã được một auditor đọc, qua hai lần đọc ngay trong phiên 4 (đều không lỗi). Khóa `.lock` đã gỡ lúc đóng. Dòng trong `.git/info/exclude` giữ theo lời owner.

### Decisions waiting on the owner

1. Cập nhật bản cài hằng ngày và kho Antigravity (từ marketplace, `--scope user` và `--scope local`): tới khi đó `doctor` còn báo `FAIL` ở dòng so `skills/`.
2. Hai dòng đã cũ, owner commit: dòng Status của `docs/specs/2026-10-06-autopilot-design.md` và dòng 19 của `AGENTS.md`; cùng đề xuất sửa luật tự lái (A1, A3, B3, D1, E) và dòng trần của `state.md`.
3. Hai bài học ghi ở cuối spec P5b dưới dạng đề xuất (ghim model bằng tên đầy đủ và kiểm `init` trước phiên đầu; chọn task guard chạm tới bản chữ được đổi): nhận hay không là việc của owner (COUNCIL).
4. Lần kiểm toán của mục 17 có thay phiên kiểm toán riêng không (bộ đếm 4 hay 1).
5. Ghi `RUN` khi muốn phiên tự chạy không cần lời từng việc; xác nhận thay đổi 4 và 5 khi muốn.

### Open threads

- Guard của `node-01` (2026-10-07): `node.md` mở đúng 4/8, `bk-build` chỉ được gọi 1/8 (các phiên đi qua `bk-spec`); đáng xem khi làm P5c.
- Alias `sonnet` nay trỏ tới `claude-sonnet-5-5`; số đo của các task trước 2026-10-07 là trên `claude-sonnet-5`.
- Test `tests/bench-node-01.test.cjs` nhạy tải (trượt rồi đạt khi chạy lại).
- `docs/status.md` trên trần "khoảng 15 KB".
- Các điểm yếu kiểm toán nêu (nhật ký mục 17).

### Next work

1. P5c: đo riêng dòng "luật stack trong code dùng chung" của Bước 0 (định nghĩa: `docs/handoff/2026-10-03-close.md`, "Next work" mục 3; `docs/handoff/2026-10-02-shell-replicated-source.md`, Block 2 điểm 1; manh mối: `docs/handoff/2026-09-30-p4-step0-measured.md`). Bắt đầu bằng đề xuất thiết kế (kèm bản đăng ký dự kiến), rồi trình owner; đăng ký ghi tên model đầy đủ và kiểm `init` trước phiên đầu nếu owner nhận bài học đó. Đổi thiết kế hay phạm vi của kit là COUNCIL: đề xuất rồi chờ.
2. Rồi `c-cpp`; rồi các mục "gate" của đề xuất sửa luật tự lái.

### Resume prompt

"Phiên tiếp của Bearingkit, máy owner, `C:\Projects\Bearingkit`. CẢNH BÁO: không chạy `node evals/analysis/plan-run.cjs` dưới bất kỳ dạng nào (cờ `BARS_APPROVED` là `true`; từ nhánh `p5b-bk-plan` nó khởi động một lượt đo thứ ba mà luật cấm); không xóa nhánh `p5b-bk-plan` (suite cần các commit của nó). Trước mọi việc đọc `docs/autopilot/state.md`, rồi `docs/specs/2026-10-06-autopilot-design.md` cả file, `docs/autopilot/decisions.md` mục 15 đến 18, `docs/handoff/2026-10-08-p5b-record-on-main.md` (Block 2 trước), `docs/status.md`. Công tắc `PAUSE` và owner không bảo gì thêm: không ghi khóa, không chạy suite; báo cáo trạng thái, nêu "Decisions waiting" và dừng. Owner bảo một việc trong lời mở phiên: làm đúng việc đó; một câu chung ("tiếp tục theo khuyến nghị", "tự động đi") chỉ phủ việc trong repo, cộng thêm và hoàn tác được: khi đó làm "Next work" mục 1 tới mức đề xuất thiết kế của P5c rồi trình owner (COUNCIL). Công tắc `RUN` và owner không bảo gì thêm: bộ đếm 4, phiên này là phiên kiểm toán: đọc toàn bộ nhật ký (mục 1 đến 18) và mọi commit từ khi có luật tự lái; các lần đọc kiểm toán trước đều làm trong phiên 4, chưa phải phiên riêng; không làm gì khác, trừ khi owner đã nói bộ đếm là 1. Khi có việc phải làm, đầu phiên mỗi lệnh một mình: khóa `docs/autopilot/.lock` trước; `git status` (sạch, `main`); `git fetch origin`; `node bin/bearingkit.cjs doctor` (năm `ok`, một `skip`, một `FAIL` ở dòng `skills/` cho tới khi owner cập nhật bản cài); `get_usage`; suite `node --test tests/*.test.cjs` (229/229, timeout trên 300 giây; test `node-01` nhạy tải, trượt thì chạy lại). Không cập nhật bản cài, không xóa nhánh, không sửa `AGENTS.md`: chỉ khi owner nói đích danh; `RUN` thì owner tự ghi. Mỗi commit qua cổng (suite; reviewer mới mỗi commit, tối đa năm vòng; bước nặng thêm reviewer đối kháng; sau khi rà chỉ chép câu của reviewer). Không tự clear giữa các phase; dừng với handoff ở 80% ngữ cảnh. Trả lời bằng tiếng Việt; cuối mỗi khối việc có "Đã xong" và "Còn lại"; đóng phiên bằng handoff, dòng phiên trong nhật ký, `git status` dán nguyên."
