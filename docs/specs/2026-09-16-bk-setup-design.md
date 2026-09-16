# `bk-setup` — đề xuất thiết kế, 2026-09-16

Status: **PROPOSED — chờ owner duyệt thiết kế** (COUNCIL theo `AGENTS.md`: đổi thiết kế thì đề xuất rồi chờ). **Phạm vi đã được owner chốt**: câu 22 của `docs/specs/2026-09-12-d5-owner-questions.md`, 2026-09-16, đường (b). File này chỉ trả lời "làm thế nào", không mở lại "có làm không".

---

## 1. Owner đã chốt gì

Kiểm kê `claude-code-setup` (2026-09-15, cuối `docs/specs/2026-09-11-skill-inventory.md`) kết luận 0 absorb / 5 drop / 3 idea và đưa hai đường: (a) ideas-only, đóng lại; (b) một skill `bk-setup` thật. **Owner chọn (b).** Chính file kiểm kê đã ghi (b) kéo theo gì: một mục catalog mới, phải qua scope test §5.2, và phải giải mâu thuẫn host-specific ở mục 1 của bảng. Ba việc đó là mục 2, 3 và 6 dưới đây.

## 2. Scope test (spec §1, §5.2)

> *Có giúp một người làm được việc mà cả một đội mới làm nổi không?*

Trong một đội, có người (platform, DevEx, tech lead) làm cho repository **sẵn sàng cho những ai sẽ làm việc trong nó**: tài liệu nhập môn, lệnh nào chặn merge, hook nào kiểm khi lưu, chỗ nào phải cẩn thận. Với một công ty một người điều khiển AI agent, "những ai" là các agent trên nhiều host, và việc chuẩn bị là: file chỉ dẫn nêu những sự thật agent không tự suy ra được; lệnh guardrail được gắn vào nơi host cho phép; hot path được khai; công cụ tra tài liệu có mặt khi stack mới hơn dữ liệu huấn luyện; không dòng nào mâu thuẫn với protocol của kit. Việc làm một lần mỗi project, làm lại khi stack đổi. **Qua.**

Phần **không** qua và ở ngoài: giữ một catalog plugin/MCP của host (vendor đã ship, đổi theo tuần — non-goal "anything a host or framework vendor already ships"); cài bất cứ thứ gì (non-goal "a universal installer that writes into host profiles").

## 3. Hai mâu thuẫn và cách giải

### 3.1 Nguyên tắc 6 — thân skill không mang tên công cụ của một host

Mục 1 của bảng kiểm kê drop bản chất của nguồn vì nó là recommender **cho riêng Claude Code**. Cách giải là cơ chế kit đã dùng cho mọi skill: thân `bk-setup` mô tả **hành động và kết quả** ("chạy lệnh format sau mỗi lần sửa", "một công cụ tra tài liệu có ghim phiên bản"), còn **tên file và tên sự kiện của từng host** nằm trong bảng ánh xạ `bk-protocol/references/host-tools.md`. Bảng đó hiện có 11 hàng hành động cho Claude Code và Antigravity; `bk-setup` cần thêm **hai hàng**:

| Hành động | Cần biết cho mỗi host |
|---|---|
| file chỉ dẫn của project mà host đọc | tên file và việc nó có import được file khác không (repo này: `CLAUDE.md` chỉ chứa `@AGENTS.md`) |
| chạy một lệnh kiểm sau mỗi lần sửa | sự kiện hook nếu host có; nếu không có thì ghi "không có" |

**Giá trị của hai hàng này chưa được xác minh** cho host nào ngoài những gì repo này tự dùng; chúng được đọc từ tài liệu của từng host lúc dựng skill, mỗi ô một nguồn, ô nào không xác minh được ghi "chưa xác minh" thay vì đoán. Host không có sự kiện sau-khi-sửa thì guardrail ở lại trong file chỉ dẫn và `bk-ship` chạy nó — đúng nguyên tắc 8 (gate nằm trong skill; hook là phần thêm nơi host có sự kiện).

### 3.2 MCP và catalog của host

Neo thật, đã đọc lại 2026-09-16: spec §3 "Removed from v1" ghi `core/mcp.json` bị bỏ vì *"context7 is documented per host in `docs/hosts.md`, never installed by the kit"*; `docs/hosts.md:52` ghi *"The kit installs no MCP server."* Ràng buộc là **không cài**, không phải **không nhắc**. (Bảng kiểm kê 2026-09-15 viết ràng buộc này "ghi thẳng trong spec §1" — sai chỗ: nó ở §3 và `hosts.md`, không ở danh sách non-goal của §1. Nội dung không đổi, chỉ sửa neo.)

