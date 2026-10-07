# Handoff · 2026-10-07 · Lượt đo lần hai của `plan-01` đã chạy và đọc xong; **chưa có phán quyết** vì model đổi giữa hai lượt; công tắc `PAUSE`; chờ owner chọn cách đọc

Nhánh `main`. Phiên 4 của chế độ tự lái, mở bằng dòng dán ở `2026-10-07-pause-notes.md`. Block 2 dưới đây thay Block 2 của `2026-10-07-second-freeze.md` và phần thêm của `2026-10-07-pause-notes.md`; sự thật khác ở các handoff trước vẫn đúng.

## Block 1 · What happened

Lời owner trong phiên (nguyên văn, lời duy nhất): "Làm theo resume prompt ở dòng 29 của docs/handoff/2026-10-07-second-freeze.md; trước đó đọc docs/autopilot/decisions.md mục 11 và 12 và docs/handoff/2026-10-07-pause-notes.md. Không tự clear giữa các phase; dừng với handoff ở 80% ngữ cảnh."

1. **Bộ chạy đã chỉnh và lượt đo lần hai đã đăng ký** (`47d2de4` trên `p5b-bk-plan`): `FROZEN` là `afa1a46`, log riêng `evals/results/plan-run-2-log.txt`, thêm một điểm dừng (bản chữ lần hai chỉ được khác bản lần một ở `skills/bk-plan/SKILL.md`). Không đổi ngưỡng, con số, rubric, người đọc, cách phân tích. Năm vòng rà, vòng 1 đến 4 mỗi vòng một lỗi phải sửa, vòng 5 sạch (nhật ký mục 13, có câu trả lời từng ngưỡng của reviewer đối kháng).
2. **Trước lượt đo** (`00a5276`): `--dry` sạch; thăm dò đạt (2/2); phiên thử S được nhận.
3. **Lượt đo** (`3f77ff1`): bốn vòng, 32 phiên, 16 lệnh đều `exit=0`, không phiên nào bị cắt, không có lần máy ngủ nào trong một vòng; danh sách 16 thư mục được tính ghi trước khi đọc plan.
4. **Đọc và tổng hợp** (`2ce999d`): cổng của ngày đạt (mỗi người đọc 70/70); 32 plan, ba lô, không câu trả lời nào bị gạt; bảng tổng hợp và bằng chứng ở `evals/bench/plan-01/run-2026-10-07/` trên nhánh.
5. **Sự cố, phát hiện khi đọc bảng tổng hợp**: cả 32 phiên của lượt hai ghi model `claude-sonnet-5-5`; lượt đầu là `claude-sonnet-5`. Đăng ký chỉ ghi "model alias `sonnet`"; luật của lượt đo lại đòi "identical ... in model". Alias trỏ sang model khác trong ngày; repo không có chỗ nào kiểm model thật. Đăng ký không có luật cho việc này. Reviewer đối kháng (chỉ được biết đăng ký và sự cố, không biết kết quả) liệt kê sáu cách xử lý A đến F; ba cách (C, D, E) làm đổi phán quyết → theo luật tự lái: **`PAUSE`** (`4bb6fa2`, nhật ký mục 14, có nguyên văn câu trả lời của reviewer).
6. Thông báo đẩy tới owner sau `PAUSE`: công cụ trả lời "Mobile push not sent (Remote Control inactive)."

**Con số của lượt hai** (đầy đủ trong spec của nhánh, mục "The second run, read and tallied"; không phải phán quyết): P kit mới 5,000 so với kit cũ 3,750, p = 0,000155 (mỗi người đọc riêng cũng vậy); P1 + P3 16 so với 15; khớp 159/160; O1, O2 8/8; G2 8/8, G1 8/8; `bk-plan` gọi 8/8, `vertical-slices.md` mở 6/8; so với nguồn (đọc 8/8) p = 0,000155, 5,000 so với 2,125.

**Điều bất lợi cho kit, phải đọc cùng con số**: kit cũ (cùng một commit ở cả hai lượt) được 2,625 trên model của lượt đầu và 3,750 trên model của lượt hai (P5 từ 2/8 lên 7/8): model làm đổi điểm của một bản chữ không đổi. Khoảng cách giữa hai nhánh kit là 1,25 ở cả hai lượt. Trong lượt hai khác biệt nằm chủ yếu ở P4 (8 so với 0). Điều kiện P1 + P3 hơn nhau đúng một plan, chính là plan hai người đọc chấm khác nhau. Plan của kit mới đều chạm trần thang điểm. Không được nói: lượt hai lặp lại hay xác nhận lượt đầu; hai sửa của lần đóng băng hai tạo ra thay đổi giữa hai lượt; điều gì về "Sonnet" nói chung.

