# Daily driver: tập con dùng được trước, phần đuôi quyết sau

Status: IN PROGRESS 2026-09-13 · Spec: `docs/specs/2026-09-11-bearingkit-v2-design.md` · Trạng thái dự án: `docs/status.md` · Owner chọn lộ trình B ngày 2026-09-13 (thay cho A "đi hết spec" và C "chỉ dọn nhà").

**Mục tiêu:** đóng một tập con của v0.2 đủ để kit trở thành công cụ dùng hằng ngày của owner, rồi **đo một lần**, rồi mới quyết phần đuôi (6 skill còn lại, pack, 4 host trên máy khác, `upstream-watch`, publish). Không mốc mới nào được đặt tên trong spec; đây là thứ tự thực thi bên trong v0.2, không phải phiên bản mới.

**Không nằm trong plan này:** `bk-design`, `bk-db`, `bk-perf`, `bk-ops`, `bk-map`, `bk-research`; pack tuỳ chọn; hook push/deploy; 4 host trên máy khác; benchmark 12 task; `upstream-watch`; publish. Chúng giữ nguyên vị trí spec đã xếp.

**Quy ước:** LF, không BOM, conventional commit, mỗi task có dòng `Check:` phải xanh trước khi qua task sau, handoff ghi đè trước commit cuối mỗi phiên.

---

## Ba điều lộ trình B **không** tự động cho phép

Ghi ra để không có quyết định nào của owner bị đảo lặng lẽ:

1. **Câu 12 giữ nguyên.** `bk-design` vẫn chờ "inventory §5.2 hoàn tất chính thức". Plan này không tuyên bố kiểm kê đã hoàn tất; nó chỉ làm kiểm kê **mức từng mục cho những nguồn nó thật sự port** (Task 5).
2. **Nguyên tắc 9 giữ nguyên.** Đo đạc chỉ ở mốc, tại Task 8 — không có canary benchmark sớm (R6 vẫn là đề xuất chưa được gật).
3. **Thứ tự file stack** (`typescript-react`, `kotlin`, `sql` trước) là thứ tự thực thi, không sửa danh sách 8 stack của §5.5 — câu đó tự ghi "at first; others as the inventory shows sources".

## Một quyết định cần owner, phát hiện khi lên plan

Mô tả lộ trình B nói "3 nguồn bắt buộc còn lại", nhưng **một trong ba không thể hạ cánh trong plan này**: `frontend-design` có đích là `bk-design`, mà `bk-design` bị câu 12 chặn. Hai đường:

- **(i) mặc định, đang áp:** port 2 nguồn (`code-review` + `pr-review-toolkit`, `claude-code-setup`); `frontend-design` chờ. Giữ câu 12 nguyên vẹn.
- **(ii)** owner bỏ điều kiện của câu 12 cho riêng `bk-design` để `frontend-design` hạ cánh trong plan này.

**Owner chốt 2026-09-14: đường (ii).** `bk-design` được tạo trong plan này và `frontend-design` hạ cánh vào đó; điều kiện của câu 12 vẫn áp cho mọi skill khác. Ghi vào nguồn thật: `docs/specs/2026-09-12-d5-owner-questions.md` câu 12. Việc này thành Task 6b dưới đây.

---

## Tasks