Vì vậy `bk-setup` **không giữ catalog** plugin hay MCP. Nó khuyến nghị theo **khoảng trống năng lực**, và chỉ một trường hợp đã có trong kit: stack profile cho thấy major mới hơn dữ liệu huấn luyện → cần tra tài liệu có ghim phiên bản (spec §16, cơ chế 3) → nếu host chưa có công cụ đó, trỏ đúng dòng cài đặt `docs/hosts.md` đã ghi. Không khuyến nghị MCP nào khác.

## 4. Skill làm gì

**Đọc trước:** stack profile (`detect-stack`); mọi file chỉ dẫn của project mà các host owner dùng sẽ đọc (theo hàng mới của `host-tools.md`); `docs/hosts.md` của kit; kết quả `bearingkit doctor` nếu có — `bk-setup` **không** kiểm lại cài đặt của kit, đó là việc của `doctor`.

**Các bước:**

1. **Một nguồn cho mọi host.** Mỗi host owner dùng có file chỉ dẫn nó đọc không; các file đó có trỏ về một nguồn (import) hay là các bản chép đang lệch nhau. Bản chép lệch là một phát hiện.
2. **Sự thật agent không tự suy ra được.** Đối chiếu file chỉ dẫn với profile: lệnh guardrail (`profile.guardrails` so với lệnh file chỉ dẫn khai), hot path (`profile.hotPathGlobs` cộng những chỗ riêng của project), danh sách "không được làm", nơi để spec/plan/handoff, ngôn ngữ owner viết. Thiếu thì đề xuất đúng dòng cần thêm, kèm bằng chứng.
3. **Mâu thuẫn với protocol.** Dòng bảo agent bỏ test, tự push, in secret — báo ra. Theo protocol, sự thật của project thắng, nên đây là phát hiện để owner quyết, không phải thứ `bk-setup` tự ghi đè.
4. **Gắn guardrail.** Nơi host có sự kiện sau-khi-sửa hoặc trước-commit, đề xuất gắn lệnh format/lint của profile vào đó; nơi không có, guardrail ở trong file chỉ dẫn và `bk-ship` chạy. Không bao giờ đề xuất lệnh chạm state hay mạng (`terraform plan`/`apply`/`init` là ví dụ `detect-stack` đã có test canh).
5. **Tra tài liệu.** Như mục 3.2 — một khuyến nghị, chỉ khi có khoảng trống.
6. **Báo cáo.** Nhiều nhất **hai khuyến nghị mỗi nhóm** (file chỉ dẫn, guardrail, hook, tra tài liệu) — kỷ luật đầu ra của nguồn, mục 8 bảng kiểm kê. Mỗi khuyến nghị có: bằng chứng (`file:line` hoặc trường của profile), thay đổi chính xác, và cổng của nó.

**Cổng** — không thêm luật mới, dùng đúng Autonomy Gate của `bk-protocol`:

- Sửa file chỉ dẫn **của chính project** là việc tài liệu → **ACT**, với một điều kiện riêng của skill: mỗi dòng thêm vào phải có bằng chứng đi kèm, vì một dòng sai ở đó đánh lừa mọi phiên sau.
- Bất cứ thứ gì trong **profile của host ở cấp người dùng** (hook trong `~/.claude`, cấu hình MCP) ảnh hưởng mọi project → "consequences you cannot bound" → **COUNCIL**, đưa ra dưới dạng lệnh cho owner chạy.
- **Không cài gì.** Giống lập trường chỉ-đọc của nguồn (mục 6 bảng kiểm kê), nhưng ở kit nó là cổng, không chỉ là câu tuyên bố.

## 5. Không làm gì

- Không kiểm cài đặt của kit (`doctor`).
- Không hiểu codebase (`bk-map`, chưa dựng).
- Không đề xuất sửa tài liệu sau mỗi phiên làm việc (`bk-close --docs`).
- Không viết agent mới, không đề xuất plugin, không giữ bảng MCP.

## 6. Vị trí trong catalog

**Domain skill**, không phải lifecycle: §5.1 định nghĩa lifecycle là chuỗi `spec → … → close`, còn `bk-setup` đứng ngoài chuỗi, chạy một lần mỗi project và khi stack đổi. Giống `bk-design`, nó có **một hàng router riêng** trong `bk-protocol` ("set up a project for agents → bk-setup"); body `bk-protocol` hiện **87**/100 dòng nên còn chỗ (đếm như `tests/skills.test.cjs` đếm — phần sau frontmatter; con số 93 trong handoff 2026-09-14 là cả file, kể cả frontmatter). `bk-next` có thể gợi ý nó khi project chưa có file chỉ dẫn.

