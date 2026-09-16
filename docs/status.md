# Trạng thái dự án Bearingkit

Cập nhật: **2026-09-15** · Nhánh `main` · `package.json` 0.1.0 · tag duy nhất `0.1.0-phase1` · số commit không ghi ở đây: nó tự cũ sau mỗi commit của chính phiên đang viết (đã vấp hai lần); đếm bằng `git log --oneline | wc -l` · **69/69** test xanh (`node --test tests/*.test.cjs`, chạy 2026-09-16 sau Terraform và guardrail còn sót)

> **File này là BẢNG ĐIỀU KHIỂN, không phải nguồn sự thật.** Nó chỉ trỏ đường và ghi trạng thái; mọi nội dung thật nằm ở nơi khác:
>
> - Thiết kế: `docs/specs/2026-09-11-bearingkit-v2-design.md` (§13 là bảng mốc, §15 là log quyết định)
> - Câu hỏi / quyết định của owner: `docs/specs/2026-09-12-d5-owner-questions.md` (nguồn thật duy nhất)
> - Trạng thái phiên, luồng đang mở: file mới nhất trong `docs/handoff/`
> - Kế hoạch: `docs/plans/` · Đo đạc: `docs/compat/` · Host: `docs/hosts.md`
>
> **Luật của file này:** (1) không giữ bản song song của quyết định hay câu hỏi — chỉ đếm và trỏ; (2) mỗi ô trạng thái phải có bằng chứng (đường dẫn, commit, hoặc lệnh) hoặc ghi thẳng "chưa đo"; (3) viết lại trước commit cuối của mỗi phiên, cùng lúc với handoff; (4) không con số nào chưa tự xác minh trong phiên ghi nó.

---

## 1. Đang ở đâu

Kit đã qua Phase 1 (v1) và đã đổi hình dạng sang v2 (skills ở gốc, cài bằng lệnh của từng host, không installer). Hai host đã qua acceptance test. Phần **máy móc** gần như xong; phần **nội dung** — chắt lọc các nguồn thành bộ skill chuẩn — mới đi được 3 trong 11 nguồn cần nội dung. Đang ở giữa mốc **v0.2**, và cổng v0.2 còn 2/3 điều kiện chưa đo trên bản v2.

| Đếm được hôm nay | Số | Lệnh / nguồn |
|---|---|---|
| Skill trong catalog §5.1 đã tồn tại | **12/17** (11 skill hiện + `bk-protocol`) | `ls skills/` |
| — còn thiếu | `bk-map`, `bk-research`, `bk-perf`, `bk-db`, `bk-ops` | §5.1 |
| Nguồn trong `upstream/sources.json` | 22 (adapt 5 · ideas-only 6 · reference 11) | đọc file bằng `node -e` |
| — nguồn **cần nội dung** (adapt + ideas-only) | 11, đã xong **3** (superpowers, karpathy, claude-plugins-official một phần) | cùng lệnh |
| — nguồn đã có `derived` (chữ thật đã port) | **3** nguồn, **19** file dẫn xuất | cùng lệnh |
| Mục trong `NOTICE` | **2** (obra/superpowers, anthropics/claude-plugins-official) | `grep '^##' NOTICE` |
| Hàng nguồn trong ma trận | 39 (gồm host candidate, tool, và 8 mục owner loại) | `grep -c '^\| [0-9]'` |
| Test | 69/69 xanh | `node --test tests/*.test.cjs` |
| `skills/<name>/tests/` (§5.3 cần ≥3 prompt mỗi skill) | **9/11** — 27 case; `bk-audit` và `bk-next` thuộc v0.3 | `find skills -type d -name tests` |
| `SKILL.md` có dòng provenance + license mode | 11/11 skill đang tồn tại | `grep -h '^Sources:' skills/*/SKILL.md`, có test canh |
| File stack `bk-build/references/stacks/` (§5.5 cần 8) | **3/8** — `typescript-react`, `kotlin`, `sql`, cộng `index.md` ánh xạ profile → file | `ls skills/bk-build/references/stacks/` |
| Host đã pass acceptance | 2/7 (Claude Code, Antigravity) | `docs/hosts.md` |

---

## 2. "Hoàn thành" là gì — 12 mục; hôm nay **0 mục đạt có phép đo**, 1 mục đạt theo thiết kế, 11 mục chưa