## Block 2 · Resume payload

### State (kiểm bằng git lúc đóng)

`main`: commit trên cùng chứa file này; đã push; cây sạch. Công tắc **`PAUSE`** từ `4bb6fa2`; chỉ owner ghi `RUN`. `p5b-bk-plan` ở `2ce999d` (đã push): chữ đóng băng lần hai `afa1a46`, lần một `7896625`; `p5b-bk-plan-before` `531ad2c` (chỉ local). **`BARS_APPROVED` vẫn `true` và bộ chạy nay chạy được trên chữ mới: `node evals/analysis/plan-run.cjs` không kèm `--dry` sẽ khởi động phiên đo thật, tức một lượt thứ ba mà luật cấm. Không chạy nó dưới bất kỳ dạng nào.** Thay đổi 1 đến 3 và 6 có hiệu lực khi công tắc `RUN`; 4, 5 chưa. Bộ đếm "sessions since the last audit": 4, nên phiên tự lái kế tiếp là phiên kiểm toán và không làm gì khác. Khóa `.lock` đã gỡ lúc đóng. Một dòng local ngoài commit: `/docs/autopilot/.lock` trong `.git/info/exclude` của clone này (hai nhánh kit không có dòng ignore đó, còn bộ chạy đòi cây sạch). Trên máy owner, git bỏ qua: `evals/results/2026-10-07-bench-plan-01-natural` (thăm dò), `-2` (thử S), `-3` đến `-18` (được tính), `plan-run-2-log.txt`.

### Decisions waiting on the owner

1. **Lượt đo lần hai được đọc theo cách nào** (nhật ký mục 14; spec của nhánh):
   - A. Tính như đã đăng ký (alias là thứ được đăng ký).
   - B. Tính, ghi nhãn "trên claude-sonnet-5-5, task này", không gộp và không so với lượt đầu.
   - C. Không hợp lệ vì không "identical in model": lượt hai vô hiệu, kết quả lượt đầu (trượt) là kết quả duy nhất.
   - D. Chỉ tính các phép so trong lượt (ngưỡng 1, 2, so với nguồn); ngưỡng 3, 4, 5 không xét.
   - E. Coi là thăm dò, không đăng ký; kết quả lượt đầu đứng.
   - F. Tính, nhưng không được báo là lặp lại lượt đầu.
   - **Khuyến nghị của phiên: B kèm F** (một cách đọc: tính, nhãn đúng model, không so với lượt đầu). Lý do: trong lượt hai bốn nhánh chạy cùng model và xen kẽ nên phép so trong lượt vẫn công bằng; thứ hỏng là mọi phép so giữa hai lượt, và B kèm F cấm đúng thứ đó. Đánh đổi: chấp nhận rằng "model giống lượt đầu" không được giữ; ai muốn giữ nguyên chữ của luật thì chọn C. Lưu ý: reviewer đối kháng gọi C là cách bất lợi nhất cho kit; B kèm F là cách cho kit số đạt ở mọi ngưỡng 1 đến 5, nên owner nên cân điều đó. Dù chọn gì, **merge vẫn là quyết định riêng của owner** (chữ chỉ đạt ở lượt hai, viết sau khi đã thấy bẫy nào trượt), guard chỉ chạy khi owner bảo, và không có lượt thứ ba.
2. Sau câu 1: merge (sau guard) hay đóng P5b giữ chữ trên nhánh.
3. Có đưa vào các đăng ký sau việc ghim model bằng tên đầy đủ và cho bộ chạy kiểm `init` trước phiên đầu không (đổi thiết kế: phiên đề xuất, COUNCIL).
4. Như các handoff trước: đề xuất sửa luật tự lái (A1, A3, B3, D1, E); dòng trần của `state.md` theo lời owner (cảnh báo khi tuần trên 90%); xác nhận thay đổi 4 và 5 khi muốn; ghi `RUN` khi muốn chạy lại.

### Open threads