Catalog **17 → 18**. Câu *"That is the seventeen of v1 §7, unchanged in name and intent"* của spec §5.1 phải sửa, kèm ghi chú quyết định câu 22.

## 7. Chi phí

| Hạng | Tăng | Trần |
|---|---|---|
| Mô tả trong listing | một mô tả, cỡ các skill khác (panel `/skills` đo 70–100 token mỗi skill ngày 2026-09-10) | 1.700 cho mọi mô tả; lần đọc 2026-09-13 là 900 cho 11 skill (kể cả `bk-protocol`). **Dự phóng**, không phải số đo: cùng mức trung bình, 18 skill ≈ 1.473 — vẫn dưới trần |
| Bootstrap | một hàng router | body `bk-protocol` ≤100 dòng; hiện 87 |
| Bộ activation | +3 prompt (2 positive + 1 negative, đúng bất biến của `tests/evals.test.cjs`) → 81 | — |
| Test case | 3, như `bk-design` dù danh sách tám lifecycle của test không đòi | — |

Lần đo cổng đang chạy hôm nay đo **commit `e244070` với 78 prompt**, trong một worktree đóng băng; skill mới không làm lệch nó.

## 8. Kiểm kê lại `claude-code-setup` khi đã có đích

Nguyên tắc §5.2: một mục nguồn về đúng một skill. Có đích rồi thì bốn dòng đổi, bốn dòng giữ:

| # | Mục | Trước | Sau |
|---|---|---|---|
| 1 | Bản chất: quét codebase rồi khuyến nghị | drop (host-specific) | **idea → `bk-setup`**, host-specific được giải bằng mục 3.1 |
| 2 | Bảng chỉ dấu → khuyến nghị | drop (trùng `detect-stack`) | **idea → `bk-setup`**: hình dạng "chỉ dấu → khuyến nghị" là của skill, còn chỉ dấu vẫn do `detect-stack` đọc |
| 3 | Bảng MCP | drop | giữ **drop** (mục 3.2) |
| 4 | Catalog plugin/skill | drop | giữ **drop** |
| 5 | 8 mẫu subagent | drop | giữ **drop** |
| 6 | Lập trường chỉ-đọc | idea | **idea → `bk-setup`** (thành cổng ở mục 4) |
| 7 | Bảng lệnh format/type-check | idea → Task 7 | giữ nguyên đích: đã thành guardrail của `detect-stack` ngày 2026-09-16 |
| 8 | Hai khuyến nghị mỗi nhóm | idea | **idea → `bk-setup`** (bước 6) |

Không mục nào **absorb** — không chữ nào được lấy, nên `NOTICE` không thêm mục và `derived` giữ nguyên. Dòng `Sources:` của skill ghi nguồn là ideas-only, "no upstream text", kèm license mode Apache-2.0 — đúng dạng test provenance đòi.

## 9. Thứ tự dựng khi được duyệt (TDD)

1. Thêm 3 prompt vào `evals/activation/phase-1.jsonl` và intent `setup` vào `SKILL_INTENTS` của `tests/evals.test.cjs` → suite đỏ vì skill chưa có.
2. Tạo `skills/bk-setup/SKILL.md` (body ≤100 dòng, dòng `Sources:`, mô tả ≤300 ký tự có "Use when") + 3 test case → xanh.
3. Hai hàng mới của `host-tools.md`, mỗi ô một nguồn hoặc "chưa xác minh".
4. Hàng router trong `bk-protocol`; sửa spec §5.1 (17 → 18); dòng kiểm kê; ma trận hàng 2; `status.md`; `CHANGELOG.md`.
5. Re-check: chạy `detect-stack` trên một fixture và đọc output trước khi viết bất cứ câu nào mô tả nó (bài học 2026-09-15).
6. Bản copy Antigravity lệch sau bước 2 → một lệnh `antigravity install` cho owner, rồi `doctor`.

## 10. Cần owner

Một câu: **duyệt thiết kế này để dựng thành Task 6c**, hay sửa chỗ nào. Hai cách giải ở mục 3 là phán đoán của phiên, không phải điều spec đã quyết; nếu owner đọc nguyên tắc 6 hay dòng MCP khác đi, thiết kế đổi theo.