Đây là bản suy ra từ ba nơi, không phải luật mới: `v1 §17` (Success metrics v1.0), `v2 §13` (hàng v1.0), `v2 §5.3` (quality bar mỗi skill). Kit xem là hoàn thành khi cả 12 dòng dưới đây đóng.

> **Sửa của lượt tự-audit 2026-09-13:** bản đầu của mục này ghi "2/12", đếm mục 9 và mục 10 là đạt. Sai ở mục 9: `v1 §17` đòi "**every skill carries provenance and license mode**; NOTICE complete" — bản đầu chỉ giữ nửa sau (`NOTICE`) rồi cho điểm đạt. `grep -l 'Adapted from' skills/*/SKILL.md` → **không SKILL.md nào nêu nguồn**, nên mục 9 chưa đạt. Mục 10 đạt theo thiết kế nhưng không có phép kiểm nào canh, nên không đếm là đạt có bằng chứng.

| # | Mục (nguồn) | Đích | Hôm nay |
|---|---|---|---|
| 1 | Catalog đủ skill (v2 §5.1) | 17 | **12/17** — `bk-design` thêm 2026-09-14 |
| 2 | Mỗi skill đạt cả 5 điều kiện quality bar (v2 §5.3) | 17/17 | **0/17 đủ cả năm, nhưng tám skill lifecycle nay đạt 4/5**: #1 body ≤100 dòng, #3 `tests/` ≥3 case (2026-09-14), #4 activation prompt (2026-09-14), #5 acceptance trên hai host. Điều kiện còn thiếu cho cả tám là **#2** — mỗi *dòng luật* trong body truy được về một nguồn hoặc một field lesson; dòng `Sources:` nêu nguồn của skill chứ chưa chứng minh từng dòng |
| 3 | File stack (v2 §5.5) | 8 | **3/8** — ba stack owner dùng hằng ngày, viết 2026-09-15. Version card của cả ba ghi thẳng: chỉ đối chiếu ở mức fixture, **chưa** đối chiếu với project thật nào, vì máy viết ra chúng không có project của ba stack đó |
| 4 | Nguồn **lấy chữ hoặc lấy ý** đã có quyết định + `NOTICE`/`derived` khi lấy chữ | 11 | **3/11** — mẫu số 11 chỉ gồm `adapt` + `ideas-only`; 11 nguồn `reference` không nằm ở đây nhưng vẫn sinh việc, và việc đó được đếm ở mục 1–3 (ví dụ awesome-cursorrules và vercel agent-skills là nguyên liệu của file stack, mục 3) |
| 5 | Fixed context ≤5,000 đo bằng `/context` trên bản v2 (v1 §17, v2 §12) | 1 số | **chưa đo trên v2** — số v1 (~2,650) vẫn là bằng chứng về độ lớn (`phase-1-gate.md` tự ghi "the measurements stand"), nhưng §11 đòi đọc lại ở mốc phát hành |
| 6 | Activation precision ≥0.9 và recall ≥0.9, cả hai host, trên bản v2 (v1 §17) | 2 host | **chưa đo trên v2** |
| 7 | Outcome benchmark: 12 task, kit ≥ Superpowers về pass rate và ít token hơn (v1 §17) | 12 task | **0/12** — `evals/fixtures/` chỉ có `sample-app`, không có task suite nào |
| 8 | `upstream-watch` ra báo cáo delta cho mọi nguồn, tối thiểu mỗi tháng (v1 §17) | 1 lệnh chạy được | **chưa có mã** |
| 9 | Mỗi skill mang provenance + license mode, và `NOTICE` đầy đủ (v1 §17) | 17 skill + `NOTICE` | **12/17** — đủ cho mọi skill đang tồn tại kể từ Task 2 (2026-09-13): mỗi `SKILL.md` có một dòng `Sources:` nêu nguồn và license mode, và `tests/skills.test.cjs` canh để dòng đó không khai ít hơn thứ `references/` thật sự vendor; 5 skill chưa tồn tại là phần còn lại |
| 10 | Không file cấu hình kit nào trong project (v1 §17, v2 §9) | 0 | **đạt theo kiến trúc**, chưa có test canh |
| 11 | Host owner thực dùng đã qua acceptance (v2 §3, câu 8) | 6 | **2/6** (4 host còn lại phải chạy trên máy khác) |
| 12 | Việc phát hành: README EN+VI, CI, marketplace listing, publish từ history squash (v2 §13) | 4 | **0/4** |