- [x] **Task 0 · Dọn lệch hồ sơ.** *(xong 2026-09-13, commit `8f2825c`)* Sửa `status.md` §7 mục (d) bảng D1–D6 (ghi đúng D4/D5/D6 đã xong, kèm artefact), (e) `coverage-matrix.md` hàng 20 (bỏ khẳng định `detect-stack` liệt kê biome, ghi đúng: chỉ pint/phpstan, biome là việc của Task 7), (f) `README.md` mục License (trỏ `LICENSE`). **Không** sửa (a) doctor-chưa-chạy (việc của owner), (b) hai nhãn xuất xứ (không có bản gốc), (c) `install-council.md` §6 (bản ghi lịch sử), (g) `AGENTS.md` dòng 3 (đề xuất, chờ owner). *Check:* `grep -n 'chưa chạy' docs/handoff/2026-09-11-owner-directives.md` không còn khớp D4–D6; `grep -in biome docs/specs/2026-09-10-coverage-matrix.md` không còn câu khẳng định; toàn bộ suite `node --test tests/*.test.cjs` xanh.
- [x] **Task 1 · Dogfood, bắt đầu ngay và chạy song song.** *(owner chạy 2026-09-13: phiên `--plugin-dir` trên profile hằng ngày + `doctor`; bốn field lesson thu được, ghi ở `docs/handoff/2026-09-13.md`. Vẫn để mở như việc chạy liên tục.)* Owner mở repo này bằng `claude --plugin-dir C:\Projects\Bearingkit` (không cài vào profile, không mục kit nào trong `settings.json`; host vẫn ghi transcript của chính nó như mọi phiên). Mỗi phiên sau đó ghi vào handoff: skill nào được gọi, chỗ nào router chọn sai, câu nào trong body vô dụng. *Check:* handoff của phiên kế tiếp có mục "field lessons từ dùng thật" với ít nhất một dòng cụ thể `file:line`.
- [x] **Task 2 · Dòng provenance cho mỗi `SKILL.md`.** *(xong 2026-09-13: 11/11 file có dòng `Sources:`; test mới đã thấy đỏ trước — `bk-audit: body needs exactly one line starting "Sources:"` — rồi xanh; suite 50 → 51)* 11 skill (10 skill hiện + `bk-protocol`), mỗi body một dòng nêu nguồn và license mode (lấy từ cột "Adapted from" của v1 §7.1 và `upstream/sources.json`), trỏ `NOTICE`. Thêm assertion vào `tests/skills.test.cjs`: mọi `SKILL.md` phải có dòng đó. *Check:* test mới thấy đỏ trước khi sửa, xanh sau; đóng nửa đầu của `v1 §17` mục provenance cho 11 skill đang tồn tại (§5.3 #2 đòi truy từng dòng luật, dòng này chưa chứng minh được điều đó).
- [x] **Task 2b · Audit mã và sửa bốn lỗi** *(ngoài kế hoạch gốc, owner yêu cầu 2026-09-13: "audit kỹ toàn bộ code")*. Bốn lỗi đều xác minh bằng lệnh trước khi sửa, mỗi lỗi một test: `record-guardrail` không tạo được state (đường ghi guardrail của §8 chết trong v2), `bin` dispatch tên trên `Object.prototype` rồi thoát 0, `doctor` bỏ qua `--dest`, marker của bản copy Antigravity ghi sau payload. Suite 51 → 56. Chi tiết ở `CHANGELOG.md`.
- [x] **Task 3 · Activation prompt còn thiếu.** *(xong 2026-09-14: 15 prompt, bộ 60 → 75; `tests/evals.test.cjs` cập nhật; thêm bất biến "mỗi skill tồn tại phải có ≥2 positive", đã chứng minh không rỗng bằng cách bỏ tạm 2 prompt của `bk-next` → đỏ đúng chỗ; một test cũ (`--per-intent`) đỏ theo vì bộ dữ liệu lớn lên, đã sửa số và siết assertion từ 6 lên 11 intent. Suite 56 → 57.)* 5 skill không có prompt (`bk-plan`, `bk-close`, `bk-audit`, `bk-next`) và `bk-test` (hiện chỉ là nhánh phụ): mỗi skill 1 positive EN + 1 positive VI + 1 negative → 15 prompt, bộ 60 thành 75. **`tests/evals.test.cjs` đang khẳng định "sixty prompts, six intents, ten each" nên sẽ đỏ** — cập nhật cùng lúc, giữ bất biến thật (mỗi intent cân EN/VI/negative, id không trùng). *Check:* `node --test tests/evals.test.cjs` xanh với 75 prompt; không prompt nào của skill mới trùng cụm từ với skill lân cận.
- [x] **Task 4 · `skills/<name>/tests/` cho tám skill lifecycle.** *(xong 2026-09-14: 24 case, 3 cho mỗi skill, mỗi case có bốn mục Prompt/Setup/Expected/Fails if; static check thấy đỏ trước — `bk-spec: no tests/ directory` — rồi xanh. Suite 58 → 59.)* Mỗi skill ≥3 prompt kèm kết quả mong đợi, định dạng Skillmark-compatible (§11). Thêm static check: skill trong danh sách tám phải có `tests/` với ≥3 file hoặc ≥3 mục. *Check:* check mới đỏ trước, xanh sau; §5.3 #3 đóng cho 8/8.
- [ ] **Task 5 · Port `code-review` + `pr-review-toolkit` (Apache-2.0).** Kiểm kê mức từng mục **chỉ cho hai nguồn này** (absorb/idea/drop mỗi item, ghi vào `skill-inventory.md`), rồi hạ cánh vào `bk-review` (phương pháp, lenses) và `bk-test` (test lens). Ba việc cùng lúc: file dẫn xuất nêu nguồn ở đoạn mở đầu, `NOTICE` thêm mục giữ nguyên attribution notice gốc, `upstream/sources.json` cập nhật `derived`. *Check:* `tests/skills.test.cjs` (provenance/derived) xanh; ma trận hàng 2 chuyển sang `absorbed` với đúng định nghĩa của nó.
- [ ] **Task 6 · Port `claude-code-setup` (Apache-2.0), phạm vi đã cắt ở D3 rank 7.** Đích: các mục kiểm của `doctor` và `bk-close`. Cùng ba việc provenance như Task 5. *Check:* như trên; `tests/doctor.test.cjs` xanh sau khi thêm mục kiểm.
- [ ] **Task 6b · Tạo `bk-design` và port `frontend-design` (Apache-2.0)** *(mở khoá bởi quyết định (ii), 2026-09-14)*. Kiểm kê mức từng mục chỉ cho nguồn này, rồi viết body theo §5.4 và một `references/` mang chữ đã port. Ba việc provenance như Task 5. **Thứ tự bắt buộc:** `tests/evals.test.cjs` nay đòi mỗi skill tồn tại phải có ≥2 prompt positive, nên tạo thư mục skill mà chưa thêm prompt sẽ làm suite đỏ — viết 2 positive + 1 negative cho `bk-design` **cùng lượt** với skill. *Check:* suite xanh; `NOTICE` có mục Apache-2.0 của nguồn; `upstream/sources.json` có `derived`; ma trận hàng 2 và hàng 22 ghi đúng provenance đã chốt ở câu 14.
- [ ] **Task 7 · Ba file stack + guardrail Biome.** `bk-build/references/stacks/{typescript-react,kotlin,sql}.md`, mỗi file mở bằng version card; nguyên liệu: awesome-cursorrules (CC0), vercel `react-best-practices`, tài liệu vendor, field lesson của owner. Cùng lúc: thêm biome vào `scripts/detect-stack.cjs` (quyết định câu 9, phần v0.2) và test cho nó. *Check:* `node --test tests/detect-stack.test.cjs` có case biome xanh; ba file được `bk-build`/`bk-test`/`bk-review` trỏ tới đúng đường.
- [ ] **Task 8 · Cổng đo, một lần, một phiên.** Acceptance 2 prompt trên Claude Code và Antigravity; bộ 75 prompt trên Claude Code (`claude -p --plugin-dir`, profile cách ly, fixture staged) và trên Antigravity qua driver; một lần đọc `/context`. Thông báo trước khi tiêu quota. Số vào `docs/compat/<date>-daily-driver-gate.md`, cột measurement của ma trận, `docs/status.md` §2 và §5. *Check:* báo **hai số tách nhau**, không gộp — (1) **tập con Phase 1, 60 prompt**, so trực tiếp với 57/60 và 0 false activation của lần chạy sạch 2026-09-10: đây là cổng; (2) **15 prompt mới**, đọc lần đầu, **không có đường cơ sở** nên không được diễn giải là tiến bộ hay thụt lùi. Lý do tách: bộ đo đã lớn lên và 3 negative mới `expect: none` cũng chảy vào bộ đếm `falseActivations` toàn cục của `summarize()`, nên một con số gộp trên 75 prompt không so được với bất cứ số nào đã công bố. Cộng: fixed context ≤5,000 đọc bằng `/context` trong profile cách ly; và 2 câu acceptance chạy trong profile thật (owner gật phạm vi 2026-09-14).
- [ ] **Task 9 · Đóng lộ trình B và quyết phần đuôi.** Viết một mục trong `docs/status.md` §2 với điểm mới, rồi đưa owner ba câu: 6 skill còn lại làm theo thứ tự nào; `frontend-design`/`bk-design` (đường (i) hay (ii)); benchmark 12 task làm ngay hay chờ v1.0. *Check:* handoff ghi lựa chọn của owner; plan này chuyển `Status: CLOSED`.

---

## Rủi ro của plan này

| Rủi ro | Cách chặn |
|---|---|
| Task 3 và 4 phình ra thành viết-nội-dung thay vì viết-phép-đo | prompt chỉ cần đủ để phân biệt skill với skill lân cận; không viết lại body ở hai task đó |
| Task 8 tiêu quota rồi phát hiện còn thiếu prompt | Task 3 và 4 **phải** xong trước Task 8; đó là lý do chúng đứng trước các task port |
| Dogfood sinh ra đòi hỏi sửa body giữa plan | field lesson được ghi vào handoff, không sửa body ngoài task; sửa body là việc của sprint skill |
| Port Apache-2.0 làm mà quên nghĩa vụ | ba việc provenance là một dòng `Check:` của chính task, không phải việc dọn sau |
