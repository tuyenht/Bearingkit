# Trạng thái dự án Bearingkit

Cập nhật: **2026-10-08, P5b đã đóng: bản chữ mới của `bk-plan` ở `main` (`8a74217`) theo lời owner; bản cài hằng ngày chưa cập nhật.** Nhãn được dùng cho `bk-plan`: đạt ngưỡng đã đăng ký trên `plan-01`, `claude-sonnet-5-5`, ở lượt đo thứ hai của bản chữ, theo cách đọc B kèm F do owner chọn đích danh; tốt hơn `superpowers:writing-plans` như đã đọc trên task và model đó; với `to-tickets`: chưa so. Không được nói: lượt hai lặp lại lượt đầu, hai lượt gộp lại, điều gì về "Sonnet" nói chung, hay guard cho thấy bản chữ có tác dụng (không phiên guard nào đọc bản chữ đã sửa). P5a (`bk-spec`, task `spec-01`): owner đóng, **không merge**, chữ giữ ở nhánh `p5a-bk-spec`. Diễn biến P5a và P5b: hai spec của chúng và phụ lục 2026-10-08 của `docs/status-history.md`. P5c (`docs/specs/2026-10-08-p5c-shared-code-design.md`): giai đoạn 1 đã đăng ký theo lời owner, một phiên không đếm đã chạy, dấu hiệu nạp `bk-build` chờ owner duyệt, chưa phiên đếm nào chạy; hướng `bk-spec` đã được duyệt (`docs/specs/2026-10-08-bk-spec-stack-reach-proposal.md`); rồi `c-cpp`. Phiên gần nhất: `docs/handoff/2026-10-08-p5c-proposal.md` (công tắc tự lái `PAUSE`). Lộ trình: `docs/plans/2026-09-26-v03-roadmap.md`. Lịch sử file này (nguyên văn tới `b89eb36`; các đoạn rời đi 2026-10-08): `docs/status-history.md`; mọi tham chiếu "status §N" hay "status §7 (xx)" viết trước 2026-09-26 trỏ về đó.

> **File này là bảng điều khiển, không phải nguồn sự thật.** Nó chỉ đếm và trỏ; nội dung thật nằm ở:
> - thiết kế: `docs/specs/2026-09-11-bearingkit-v2-design.md` (§13 bảng mốc, §15 log quyết định);
> - câu hỏi và quyết định của owner: `docs/specs/2026-09-12-d5-owner-questions.md` (nguồn thật duy nhất);
> - trạng thái phiên, luồng đang mở: file mới nhất trong `docs/handoff/`;
> - kế hoạch: `docs/plans/`; đo đạc: `docs/compat/` và các spec sprint; host: `docs/hosts.md`.

---

## 1. Đang ở đâu

Mốc **v0.3**, mục 7 của thứ tự v0.3: năm file stack. `node.md`, `python.md`, `php-laravel.md` và `shell.md` đã vào `main`; còn `c-cpp` (toolchain MSYS2 UCRT64 đã cài 2026-10-01, chờ thiết kế). So với skill nguồn, tám phiên xen kẽ mỗi bên: **không khác biệt rõ** (`node-01` p = 1,0; `py-01` p = 0,2; `php-01` p = 1,0). `php-laravel.md` trượt guard lần đầu vì không được đọc (0/8); bước 1 mới của `bk-build` (chạy `detect-stack`, mở mọi file trong `stackFiles`) đo 2026-10-01: file mở 6/8 so với 1/8, p = 0,041, guard đạt → merge (`docs/specs/2026-10-01-bk-build-stack-reach-design.md`). P4b (2026-10-01): `detect-stack` nêu `sql.md` và `shell.md` theo nội dung cây; `sql.md` mở 8/8 trên `php-01` → merge (`docs/specs/2026-09-28-topic-stackfiles-design.md`). `shell.md` (2026-10-01, lặp lại 2026-10-02): `shell-01` (PowerShell 5.1) là task stack đầu tiên qua hiệu chỉnh; kit có file so với kit chưa có: p = 0,0016, **lặp lại được vào ngày khác** (p = 0,0003); so với `fullstack-dev-skills` p = 0,0005 (tốt hơn trên task này); **so với chữ của nguồn**, khi nguồn được đọc 8/8: **không khác biệt rõ** (p = 0,34); không câu nào được nói `shell.md` tốt hơn nguồn (`docs/specs/2026-10-01-stack-shell-design.md`). Bước 0 (2026-09-30): không merge, giữ nhánh; manh mối đo riêng ở P5. Sáu sprint lifecycle đầu đã xong (`bk-review`, test case `bk-audit`/`bk-next`, khung benchmark, `bk-debug`, `bk-test`, `bk-build`); còn `bk-spec` (P5a đóng, chưa merge) và P5c (dòng Bước 0), `bk-ship` + `bk-close` (P6), cổng v0.3 (P7); `bk-plan` (P5b) đã vào `main` 2026-10-07.