- Reviewer vòng 5 của `47d2de4` để lại các điểm nhỏ chưa áp dụng (nhật ký mục 13, "Left open").
- Dòng Status ở đầu spec của nhánh chưa nhắc lần đóng băng hai và lượt hai (cũ từ `afa1a46`).
- Model thật của người đọc A (cũng gọi bằng alias `sonnet`) ở cả hai lượt không được ghi lại; cổng của ngày đạt ở cả hai lượt.
- Phiên của lượt hai nhanh hơn hẳn lượt đầu (vòng 15 đến 18 phút so với 48 đến 108); ba phiên thăm dò đã nhanh như vậy mà phiên không kiểm `init` lúc đó. Bài học: kiểm model trong `init` của phiên thăm dò trước khi chạy lượt đo.
- `docs/status.md` 16.090 byte, trên trần "khoảng 15 KB".

### Next work

1. Chờ owner trả lời câu 1. Chưa có lời: không viết phán quyết, không chạy phiên nào, không merge.
2. Khi owner đã chọn và đã ghi `RUN`: phiên kế là **phiên kiểm toán** (luật: sau mỗi bốn phiên; đọc nhật ký mục 13, 14 và các diff từ đầu, bằng một agent chỉ đọc của model khác phiên chính). Phiên sau đó mới ghi phán quyết theo cách owner chọn vào spec của nhánh (bước nặng: thêm reviewer đối kháng), cập nhật `docs/status.md`, rồi làm theo câu 2.
3. Sau P5b: P5c, `c-cpp`, các mục "gate" của đề xuất sửa luật.

### Resume prompt

"Phiên tiếp của Bearingkit, máy owner, `C:\Projects\Bearingkit`. CẢNH BÁO: trên nhánh `p5b-bk-plan` lệnh `node evals/analysis/plan-run.cjs` không kèm `--dry` khởi động phiên đo thật (một lượt thứ ba, luật cấm): không chạy nó. Trước mọi việc đọc `docs/autopilot/state.md` (không phải `RUN` thì chỉ báo cáo và dừng, trừ việc owner bảo trong phiên), rồi `docs/specs/2026-10-06-autopilot-design.md` cả file, `docs/autopilot/decisions.md` mục 13 và 14, `docs/handoff/2026-10-07-second-run-pause.md` (Block 2 trước), và trên nhánh, bằng `git show p5b-bk-plan:docs/specs/2026-10-03-bk-plan-design.md`, các mục từ "The second run (registered 2026-10-07" tới hết. Đầu phiên, mỗi lệnh một mình: `git status` (sạch, `main`); `git fetch origin`; `git rev-parse p5b-bk-plan` (`2ce999d…`); `node bin/bearingkit.cjs doctor` (sáu `ok`, một `skip`); `get_usage`; suite `node --test tests/*.test.cjs` (206/206, timeout trên 300 giây); khóa `docs/autopilot/.lock` trước mọi ghi. Việc: nếu công tắc là `RUN` thì phiên này là phiên kiểm toán (bộ đếm là 4) và không làm gì khác, trừ khi lời mở phiên của owner bảo làm việc khác trước. Phán quyết của lượt đo lần hai chỉ được ghi khi owner đã chọn cách đọc (A đến F ở handoff), theo đúng cách đó; chưa chọn thì chỉ hỏi. Dưới PAUSE mà owner chọn cách đọc: ghi phán quyết theo cách đó, không làm kiểm toán trước, trừ khi owner bảo. Dưới PAUSE: không ghi khóa, không chạy suite; báo cáo trạng thái và nêu câu 1 để owner chọn. RUN không phải lời chọn cách đọc; không tự lấy khuyến nghị làm lựa chọn của owner. Không merge, không chạy guard. Mỗi commit qua cổng (suite; reviewer mới mỗi commit, tối đa năm vòng; bước nặng thêm reviewer đối kháng; sau khi rà chỉ chép câu của reviewer). Không tự clear giữa các phase; dừng với handoff ở 80% ngữ cảnh. Trả lời bằng tiếng Việt; cuối mỗi khối việc có "Đã xong" và "Còn lại"; đóng phiên bằng handoff, dòng phiên trong nhật ký, `git status` dán nguyên."

### Hạn mức và ngữ cảnh lúc đóng

`get_usage` lúc viết: khung 5 giờ 8% (mở lại 12:10Z), tuần 6%; ngữ cảnh phiên chính 385.104 token trên cửa sổ 1 triệu (39%). Cả lượt đo 32 phiên cộng ba phiên thăm dò, cổng và ba lô đọc: tuần từ 3% lên 6%.
