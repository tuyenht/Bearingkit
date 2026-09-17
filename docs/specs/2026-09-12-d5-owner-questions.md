# D5 — Batch câu hỏi hợp nhất cho owner, 2026-09-12

> **TRẠNG THÁI: MỘT PHẦN ĐÃ CHỐT (2026-09-12). CÒN LẠI CHỜ OWNER.**
>
> Đây là D5 (`docs/handoff/2026-09-11-owner-directives.md`, mục "Thứ tự thực thi"): hợp nhất **tất cả** câu hỏi đang chờ owner, đang nằm rải rác ở nhiều file, thành một batch duy nhất. Tài liệu này **không tự trả lời, không tự quyết** thay owner — nó chỉ tập hợp, khử trùng lặp, sắp thứ tự, và (với vài câu) nhắc lại hoặc bổ sung khuyến nghị (ghi rõ là khuyến nghị, không phải quyết định). Không dòng mã, spec, ma trận hay `docs/hosts.md` nào bị sửa theo file này — kể cả sau khi có quyết định, việc áp dụng vẫn là một bước riêng, chưa làm.
>
> **Cập nhật 2026-09-12, vòng 4 — Tier 1 (1–6) VÀ bốn câu Tier 2 (9,12,14,16) nay đã chốt hết.** Câu 5 (vòng 3): rank = bao hàm, mode = giữ ideas-only, sau khi phát hiện lý do đổi mode ở vòng 1 dựa trên một luật không tồn tại. Câu 9: guardrail v0.2 + hook v0.4, cả hai — owner xác nhận đây là ngữ cảnh "hoặc" điều phối-stack, không loại trừ. Câu 12: chờ inventory, không tạo `bk-design` trước. Câu 14: provenance = claude-plugins-official. Câu 16: đường dẫn cục bộ là chuẩn. Phát hiện #4 của Phụ lục C (v2-design.md tự trỏ nhầm §5.1→§5.2) **đã sửa trực tiếp trong v2-design.md** (xếp cùng hạng dữ kiện-xác-minh-được như §1:28/Skillmark). Thêm **câu 21** (Tier 3, mới, ngoài 20 câu gốc): đề xuất sửa AGENTS.md cho COUNCIL/doctor — nhãn "đề xuất của phiên", KHÔNG phải quyết định owner, chủ động hoãn tới khi có ma sát thật đo được. Còn mở: câu 7,10,11,13,15 (Tier 2, giữ mặc định/hướng nghiêng, chưa owner tự chốt), câu 17–20 (Tier 3, giữ nguyên trạng), câu 21 (Tier 3, đề xuất chờ). Chi tiết: xem **"Quyết định 2026-09-12 và những gì mở khoá"** và **Phụ lục C**.

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
> **ĐÃ CHỐT 2026-09-12 — quyết định của owner: A + B′.** Xem mục "Quyết định 2026-09-12 và những gì mở khoá" để biết chính xác việc sẽ mở khoá.
> **THỰC HIỆN MỘT PHẦN 2026-09-12: phần B′ (mã) XONG, phần A (tài liệu) CHƯA.** `scripts/doctor.cjs` + `tests/doctor.test.cjs` đã có, `bin/bearingkit.cjs doctor` không còn là placeholder v0.3. Còn nợ: đường CLI Claude Code ở `docs/hosts.md`/README. Một mục của §6 KHÔNG hiện thực hoá — xem ghi chú lệch ở mục "Từ câu 1" bên dưới.
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
> **ĐÃ CHỐT 2026-09-12 — quyết định của owner:** trần cứng = *"doctor chỉ đọc, không ghi một byte nào."* Đây là bất biến, viết thành acceptance test.
> **ĐÃ THỰC HIỆN 2026-09-12:** `tests/doctor.test.cjs`, test đầu tiên của file — chạy `bin/bearingkit.cjs doctor` trong HOME giả (`HOME` và `USERPROFILE`), so cây thư mục trước/sau theo từng đường dẫn, kích thước, mtime và hash nội dung; đo trên cả ba trạng thái: bản copy lành, bản copy hỏng, và profile chưa từng cài. Test được kiểm ngược bằng cách cố tình cho doctor ghi một byte — test đổ đúng như phải đổ, rồi hoàn tác.
- **Cần quyết định:** Chốt bất biến cho B′: *"doctor chỉ đọc, không ghi một byte nào vào cấu hình host; mọi thao tác ghi vẫn là lệnh owner tự gõ"* — kiểm bằng test chạy trong HOME giả, so cây thư mục trước/sau. Nếu chọn B thay vì B′: trần tương ứng có nên là *"wrapper chỉ được gọi lệnh cài chính thức của host hoặc copy vào thư mục plugin của chính host; không bao giờ mở hay ghi `settings.json`, `CLAUDE.md`, `opencode.json` hay bất kỳ file cấu hình host nào"* không?
- **Lựa chọn:** Đồng ý trần đã đề xuất / sửa trần / không áp dụng (nếu chọn A hoặc C ở câu 1).
- **Bị chặn:** Viết được acceptance test đúng cho doctor/install — cần bất biến chốt trước khi viết test.
- **Khuyến nghị:** Không nêu riêng; trần đề xuất đã nằm trong khuyến nghị A+B′ ở câu 1, nhưng việc "chốt làm bất biến" cần owner gật đầu riêng.

