# Trạng thái dự án Bearingkit

Cập nhật: **2026-09-13** · Nhánh `main` · `package.json` 0.1.0 · tag duy nhất `0.1.0-phase1` · 83 commit · 50/50 test xanh (`node --test tests/*.test.cjs`, chạy 2026-09-13)

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

Kit đã qua Phase 1 (v1) và đã đổi hình dạng sang v2 (skills ở gốc, cài bằng lệnh của từng host, không installer). Hai host đã qua acceptance test. Phần **máy móc** gần như xong; phần **nội dung** — chắt lọc các nguồn thành bộ skill chuẩn — mới đi được 2 trong 11 nguồn cần nội dung. Đang ở giữa mốc **v0.2**, và cổng v0.2 còn 2/3 điều kiện chưa đo trên bản v2.

| Đếm được hôm nay | Số | Lệnh / nguồn |
|---|---|---|
| Skill trong catalog §5.1 đã tồn tại | 11/17 (10 skill hiện + `bk-protocol`) | `ls skills/` |
| — còn thiếu | `bk-map`, `bk-research`, `bk-design`, `bk-perf`, `bk-db`, `bk-ops` | §5.1 |
| Nguồn trong `upstream/sources.json` | 22 (adapt 5 · ideas-only 6 · reference 11) | đọc file bằng `node -e` |
| — nguồn **cần nội dung** (adapt + ideas-only) | 11, đã xong 2 (superpowers, karpathy) | cùng lệnh |
| — nguồn đã có `derived` (chữ thật đã port) | 2 | cùng lệnh |
| Mục trong `NOTICE` | 1 (obra/superpowers) | `grep '^##' NOTICE` |
| Hàng nguồn trong ma trận | 39 (gồm host candidate, tool, và 8 mục owner loại) | `grep -c '^\| [0-9]'` |
| Test | 50/50 xanh | `node --test tests/*.test.cjs` |
| `skills/<name>/tests/` (§5.3 cần ≥3 prompt mỗi skill) | 0/10 | `find skills -type d -name tests` |
| File stack `bk-build/references/stacks/` (§5.5 cần 8) | 0/8 | thư mục chưa tồn tại |
| Host đã pass acceptance | 2/7 (Claude Code, Antigravity) | `docs/hosts.md` |

---

## 2. "Hoàn thành" là gì — 12 mục, hôm nay **2/12**

Đây là bản suy ra từ ba nơi, không phải luật mới: `v1 §17` (Success metrics v1.0), `v2 §13` (hàng v1.0), `v2 §5.3` (quality bar mỗi skill). Kit xem là hoàn thành khi cả 12 dòng dưới đây đóng.

| # | Mục (nguồn) | Đích | Hôm nay |
|---|---|---|---|
| 1 | Catalog đủ skill (v2 §5.1) | 17 | **11/17** |
| 2 | Mỗi skill đạt cả 5 điều kiện quality bar (v2 §5.3) | 17/17 | **0/17** — không skill nào có `tests/` |
| 3 | File stack (v2 §5.5) | 8 | **0/8** |
| 4 | Nguồn cần nội dung đã có quyết định + `NOTICE`/`derived` khi lấy chữ | 11 | **2/11** |
| 5 | Fixed context ≤5,000 đo bằng `/context` trên bản v2 (v1 §17, v2 §12) | 1 số | **chưa đo** |
| 6 | Activation precision ≥0.9 và recall ≥0.9, cả hai host, trên bản v2 (v1 §17) | 2 host | **chưa đo trên v2** |
| 7 | Outcome benchmark: 12 task, kit ≥ Superpowers về pass rate và ít token hơn (v1 §17) | 12 task | **0/12 — chưa có task nào** |
| 8 | `upstream-watch` ra báo cáo delta cho mọi nguồn, tối thiểu mỗi tháng (v1 §17) | 1 lệnh chạy được | **chưa có mã** |
| 9 | `NOTICE` đầy đủ cho mọi nguồn đã port (v1 §17) | không nợ | **đạt** (1 mục cho 1 nguồn đã port; không nghĩa vụ treo) |
| 10 | Không file cấu hình kit nào trong project (v1 §17, v2 §9) | 0 | **đạt theo kiến trúc**, chưa có test canh |
| 11 | Host owner thực dùng đã qua acceptance (v2 §3, câu 8) | 6 | **2/6** (4 host còn lại phải chạy trên máy khác) |
| 12 | Việc phát hành: README EN+VI, CI, marketplace listing, publish từ history squash (v2 §13) | 4 | **0/4** |

