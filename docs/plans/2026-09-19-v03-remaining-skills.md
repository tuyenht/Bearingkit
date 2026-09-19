# Plan · ba skill còn lại của v0.3 và việc đi kèm · 2026-09-19

Status: PLANNED · Owner duyệt thứ tự (câu 27, nhóm A); plan này chỉ xếp việc, không tự quyết thay owner. Công thức mỗi sprint gốc ở `docs/plans/2026-09-11-content-program.md` Step 2; plan này thêm những gì sprint `bk-ops` và `bk-db` dạy (`docs/handoff/2026-09-19.md`, Lessons).

## Thứ tự

1. `bk-map`: B6 đã chạy (86/87 trong profile hằng ngày), điều kiện trước của catalog đã đạt.
2. `bk-research`: hàng router chỉ thay hàng "research → bk-spec until its skill exists", gần như không tốn ký tự.
3. `bk-perf`: dựa vào `bk-db` (v1 §7.1: phần DB giao cho `bk-db`), nên đứng cuối.

Mỗi sprint một phiên mới: phiên dài tiêu hạn mức nhiều hơn các phiên đo (bài học 2026-09-19). Cửa sổ bảy ngày ở 70% sau B6, reset 23/09 10:00: khuyến nghị làm `bk-map` trước reset, `bk-research` và `bk-perf` sau reset.

## Công thức mỗi sprint (đã siết sau `bk-db`)

1. Đọc các dòng kiểm kê có đích là skill đó (`docs/specs/2026-09-18-item-inventory.md`) và ô v1 §7.1 của nó; agent nghiên cứu chạy Sonnet, ghi báo cáo vào scratchpad; mọi câu "của owner" trong báo cáo phải `grep` lại repo.
2. Thiết kế: `docs/specs/<date>-<skill>-design.md` (mẫu: `2026-09-18-bk-db-design.md`), gồm hàng router và phần protocol phải cắt để trả.
3. Viết thân (≤100 dòng), reference, ba test case, ba prompt activation (`<intent>-en-01`, `-vi-01`, `-neg-01`); cập nhật `tests/evals.test.cjs` (SKILL_INTENTS, tổng số prompt) và `evals/activation/README.md`.
4. Câu về hành vi công cụ hay engine trong reference: đối chiếu tài liệu chính thức, ghi bảng vào `docs/compat/`.
5. Đo trước commit trong profile cách ly, **đọc hạn mức trước và chạy prompt quan trọng trước, mỗi nhóm một lần gọi runner**: token (A/B/C, hai lượt, chỉ so trong một lượt), định tuyến quanh skill mới và các hàng protocol vừa đổi, acceptance, hành vi trước/sau chỉ cho prompt mà skill phải đổi câu trả lời.
6. Rà soát độc lập (Sonnet) trước commit; xét từng điểm theo bằng chứng, không đảo quyết định owner đã chốt.
7. Commit tách theo thay đổi (commit phần thì kiểm HEAD trên worktree sạch), push; handoff và status viết lại trước commit cuối.
8. Gói đo Antigravity sau commit, chỉ khi owner duyệt (cài lại bản copy, acceptance, prompt của skill mới).

## Sprint 1 · `bk-map`

- Ô v1 §7.1: hiểu một codebase lạ, viết hoặc làm mới `docs/architecture-map.md` có anchor `file:line` (ACT); đề xuất sửa file chỉ dẫn dưới dạng diff (COUNCIL). Nguồn: feature-dev code-explorer (Apache).
- Kiểm kê: **5 absorb** của `claude-plugins-official:plugins/code-modernization` (Apache-2.0: `agents/business-rules-extractor.md`, `agents/legacy-analyst.md`, `commands/modernize-extract-rules.md`, `commands/modernize-map.md`, `commands/modernize-preflight.md`) và **10 idea**. Absorb là lấy chữ: `references/` có dòng "Adapted from …" trỏ `NOTICE`, mục `NOTICE` cho nguồn, `derived` trong `upstream/sources.json`; `tests/skills.test.cjs` canh cả ba.
- Đối thủ trong profile hằng ngày: `fullstack-dev-skills:spec-miner`. B6 đo bộ prompt hiện có trước khi `bk-map` vào (86/87); các prompt `map-*` mới chưa có số nền ở profile đó, nên đo chúng ở profile cách ly như mọi sprint. Hàng router dự kiến "understand a codebase, architecture map → bk-map"; prompt âm nên là một câu hỏi thường về code (phải trả lời thẳng) để canh hàng mới không nuốt hàng question.
- Protocol còn 7 ký tự: xem mục "Ngân sách protocol".

