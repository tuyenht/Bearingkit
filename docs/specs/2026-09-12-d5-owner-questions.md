# D5 — Batch câu hỏi hợp nhất cho owner, 2026-09-12

> **TRẠNG THÁI: BATCH CÂU HỎI. CHƯA CÓ QUYẾT ĐỊNH NÀO Ở ĐÂY. CHỜ OWNER TRẢ LỜI MỘT LẦN.**
>
> Đây là D5 (`docs/handoff/2026-09-11-owner-directives.md`, mục "Thứ tự thực thi"): hợp nhất **tất cả** câu hỏi đang chờ owner, đang nằm rải rác ở nhiều file, thành một batch duy nhất, hỏi một lần. Tài liệu này **không tự trả lời, không tự quyết** bất cứ câu nào — nó chỉ tập hợp, khử trùng lặp, sắp thứ tự các câu đã có sẵn ở nơi khác trong repo, và với vài câu, nhắc lại khuyến nghị mà phiên trước đã đưa ra (ghi rõ là khuyến nghị). Không dòng mã, spec hay plan nào bị sửa theo file này.
>
> Sau khi owner trả lời: áp dụng câu trả lời vào các file liên quan (ma trận, LICENSE, `docs/hosts.md`, spec v2 §1/§3, v.v.), rồi mới commit.

---

## 0. Số liệu thật — đã grep và đọc lại, không dùng số cũ

Quét `docs/specs/` và `docs/handoff/` bằng nhiều bộ từ khoá (`Questions for D5`, `Câu hỏi`, `chờ owner`, `TODO`, `pending`, `unresolved`, `chưa chốt`, v.v.), rồi đọc trực tiếp từng nơi khớp — không tin số nào đã lưu hành trước đó (13, 9, 7, 15, 21 đều từng xuất hiện). Ba nơi thật sự giữ câu hỏi cho owner:

| Nơi | Số câu (đọc trực tiếp) | Vai trò |
|---|---|---|
| `docs/handoff/2026-09-11.md`, mục "Decisions waiting on the owner (COUNCIL)" | 6 | **Bản gốc, đầy đủ nhất** — có khuyến nghị sẵn cho 1 câu, mô tả rõ nội dung câu "Phase 0" |
| `docs/handoff/2026-09-11-opus5-handoff.md` §4.5 | 6 (cùng 6 câu trên, chép lại dạng rút gọn — không phải câu mới) | Bản tóm tắt; tự sửa lại thành con số "21" ở đoạn "Cập nhật 2026-09-12" của chính nó |
| `docs/specs/2026-09-11-skill-inventory.md`, mục "Questions for D5" | 15 (đánh số 1–15, đọc trực tiếp, khớp con số "15" mà opus5-handoff tự tính) | Sinh từ D3 (9 câu gốc, gồm 2 câu #8–#9 thêm bởi một lượt verification) + D4 (6 câu, #10–#15) |

**Tổng thô: 6 + 15 = 21** — khớp con số opus5-handoff tự tính lại ngày 2026-09-12, nhưng xác minh **độc lập** ở đây bằng cách đọc trực tiếp từng mục, không phải vì tin sẵn con số đó. Sau khi gộp một cặp trùng nhau (câu 5 dưới đây, gộp từ skill-inventory #2 + #8), **batch này còn 20 câu.**

Số "13" từng xuất hiện (`opus5-handoff.md:171`) đã bị chính file đó sửa lại hai dòng sau (`:173`); "7" và "9" là các mốc trung gian trước khi D4 thêm 6 câu nữa — không dùng số nào trong ba số này.

**Đã kiểm, không có câu hỏi nào bị bỏ sót ở:** `docs/specs/2026-09-10-bearingkit-v1-design.md`, `docs/specs/2026-09-10-coverage-matrix.md`, `docs/specs/2026-09-11-bearingkit-v2-design.md` (kể cả §15 "Decisions log" — chỉ là lịch sử quyết định đã chốt, không còn mục nào mở), `docs/plans/2026-09-11-v2-restructure.md`, `docs/hosts.md`, `docs/compat/phase-1-gate.md`, `docs/plans/2026-09-10-phase-1-core.md`. Các file này chỉ khớp từ khoá một cách tình cờ (ví dụ trạng thái nối dây host "wired; pending", không phải câu hỏi).

**Phát hiện ngoài phạm vi ban đầu:** `docs/handoff/2026-09-11.md` mục "Decisions waiting on the owner (COUNCIL)" là **nơi thứ ba** giữ đúng 6 câu đã nêu ở opus5-handoff §4.5 — và là bản gốc, đầy đủ hơn bản tóm tắt. Yêu cầu ban đầu chỉ nhắc hai nơi cũ (opus5-handoff §4.5 và skill-inventory); nơi thứ ba này đã được xử lý theo đúng tinh thần chung — một bản đầy đủ duy nhất, còn lại chỉ là con trỏ — nói rõ ở đây vì đó là việc tự mở rộng phạm vi ngoài đúng chữ đã yêu cầu.

**Đối chiếu với 4 chỉ thị verbatim của owner** (`docs/handoff/2026-09-11-owner-directives.md`): không câu nào trong 20 câu dưới đây được trả lời sẵn bằng nguyên văn 4 chỉ thị. Chỉ thị 1 cho một **tiêu chí** để owner tự áp dụng khi trả lời câu 7 (không phải câu trả lời có sẵn). Chỉ thị 2 **chỉ định làm council** cho đúng cụm câu 1–4 (không tự chọn phương án nào). Chỉ thị 3 đã thực thi xong, không sinh câu hỏi nào (cơ chế đã đặc tả đủ ở spec v2 §16). Chỉ thị 4 là **nguyên liệu thô** cho câu 5, 9, 10, 11 — bản thân nó chứa sự mơ hồ ("hoặc") và bảng tier gốc, nhưng không tự giải quyết chúng; đó chính xác là lý do các câu này còn mở.

---

## Tier 1 — Đang chặn việc khác

### 1. Cách cài chung cho mọi host
*(gộp từ: `skill-inventory.md` #10)*
- **Cần quyết định:** Chọn một trong bốn phương án cài đặt đã khảo sát ở `docs/specs/2026-09-12-install-council.md` §6–7.
- **Lựa chọn:**
  - **A** — Một trang tài liệu duy nhất gom lệnh cài mỗi host, bổ sung đường CLI của Claude Code còn thiếu tài liệu. 0 dòng mã.
  - **B′** — A cộng `bearingkit doctor` (chỉ đọc): so bản copy trên host với repo, lệch thì in ra đúng lệnh cần gõ, không tự ghi gì.
  - **B** (đã cân nhắc, đã rút ở D4) — A cộng `bearingkit install` **tự chạy** lệnh cài của host (~100–150 dòng), cộng doctor.
  - **C** — Installer phổ quát tự ghi vào cấu hình từng host (quay lại v1; v2 §1 đã bác).
- **Bị chặn:** Toàn bộ việc viết mã cài đặt cho v0.2/v0.4 (doctor hoặc install wrapper), và nội dung phần cài đặt của `docs/hosts.md`/README.
- **Khuyến nghị:** D4 khuyến nghị **A + B′**, bỏ hẳn B, không làm C. B trượt tiêu chí v2 §2.1 ("một dòng công cụ chỉ tồn tại khi nó giữ đúng hoặc đo được nội dung skill") — phần "install" của B không chạm nội dung skill, không đo gì, không sửa cái gì đang sai; hai lệnh nó gộp lại đã chạy được, đã qua acceptance trên cả hai host rồi. C không có dữ kiện mới ủng hộ, và lịch sử installer v1 (9 commit, 6/9 chạy theo quirk một host) cho thấy nó không giảm được việc theo host.

### 2. Trần cứng cho doctor / install wrapper
*(gộp từ: `skill-inventory.md` #11 — phụ thuộc câu trả lời của câu 1)*
- **Cần quyết định:** Chốt bất biến cho B′: *"doctor chỉ đọc, không ghi một byte nào vào cấu hình host; mọi thao tác ghi vẫn là lệnh owner tự gõ"* — kiểm bằng test chạy trong HOME giả, so cây thư mục trước/sau. Nếu chọn B thay vì B′: trần tương ứng có nên là *"wrapper chỉ được gọi lệnh cài chính thức của host hoặc copy vào thư mục plugin của chính host; không bao giờ mở hay ghi `settings.json`, `CLAUDE.md`, `opencode.json` hay bất kỳ file cấu hình host nào"* không?
- **Lựa chọn:** Đồng ý trần đã đề xuất / sửa trần / không áp dụng (nếu chọn A hoặc C ở câu 1).
- **Bị chặn:** Viết được acceptance test đúng cho doctor/install — cần bất biến chốt trước khi viết test.
- **Khuyến nghị:** Không nêu riêng; trần đề xuất đã nằm trong khuyến nghị A+B′ ở câu 1, nhưng việc "chốt làm bất biến" cần owner gật đầu riêng.

### 3. Phạm vi đọc của doctor
*(gộp từ: `skill-inventory.md` #12 — phụ thuộc câu 1)*
- **Cần quyết định:** `doctor` được đọc profile hàng ngày thật (`~/.claude`, `~/.gemini`), hay chỉ chạy trên profile cách ly và owner tự chạy tay trên profile thật khi cần?
- **Lựa chọn:** (a) đọc profile hàng ngày — cách duy nhất bắt được bản copy Antigravity đang sống bị lệch (đúng loại lỗi đã xảy ra ở commit `3d7b4eb`); (b) chỉ profile cách ly.
- **Bị chặn:** Phạm vi quyền đọc của doctor, và có cần xin phép COUNCIL mỗi lần chạy hay không — `AGENTS.md` xếp mọi thứ chạm `~/.claude`/`~/.gemini` vào COUNCIL, ranh giới "đọc thì tự do, ghi thì xin phép" cần owner nói rõ trước khi viết doctor.
- **Khuyến nghị:** Không nêu — nguồn chỉ trình bày đánh đổi hai phía.

### 4. Thời điểm ra mắt của doctor
*(gộp từ: `skill-inventory.md` #13 — phụ thuộc câu 1, 3)*
- **Cần quyết định:** Kéo doctor lên trước v0.2 (bắt bản copy Antigravity lệch sớm hơn), hay giữ lịch v0.3 hiện tại (`bin/bearingkit.cjs` đã tự in đúng câu "doctor arrives with v0.3")?
- **Lựa chọn:** giữ v0.3 / kéo lên trước v0.2.
- **Bị chặn:** Thứ tự release gate — v0.2 hiện là mốc đo đầu tiên (spec v2 §11); nếu doctor cần có mặt sớm hơn, mốc đó phải viết lại.
- **Khuyến nghị:** Không nêu; lý do để kéo lên đã có sẵn — `tests/antigravity-install.test.cjs` chỉ chứng minh script **sẽ** ghi host note, không chứng minh bản copy **đang nằm trên đĩa** có nó, đúng chỗ lỗi `3d7b4eb` lọt qua.

### 5. Nghĩa của "hoặc" giữa Superpowers và spec-kit
*(gộp từ: `skill-inventory.md` #2 + #8 — hai câu hỏi cùng một quyết định, viết ở hai chỗ khác nhau trong cùng file)*
- **Cần quyết định:** Chỉ thị 4 viết "#3 superpowers hoặc #4 spec-kit". "Hoặc" ở đây là **bao hàm** (cả hai cùng thoả một chỗ bắt buộc, lấy cả hai không sai) hay **loại trừ** (chỉ một trong hai được tính, cái kia rớt khỏi nhóm bắt buộc)?
- **Lựa chọn:**
  - (a) Bao hàm — bằng chứng: "hoặc" tiếng Việt thường không mang nghĩa loại trừ kiểu "hoặc...hoặc"/XOR; owner liệt kê "#3 hoặc #4" thành một gạch đầu dòng duy nhất bên cạnh các mục liệt kê rõ ràng khác (#1, #19, #21, #15).
  - (b) Loại trừ — bằng chứng: bản dựng lại kết luận hiện tại của D3 đã đọc theo hướng này, rút lại cách đọc "giữ cả hai, không loại trừ" của lượt đầu vì coi đó là suy diễn đè lên chữ tường minh.
  - *Ghi chú:* cách dùng song song "Biome hoặc Pint" ở #18 không giải quyết được câu này — cặp đó phân biệt được bằng một dữ kiện bên ngoài (stack nào của repo đích dùng Biome hay Pint), còn #3/#4 không có dữ kiện phân biệt tương tự vì cả hai phục vụ cùng lúc `bk-spec`/`bk-plan`.
- **Bị chặn:** Rank và mode của spec-kit trong bảng ưu tiên hợp nhất (D3) — hiện xếp "dưới vạch", mode "ideas-only". Nếu chọn (a) hoặc mở lại: mode phải đổi sang "adapt" vì MIT cho phép lấy chữ và lý do hạn chế hiện tại (khác biệt cấu trúc) là trục mà luật riêng của kit nói không được dùng để đánh giá.
- **Khuyến nghị:** Không có — nguồn tự nhận cả hai cách đọc đều có bằng chứng hợp lý, chỉ nói rank hiện tại của spec-kit "hangs entirely on this answer".

### 6. Dòng bản quyền cho LICENSE
*(gộp từ: `docs/handoff/2026-09-11.md` "Decisions waiting on the owner" #2 = `opus5-handoff.md` §4.5 (2))*
- **Cần quyết định:** Tên chủ sở hữu bản quyền + năm cho dòng `Copyright (c) <năm> <tên>` trong file LICENSE.
- **Lựa chọn:** `package.json` đã khai loại MIT; chỉ thiếu dòng bản quyền — owner cho tên + năm muốn dùng.
- **Bị chặn:** Không tạo được file LICENSE thật — agent bị cấm tự viết file này (nằm trong danh sách "rejected options" của handoff tối 2026-09-11, xem `opus5-handoff.md` §2.2). Repo hiện chưa có file LICENSE dù `package.json` khai MIT.
- **Khuyến nghị:** Không có — chỉ owner biết thông tin này.

---

## Tier 2 — Cần sớm, có mặc định nếu chưa trả lời

### 7. Pack nào bắt buộc là core
*(gộp từ: `docs/handoff/2026-09-11.md` "Decisions waiting on the owner" #4 = `opus5-handoff.md` §4.5 (4))*
- **Cần quyết định:** Trong các skill "product discovery, UX, AI-feature, dependency hygiene" (quyết định bởi inventory §5.2) — có gói nào owner muốn bắt buộc là core ngay, thay vì mặc định là pack tuỳ chọn?
- **Lựa chọn:** Không gói nào là core (mặc định hiện tại, giữ tới khi inventory nói khác) / nêu tên gói cụ thể.
- **Bị chặn:** Bước "chốt catalog + pack" (mục 4.3 kế hoạch D2) — có thể tiến hành theo mặc định nếu owner không phản đối, nhưng catalog cuối cùng cần xác nhận rõ.
- **Khuyến nghị:** Không có câu trả lời sẵn, nhưng chỉ thị 1 đã cho tiêu chí để owner tự áp dụng: *"nó có giúp một người làm được việc của cả một đội không."*

### 8. Host nào owner thực dùng thêm
*(gộp từ: `docs/handoff/2026-09-11.md` "Decisions waiting on the owner" #3 = `opus5-handoff.md` §4.5 (3); D4 xác nhận đây cũng là "câu thứ 7" của riêng nó, không tạo mục mới)*
- **Cần quyết định:** Ngoài Claude Code và Antigravity, owner thực sự dùng thêm host nào (Gemini CLI / Cursor / Codex / Copilot CLI / Droid)?
- **Lựa chọn:** liệt kê host cụ thể / không dùng thêm host nào.
- **Bị chặn:** Lịch chạy acceptance test cho các host đó (hiện "wired; pending" hoặc "manifest sẵn, chưa xác minh gì").
- **Khuyến nghị:** Không có, nhưng có dữ kiện mới: xác minh 2026-09-12 bằng `command -v`, trên máy này **chỉ `claude`** có trên PATH; `gemini`, `droid`, `copilot`, `opencode`, `codex`, `cursor-agent` đều không có — "mọi công cụ" hôm nay trên thực tế là 2 host (Antigravity là app GUI, không có CLI để `command -v` phát hiện).

### 9. Biome/Pint — hook hay guardrail command
*(gộp từ: `skill-inventory.md` #1)*
- **Cần quyết định:** Chữ "hook" ở chỉ thị 4 ("#18 Biome hoặc Pint hook") va với chính sách hook hiện tại của v2 §8 (enforcement hook hoãn tới v0.4, tuỳ chọn). Dùng guardrail command ở v0.2 rồi mới thành hook thật ở v0.4 (giữ chính sách, chỉ trễ), hay đổi chính sách hook ngay?
- **Lựa chọn:** guardrail command v0.2 + hook v0.4 / đổi chính sách hook ngay.
- **Bị chặn:** Cách hiện thực hoá mục "#18" trong tier "thêm khi cần" — chưa cấp bách, nhưng cần chốt trước khi thật sự cài Biome/Pint.
- **Khuyến nghị:** Không nêu.

### 10. Rank của security-guidance: theo tier hay theo bằng chứng
*(gộp từ: `skill-inventory.md` #6)*
- **Cần quyết định:** security-guidance (tier "trước khi ship" theo chỉ thị 4) đang bị D3 xếp hạng 8, dù nó "không bị chặn và rẻ" trong khi hạng 3, 6, 7 đang bị chặn. Nhảy hạng lên sớm hơn, hay giữ hạng 8 theo đúng tier owner đã cho?
- **Lựa chọn:** giữ hạng 8 (mặc định hiện tại) / nhảy lên hạng cao hơn.
- **Bị chặn:** Thứ tự sprint từng skill ở bước 2 (content program) — có thể tiến hành theo mặc định nếu owner không phản đối.
- **Khuyến nghị:** Không nêu — nguồn chỉ đặt câu hỏi, không nghiêng bên nào.

### 11. Rank của plugin code-review chính thức
*(gộp từ: `skill-inventory.md` #7)*
- **Cần quyết định:** Plugin `code-review` chính thức (từng bắt buộc ở danh sách cũ, không có trong danh sách tối thiểu mới của chỉ thị 4, owner không hỏi riêng về nó) — giữ hạng 2 như cũ, hay việc owner không nhắc tới nó là cố ý bỏ?
- **Lựa chọn:** giữ hạng 2 (mặc định hiện tại) / xác nhận cố ý loại, hạ hạng hoặc bỏ.
- **Bị chặn:** Thứ tự sprint bước 2 (như câu 10).
- **Khuyến nghị:** Không nêu.

### 12. Thời điểm tạo bk-design
*(gộp từ: `skill-inventory.md` #5)*
- **Cần quyết định:** Tạo thư mục `bk-design` ngay để giải quyết hạng 3 đang bị chặn, hay chờ đúng quy trình per-item inventory §5.2 yêu cầu?
- **Lựa chọn:** tạo ngay / chờ inventory chính thức hoàn tất (bước 4.2).
- **Bị chặn:** Việc bắt đầu sprint cho `bk-design` — hạng 3 trong thứ tự ưu tiên hiện đang treo vì lý do này.
- **Khuyến nghị:** Không nêu.

### 13. Marketplace-first: chủ trương nào thắng
*(gộp từ: `skill-inventory.md` #14 = `install-council.md` §8.2 — cùng một câu, install-council chỉ trỏ tới đây, không thêm nội dung mới)*
- **Cần quyết định:** `docs/handoff/2026-09-11.md:34` liệt kê "marketplace-first install" vào Rejected options; spec v2 §1:16 và §3 lại lấy marketplace làm đường cài chính. Chủ trương nào đúng?
- **Lựa chọn:** (a) dòng ở handoff là mục kế thừa từ thời v1 bị chép tiếp, không áp dụng cho v2 — bằng chứng: phần còn lại của dòng `:34` toàn là mục v1 (25 skill, `/kn-`, path-string hooks, `docs/superpowers/`), và `bearingkit-v1-design.md:81` ghi rõ "the marketplace stays a secondary channel"; (b) handoff đó viết SAU khi v2 đã chốt nên có thể mang ý hẹp hơn (ví dụ chưa lấy marketplace làm đường chính khi repo còn private và chưa qua acceptance) — không loại trừ được chỉ bằng suy luận.
- **Bị chặn:** Cách viết `docs/hosts.md`/README cho kênh cài chính (nội dung phương án A ở câu 1) — đoán sai thì đoán trúng vào kênh cài chính của kit.
- **Khuyến nghị:** D4 nghiêng về (a) nhưng nói rõ không loại trừ được (b) chỉ bằng suy luận — không tự quyết.

### 14. Provenance của frontend-design
*(gộp từ: `skill-inventory.md` #3)*
- **Cần quyết định:** Skill `frontend-design` được absorb — ghi nguồn là `anthropics/claude-plugins-official` hay `anthropics/skills`? (Hai bản giống hệt nhau, SHA-256 khớp tuyệt đối.)
- **Lựa chọn:** ghi nguồn là claude-plugins-official / ghi nguồn là anthropics/skills / ghi cả hai.
- **Bị chặn:** Dòng provenance trong `upstream/sources.json`/`NOTICE` — không ảnh hưởng nội dung đã hấp thụ (giống hệt nhau), chỉ ảnh hưởng ghi công.
- **Khuyến nghị:** Không nêu.

### 15. Công cụ browser: xác nhận agent-browser
*(gộp từ: `skill-inventory.md` #4)*
- **Cần quyết định:** Xác nhận `vercel-labs/agent-browser` là công cụ browser chính thức của kit, `playwright-mcp` là phương án dự phòng đã ghi (chưa clone/chưa xác minh) — hay muốn khác?
- **Lựa chọn:** xác nhận agent-browser + playwright-mcp dự phòng (như tài liệu hiện ghi) / chọn khác.
- **Bị chặn:** Việc build/tích hợp công cụ browser cho skill liên quan (`bk-ops` và tương tự) — chưa cấp bách vì chưa tới bước code.
- **Khuyến nghị:** Không nêu.

### 16. Dạng chuẩn của lệnh cài khi repo còn private
*(gộp từ: `skill-inventory.md` #15)*
- **Cần quyết định:** Khi repo còn private, tài liệu (`docs/hosts.md`, README) nên ghi đường dẫn cục bộ là dạng chuẩn (URL là chú thích), hay ngược lại?
- **Lựa chọn:** đường dẫn cục bộ là chuẩn / URL là chuẩn.
- **Bị chặn:** Nội dung chính xác của trang cài đặt gộp (phương án A, câu 1) cho tới khi repo public.
- **Khuyến nghị:** Không nêu trực tiếp, nhưng có dữ kiện mới liên quan: `claude plugin marketplace add` đã xác minh nhận cả `<url | path | repo>`, nên bản CLI của Claude Code không còn vướng vấn đề repo private (khác với slash-command trong phiên, hiện chỉ ghi được dạng đường dẫn cục bộ theo tài liệu).

---

## Tier 3 — Ghi nhận, không chặn gì cấp bách

### 17. Hàng 38 gemini-skills
*(gộp từ: `docs/handoff/2026-09-11.md` "Decisions waiting on the owner" #1 = `opus5-handoff.md` §4.5 (1))*
- **Cần quyết định:** Hàng 38 (`google-gemini/gemini-skills`) trong ma trận — giữ loại hẳn, hay đưa vào làm tài liệu tham khảo cho các host Gemini?
- **Lựa chọn:** giữ loại / làm reference.
- **Bị chặn:** Không gì cấp bách — D2 đã áp dụng review phân loại "không di chuyển gì owner đã quyết; hàng 38 giữ nguyên": việc đang chờ, không chặn bước nào khác.
- **Khuyến nghị:** Bản ghi gốc đã đề xuất sẵn: **reference, v0.4, chưa làm gì bây giờ.**

### 18. Các việc Phase 0 trên workstation
*(gộp từ: `docs/handoff/2026-09-11.md` "Decisions waiting on the owner" #5 = `opus5-handoff.md` §4.5 (5))*
- **Cần quyết định:** Các việc Phase 0 (backup, hook dedup cũ đã lỗi thời, kiểm kê skill bị che khuất, sửa DB knowledge base) đã có cơ chế xin phép riêng ngay tại lượt nó chạy. Owner có muốn duyệt trước gì cho cả nhóm, hay giữ nguyên cách xin-từng-việc-khi-chạy?
- **Lựa chọn:** giữ nguyên (xin phép từng việc khi chạy) / duyệt trước một số việc cụ thể ngay bây giờ.
- **Bị chặn:** Không gì — thuộc `docs/plans/2026-09-10-owner-migration.md`, chưa ai chạy, không chặn nội dung kit.
- **Khuyến nghị:** Không nêu.

### 19. Hai dòng protocol verbatim + design dataset từ kit cũ
*(gộp từ: `docs/handoff/2026-09-11.md` "Decisions waiting on the owner" #6 = `opus5-handoff.md` §4.5 (6))*
- **Cần quyết định:** Hai dòng protocol lấy nguyên văn từ v1 §18, và design dataset từ Antigravity-Core — có cần hấp thụ vào `bk-protocol/SKILL.md`/design-critic không?
- **Lựa chọn:** hấp thụ ngay / để sau.
- **Bị chặn:** Không gì — nguồn tự ghi rõ "unchanged, not blocking".
- **Khuyến nghị:** Không nêu; đây là chữ owner tự viết cho kit cũ (thuộc diện "owner's own text may be adapted"), chỉ cần owner biết là còn treo.

### 20. Công cụ khoá-phiên-bản cho `_build/upstream/`
*(gộp từ: `skill-inventory.md` #9)*
- **Cần quyết định:** Có cần dựng một lệnh khoá-phiên-bản (ví dụ `bk-fetch --lock`, đọc `upstream/sources.json` rồi re-clone từng nguồn đúng sha đã ghi) để bằng chứng của lượt inventory này tái lập được về sau, hay chấp nhận việc tự `git clone` + checkout tay theo sha ghi lại là một chi phí chấp nhận được?
- **Lựa chọn:** cần công cụ khoá-phiên-bản / chấp nhận clone tay là đủ.
- **Bị chặn:** Không gì cấp bách — bằng chứng cho lượt inventory này đã thu thập xong; chỉ ảnh hưởng khả năng tái lập về sau (nếu `_build/` bị dọn, disk mới, máy khác).
- **Khuyến nghị:** Không nêu.

---

## Phụ lục A — Đã kiểm, đã loại khỏi batch, và vì sao

| Nơi | Nội dung | Vì sao không vào batch |
|---|---|---|
| `install-council.md` §8.1 | `v2 §1:28` — câu Non-goals sai dữ kiện lịch sử installer v1 | Đã tự xếp loại **ACT**, sửa ở D6, không cần owner chốt — không phải câu hỏi |
| `install-council.md` §8.2 | Xung đột marketplace-first | Chính tài liệu đó tự trỏ sang skill-inventory "Questions for D5" — không phải câu mới, đã gộp thành câu 13 ở trên |
| `install-council.md` §9 | 4 mục "chưa xác minh, chưa cần cho quyết định này" (Codex/Cursor marketplace bên thứ ba; `gemini extensions install` đường dẫn cục bộ; `claude plugin install` chạy thật; cơ chế bootstrap Codex) | Không trình bày như lựa chọn cần owner quyết — tự nhận "not needed for this decision"; là TODO xác minh, không phải câu hỏi |
| `docs/handoff/2026-09-11.md`, mục "Open threads" (6 mục) | Đọc lại token Antigravity; chạy lại activation eval; đọc `/context`; xác minh bootstrap Codex/Cursor/Gemini; các mục migration plan; baseline run 2 | Đều là việc-cần-làm (task), không phải lựa chọn owner cần quyết |
| 4 chỉ thị owner (`owner-directives.md`) | Nguyên văn 4 chỉ thị | Đối chiếu từng câu trong 20 câu trên — không câu nào được trả lời sẵn (xem mục 0) |

## Phụ lục B — Bảng đối chiếu nguồn gốc

| # trong batch | Nơi cũ | # cũ |
|---|---|---|
| 1 | skill-inventory.md | #10 |
| 2 | skill-inventory.md | #11 |
| 3 | skill-inventory.md | #12 |
| 4 | skill-inventory.md | #13 |
| 5 | skill-inventory.md | #2 + #8 (gộp) |
| 6 | handoff 2026-09-11.md / opus5-handoff §4.5 | #2 / (2) |
| 7 | handoff 2026-09-11.md / opus5-handoff §4.5 | #4 / (4) |
| 8 | handoff 2026-09-11.md / opus5-handoff §4.5 | #3 / (3) |
| 9 | skill-inventory.md | #1 |
| 10 | skill-inventory.md | #6 |
| 11 | skill-inventory.md | #7 |
| 12 | skill-inventory.md | #5 |
| 13 | skill-inventory.md / install-council §8.2 | #14 |
| 14 | skill-inventory.md | #3 |
| 15 | skill-inventory.md | #4 |
| 16 | skill-inventory.md | #15 |
| 17 | handoff 2026-09-11.md / opus5-handoff §4.5 | #1 / (1) |
| 18 | handoff 2026-09-11.md / opus5-handoff §4.5 | #5 / (5) |
| 19 | handoff 2026-09-11.md / opus5-handoff §4.5 | #6 / (6) |
| 20 | skill-inventory.md | #9 |

---

*Ghi 2026-09-12, thực thi D5 (`docs/handoff/2026-09-11-owner-directives.md`). File này là bản đầy đủ duy nhất của mọi câu hỏi đang chờ owner; `opus5-handoff.md` §4.5, `skill-inventory.md` "Questions for D5", và `docs/handoff/2026-09-11.md` "Decisions waiting on the owner" chỉ còn giữ con trỏ về đây. Không câu nào trong 20 câu trên được agent tự trả lời.*