**Đọc bảng này thế nào.** Mục 5, 6, 7 là ba phép đo — chúng là điều kiện duy nhất cho câu "kit tốt hơn từng nguồn nó thay thế"; không có chúng thì mọi câu "tốt hơn" đều không được nói ra (ma trận §"Rules for this file"). Mục 7 chưa có một task nào, nên hôm nay **chưa có cơ sở nào** để nói kit tốt hơn Superpowers.

---

## 3. Bảng mốc phát hành (spec §13)

| Mốc | Trạng thái | Ghi chú |
|---|---|---|
| `0.1.0-phase1` | **đã phát hành** 2026-09-11 | layout v1; đo đạc ở `docs/compat/phase-1-gate.md` |
| **v0.2** | **đang làm** | hạng mục ở §4, cổng ở §5 |
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
| 10 | Nguồn bắt buộc 2–4 — `code-review`, `frontend-design`, `claude-code-setup` (+ `pr-review-toolkit`) từ `claude-plugins-official` (Apache-2.0) | **chưa** | `derived: {}` rỗng → chưa chữ nào được port. Khi port phải làm cùng lúc ba việc: ghi nguồn trong file dẫn xuất, thêm mục `NOTICE`, cập nhật `derived` |
| 11 | Các nguồn còn lại theo thứ tự D3 (spec-kit, mattpocock, addyosmani, vercel agent-skills…) | **chưa** | ma trận: phần lớn còn `designed` |
| 12 | §5.3 #3 — `tests/` ≥3 prompt cho **tám** skill của v0.2 | **chưa** | 0/8 (toàn kit 0/10) |
| 13 | §5.3 #4 — activation 2 positive + 1 negative mỗi skill, cả hai ngôn ngữ | **một phần** | bộ 60 prompt nhắm 5 skill (`bk-spec`, `bk-build`, `bk-review`, `bk-debug`, `bk-ship`). Trong tám skill v0.2 còn thiếu `bk-plan`, `bk-close`, và `bk-test` (hiện chỉ là nhánh phụ 2 lần). Ngoài tám: thiếu `bk-audit`, `bk-next` |
| 14 | Guardrail command Biome/Pint (quyết định câu 9, phần v0.2) | **chưa** | `scripts/detect-stack.cjs` có `pint` (dòng 100) và `phpstan` (dòng 101) nhưng **không có biome** ở bất cứ đâu trong `scripts/`, `skills/`, `tests/` — xem §7 (e) |
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
| Bộ activation ≥ số của Phase 1 | **chưa chạy trên bản v2** | mọi kết quả 60-prompt trong `evals/results/` đều ngày 2026-09-10 (layout v1); sau restructure chỉ có acceptance 2 prompt. Đúng cadence §11 (đo ở mốc phát hành) — việc đã lên lịch, không phải nợ quá hạn. **Hệ quả về thứ tự: prompt cho các skill còn thiếu (#13) phải viết TRƯỚC lần chạy này, nếu không sẽ phải chạy hai lần và trả quota hai lần** |
| Fixed context ≤ 5,000 qua `/context` | **chưa đo trên bản v2** | số ~2,650 là của v1 (`docs/compat/phase-1-gate.md`); hai số 43,8xx là so sánh `claude -p` trước/sau khi port Superpowers, và chính file đó nói nó "không thay thế" số gate |

---

## 6. Đang chờ owner

Nguồn thật: `docs/specs/2026-09-12-d5-owner-questions.md`. Không copy nội dung ở đây, chỉ đếm và trỏ.

- **11/21 câu đã chốt** (2026-09-12): câu 1, 2, 3, 4, 5, 6, 8, 9, 12, 14, 16.
- **10 câu còn treo**: 7, 10, 11, 13, 15 (Tier 2 — đang giữ mặc định, không chặn việc nào); 17, 18, 19, 20 (Tier 3 — ghi nhận); 21 (sửa `AGENTS.md`: đọc bởi công cụ có bất biến-không-ghi đã test thì tính ACT hay COUNCIL — điều kiện owner đặt ra nay đã đủ).
- **2 va chạm mới từ phiên doctor, cần owner đọc**: (a) mã `doctor` đã nằm trong cây trước v0.2 trong khi nhãn đã chốt là "v0.3" (câu 4); (b) `doctor` cố ý không gọi `claude plugin list`/`validate` như §6 mô tả, vì trần "không ghi một byte" là bất biến cứng (câu 1).
- **Ngã ba lộ trình (mới, 2026-09-13)**: đi hết chương trình như spec, hay chốt một bản "daily driver" dùng được trước rồi quyết phần đuôi sau. Chưa có quyết định; xem khuyến nghị của lượt rà soát trong phần trả lời phiên 2026-09-13, chưa ghi thành quyết định ở đâu.

---

## 7. Luồng đang mở và lệch hồ sơ

Ba mục đầu (a–c) thừa hưởng từ `docs/handoff/2026-09-12.md`; bốn mục sau (d–g) là phát hiện của lượt rà soát 2026-09-13, **chưa sửa**.

- (a) **`doctor` chưa chạy trên profile thật.** Mọi bằng chứng đến từ HOME giả + kit giả. Nghĩa là bản copy Antigravity ở `~/.gemini/config/plugins/bearingkit` trên máy này chưa được đối chiếu lần nào với checkout — lỗ hổng `3d7b4eb` vẫn mở trên thực địa. Một lệnh là đủ: `node bin/bearingkit.cjs doctor`.
- (b) **Hai nhãn xuất xứ còn treo, chưa sửa**: `docs/plans/2026-09-10-content-backlog.md` ("owner's explicit ask" / "owner's requirement", 2 câu) và `docs/handoff/2026-09-11.md` (dòng "approved by the owner" cho spec v2). Không có bản gốc để đối chiếu.
- (c) **`install-council.md` §6 vẫn đọc như thể doctor có gọi `claude plugin list`.** File council là bản ghi lịch sử nên không sửa; chỗ ghi lệch là câu 1 của batch D5.
- (d) **Bảng D1–D6 trong `docs/handoff/2026-09-11-owner-directives.md` đã cũ**: ghi D4, D5, D6 "**chưa chạy**", trong khi D4 đã ra `docs/specs/2026-09-12-install-council.md`, D5 đã ra `docs/specs/2026-09-12-d5-owner-questions.md`, D6 đã đóng bằng commit `932ea03`. Handoff 2026-09-12 dặn phiên sau "kiểm bảng trạng thái đó trước khi thi hành khối nguyên văn" — mà bảng lại sai theo hướng nguy hiểm nhất: giục làm lại việc đã xong.
- (e) **`coverage-matrix.md` hàng 20 nói `detect-stack` liệt kê biome** ("detect-stack lists biome (and PHP's Pint and PHPStan) among guardrail commands when present"). Đọc mã: chỉ có `laravel/pint` (`scripts/detect-stack.cjs:100`) và `phpstan` (dòng 101); `grep -ri biome scripts/ skills/ tests/` không khớp gì. Mẫu lỗi #2 (dữ kiện sai, xác minh được bằng mã), cùng hạng với `v2 §1:28` đã sửa.
- (f) **`README.md` mục `## License` còn trỏ `package.json`** ("MIT (see `package.json`)") trong khi `LICENSE` đã tồn tại từ `7cbf4be`; `NOTICE` đã được cập nhật, README thì chưa.
- (g) **`AGENTS.md` dòng 3 còn trỏ `core/AGENTS.md`** là "file chỉ dẫn của sản phẩm", nhưng `core/` đã bị xoá trong restructure v2 (`97843c4`) và nội dung đó nay là `skills/bk-protocol/SKILL.md`. Đây là câu đầu tiên mọi agent mới đọc, nên đường dẫn chết ở đúng chỗ đó là loại lệch đắt nhất. Chưa sửa vì nằm ngoài việc owner giao lượt này (sửa từng cái một, không dồn).

**Lượt 2026-09-13 đã ghi gì vào repo:** file này (mới, rồi bổ sung §2 và §8), và **một dòng** trong `AGENTS.md` mục "Where the truth lives" trỏ tới file này — không có gì khác. Bảy mục (a)–(g) ở trên đều chưa sửa.

---

## 8. Rủi ro lớn nhất hiện nay: kit chưa được dùng thật

Ghi lại vì nó không nằm ở đâu khác trong repo: kit đã có 11 skill, 2 host pass acceptance, nhưng **chưa có bằng chứng nào về việc nó được dùng cho một việc thật**. `docs/plans/2026-09-10-owner-migration.md` (Phase 2: bỏ Spartan, bỏ ClaudeKit, bỏ plugin Superpowers) vẫn ở trạng thái `PLANNED`; phép đo duy nhất về profile hằng ngày là 71.9k token memory của bộ kit cũ (`docs/compat/phase-1-gate.md`). Nghĩa là: mỗi phiên viết nội dung cho kit đang được điều khiển bởi bộ kit cũ, không phải bởi kit này.

Hệ quả: các "field lesson" mà spec §5.3 đòi (mỗi dòng trong body phải truy được về một nguồn hoặc một bài học thực địa) không được sinh thêm. `v2 §13` xếp "agents in daily use" vào v0.3, nhưng không có mục nào đòi *skills* in daily use ở bất cứ mốc nào.

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