| Đếm được hôm nay | Số | Lệnh / nguồn (chạy lại 2026-09-26) |
|---|---|---|
| Skill trong catalog §5.1 | **18/18** (17 skill và `bk-protocol`) | `ls skills/` |
| Nguồn trong `upstream/sources.json` | **23**: 12 `reference`, 6 `ideas-only` (một ghi "clean-room"), 5 `adapt` (hai có giới hạn phạm vi ghi trong cột mode) | `node -e` đọc file |
| Nguồn cần nội dung (adapt + ideas-only) đã xong | **3/11** (superpowers, karpathy, claude-plugins-official một phần); mattpocock đang làm (4 mục dẫn xuất) | cùng file |
| Nguồn có `derived` (chữ thật đã port) | **4** nguồn, **29** mục dẫn xuất trên **27** file kit | `_build/v03-prep/recount-status-numbers.cjs` |
| Mục trong `NOTICE` | **3** (anthropics/claude-plugins-official, mattpocock/skills, obra/superpowers) | `grep '^##' NOTICE` |
| Kiểm kê từng mục (§5.2) | **1.295** mục của **22/22** nguồn: 46 absorb, 610 idea, 639 drop, 0 lệch | `node scripts/inventory-items.cjs totals docs/specs/2026-09-18-item-inventory.md` |
| Test | **233/233** xanh trên Windows (2026-10-08 trên `main`; `bench-node-01` nhạy tải: từng trượt khi máy bận, chạy lại thì xanh) (trên worktree không có `_build/upstream`: một test bỏ qua) | `node --test tests/*.test.cjs` |
| Prompt activation | **96** ở `phase-1.jsonl`, **6** ranh giới, **2** acceptance | `evals/activation/*.jsonl` |
| Case trong `skills/<name>/tests/` | **17/17** skill, **56** case (`bk-protocol` không cần) | `recount-status-numbers.cjs` |
| File stack `bk-build/references/stacks/` | **7/8** trên `main` (`typescript-react`, `kotlin`, `sql`, `node`, `python`, `php-laravel`, `shell`) | `ls` |
| Task benchmark trong `evals/bench/` | **15** trên `main` (`build-01`, `debug-01`, `node-01`, `php-01`, `plan-01` (chấm bằng hai người đọc mù; hồ sơ về `main` 2026-10-08), `py-01`, `shell-01`, `shell-01-src` (cùng fixture, nhánh S là nguồn đã bọc), `spec-01` (chấm bằng hai người đọc mù), `probe-review-authored`, `review-01`…`04`, `test-01`) | `ls evals/bench/*/task.json` |
| Hàng nguồn trong ma trận | **39** | `grep -c '^\| [0-9]' docs/specs/2026-09-10-coverage-matrix.md` |
| Host đã qua acceptance | **2/7** (Claude Code, Antigravity; bảy host của `docs/hosts.md`, trong đó Copilot CLI và Factory Droid chung một mục. §2 mục 11 là chỉ số khác: 2/6 host owner thực dùng, câu 8) | `docs/hosts.md` |
| Bootstrap protocol | **6.485/6.500** ký tự | proxy của `tests/session-start.test.cjs`, đo lại 2026-09-26 |
| Bản cài hằng ngày | `e410f4d` ở cả scope user lẫn local (2026-10-01, owner nói có); kho Antigravity làm mới từ checkout chính ở `e410f4d`; `main` đi trước: từ `8a74217` (2026-10-07) có bản chữ mới của `skills/bk-plan/` mà bản cài chưa có, nên `doctor` báo `FAIL` ở dòng `skills/` (đo 2026-10-08 trên `main`: năm `ok`, một `skip`, một `FAIL`) cho tới khi owner cập nhật | `claude plugin list` 2026-10-02 (thừa hưởng); `git diff --stat e410f4d main -- skills` 2026-10-07; `bearingkit doctor` 2026-10-08 |

## 2. "Hoàn thành" là gì — 12 mục: 2 đạt có phép đo, 1 đạt theo thiết kế, 9 chưa

Suy ra từ `v1 §17`, `v2 §13` (hàng v1.0), `v2 §5.3`. Số không chạy lại trong phiên này ghi "thừa hưởng" kèm ngày.