## Sprint 2 · `bk-research`

- Ô v1 §7.1: trả lời có nguồn và nhãn độ tin; query plan, nguồn độc lập, nhãn claim. Nguồn: deep-research dựng sẵn của host; ClaudeKit research (chỉ lấy ý, clean-room).
- Kiểm kê: 0 absorb, **8 idea**. Agent `bk-researcher` đã có; dòng A4 (nội dung lấy từ ngoài là dữ liệu) đã có trong protocol.
- Hàng router: "research → bk-research" thay hàng dự phòng hiện có.

## Sprint 3 · `bk-perf`

- Ô v1 §7.1: đo rồi mới tối ưu (web vitals, bộ nhớ, ngân sách asset), phần DB giao cho `bk-db`; số kèm cách đo hoặc "not measured". Nguồn chính ghi là "Owner's LCP and memory-leak practice".
- Kiểm kê: 0 absorb, **16 idea** (addyosmani, jeffallan, vercel, cloudflare, Spartan, Antigravity-Core).
- **Câu cho owner trước sprint:** "cách làm LCP và memory-leak của owner" nằm ở đâu (repo, skill, ghi chép)? Chưa có đường dẫn nào trong repo; không đoán.

## Việc đi kèm

- **Ngân sách protocol (status §7 (ff))**: 6.493/6.500 ký tự, 2.250 và 2.254 token trên 2.300. `bk-map` và `bk-perf` thêm khoảng 100 ký tự. Khuyến nghị: trả bằng cắt (ba chú thích còn lại của danh sách References khoảng 80 ký tự, rồi rút gọn câu), đo lại mỗi lần; giữ proxy 6.500. Nâng proxy là đổi thiết kế, cần owner.
- **Harness (status §7 (dd))**: cho profile cách ly quyền đọc đường dẫn kit trong `_build/profile/claude/settings.json`, theo cú pháp đọc từ tài liệu Claude Code (không đoán), rồi một phiên kiểm cho thấy `references/` mở được. Làm ở đầu sprint 1, trước phép đo hành vi.
- **Ranh giới `bk-db` / `bk-ops` (status §7 (ee))**: bộ activation giữ đúng ba prompt mỗi intent (test canh), nên prompt ranh giới cần quyết cách thêm (nhãn chấp nhận cả hai, ở intent nào); đề xuất trong sprint 1, thêm khi owner đồng ý.
- **Bản copy Antigravity**: lệch `skills/` từ bản sửa bước 3 của `bk-db`; cài lại trong gói đo của sprint 1 (owner chốt 2026-09-19).
- **Sau ba skill**: chắt lọc tám skill lifecycle từ dòng kiểm kê (v0.2, v2 §13, gồm (y) lens bảo mật của `bk-review` và (x) dòng context7); năm file stack còn thiếu; test case cho `bk-audit`, `bk-next`; khung benchmark với hai, ba task (câu 26); pack `bk-product`, `bk-agent` ở v0.4.
- **Việc của owner**: phase 2 của `docs/plans/2026-09-10-owner-migration.md`, gồm dòng KB trong file chỉ dẫn toàn cục trước khi gỡ `database-playbook` (status §7 (gg)).

## Xong khi

Catalog 18/18; mỗi skill mới có tests, prompt activation, acceptance hai host; protocol trong ngân sách; `doctor` sáu `ok`.