**Đọc bảng này thế nào.** Mục 5, 6, 7 là ba phép đo — chúng là điều kiện duy nhất cho câu "kit tốt hơn từng nguồn nó thay thế"; không có chúng thì mọi câu "tốt hơn" đều không được nói ra (ma trận §"Rules for this file"). Mục 7 chưa có một task nào, nên hôm nay **chưa có cơ sở nào** để nói kit tốt hơn Superpowers.

---

## 3. Bảng mốc phát hành (spec §13)

| Mốc | Trạng thái | Ghi chú |
|---|---|---|
| `0.1.0-phase1` | **đã phát hành** 2026-09-11 | layout v1; đo đạc ở `docs/compat/phase-1-gate.md` |
| **v0.2** | **đang làm** | hạng mục ở §4, cổng ở §5. Thứ tự thực thi bên trong v0.2 theo lộ trình owner chọn 2026-09-13: `docs/plans/2026-09-13-daily-driver.md` |
| v0.3 | chưa bắt đầu | 6 skill còn lại, agent dùng hàng ngày, 8 file stack, skill test cho mọi skill |
| v0.4 | chưa bắt đầu | pack tuỳ chọn, hook push/deploy (gồm Biome/Pint theo câu 9), acceptance Gemini CLI / Cursor / Codex |
| v1.0 | chưa bắt đầu | outcome benchmark, `upstream-watch`, README EN+VI, CI, marketplace, publish từ history đã squash |

---

## 4. v0.2 — từng hạng mục

Phạm vi v0.2 theo §13 là **tám skill lifecycle** (`bk-spec`, `bk-plan`, `bk-build`, `bk-test`, `bk-debug`, `bk-review`, `bk-ship`, `bk-close`) đạt §5.3, cộng kiểm kê và catalog cuối, cộng các nguồn bắt buộc.