| # | Mục | Đích | Hôm nay |
|---|---|---|---|
| 1 | Catalog đủ skill (v2 §5.1) | 18 | **18/18** |
| 2 | Mỗi skill đạt cả 5 điều kiện quality bar (v2 §5.3) | 18/18 | **0/18 đủ cả năm; 17 đạt 4/5** (thừa hưởng 2026-09-24). Thiếu chung: **#2**, mỗi dòng luật truy được về nguồn hoặc field lesson |
| 3 | File stack (v2 §5.5) | 8 | **7/8** trên `main` (`node` P3b, `python` P3c, `php-laravel` và `shell` 2026-10-01); `c-cpp` chưa (toolchain đã cài 2026-10-01, câu 38 (c); chờ thiết kế file và task) |
| 4 | Nguồn lấy chữ hoặc lấy ý có quyết định, kèm `NOTICE`/`derived` khi lấy chữ | 11 | **3/11** |
| 5 | Fixed context ≤5.000 qua `/context` (v1 §17, v2 §12) | 1 số | **Đạt trên Claude Code, ≈4.010** sau `bk-research` (thừa hưởng 2026-09-23, `docs/specs/2026-09-23-bk-research-design.md`); sau `bk-perf` chưa đọc lại bằng `/context` |
| 6 | Activation precision và recall ≥0,9, cả hai host | 2 host | **Đạt 2/2** (thừa hưởng: Claude Code 2026-09-16 recall 0,958, precision 1,000; Antigravity 2026-09-17 recall và precision 0,979, chấm lại 2026-09-20). Chi tiết: `docs/compat/2026-09-16-daily-driver-gate.md` |
| 7 | Outcome benchmark 12 task, kit ≥ nguồn về pass rate và ít token hơn | 12 task | **Chưa task nào đạt tiêu chí (kit ≥ nguồn và ít token hơn).** Trước `shell-01`, mọi task Sonnet không phân biệt được kit với sàn về kết quả; `shell-01` (2026-10-01) là task đầu tiên phân biệt được, lặp lại được 2026-10-02 (kit có `shell.md` trên sàn và trên `fullstack-dev-skills`; so với chữ của nguồn, nguồn được đọc: không khác biệt rõ, p = 0,34; chi phí trung vị trên sàn 47% ở lượt đầu); `spec-01` (2026-10-03, task đọc cho `bk-spec`): sàn H 7, 7, 6 trên 7, không dùng được; hai lượt guard: trượt G2 (3/8, 4/8), không merge; nguồn chưa so (0/8, 3/8 phiên nạp skill nguồn); owner chọn đo quy trình và chi phí theo từng sprint (`docs/specs/2026-09-24-benchmark-kit-vs-sources-design.md`). Số so với nguồn: `bk-review` (ngang), `bk-debug` (ngang); `bk-test`, `bk-build` chưa so. Chi phí kit trên Sonnet: khoảng 1,9–2,1 lần sàn trên `debug-01`, `test-01`, `build-01`; khoảng 7 lần sàn trên `review-01` (reviewer Opus) |
| 8 | `upstream-watch` báo delta mỗi nguồn, tối thiểu mỗi tháng | 1 lệnh | **chưa có mã** |
| 9 | Mỗi skill mang provenance và license mode; `NOTICE` đủ | 18 + `NOTICE` | **18/18**, có test canh (`tests/skills.test.cjs`) |
| 10 | Không file cấu hình kit trong project | 0 | **Đạt theo kiến trúc**; `bearingkit activate` chỉ ghi vào file của chính host |
| 11 | Host owner dùng đã qua acceptance | 6 | **2/6** (4 host còn lại phải chạy trên máy khác) |
| 12 | Phát hành: README EN+VI, CI, marketplace, publish từ history squash | 4 | **0/4** |

## 3. Mốc phát hành (spec §13)

| Mốc | Trạng thái | Trỏ tới |
|---|---|---|
| `0.1.0-phase1` | đã phát hành 2026-09-11 | `docs/compat/phase-1-gate.md` |
| v0.2 | cổng đo đạt từ 2026-09-17; còn hạng mục #11 (các nguồn còn lại); chắt lọc tám skill lifecycle đang làm trong v0.3 | `docs/status-history.md` §4, §5 |
| **v0.3** | **đang làm**: catalog đủ; sprint lifecycle tới `bk-build` xong; còn một file stack (`c-cpp`, toolchain đã có), `bk-spec` (P5a đóng, chưa merge; `bk-plan` đã vào `main` 2026-10-07), `bk-ship`/`bk-close`, cổng | `docs/plans/2026-09-26-v03-roadmap.md` |
| v0.4 | chưa bắt đầu: pack tuỳ chọn, hook push/deploy (Biome/Pint, câu 9), acceptance Gemini CLI / Cursor / Codex | spec §13 |
| v1.0 | chưa bắt đầu: outcome benchmark đủ 12 task, `upstream-watch`, README EN+VI, CI, marketplace, publish từ history squash | spec §13 |