### 3. Phạm vi đọc của doctor
*(gộp từ: `skill-inventory.md` #12 — phụ thuộc câu 1)*
> **ĐÃ CHỐT 2026-09-12 — quyết định của owner:** đọc profile hàng ngày thật (`~/.claude`, `~/.gemini`).
> **ĐÃ THỰC HIỆN 2026-09-12 (mã), CHƯA CHẠY THẬT:** `scripts/doctor.cjs` lấy gốc là `os.homedir()` — profile hàng ngày, không phải profile cách ly. Trong phạm vi owner cho phép, thực tế **chỉ `~/.gemini` được đọc**; `~/.claude` **không** bị đọc lần nào, vì mục duy nhất cần tới nó là listing của host, mà mục đó đã bỏ (xem ghi chú lệch ở câu 1). Nhưng phiên viết nó **không tự chạy** trên profile thật: theo câu chữ `AGENTS.md` hiện hành, việc đó là COUNCIL. Ma sát này nay đã đo được và ghi ở câu 21; `AGENTS.md` giữ nguyên, không sửa.
- **Cần quyết định:** `doctor` được đọc profile hàng ngày thật (`~/.claude`, `~/.gemini`), hay chỉ chạy trên profile cách ly và owner tự chạy tay trên profile thật khi cần?
- **Lựa chọn:** (a) đọc profile hàng ngày — cách duy nhất bắt được bản copy Antigravity đang sống bị lệch (đúng loại lỗi đã xảy ra ở commit `3d7b4eb`); (b) chỉ profile cách ly.
- **Bị chặn:** Phạm vi quyền đọc của doctor, và có cần xin phép COUNCIL mỗi lần chạy hay không — `AGENTS.md` xếp mọi thứ chạm `~/.claude`/`~/.gemini` vào COUNCIL, ranh giới "đọc thì tự do, ghi thì xin phép" cần owner nói rõ trước khi viết doctor.
- **Khuyến nghị gốc:** Không nêu — nguồn chỉ trình bày đánh đổi hai phía.

> **Câu hỏi phụ của owner: mỗi lần chạy doctor có cần xin COUNCIL theo `AGENTS.md` không, và giảm ma sát thế nào mà không phá trần câu 2?**
>
> Đọc đúng câu chữ, `AGENTS.md` không phân biệt đọc/ghi: *"COUNCIL... cho anything touches ~/.claude, ~/.gemini..."* — theo nghĩa đen, mọi lần chạy doctor (kể cả chỉ đọc) đều rơi vào COUNCIL, tức phải đề xuất rồi chờ trước MỖI lần chạy. Với một công cụ chẩn đoán định chạy thường xuyên, đây là ma sát thật, không phải diễn giải sai.
>
> **Cách giảm ma sát mà không đổi trần câu 2 (doctor không bao giờ ghi):** trần câu 2 là bất biến VỀ HÀNH VI của doctor (không ghi); câu hỏi COUNCIL là về HÀNH VI của phiên chạy nó (có cần hỏi trước không) — hai việc tách được. Đề xuất: sửa `AGENTS.md` để COUNCIL áp dụng cho **ghi/thay đổi** vào `~/.claude`, `~/.gemini`, repo khác, server; còn **đọc thuần tuý bởi một công cụ có bất biến "không ghi" được kiểm bằng test tự động** (chính acceptance test của câu 2) thì là ACT — vì rủi ro của COUNCIL (thay đổi không được soát trước) không tồn tại khi không có gì bị ghi. Trần câu 2 KHÔNG bị phá: doctor vẫn tuyệt đối không ghi; cái đổi chỉ là owner không phải duyệt riêng từng lần CHẠY một công cụ đã chứng minh được là an toàn.
>
> **Nhưng đây là đề xuất sửa `AGENTS.md`, tức chính nó là COUNCIL** (thay đổi luật vận hành của cả repo) — tôi không tự sửa `AGENTS.md`. Cần owner gật đầu riêng cho việc sửa AGENTS.md này trước khi bất kỳ phiên nào áp dụng.

### 4. Thời điểm ra mắt của doctor
*(gộp từ: `skill-inventory.md` #13 — phụ thuộc câu 1, 3)*
> **ĐÃ CHỐT 2026-09-12 — quyết định của owner:** giữ v0.3, đúng kế hoạch hiện tại.
> **VA CHẠM CẦN OWNER ĐỌC, 2026-09-12:** owner ra lệnh viết `doctor` ngay trong phiên này, nên **mã đã có trong cây trước v0.2** và câu "doctor arrives with v0.3" đã bị gỡ khỏi `bin/bearingkit.cjs` (lệnh chạy được từ hôm nay). Phiên **không** tự sửa mốc phát hành: spec v2 §11 hàng v0.2/v0.3 giữ nguyên, không hàng nào nhắc doctor; CHANGELOG ghi nó ở `## Unreleased`. Việc còn lại là của owner: hoặc bản phát hành kế tiếp mang luôn doctor (khi đó nhãn "v0.3" ở câu 4 hết đúng), hoặc giữ nhãn và bản phát hành kế tiếp không quảng cáo lệnh này. Không phiên nào được tự chọn thay.
- **Cần quyết định:** Kéo doctor lên trước v0.2 (bắt bản copy Antigravity lệch sớm hơn), hay giữ lịch v0.3 hiện tại (`bin/bearingkit.cjs` đã tự in đúng câu "doctor arrives with v0.3")?
- **Lựa chọn:** giữ v0.3 / kéo lên trước v0.2.
- **Bị chặn:** Thứ tự release gate — v0.2 hiện là mốc đo đầu tiên (spec v2 §11); nếu doctor cần có mặt sớm hơn, mốc đó phải viết lại.
- **Khuyến nghị:** Không nêu; lý do để kéo lên đã có sẵn — `tests/antigravity-install.test.cjs` chỉ chứng minh script **sẽ** ghi host note, không chứng minh bản copy **đang nằm trên đĩa** có nó, đúng chỗ lỗi `3d7b4eb` lọt qua.

### 5. Nghĩa của "hoặc" giữa Superpowers và spec-kit
*(gộp từ: `skill-inventory.md` #2 + #8 — hai câu hỏi cùng một quyết định, viết ở hai chỗ khác nhau trong cùng file)*
> **ĐÃ CHỐT 2026-09-12 — quyết định của owner:** rank = **bao hàm** (spec-kit tính vào nhóm tối thiểu cùng Superpowers); mode = **giữ nguyên ideas-only**.
- **Cần quyết định:** Chỉ thị 4 viết "#3 superpowers hoặc #4 spec-kit". "Hoặc" ở đây là **bao hàm** (cả hai cùng thoả một chỗ bắt buộc, lấy cả hai không sai) hay **loại trừ** (chỉ một trong hai được tính, cái kia rớt khỏi nhóm bắt buộc)?
- **Lựa chọn:**
  - (a) Bao hàm — bằng chứng: "hoặc" tiếng Việt thường không mang nghĩa loại trừ kiểu "hoặc...hoặc"/XOR; owner liệt kê "#3 hoặc #4" thành một gạch đầu dòng duy nhất bên cạnh các mục liệt kê rõ ràng khác (#1, #19, #21, #15).
  - (b) Loại trừ — bằng chứng: bản dựng lại kết luận hiện tại của D3 đã đọc theo hướng này, rút lại cách đọc "giữ cả hai, không loại trừ" của lượt đầu vì coi đó là suy diễn đè lên chữ tường minh.
  - *Ghi chú:* cách dùng song song "Biome hoặc Pint" ở #18 không giải quyết được câu này — cặp đó phân biệt được bằng một dữ kiện bên ngoài (stack nào của repo đích dùng Biome hay Pint), còn #3/#4 không có dữ kiện phân biệt tương tự vì cả hai phục vụ cùng lúc `bk-spec`/`bk-plan`.
- **Bị chặn:** Rank và mode của spec-kit trong bảng ưu tiên hợp nhất (D3) — hiện xếp "dưới vạch", mode "ideas-only". *(Câu tiếp theo trong bản gốc suy ra mode phải đổi sang "adapt" từ đây, dựa trên nhãn "lý do hạn chế hiện tại (khác biệt cấu trúc) là trục mà luật riêng của kit nói không được dùng để đánh giá" — **nhãn này SAI, không xác minh được ở §5.2 hay bất cứ đâu trong repo**; xem Phụ lục C, dòng 1. Đã sửa nhãn tại chỗ ở đây; kết luận đã được kiểm lại ở khối audit ngay dưới, không phải bị đảo ngược thêm lần nữa.)*
- **Khuyến nghị gốc (đã sửa bởi audit dưới đây):** Không có — nguồn tự nhận cả hai cách đọc đều có bằng chứng hợp lý, chỉ nói rank hiện tại của spec-kit "hangs entirely on this answer".

> **Audit 2026-09-12, kiểm lại theo yêu cầu owner — bản trước tự mâu thuẫn, đã sửa.**
>
> **Owner chỉ đúng chỗ sai:** đề xuất trước ghi rank = loại trừ (spec-kit không tính vào ô bắt buộc) NHƯNG mode = adapt (nâng quyền hấp thụ) — hai vế không tương thích nếu không giải thích được vì sao thứ "không bắt buộc" lại đáng được nâng cấp. Tôi không giải thích được, vì lý do dẫn tới vế mode **đọc sai một nguồn**.
>
> **Kiểm lại tại nguồn — phát hiện:** vế mode dựa trên tiền đề "spec v2 §5.2 cấm dùng khác-biệt-cấu-trúc để chấm mode". Tôi vừa đọc lại NGUYÊN VĂN §5.2 (`docs/specs/2026-09-11-bearingkit-v2-design.md` dòng 94–96) — nó chỉ nói: một mục nguồn ứng đúng một skill; giấy phép permissive là ĐIỀU KIỆN CẦN để absorb (không permissive → chỉ idea); drop cần lý do; inventory (không phải từng mục riêng lẻ) chốt catalog cuối theo phép thử §1. **Không có câu nào cấm dùng "khác biệt cấu trúc" làm căn cứ.** Cụm "the axis the kit's own rule says not to judge on" mà bản trước (và văn bản gốc của D3 trong `skill-inventory.md` trước khi tôi xoá) dùng — grep toàn repo không tìm thấy luật này ở đâu khác. Đây là một khẳng định không xác minh được, có thể là suy diễn của một phiên trước bị gán nhầm thành "luật của kit" — đúng loại lỗi mà cả việc D5 này đang cố dọn. Vế mode của tôi dựng trên khẳng định đó, nên **rút lại**, không phải vì owner nói khác, mà vì tự kiểm tra thấy nền móng của nó không đứng vững.
>
> **Về "hoặc" (rank) — cân lại 2 bằng chứng mới của owner:**
> - **Lập luận "danh sách tối thiểu" — thuyết phục, chấp nhận.** Một ngưỡng TỐI THIỂU nêu sàn (cái gì phải có), không nêu trần (cái gì bị cấm). "#3 hoặc #4" trong một danh sách tự khai là "tối thiểu" đọc tự nhiên là "cần ít nhất một trong hai để đạt sàn" — có cả hai vẫn đạt sàn, không vi phạm gì. Muốn đọc thành loại trừ cần chữ tường minh hơn ("chỉ một trong hai", "không phải cả hai") — không có trong nguyên văn chỉ thị 4.
> - **So sánh với #18 "Biome hoặc Pint" — đúng một phần, có khác biệt logic thật.** Hai cách dùng "hoặc" của owner KHÁC NHAU về hình thức logic, dù cùng không phải loại trừ: ở #18, "hoặc" là **điều phối theo ngữ cảnh** — Biome ứng với target dùng JS/TS, Pint ứng với target dùng PHP; không phải hai thứ cùng áp vào MỘT đối tượng. Ở #3/#4, "hoặc" là **câu hỏi đủ-hay-không trên cùng một đối tượng** — Superpowers và spec-kit cùng phục vụ `bk-spec`/`bk-plan` của MỘT kit, không tách theo ngữ cảnh bên ngoài như Biome/Pint. Nên #18 không "chứng minh" #3/#4 bằng phép so sánh trực tiếp — nhưng KHÔNG cần phép so sánh đó nữa, vì lập luận "sàn tối thiểu" ở trên đã đủ tự đứng.
>
> **Kết luận, đã tách đúng 2 trục (không còn mâu thuẫn):**
> - **Rank:** đổi sang **bao hàm (a)** — spec-kit CÓ tính vào nhóm tối thiểu cùng Superpowers, không bị loại. Đây là điểm tôi đổi ý so với đề xuất trước, dựa trên lập luận sàn-tối-thiểu, không phải vì owner yêu cầu.
> - **Mode:** **giữ nguyên ideas-only** — rút đề xuất đổi sang adapt. Lý do hiện có cho ideas-only (dòng nguồn: "the kit routes from plain language rather than spec-kit's own commands") là một khác biệt cấu trúc **có thật**, và không có luật nào cấm dùng nó; MIT chỉ mở CỬA để absorb nếu muốn, không BẮT phải absorb. Không có bằng chứng mới nào cho thấy lấy thêm chữ của spec-kit (ngoài ý tưởng đã có qua Superpowers) sẽ bổ sung được gì cho `bk-spec`/`bk-plan`.
>
> **Trạng thái: khuyến nghị đã kiểm lại, tự tin hơn nhiều ở phần rank — vẫn để owner đóng dấu CHỐT**, vì phần mode là một lựa chọn biên tập (có đáng absorb hay không), không phải một sự kiện đo được.
>
> **Nếu owner đồng ý (rank bao hàm, mode giữ ideas-only):** mở khoá đúng một sửa — `skill-inventory.md`, bảng ưu tiên D3: bỏ ghi chú "spec-kit không tính vào ô bắt buộc", ghi rõ nó cùng Superpowers thoả nhóm tối thiểu; **không** cần sửa `upstream/sources.json` hay `NOTICE` (mode không đổi, không có chữ mới nào được lấy). Khác hẳn danh sách mở khoá ở bản trước — xem mục "Quyết định 2026-09-12" đã cập nhật.

### 6. Dòng bản quyền cho LICENSE
*(gộp từ: `docs/handoff/2026-09-11.md` "Decisions waiting on the owner" #2 = `opus5-handoff.md` §4.5 (2))*
> **ĐÃ CHỐT 2026-09-12 — quyết định của owner: `tuyenht`, 2026.** **ĐÃ THỰC HIỆN 2026-09-12** — file `LICENSE` tạo tại commit `7cbf4be`.
- **Cần quyết định:** Tên chủ sở hữu bản quyền + năm cho dòng `Copyright (c) <năm> <tên>` trong file LICENSE.
- **Lựa chọn:** `package.json` đã khai loại MIT; chỉ thiếu dòng bản quyền — owner cho tên + năm muốn dùng.
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
> **ĐÃ CHỐT 2026-09-12 — quyết định của owner: có dùng thêm cả 4 — Gemini CLI, Cursor, Codex CLI/App, Copilot CLI —, trên MÁY KHÁC, không phải máy đang chạy phiên này.** "Something else" ở lượt trước không có nội dung — owner đã xác nhận không có host thứ 5, mục đó bỏ.
> **Xung đột đã nêu ở lượt trước — nay đã giải quyết:** dữ kiện `command -v` (chỉ `claude` trên PATH máy này) và việc owner dùng 4 host kia không còn mâu thuẫn, vì owner nói rõ chúng chạy trên máy khác. Acceptance test cho 4 host này (khi chạy) sẽ cần thực hiện trên máy có cài chúng, không phải máy đang chạy phiên này.
- **Cần quyết định:** Ngoài Claude Code và Antigravity, owner thực sự dùng thêm host nào (Gemini CLI / Cursor / Codex / Copilot CLI / Droid)?
- **Lựa chọn:** liệt kê host cụ thể / không dùng thêm host nào.
- **Bị chặn:** Lịch chạy acceptance test cho các host đó (hiện "wired; pending" hoặc "manifest sẵn, chưa xác minh gì").
- **Khuyến nghị:** Không có, nhưng có dữ kiện mới: xác minh 2026-09-12 bằng `command -v`, trên máy này **chỉ `claude`** có trên PATH; `gemini`, `droid`, `copilot`, `opencode`, `codex`, `cursor-agent` đều không có — "mọi công cụ" hôm nay trên thực tế là 2 host (Antigravity là app GUI, không có CLI để `command -v` phát hiện).

### 9. Biome/Pint — hook hay guardrail command
*(gộp từ: `skill-inventory.md` #1)*
> **ĐÃ CHỐT 2026-09-12 — quyết định của owner:** cả hai — guardrail command ở v0.2, hook thật ở v0.4 (không phải chọn một, mà là trình tự thời gian: guardrail trước, hook sau), giữ đúng v2 §8 "the kit writes no host settings". Owner xác nhận thêm: đây chính là chỗ họ dùng "hoặc" theo nghĩa điều phối stack (Biome cho JS/TS, Pint cho PHP) — không loại trừ, khớp đúng phân tích logic đã nêu ở câu 5 (điều phối-theo-ngữ-cảnh khác với đủ-hay-không-trên-cùng-một-đối-tượng).
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
> **ĐÃ CHỐT 2026-09-12 — quyết định của owner:** chờ inventory §5.2 hoàn tất chính thức, không tạo `bk-design` trước.
>
> **SỬA 2026-09-14 — quyết định của owner, đường (ii):** nới điều kiện **chỉ cho riêng `bk-design`**. Được tạo `bk-design` và port `frontend-design` trong `docs/plans/2026-09-13-daily-driver.md` mà không chờ inventory §5.2 hoàn tất. Điều kiện "chờ inventory hoàn tất" **vẫn áp cho mọi skill khác**. Lý do owner cân nhắc khi chốt: React/Next là việc hằng ngày nên bản daily driver thiếu skill UI là thiếu đúng chỗ dùng nhiều nhất; riêng skill này inventory gần như không thêm được gì nữa (D3 đã xếp `frontend-design` vào nhóm bắt buộc, câu 14 đã chốt provenance là `claude-plugins-official`, giấy phép Apache-2.0 đã xác minh); và mục đích gốc của câu 12 — không tạo skill rỗng việc — vẫn được tôn trọng vì `frontend-design` chính là việc đằng sau nó.
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
> **ĐÃ CHỐT 2026-09-12 — quyết định của owner:** ghi nguồn là `anthropics/claude-plugins-official` — vòng đời rõ hơn. Khớp khuyến nghị đã có sẵn ở `skill-inventory.md` dòng 124 ("Recommend the official plugins repo"); quyết định hôm nay xác nhận, không đảo hướng.
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
> **ĐÃ CHỐT 2026-09-12 — quyết định của owner:** đường dẫn cục bộ là dạng chuẩn trong tài liệu, URL ghi làm biến thể — vì `claude plugin marketplace add` đã xác minh nhận đường dẫn cục bộ, còn URL không chạy được khi repo còn private.
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
> **Nhãn cần sửa (phát hiện ở Phụ lục C, dòng 2–3):** "hai dòng protocol" không phải một con số đếm được ở v1 §18 — L20 ở đó kể một RỦI RO quá khứ ("hai dòng protocol" từng chỉ tồn tại dạng edit chưa commit), không định danh hai dòng cụ thể nào; đoạn văn ngay sau bảng liệt kê ~13 mục chữ owner viết được lấy verbatim (Autonomy Gate, Council Protocol, Definition of DONE...), phần lớn đã có trong `bk-protocol/SKILL.md` hiện tại. "Design dataset" cũng vậy — đó là một TODO ("nêu chính xác file chứa... design dataset", `opus5-handoff.md` §4.1 dòng 14), chưa ai định danh được file/nội dung thật. Câu hỏi vẫn còn giá trị (có thể còn sót gì đó chưa hấp thụ), nhưng khung "hai dòng" + "một dataset" như đang viết là số đã bị gán chắc hơn mức xác minh được — không đảo kết luận (vẫn ghi nhận, không chặn), chỉ sửa nhãn.
- **Cần quyết định:** Còn sót phần nào của ~13 mục chữ owner viết (v1 §18, đoạn sau bảng) chưa vào `bk-protocol/SKILL.md`, và design dataset (nếu có, chưa định danh được) từ Antigravity-Core — có cần hấp thụ không?
- **Lựa chọn:** hấp thụ ngay / để sau.
- **Bị chặn:** Không gì — nguồn tự ghi rõ "unchanged, not blocking".
- **Khuyến nghị:** Không nêu; đây là chữ owner tự viết cho kit cũ (thuộc diện "owner's own text may be adapted"), chỉ cần owner biết là còn treo.

### 20. Công cụ khoá-phiên-bản cho `_build/upstream/`
*(gộp từ: `skill-inventory.md` #9)*
- **Cần quyết định:** Có cần dựng một lệnh khoá-phiên-bản (ví dụ `bk-fetch --lock`, đọc `upstream/sources.json` rồi re-clone từng nguồn đúng sha đã ghi) để bằng chứng của lượt inventory này tái lập được về sau, hay chấp nhận việc tự `git clone` + checkout tay theo sha ghi lại là một chi phí chấp nhận được?
- **Lựa chọn:** cần công cụ khoá-phiên-bản / chấp nhận clone tay là đủ.
- **Bị chặn:** Không gì cấp bách — bằng chứng cho lượt inventory này đã thu thập xong; chỉ ảnh hưởng khả năng tái lập về sau (nếu `_build/` bị dọn, disk mới, máy khác).
- **Khuyến nghị:** Không nêu.

### 21. Đề xuất sửa AGENTS.md: COUNCIL chỉ áp cho ghi, đọc-có-test-bất-biến là ACT
*(MỚI — không nằm trong 20 câu gốc của D5 (mục 0). Phát sinh từ câu hỏi phụ của owner ở câu 3; ghi vào batch theo yêu cầu 2026-09-12. Đánh số 21 để không xáo trộn số thứ tự 1–20 đã dùng khắp file.)*
> **ĐÃ CHỐT 2026-09-15 — quyết định của owner: SỬA, theo hướng tách đọc/ghi.** `AGENTS.md` mục Autonomy nay ghi: **đọc** `~/.claude`/`~/.gemini` **bằng một lệnh của kit có bất biến không-ghi được test cưỡng chế** (hôm nay là `bearingkit doctor`, đo bởi `tests/doctor.test.cjs` chạy trong HOME riêng và so cây thư mục từng byte trước/sau) là **ACT**; mọi **lệnh ghi** (`antigravity install`, `uninstall`) vẫn **COUNCIL**; đọc bằng bất cứ cách nào khác — lệnh tuỳ hứng, công cụ không có bất biến đó — vẫn COUNCIL. Đã thi hành cùng ngày.
>
> **Ma sát cuối cùng dẫn tới quyết định (đo lần thứ tư, 2026-09-13 → 2026-09-15):** trong ba ngày owner phải tự gõ `doctor`/`antigravity install` bốn lần, và owner hỏi hai lần "sao không tự chạy được". Lần chạy đầu tiên của phiên ngay sau khi luật đổi báo `FAIL antigravity copy of skills/ matches this checkout` — đúng drift do Task 5 và 6b tạo ra, tức là công cụ trả lời được câu hỏi mà trước đó không ai hỏi được nếu owner không ngồi gõ.
>
> *(Nhãn cũ, giữ để đọc được lịch sử: ĐỀ XUẤT CỦA PHIÊN — KHÔNG PHẢI QUYẾT ĐỊNH OWNER. CHƯA DUYỆT.)*
- **Cần quyết định:** Có sửa `AGENTS.md` để COUNCIL chỉ áp cho **ghi/thay đổi** vào `~/.claude`, `~/.gemini`, repo khác, server; còn **đọc** bởi một công cụ có bất biến "không ghi" được kiểm bằng test tự động (như `doctor`, câu 2) thì là ACT — hay không?
- **Lựa chọn:** sửa AGENTS.md theo hướng trên / giữ nguyên (mọi chạm vào `~/.claude`, `~/.gemini` đều là COUNCIL, không phân biệt đọc/ghi).
- **Bị chặn:** Không gì cấp bách. Owner nói rõ: hoãn tới khi `doctor` thực sự được viết và ma sát thật được đo — không quyết trước dựa trên suy đoán.
- **Khuyến nghị:** Đã nêu ở câu 3 (không lặp lại) — ghi nhận ở đây là còn treo, chủ động chờ bằng chứng ma sát đo được trước khi owner quyết.
- **Ma sát đo được, 2026-09-12 (điều kiện owner đặt ra nay đã đủ — `doctor` tồn tại):** phiên viết `doctor` chạy được TOÀN BỘ test (50/50 xanh, gồm cả bất biến không-ghi chạy trong HOME giả) mà **không** cần chạm `~/.claude` hay `~/.gemini` thật một lần nào. Nhưng phiên đó **không chạy được chính `bearingkit doctor`** trên profile thật để xem nó báo gì — đúng việc mà công cụ sinh ra để làm — vì theo đúng câu chữ `AGENTS.md` đó là COUNCIL. Ma sát cụ thể, không phải giả định: (a) không ai xác nhận được bản copy Antigravity đang sống trên máy này có lệch hay không, tức đúng lỗ hổng `3d7b4eb` vẫn mở cho tới khi owner tự gõ lệnh; (b) mỗi lần dùng công cụ chẩn đoán là một vòng đề xuất–chờ, trong khi test tự động đã chứng minh nó không ghi được một byte. Chi phí của việc GIỮ NGUYÊN luật hiện tại vì vậy là: doctor chỉ owner chạy được, phiên không bao giờ tự đọc được kết quả. Đây là **số đo, không phải đề xuất mới** — quyết định vẫn của owner, và phiên vẫn KHÔNG tự sửa `AGENTS.md`.

---

### 22. `claude-code-setup`: ideas-only, hay một skill `bk-setup`
*(MỚI — phát sinh từ kiểm kê mức từng mục ngày 2026-09-15, cuối `docs/specs/2026-09-11-skill-inventory.md`. Đánh số 22 vì cùng lý do với câu 21.)*
> **ĐÃ CHỐT 2026-09-16 — quyết định của owner: (b), muốn một skill `bk-setup`.** Hỏi bằng câu hỏi có lựa chọn; khuyến nghị của phiên lúc đó là (a), owner chọn khác. Hệ quả mà chính file kiểm kê đã nêu trước khi hỏi: một mục catalog mới (17 → 18), qua scope test §5.2, và giải mâu thuẫn host-specific. Thiết kế đề xuất: `docs/specs/2026-09-16-bk-setup-design.md` — **chờ owner duyệt thiết kế** trước khi dựng (Task 6c của `docs/plans/2026-09-13-daily-driver.md`).
- **Cần quyết định:** nguồn bắt buộc thứ tư kiểm kê ra 0 absorb / 5 drop / 3 idea — (a) chấp nhận ideas-only và đóng lại, hay (b) dựng một skill `bk-setup` thật?
- **Lựa chọn:** (a) / (b).
- **Bị chặn:** việc đóng hàng 2 của ma trận cho phần `claude-code-setup`; một trong ba câu của Task 9.
- **Khuyến nghị lúc hỏi:** (a) — phần lớn nguồn là host-specific và khuyến nghị MCP mà kit cố ý không làm. Owner chọn (b); phiên không mở lại câu này.

---

### 23. `bug-en-03`: chấp nhận một khoảng trống hẹp, hay đưa lại hook chạy theo từng prompt
*(MỚI — phát sinh từ cổng đo 2026-09-16/17, `docs/compat/2026-09-16-daily-driver-gate.md`. Đánh số 23 vì cùng lý do với câu 21.)*
> **CHỜ OWNER.** Khuyến nghị của phiên: (a).
- **Dữ kiện, đã đo:** prompt `bug-en-03` — *"Uploads over 5 MB silently disappear."* — không được mô hình coi là yêu cầu, **có kit hay không cũng vậy** (3/3 mỗi bên, Claude Code 2.1.270, `claude-sonnet-5`): nó trả lời *"What would you like to work on?"*. Thêm hai chữ neo vào ứng dụng (*"… in the app."*) thì có kit đi `bk-debug` (2/2), không kit thì tự lục code (2/2). Kit v1 từng làm câu này qua bằng một chỉ dẫn nằm ở **cấp memory** (`core/AGENTS.md` được import); v2 nạp protocol qua SessionStart, tức **cấp system-reminder**, và hai cách viết khác nhau của chỉ dẫn đó đều không đổi được kết quả (3/3 mỗi cách).
- **Cần quyết định:** kit có cần bù cho một câu trần thuật mơ hồ như vậy không.
- **Lựa chọn:** (a) chấp nhận, ghi là giới hạn đã biết, giữ nguyên prompt trong bộ Phase 1 để còn so được với đường cơ sở; (b) đưa lại một hook chạy mỗi prompt (`UserPromptSubmit`) nói rõ "tin nhắn trên là yêu cầu" cho prompt rất ngắn — **đổi thiết kế**: spec §3 đã bỏ hook theo từng prompt khi chuyển sang v2, và nó tốn token ở mọi lượt; (c) tìm cách đặt chỉ dẫn ở cấp memory mà không cần installer — chưa có cách nào đã kiểm trên host.
- **Bị chặn:** không gì. Nửa Claude Code của cổng đã có số; câu này chỉ quyết một prompt có còn được coi là lỗi của kit hay không.
- **Khuyến nghị:** (a). Khoảng trống hẹp (một câu sáu từ đọc giống thông báo của nền tảng), host trần cũng hỏng y hệt, dùng thật thì người dùng gỡ trong một lượt, còn (b) mở lại đúng thứ v2 đã cố ý bỏ, chỉ để đổi một prompt.

---

## Quyết định 2026-09-12 và những gì mở khoá — CHƯA áp dụng, chỉ liệt kê

Owner đã chốt câu 1, 2, 3, 4, 6, 8 làm quyết định thật; câu 5 owner yêu cầu kiểm lại thay vì tự quyết, đã kiểm (xem khối audit trong câu 5 ở trên) — vẫn là khuyến nghị. Tier 2 (trừ câu 9/12/14/16, nhóm riêng không mặc định) và Tier 3 giữ nguyên như owner chỉ định. Mục này liệt kê **chính xác** việc sẽ mở khoá cho từng quyết định — không file nào trong repo bị sửa theo mục này.

### Từ câu 1 (A + B′)

- **`docs/hosts.md`** — mục `## Claude Code` (dòng 16): bổ sung đường CLI không tương tác đã xác minh (`claude plugin marketplace add <url|path|repo>`, `claude plugin install <p>@<m> -y --scope user --json`, `validate`, `list`, `details`, `update` — nguồn: `install-council.md` §5), hiện chưa có ở đây. Bảng đầu file (dòng 5–12) và `README.md` mục `## Install` (dòng 5–14) đã gần đúng hình dạng phương án A (một trang, một dòng/host) — không cần dựng lại từ đầu, chỉ cần thêm đường CLI này.
- **Mã mới:** một subcommand `doctor` cho `bin/bearingkit.cjs` (hiện chỉ có `antigravity install|uninstall`) — chỉ đọc, theo đặc tả B′ ở `install-council.md` §6: so bản copy Antigravity/`~/.claude` với repo, gọi `claude plugin list`/`validate` (đọc), chạy `hooks/session-start.cjs` xem có in đúng protocol + plugin root; lệch thì in lệnh cần gõ, không tự ghi. — **ĐÃ THỰC HIỆN 2026-09-12: `scripts/doctor.cjs`, 80 dòng (đúng trần §6), 6 mục kiểm.**
- **LỆCH KHỎI §6, CÓ CHỦ ĐÍCH, CHỜ OWNER ĐỌC:** doctor **không** gọi `claude plugin list`/`validate`. Lý do: đó là một tiến trình con khởi động binary của host, không chứng minh được là nó không ghi gì vào `~/.claude` (config migration, khoá, telemetry đều nằm ngoài tầm kiểm soát của kit) — mà trần câu 2 là bất biến CỨNG, cao hơn một mục kiểm. Doctor báo mục đó là `skip` kèm câu lệnh để owner tự chạy, **không bao giờ báo `ok`** cho thứ nó không chạy (đúng nguyên tắc v1 §13: "never reports OK for a check it could not run"). Đảo lại được bất cứ lúc nào nếu owner chấp nhận việc doctor gọi binary của host.
- **Test mới:** file test cho `doctor` (chạy trong HOME giả, so cây thư mục trước/sau — 0 byte ghi) — có thể tái dùng assertion đã có trong `tests/antigravity-install.test.cjs` nhưng chạy trên bản copy sống thay vì fixture. — **ĐÃ THỰC HIỆN 2026-09-12: `tests/doctor.test.cjs` (6 test) + `tests/fixtures/fake-kit.cjs` (fixture và 4 assertion của rule, dùng chung với `antigravity-install.test.cjs` thay vì viết lại). Hai trạng thái §6 nêu làm phép đo đều dựng lại thành test: bản copy rớt host note (đúng trạng thái `3d7b4eb` đã ship) và bản copy cũ hơn `skills/` trong repo (đổi nội dung một skill, và thêm một skill mới).**
- **`docs/specs/2026-09-11-bearingkit-v2-design.md`** §1 Non-goals — cần RÀ LẠI (không chắc phải sửa): B′ là công cụ chẩn đoán chỉ đọc, không phải "installer" hay "at-runtime shim" mà Non-goals cấm — nhưng nên đọc lại nguyên văn trước khi kết luận không cần đổi gì.
- **`CHANGELOG.md`** mục `## Unreleased` — thêm một dòng ghi quyết định cài đặt A+B′ (theo đúng thói quen ghi log hiện có của file).

### Từ câu 2 (trần cứng doctor)

- **Test mới** (cùng test đã nêu ở câu 1, không phải việc riêng): assertion cụ thể "0 byte ghi ra ngoài, chạy trong HOME giả, so cây thư mục trước/sau" trở thành **bất biến bắt buộc phải test**, không phải tuỳ chọn. — **ĐÃ THỰC HIỆN 2026-09-12**, và đã kiểm ngược (cho doctor cố tình ghi một byte → test đổ, rồi hoàn tác), nên không phải một assertion rỗng.
- **`install-council.md` §6** — trần đã đề xuất ở đó nay là trần đã chốt, không còn "đề xuất chờ owner".

### Từ câu 3 (phạm vi đọc doctor + câu hỏi phụ COUNCIL)

- **Mã `doctor`** (câu 1): phạm vi đọc = `~/.claude`, `~/.gemini` thật, không phải profile cách ly. — **ĐÃ THỰC HIỆN 2026-09-12** (`os.homedir()`), nhưng **chưa từng chạy thật lần nào**: phiên viết nó dừng trước ranh giới COUNCIL.
- **`AGENTS.md`** — mục Autonomy: **ĐỀ XUẤT sửa** (chưa làm, tự nó là COUNCIL) để phân biệt "ghi = COUNCIL" và "đọc bởi công cụ có bất biến-không-ghi được test = ACT". Cần owner gật đầu riêng cho việc sửa AGENTS.md, tách khỏi quyết định phạm vi đọc. — **VẪN CHƯA SỬA 2026-09-12.** Số đo ma sát mà owner đòi trước khi quyết nay đã có, ghi ở câu 21.

### Từ câu 4 (thời điểm doctor)

- Không mở khoá gì mới — giữ đúng kế hoạch đang có (`bin/bearingkit.cjs` đã in "v0.3"), không có file nào cần sửa vì đây là xác nhận hiện trạng, không phải thay đổi.

### Từ câu 5 (ĐÃ CHỐT — rank bao hàm, mode giữ nguyên)

- **`docs/specs/2026-09-11-skill-inventory.md`** — bảng ưu tiên hợp nhất (D3): sửa đúng MỘT chỗ — ghi chú rank của spec-kit đổi từ "không tính vào ô bắt buộc" sang "cùng Superpowers thoả nhóm tối thiểu". Mode giữ nguyên "ideas-only", không đổi.
- **`upstream/sources.json`, `NOTICE`** — **không cần sửa**: mode không đổi nên không có chữ mới nào được lấy, không có gì để ghi công thêm.

### Từ câu 6 (LICENSE: tuyenht, 2026)

- **File mới `LICENSE`** ở gốc repo — văn bản MIT chuẩn + dòng `Copyright (c) 2026 tuyenht`. `package.json` đã khai `"license": "MIT"` và đã liệt kê `LICENSE` trong mảng `files` (dòng 29) — tức đã "chờ sẵn" file này, không cần sửa `package.json`.
- **`README.md`** mục `## License` (dòng 32–34) — hiện chỉ nói "MIT (see `package.json`)"; có thể giữ nguyên hoặc thêm dòng bản quyền, tuỳ owner.
- **ĐÃ THỰC HIỆN 2026-09-12**, commit `7cbf4be`.

### Từ câu 8 (host thêm: Gemini CLI, Cursor, Codex CLI/App, Copilot CLI — dùng trên máy khác)

- **`docs/hosts.md`** — bảng đầu file: 4 dòng đang ghi "not tested / pending" (Gemini CLI dòng 9; Cursor dòng 10; Codex CLI/app dòng 11; Copilot CLI, Factory Droid dòng 12 — dòng này gộp chung với Factory Droid, **không nằm trong 4 host owner vừa xác nhận**, cần tách khi cập nhật) — chỉ đổi sau khi **thật sự chạy** acceptance test (2 câu ở `evals/activation/acceptance.jsonl`), **trên máy có cài các host đó** (không phải máy đang chạy phiên này, theo đúng owner vừa nói).
- **`README.md`** dòng 12 — dòng gộp "Cursor, Codex, Copilot CLI, Factory Droid | manifests are in place..." cũng cần tách ra tương tự, sau khi có kết quả acceptance thật.
- Đây là việc **chạy test trên máy khác**, không phải chỉ sửa tài liệu — chưa lên lịch, chỉ ghi nhận là đã có danh sách host để lên lịch.

### Tier 2 (trừ câu 8) — giữ mặc định/hướng đã nghiêng (KHÔNG phải quyết định mới)

- **Có mặc định rõ ghi trong file, giữ nguyên:** câu 7 (không pack nào core), câu 10 (security-guidance giữ hạng 8), câu 11 (code-review plugin giữ hạng 2).
- **Có hướng đã nghiêng (gần như mặc định), giữ nguyên:** câu 13 (nghiêng đọc (a): dòng "marketplace-first" ở handoff là tàn dư v1), câu 15 (agent-browser + playwright-mcp dự phòng, như tài liệu hiện ghi).

### Nhóm trước đây "cần owner, không mặc định" — nay ĐÃ CHỐT hết (2026-09-12)

Câu 9, 12, 14, 16 (từng tách riêng vì không có mặc định) nay đều đã chốt bởi owner — xem nhãn ĐÃ CHỐT ở từng câu trong Tier 2 phía trên. Nhóm này đóng lại; không còn câu nào trong Tier 2 bị treo vì thiếu mặc định.

### Từ câu 9 (Biome/Pint: guardrail v0.2 + hook v0.4)

- **v0.2 scope** — thêm guardrail command cho Biome/Pint vào danh sách lệnh `bk-ship` chạy; `coverage-matrix.md` hàng 20 đã ghi "detect-stack lists biome (and PHP's Pint...) among guardrail commands when present" — cần kiểm `scripts/detect-stack.cjs` xem đã liệt kê thật chưa hay mới là dự định.
- **v0.4 scope** — thêm đúng tên Biome/Pint vào mục "optional push and deploy hooks" đã có sẵn ở `docs/specs/2026-09-11-bearingkit-v2-design.md` §13 (bảng Delivery, dòng v0.4).
- Không áp dụng gì ngay — cả hai đều là việc code cho các mốc sau, chưa tới lượt.

### Từ câu 14 (frontend-design: claude-plugins-official)

- **`upstream/sources.json`, `NOTICE`** — ghi provenance chính thức là `claude-plugins-official` khi thật sự absorb. `skill-inventory.md` dòng 124 tự ghi "Not applied; nothing is ported yet" — quyết định hôm nay xác nhận hướng, không tự kích hoạt việc port.

### Từ câu 16 (đường dẫn cục bộ là chuẩn, URL là biến thể)

- Gộp vào cùng việc mở khoá đã ghi ở câu 1 (không phải mục tách riêng): khi viết lại `docs/hosts.md`/`README.md` theo phương án A, dùng đường dẫn cục bộ làm ví dụ chính, URL ghi làm biến thể có chú thích.

### Tier 3 (17–20)

Giữ nguyên trạng đúng như owner chỉ định, không đổi gì, không có mặc định nào bị áp.

---

## Phụ lục C — Audit mẫu lỗi thứ tư: viện dẫn luật/nguyên tắc không xác minh được

Mẫu lỗi: một trích dẫn §N / "principle N" / "non-goal" / "rejected option" được dùng làm CĂN CỨ cho một kết luận, nhưng nguyên văn nơi nó trỏ tới không nói vậy. Khác ba mẫu đã dọn trước đó (nhãn xuất xứ sai gán cho owner, dữ kiện sai đã xác minh bằng mã, số thừa hưởng từ nguồn cũ không tự đếm lại).

**Phạm vi đã quét:** mọi `§\d+`, "principle N", "non-goal", "rejected option" trong `docs/`, `AGENTS.md`, `skills/bk-protocol/SKILL.md` (196 dòng khớp `§\d+` riêng trong `docs/`). Với mỗi trích dẫn có tính CHẤT VẤN (gán nội dung cụ thể cho một điều khoản, không chỉ là con trỏ vị trí), đã mở nguyên văn đích và đối chiếu. Các trích dẫn thuần con trỏ vị trí ("xem thêm §N", "chi tiết ở §N") không nằm trong phạm vi — không phải căn cứ cho kết luận nào.

| # | Nơi viện dẫn | Trỏ tới đâu | Nội dung được gán | Nguyên văn có nói vậy không | Kết luận bị ảnh hưởng |
|---|---|---|---|---|---|
| 1 | `skill-inventory.md` câu #2 gốc (đã xoá, nay là câu 5 batch) | spec v2 §5.2 (ngầm định, không nêu số cụ thể) | "the recorded reason for the restriction is about structure, which is the axis **the kit's own rule says not to judge on**" | **KHÔNG.** Đọc nguyên văn §5.2 (`v2-design.md:94-96`): chỉ nói một-nguồn-một-skill, giấy phép permissive là điều kiện cần để absorb, drop cần lý do, inventory chốt catalog theo test §1. Không câu nào cấm dùng "cấu trúc" làm căn cứ. Grep `structur` toàn `v2-design.md` và `skill-inventory.md`: không tìm thấy luật này ở đâu khác trong repo. | Câu 5 batch — vế "mode phải đổi sang adapt" trong đề xuất VÒNG 1 của tôi. **Đã kiểm lại và rút vòng 2 (trước khi owner chốt); owner đã chốt mode = giữ ideas-only.** Không còn kết luận nào đang treo dựa trên nhãn này — chỉ còn chữ tường thuật ở câu 5 cần sửa nhãn (đã sửa ngay tại chỗ, xem ngoặc trong "Bị chặn" của câu 5). |
| 2 | `docs/handoff/2026-09-11.md` "Decisions waiting" #6, `opus5-handoff.md` §4.5 (6), batch câu 19 | v1-design.md §18, dòng L20 (bảng field lessons) | "hai dòng protocol lấy nguyên văn" — ngụ ý hai dòng cụ thể, đã định danh, đang chờ hấp thụ | **KHÔNG rõ ràng.** L20 (dòng 381) kể một RỦI RO quá khứ ("two protocol lines the kit lifts verbatim exist only as uncommitted edits on one machine") — không định danh hai dòng nào. Đoạn văn ngay sau bảng (dòng 383) liệt kê **~13 mục** chữ owner viết được lấy verbatim (Autonomy Gate, Council Protocol, Definition of DONE, UX/reversibility checklist, two-block handoff, four-step spec ritual, evidence-or-unverified line, propose-from-real-state line, no-rubber-stamp stance, version-drift warning, tie-breaker order, "no test = not done", "prevent traps by architecture"). Phần lớn ĐÃ có trong `bk-protocol/SKILL.md` hiện tại (đối chiếu trực tiếp: Autonomy Gate ✓, Council ✓ kể cả "no theatrics", Definition of done ✓ kể cả "no test = not done" và "propose from real state"). Không có chỗ nào trong repo định danh chính xác "hai dòng" còn thiếu là dòng nào. | Câu 19 batch — khung "hai dòng" là số bị gán chắc hơn mức xác minh được. Không đảo kết luận (câu 19 vẫn ghi nhận, không chặn) — đã sửa nhãn tại câu 19 (đổi "hai dòng" thành "còn sót phần nào của ~13 mục"). |
| 3 | Cùng chỗ (batch câu 19) | Không có nguồn cụ thể — TODO trong `opus5-handoff.md` §4.1 dòng 14 | "design dataset từ kit cũ" — ngụ ý một artefact đã biết, chỉ chờ hấp thụ | **KHÔNG.** Dòng 14 gốc là một CHỈ THỊ cho agent tương lai ("nêu chính xác file chứa... design dataset"), không phải một phát hiện đã có. Không file/thư mục nào trong `Antigravity-Core` được nêu tên cụ thể là "design dataset" ở bất cứ đâu tôi tìm thấy trong repo. | Câu 19 batch — cùng dòng với #2, đã sửa nhãn thành "nếu có, chưa định danh được". |
| 4 | `v2-design.md` dòng 30 (Non-goals) | v2-design.md §5.1 (tự trỏ, trong cùng file) | "they are optional packs decided by the inventory (**§5.1**)" | **KHÔNG khớp nội bộ.** §5.1 chính nó (dòng 92) nói "decided by the inventory (**§5.2**)"; bảng Decisions log (dòng 189) cũng dùng §5.2. Dòng 30 là chỗ DUY NHẤT trong file tự trỏ nhầm về §5.1 thay vì §5.2. | Không kết luận nào bị ảnh hưởng — nội dung ("packs không phải core, do inventory quyết") đúng và nhất quán ở cả 3 chỗ, chỉ riêng số section ở dòng 30 sai. **ĐÃ SỬA 2026-09-12** — owner xếp cùng hạng với §1:28 và Skillmark/MIT (dữ kiện xác minh được, không phải chủ trương): `v2-design.md` dòng 30 nay ghi "§5.2"; thêm một dòng vào Decisions log (§15) ghi lại việc sửa, ngày, và căn cứ. |

**Đã kiểm và KHỚP (không phải lỗi, liệt kê để owner thấy phạm vi đã quét, không phải mọi trích dẫn đều đáng ngờ):** cả 4 trích dẫn trực tiếp làm căn cứ chính cho `install-council.md` (§1 Non-goals dòng 28, §1 Goal 2 dòng 16, §2.1 "Content over machinery" dòng 35, §2.2 "One source, native install" dòng 36) khớp nguyên văn `v2-design.md` từng chữ; §8 ("optional extras... scheduled for v0.4, never required", "the kit writes no host settings") khớp, dùng làm căn cứ cho câu 9; §11 ("acceptance test when the bootstrap wiring or a host changes") khớp; §5.2 (một-nguồn-một-skill, giấy phép, "a skill enters the catalog only when the inventory shows work for it") khớp ở cả 4 chỗ trích lại (opus5-handoff §2.1.7, §4.1 dòng 30, skill-inventory dòng 103, dòng 124); "twenty-line rule" (v2 §6) khớp `bk-protocol/SKILL.md` dòng 18; v1 §17 (outcome benchmark, mười hai fixture task) khớp v2 §11's trích lại; `AGENTS.md` COUNCIL rule ("touches ~/.claude, ~/.gemini, other repositories, or any server") khớp cách tôi đã trích ở câu 3 và ở `install-council.md` dòng 110; Principle 4 "official first... not re-implemented" (v2 §2) khớp trích dẫn ở `skill-inventory.md` dòng 123.

*Ghi 2026-09-12. Phạm vi: `docs/`, `AGENTS.md`, `skills/bk-protocol/SKILL.md`. Không quét `skills/bk-*/SKILL.md` khác hay `agents/*.md` — nếu owner muốn mở rộng, nói rõ thư mục.*

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

*Ghi 2026-09-12, thực thi D5 (`docs/handoff/2026-09-11-owner-directives.md`). File này là bản đầy đủ duy nhất của mọi câu hỏi đang chờ owner; `opus5-handoff.md` §4.5, `skill-inventory.md` "Questions for D5", và `docs/handoff/2026-09-11.md` "Decisions waiting on the owner" chỉ còn giữ con trỏ về đây.*

*Cập nhật 2026-09-12, vòng 1 (cùng ngày, sau khi owner trả lời): câu 1, 6 chốt bởi owner; câu 8 chốt một phần, một chi tiết ("Something else") còn cần hỏi lại; câu 5 owner yêu cầu audit thay vì tự chọn — đã audit, kết quả là khuyến nghị chờ owner xác nhận.*

*Cập nhật 2026-09-12, vòng 2: owner chỉ ra đề xuất câu 5 vòng 1 tự mâu thuẫn — đã kiểm lại, tìm thấy lý do gốc (một luật "cấm dùng cấu trúc" gán cho §5.2) không xác minh được khi đọc nguyên văn; đề xuất sửa thành rank = bao hàm, mode = giữ nguyên ideas-only. Owner chốt thêm câu 2, 3, 4, 8.*

*Cập nhật 2026-09-12, vòng 3: owner CHỐT câu 5 (rank bao hàm, mode ideas-only) — tất cả 6 câu Tier 1 nay đã chốt. Theo yêu cầu owner, quét toàn repo tìm mọi viện dẫn §N/principle/non-goal cùng mẫu lỗi với vụ "cấm dùng cấu trúc" — kết quả ở Phụ lục C: thêm đúng 1 lỗi cùng dạng (câu 19, "hai dòng protocol"/"design dataset" không định danh được ở nguồn — đã sửa nhãn, không đổi kết luận câu 19) và 1 lỗi tự trỏ nhầm section trong `v2-design.md` (không ảnh hưởng kết luận nào, chưa sửa ở vòng này).*

*Cập nhật 2026-09-12, vòng 4: owner CHỐT thêm câu 9, 12, 14, 16 (Tier 2, nhóm "không mặc định" đóng lại hết). Owner cho sửa phát hiện #4 của Phụ lục C — đã áp dụng trực tiếp vào `v2-design.md` (dòng 30 và Decisions log §15), là ngoại lệ DUY NHẤT ngoài file batch được sửa trong cả phiên D5. Thêm câu 21 (Tier 3, mới, ngoài 20 câu gốc mục 0): đề xuất sửa AGENTS.md cho COUNCIL/doctor, nhãn "đề xuất của phiên", chưa duyệt, chủ động hoãn. Không câu nào được agent tự quyết mà không owner yêu cầu hoặc xác nhận; câu 21 là đề xuất treo có chủ đích, không phải quyết định.*