| # | Hạng mục | Trạng thái | Bằng chứng / việc còn thiếu |
|---|---|---|---|
| 1 | Restructure sang layout v2 | **xong** | `docs/plans/2026-09-11-v2-restructure.md` task 0–11 đều `[x]`; commit `97843c4` |
| 2 | Acceptance Claude Code 2.1.268 | **xong** 2026-09-11 | `docs/hosts.md`, bảng đầu file |
| 3 | Acceptance Antigravity 2.0 (2.12.2) | **xong** 2026-09-11 | cùng bảng; pass sau khi host note được trả lại (`3d7b4eb`) |
| 4 | Kiểm kê nguồn mức *registry* (17 nguồn: sha, giấy phép, vai trò) | **xong** | `docs/specs/2026-09-11-skill-inventory.md` |
| 5 | D3 — một thứ tự ưu tiên hợp nhất, đã audit | **xong** | cùng file, phần `# D3` |
| 6 | Kiểm kê §5.2 mức *từng mục* (absorb / idea / drop cho mọi item của mọi nguồn) | **chưa** | `skill-inventory.md` tự ghi là ngoài phạm vi ("registry-level only"). **Việc chặn lớn nhất của v0.2**; lần thử đầu (16 agent song song) chết vì rate limit, D2 sau đó chạy theo đợt ≤3 nguồn và thành công |
| 7 | Chốt catalog cuối (§5.2: kiểm kê "fixes the final catalog") | **chưa** | phụ thuộc #6; cũng là điều kiện owner đặt cho `bk-design` (câu 12) |
| 8 | Nguồn bắt buộc 1/4 — Superpowers 5.1.0 (MIT) | **xong** 2026-09-11 | 8 file `references/`, `NOTICE`, `derived` 15 file |
| 9 | karpathy-skills (không giấy phép → chỉ lấy ý) | **xong** 2026-09-11 | 2 dòng paraphrase trong `skills/bk-build/SKILL.md`; không nợ `NOTICE` |
| 10 | Nguồn bắt buộc 2–4 — `code-review`, `frontend-design`, `claude-code-setup` (+ `pr-review-toolkit`) từ `claude-plugins-official` (Apache-2.0) | **3/4 xong** | `frontend-design` → `bk-design` (2026-09-14); `code-review` + `pr-review-toolkit` → `bk-review`/`bk-test` (2026-09-15). Mỗi lần đủ ba việc: nguồn trong file dẫn xuất, mục `NOTICE`, `derived`. `claude-code-setup` đã kiểm kê 2026-09-15 và **kết luận không port được** (0 absorb / 5 drop / 3 idea) — một idea chuyển sang Task 7; owner cần quyết chấp nhận ideas-only hay muốn skill `bk-setup` mới |
| 11 | Các nguồn còn lại theo thứ tự D3 (spec-kit, mattpocock, addyosmani, vercel agent-skills…) | **chưa** | ma trận: phần lớn còn `designed` |
| 12 | §5.3 #3 — `tests/` ≥3 prompt cho **tám** skill của v0.2 | **xong** 2026-09-14 | 24 case, 3 mỗi skill, bốn mục cố định (Prompt/Setup/Expected/Fails if) để một harness đọc được và để so giữa các skill; `tests/skills.test.cjs` canh cả số lượng lẫn bốn mục |
| 13 | §5.3 #4 — activation 2 positive + 1 negative mỗi skill, cả hai ngôn ngữ | **xong cho 11/11 skill task** (2026-09-14, cập nhật 2026-09-15) | 15 prompt cho `bk-plan`, `bk-close`, `bk-audit`, `bk-next`, `bk-test` ở Task 3, rồi 3 cho `bk-design` ở Task 6b: bộ 60 → **78**, Phase 1 giữ nguyên 60 để còn so được. Bất biến "mỗi skill tồn tại phải có ≥2 positive" trong `tests/evals.test.cjs` đã làm đúng việc của nó: tạo thư mục `bk-design` mà chưa có prompt là suite đỏ ngay |
| 14 | Guardrail command Biome/Pint (quyết định câu 9, phần v0.2) | **xong** 2026-09-15 | `detect-stack` nhận `@biomejs/biome` hoặc `biome.json` và đặt `biome check --error-on-warnings .` làm lệnh lint, thay cho script `lint` nó bao. Test đỏ trước, fixture riêng. Hook thật vẫn là v0.4 |
| 15 | Phần A của câu 1 — đường CLI `claude plugin …` trong `docs/hosts.md` + `README.md` | **chưa** | `grep 'claude plugin ' docs/hosts.md README.md` không khớp; hiện chỉ có dạng slash-command `/plugin` |
| 16 | Sửa rank spec-kit trong `skill-inventory.md` (câu 5) | **chưa** | đúng một chỗ: "không tính vào ô bắt buộc" → "cùng Superpowers thoả nhóm tối thiểu" |
| 17 | Rà `v2 §1 Non-goals` xem B′ có cần nói gì thêm | **chưa** | khả năng cao không phải sửa (doctor chỉ đọc, không phải installer) |
| 18 | `bearingkit doctor` (phần B′ của câu 1) | **xong** 2026-09-12 | `scripts/doctor.cjs` 80 dòng, `tests/doctor.test.cjs` 6 test, bất biến không-ghi đã kiểm ngược; commit `e049c58`. **Chưa chạy thật lần nào** — xem §7 (a) |
| 19 | `LICENSE` (câu 6) | **xong** 2026-09-12 | MIT, `Copyright (c) 2026 tuyenht`, commit `7cbf4be`; không còn nghĩa vụ Apache-2.0 nào treo |

---

## 5. Cổng phát hành v0.2 — ba điều kiện (spec §13)