## 4. Đang chờ owner

- **38/38 câu D5 có quyết định** (`docs/specs/2026-09-12-d5-owner-questions.md`). Mới nhất: câu 38 (2026-09-27), cách đo ba file stack còn lại của P4 (`c-cpp`: toolchain đã cài 2026-10-01, chờ thiết kế).
- Việc chờ owner của phiên đang mở: mục Decisions waiting của handoff mới nhất. Mới nhất (`docs/handoff/2026-10-08-p5c-proposal.md`): duyệt dấu hiệu nạp của P5c; commit hai chỗ trong `docs/specs/2026-10-08-autopilot-stale-lines-proposal.md`; cập nhật bản cài hằng ngày (`doctor` báo `FAIL` ở dòng `skills/` cho tới khi đó); đề xuất sửa luật tự lái `docs/specs/2026-10-06-autopilot-amendments.md` (chưa áp dụng gì).

## 5. Luồng mở mang từ bản cũ của file này

Chữ đầy đủ ở `docs/status-history.md`, §7, theo nhãn. Luồng của phiên thuộc handoff mới nhất, không lặp ở đây.

| Nhãn | Việc, một dòng |
|---|---|
| (b) | Hai nhãn xuất xứ còn treo trong `content-backlog.md` và `handoff/2026-09-11.md` |
| (c) | `install-council.md` §6 đọc như thể `doctor` gọi `claude plugin list`; file lịch sử, không sửa |
| (ff) | Protocol còn 15 ký tự dưới trần; mọi hàng router mới phải trả bằng cắt |
| (qq) | Profile đo từng nạp connector claude.ai của tài khoản owner (không phiên nào gọi) |
| (rr) | Còn một trường hợp con số lấy từ kiến thức chung sau bản sửa `ed8aaeb` |
| (tt) | Antigravity mở `bk-review` cho `rev-neg-01` (nhãn `none`) |
| (ss) | `bnd-en-01` chưa có lần đọc sạch trong gói đo `bk-perf` |
| (ll) | Hàng đợi đo từng nằm cạnh kho, một hội thoại đã đi tới nó |
| (gg) | `database-playbook` của owner và `bk-db` trả lời cùng câu hỏi database |
| (aa) | `bk-design` chưa trỏ tới Web Interface Guidelines của Vercel dù đã quyết |
| (p) | `npx <bin>` có thể tự tải package khi không có TTY; chưa kiểm thật |
| (n) | `q-en-01` trỏ file fixture không có; cố ý không sửa (đường cơ sở Phase 1) |
| (m) | Ba lỗi mã để lại có chủ đích sau audit 2026-09-13 |
| (l) | Bản copy Antigravity chỉ có mặt trong lượt đo |
| (r), (q) | Bản ghi hai sự cố đã xử lý, giữ để tra |

## 6. Việc của các mốc sau

- **v0.3**: 8 file stack; `bk-spec` (P5a đóng, chưa merge), P5c, `bk-ship`/`bk-close` (có `--verify`, câu 34); một lượt chấp nhận Antigravity ngắn (câu 34, đã duyệt).
- **v0.4**: pack tuỳ chọn kiểm kê chứng minh được; hook push/deploy; acceptance thật cho Gemini CLI, Cursor, Codex, Copilot CLI trên máy khác (câu 8).
- **v1.0**: outcome benchmark 12 task; `upstream-watch`; README EN+VI; CI; marketplace; publish từ history squash sau khi grep tên project riêng.

## 7. Cách cập nhật file này

1. Ở bước đóng phiên, **thay** các ô và dòng "Cập nhật", không chèn thêm đoạn "Trước đó…": lịch sử thuộc handoff và `docs/status-history.md`.
2. Đổi một ô thì đổi cả ô bằng chứng; không có bằng chứng thì ghi "chưa đo".
3. Không thêm quyết định, câu hỏi hay luận điểm mới: chúng thuộc `d5-owner-questions.md` hoặc spec.
4. Số không chạy lệnh lại trong phiên thì ghi "thừa hưởng" kèm ngày, hoặc bỏ.
5. Giữ file dưới khoảng 15 KB; vượt thì chuyển phần cũ sang `docs/status-history.md` nguyên văn (quyết định của owner 2026-09-26).