| Điều kiện | Trạng thái | Chi tiết |
|---|---|---|
| Acceptance pass trên cả hai host | **đạt** | đo 2026-09-11; chỉ phải chạy lại khi bootstrap hoặc host đổi (§11 cadence) |
| Bộ activation ≥ số của Phase 1 | **chưa chạy trên bản v2**; phạm vi owner gật 2026-09-14: **78** prompt một lần trong profile cách ly + 2 câu acceptance trong profile thật, báo hai số tách nhau | mọi kết quả 60-prompt trong `evals/results/` đều ngày 2026-09-10 (layout v1); sau restructure chỉ có acceptance 2 prompt. Đúng cadence §11 (đo ở mốc phát hành) — việc đã lên lịch, không phải nợ quá hạn. **Hệ quả về thứ tự: prompt cho các skill còn thiếu (#13) phải viết TRƯỚC lần chạy này, nếu không sẽ phải chạy hai lần và trả quota hai lần** (#13 đã xong 2026-09-14/15). **Chặn hiện tại, đo 2026-09-15: cửa sổ quota bảy ngày ở 89%** (reset 16/9 10:00), năm giờ 43% — không đủ cho 78 prompt liền mạch, và một lần chạy dừng giữa chừng thì không so được với 57/60. Đã vá `scripts/evals.cjs` để nó dừng có kiểm soát ở cả hai cửa sổ thay vì chỉ cửa sổ năm giờ |
| Fixed context ≤ 5,000 qua `/context` | **chưa đo trên bản v2** | số ~2,650 là của v1 (`docs/compat/phase-1-gate.md`); hai số 43,8xx là so sánh `claude -p` trước/sau khi port Superpowers, và chính file đó nói nó "không thay thế" số gate |

---

## 6. Đang chờ owner

Nguồn thật: `docs/specs/2026-09-12-d5-owner-questions.md`. Không copy nội dung ở đây, chỉ đếm và trỏ.

- **11/21 câu đã chốt** (2026-09-12): câu 1, 2, 3, 4, 5, 6, 8, 9, 12, 14, 16.
- **10 câu còn treo**: 7, 10, 11, 13, 15 (Tier 2 — đang giữ mặc định, không chặn việc nào); 17, 18, 19, 20 (Tier 3 — ghi nhận); 21 (sửa `AGENTS.md`: đọc bởi công cụ có bất biến-không-ghi đã test thì tính ACT hay COUNCIL — điều kiện owner đặt ra nay đã đủ).
- **2 va chạm mới từ phiên doctor, cần owner đọc**: (a) mã `doctor` đã nằm trong cây trước v0.2 trong khi nhãn đã chốt là "v0.3" (câu 4); (b) `doctor` cố ý không gọi `claude plugin list`/`validate` như §6 mô tả, vì trần "không ghi một byte" là bất biến cứng (câu 1).
- ~~Ngã ba lộ trình~~ — **owner chốt 2026-09-13: lộ trình B, daily driver trước**, kế hoạch ở `docs/plans/2026-09-13-daily-driver.md`. ~~Câu sinh ra từ đó về `frontend-design`/`bk-design`~~ — **owner chốt 2026-09-14: đường (ii)**, nới điều kiện câu 12 **chỉ cho riêng `bk-design`**; mọi skill khác vẫn chờ inventory. Ghi ở nguồn thật (`d5-owner-questions.md` câu 12) kèm lý do, và thành Task 6b của plan.

---

## 7. Luồng đang mở và lệch hồ sơ

Ba mục đầu (a–c) thừa hưởng từ `docs/handoff/2026-09-12.md`; bốn mục sau (d–g) là phát hiện của lượt rà soát 2026-09-13, **chưa sửa**.

- (a) ~~`doctor` chưa chạy trên profile thật~~ — **đã chạy 2026-09-13** (owner): 5 mục `ok`, 1 `FAIL` (bản copy `skills/` lệch checkout, đúng vì Task 2 vừa sửa 11 file), 1 `skip` (mục cần host). Lỗ hổng `3d7b4eb` đóng trên thực địa, và đây là bằng chứng đầu tiên cho giá trị của B′. Bản gốc của mục này: Mọi bằng chứng đến từ HOME giả + kit giả. Nghĩa là bản copy Antigravity ở `~/.gemini/config/plugins/bearingkit` trên máy này chưa được đối chiếu lần nào với checkout — lỗ hổng `3d7b4eb` vẫn mở trên thực địa. Một lệnh là đủ: `node bin/bearingkit.cjs doctor`.
- (b) **Hai nhãn xuất xứ còn treo, chưa sửa**: `docs/plans/2026-09-10-content-backlog.md` ("owner's explicit ask" / "owner's requirement", 2 câu) và `docs/handoff/2026-09-11.md` (dòng "approved by the owner" cho spec v2). Không có bản gốc để đối chiếu.
- (c) **`install-council.md` §6 vẫn đọc như thể doctor có gọi `claude plugin list`.** File council là bản ghi lịch sử nên không sửa; chỗ ghi lệch là câu 1 của batch D5.
- (d) ~~**Bảng D1–D6 đã cũ**~~ — **đã sửa 2026-09-13** (Task 0). Trước khi sửa: ghi D4, D5, D6 "**chưa chạy**", trong khi D4 đã ra `docs/specs/2026-09-12-install-council.md`, D5 đã ra `docs/specs/2026-09-12-d5-owner-questions.md`, D6 đã đóng bằng commit `932ea03`. Handoff 2026-09-12 dặn phiên sau "kiểm bảng trạng thái đó trước khi thi hành khối nguyên văn" — mà bảng lại sai theo hướng nguy hiểm nhất: giục làm lại việc đã xong.
- (e) ~~**Hàng 20 của ma trận nói `detect-stack` liệt kê biome**~~ — **đã sửa 2026-09-13** (Task 0): hàng đó nay ghi đúng hiện trạng và trỏ việc thêm biome về quyết định câu 9. Trước khi sửa ("detect-stack lists biome (and PHP's Pint and PHPStan) among guardrail commands when present"). Đọc mã: chỉ có `laravel/pint` (`scripts/detect-stack.cjs:100`) và `phpstan` (dòng 101); `grep -ri biome scripts/ skills/ tests/` không khớp gì. Mẫu lỗi #2 (dữ kiện sai, xác minh được bằng mã), cùng hạng với `v2 §1:28` đã sửa.
- (f) ~~**`README.md` trỏ `package.json` cho license**~~ — **đã sửa 2026-09-13** (Task 0): nay trỏ `LICENSE` và `NOTICE`. Trước khi sửa ("MIT (see `package.json`)") trong khi `LICENSE` đã tồn tại từ `7cbf4be`; `NOTICE` đã được cập nhật, README thì chưa.
- (g) ~~**`AGENTS.md` dòng 3 còn trỏ `core/AGENTS.md`**~~ — **đã sửa 2026-09-15**: nay trỏ `skills/bk-protocol/SKILL.md` và nói rõ nó được `hooks/session-start.cjs` bơm vào, kèm commit đã xoá `core/`. Bản gốc của mục này: **`AGENTS.md` dòng 3 còn trỏ `core/AGENTS.md`** là "file chỉ dẫn của sản phẩm", nhưng `core/` đã bị xoá trong restructure v2 (`97843c4`) và nội dung đó nay là `skills/bk-protocol/SKILL.md`. Đây là câu đầu tiên mọi agent mới đọc, nên đường dẫn chết ở đúng chỗ đó là loại lệch đắt nhất. Chưa sửa vì nằm ngoài việc owner giao lượt này (sửa từng cái một, không dồn).

- (h) ~~**`scripts/detect-stack.cjs` không nhận Terraform/HCL**~~ — **đã sửa 2026-09-16** (owner chọn làm trong lúc chờ quota): thư mục có `*.tf` hoặc `.terraform.lock.hcl` nay cho `languages: ["terraform"]`, guardrail `terraform fmt -check -recursive`, `terraform validate`, và `tflint` khi có `.tflint.hcl`; major của provider đọc từ lock file (bản thật đã cài), không từ constraint. `plan`/`apply`/`init` **không bao giờ** là guardrail — có test canh. Giới hạn ghi thẳng trong code: detector đọc đúng thư mục được đưa, nên layout multi-root chỉ nhận khi phiên chạy bên trong một thư mục môi trường. Bản gốc của mục này: **`scripts/detect-stack.cjs` không nhận Terraform/HCL** (`grep -in 'terraform\|hcl'` → rỗng), nên trên một repo chỉ có `.tf` nó ném `no-manifest` và skill không có stack profile nào để đọc. Đây là khoảng trống so với công việc hằng ngày của owner, **không phải lệch so với spec**: §5.5 tự ghi danh sách 8 stack là "at first; others as the inventory shows sources", tức là danh sách mở. Lượt rà soát đầu (phần trả lời 2026-09-13) trình bày chỗ này như một lệch của spec — đó là đọc sót cụm "at first", đã sửa lại ở đây.

- (i) ~~`bk-protocol` hiện trong panel `/skills`~~ — **đã kết luận 2026-09-13, là host đổi chứ không phải kit đổi.** `/skills` liệt kê nó `user-only · ~80 tok`; ngày 2026-09-10 trên 2.1.267 nó **vắng mặt** khỏi nhóm User của `/context all`. Frontmatter kit không đổi; hôm đó host tự cập nhật. Ngân sách §12 vẫn đạt: **900 token cho 11 skill** trên trần 1,700 (ước chiếu 17 skill ≈ 1,390). Spec §6 và §12 đã sửa, `docs/hosts.md` có ghi chú drift, §15 có hai dòng log. Số và phương pháp: `docs/compat/2026-09-13-daily-profile-readings.md`.
- (j) ~~Hình dạng bằng chứng acceptance prompt 1 đổi~~ — **đã kết luận: bootstrap CÓ nạp.** Câu kiểm "không được đọc file nào, kit root là gì" được trả lời trong 4 giây, **không gọi tool nào**, trích đúng dòng chỉ tồn tại trong text mà `hooks/session-start.cjs` bơm vào. Vậy ba lần search ở prompt 1 là model tự chọn trích `file:line`, không phải bootstrap vắng.
- (k) **Thu hẹp, chưa đóng.** Trong profile thật 196 skill, câu `Let's make a react todo list` có hành động đầu tiên là `Skill(bearingkit:bk-spec)` — không thăm dò trước, không skill đối thủ nào chiếm lượt. Đó là **một điểm dữ liệu, không phải một phép đo**: bộ 60 prompt chưa bao giờ chạy trong profile này. Câu hỏi phạm vi cho Task 8 vẫn còn: chạy một lần (cách ly, so được với Phase 1) hay hai lần (thêm profile thật).
- (o) ~~**`detect-stack` còn sót guardrail của vài hệ sinh thái.**~~ — **đã sửa 2026-09-16**, mỗi mục một fixture và một test đỏ trước: ESLint (`--max-warnings 0`) và Prettier (`--check`, không bao giờ script `format` vì nó thường ghi) khi gọi trực tiếp; Biome thay Prettier; script `lint` của project thắng ESLint — thứ tự ưu tiên này được chứng minh không rỗng bằng một bản cài cố ý bỏ ưu tiên. black, mypy/pyright; `go vet` và `golangci-lint`; `cargo fmt --check`; `ktlintCheck`/`detekt` qua plugin Gradle. **gofmt cố ý không có**: `gofmt -l` in file cần sửa mà vẫn exit 0, làm guardrail thì xanh đúng lúc phải đỏ. Không công cụ nào trong số này có trên máy này, nên hành vi exit code là theo tài liệu, **chưa chạy thật**. Bản gốc của mục này: **`detect-stack` còn sót guardrail của vài hệ sinh thái.** Đối chiếu với bảng lệnh của `claude-code-setup` (ý duy nhất dùng được từ Task 6): kit nhận `tsc`, script `test`/`lint`/`build`, biome, pint, phpstan, ruff, pytest, gradle, cmake, go test, cargo test, dotnet test. **Chưa nhận**: prettier và eslint khi chạy độc lập (không qua script), black, mypy/pyright, gofmt, rustfmt, ktlint, detekt. Không chặn gì — mỗi project khai guardrail trong instruction file của nó — nhưng là danh sách sẵn cho lần mở rộng `detect-stack` tiếp theo.
- (n) **`q-en-01` của Phase 1 trỏ vào `src/http/retry.ts`, file fixture không có** (fixture có `src/lib/http.ts`). Phát hiện khi audit Task 3, **cố ý không sửa**: 60 prompt của Phase 1 là đường cơ sở duy nhất so được với các lần chạy trước, đụng vào là mất khả năng so sánh. Hệ quả cần biết khi đọc kết quả Task 8: prompt này `expect: none`, nên nếu model đi tìm một file không tồn tại rồi gọi nhầm skill, nó bị tính là false activation mà nguyên nhân là fixture, không phải routing. `tests/evals.test.cjs` nay chặn lỗi cùng loại cho mọi prompt **ngoài** Phase 1.
- (m) **Audit mã 2026-09-13 — bốn lỗi đã sửa, ba lỗi còn để lại có chủ đích.** Đã sửa (có test, `CHANGELOG.md`): đường ghi guardrail của §8 chết trong v2; `bin` thoát 0 cho lệnh không tồn tại; `doctor` bỏ `--dest`; marker copy ghi sau payload. **Còn để lại, không chặn gì:** (1) `parseArgs` trong `antigravity.cjs` và `record-guardrail.cjs` coi positional sau một cờ là giá trị của cờ, nên `--dry-run install` không chạy được — thứ tự đúng có ghi trong usage; (2) `State.latest` so `cwd` phân biệt hoa thường, nên `C:\Projects` và `c:\projects` sinh hai file state trên Windows; (3) `prune()` chỉ chạy khi state được tạo tự động, không chạy trên đường `--session`.
- (l) **Bản copy Antigravity đã đồng bộ lại** 2026-09-13: owner chạy `antigravity install` (gỡ bản cũ, chép `skills/` đã dereference, 3 script, viết lại `rules/bearingkit.md` và marker). **Đã xác nhận 2026-09-13**: sau `antigravity install`, `doctor` báo sáu mục `ok` và một `skip`. Cùng với lần `FAIL` trước đó, đây là negative control đầy đủ: phép kiểm đã được thấy đỏ rồi mới được tin khi xanh. **Lặp lại 2026-09-15** sau Task 5/6b/7: `doctor` báo `FAIL antigravity copy of skills/ matches this checkout`, owner chạy `antigravity install`, `doctor` trở lại sáu `ok` — cùng một cặp đỏ-rồi-xanh, lần này trên một lệch do chính phiên tạo ra.

**Lượt 2026-09-13 đã ghi gì vào repo:** file này (mới, bổ sung §2, tự-audit sửa §2/§7/§8, rồi cập nhật Task 0); `docs/handoff/2026-09-13.md`; `docs/plans/2026-09-13-daily-driver.md`; **một dòng** trong `AGENTS.md` mục "Where the truth lives"; và Task 0 của plan đó — ba sửa dữ kiện (d), (e), (f). Không mã nào đổi. Năm mục còn lại (a), (b), (c), (g), (h) chưa sửa: (a) là việc của owner, (b) không có bản gốc để đối chiếu, (c) là bản ghi lịch sử không sửa, (g) chờ owner gật, (h) là Task 7 của plan.

---

## 8. Rủi ro mở

Luồng mở và rủi ro thuộc handoff, không thuộc file này (luật #3 ở §10). Rủi ro lớn nhất đang mở — **không có bằng chứng trong repo về việc kit được dùng cho một việc thật ngoài eval và acceptance**, trong khi `owner-migration.md` còn `PLANNED` — nằm ở `docs/handoff/2026-09-13.md`, Block 2, Open threads, kèm giới hạn của bằng chứng đó.

Bản đầu của file này (cùng ngày) viết mục này thành một đoạn lập luận dài, vi phạm chính luật #3 nó đặt ra; lượt tự-audit rút xuống thành con trỏ này.

---

## 9. Việc của các mốc sau, để khỏi quên

- **v0.3**: 6 skill còn thiếu (`bk-map`, `bk-research`, `bk-design`, `bk-perf`, `bk-db`, `bk-ops`); 8 file stack (`typescript-react`, `node`, `python`, `php-laravel`, `sql`, `shell`, `kotlin`, `c-cpp`); skill test cho mọi skill đã liệt kê.
- **v0.4**: pack tuỳ chọn mà kiểm kê chứng minh được; hook push/deploy tuỳ chọn (đặt tên Biome/Pint vào đó, theo câu 9); acceptance thật cho Gemini CLI, Cursor, Codex CLI/App, Copilot CLI — **phải chạy trên máy khác** nơi có cài các host đó (câu 8).
- **v1.0**: outcome benchmark 12 task (cơ sở duy nhất cho mọi câu "tốt hơn"); `bin/bearingkit.cjs upstream-watch` (chưa hiện hữu); README EN+VI; CI; marketplace listing; publish từ history đã squash, sau khi grep toàn history tìm tên project riêng.

---

## 10. Cách cập nhật file này

1. Ở bước đóng phiên (`bk-close`), viết lại file này **cùng lúc** với handoff — handoff giữ trạng thái phiên, file này giữ trạng thái dự án.
2. Đổi một ô trạng thái thì phải đổi cả ô bằng chứng. Không có bằng chứng thì ghi "chưa đo", không ghi ước lượng.
3. Không thêm quyết định, câu hỏi hay luận điểm mới vào đây — chúng thuộc `d5-owner-questions.md` hoặc spec. File này chỉ đếm và trỏ; §2 là bản suy ra có dẫn nguồn, không phải luật mới.
4. Con số nào chưa tự chạy lệnh xác minh trong phiên đó thì ghi rõ là số thừa hưởng, hoặc bỏ.
