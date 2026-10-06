# Trạng thái dự án Bearingkit

Cập nhật: **2026-10-06, P5b: lượt đo `plan-01` xong, trượt sát, không merge** (máy owner; P5a (`bk-spec`, task `spec-01`): sàn H 7, 7, 6 trên 7 nên task không dùng được; đường guard, hai lượt 2026-10-03 (24 phiên mỗi lượt): H ngang K-trước, G2 3/8 rồi 4/8 (cần 6/8), `domain-language.md` mở 5/8 rồi 0/8 (cần 4/8) → **không merge**, owner đóng P5a, chữ giữ ở nhánh `p5a-bk-spec`; P5b (`bk-plan`, task `plan-01`, mọi thứ trên nhánh `p5b-bk-plan`): fixture, rubric đóng băng và công cụ đọc đã dựng; ba phiên sàn 2026-10-05, hai người đọc mù (Sonnet và Opus) khớp 15/15 ô: P 2, 0, 2 trên 5, O1 3/3 → **task dùng được**; rubric sửa hai lần theo quyết định của owner (đóng băng lần ba), cổng thử 14 plan **đạt** (mỗi người đọc 70/70 ô bẫy), sàn dưới rubric đang dùng: P 0, 0, 0; chữ mới của `bk-plan` viết xong và **đóng băng ở `7896625`** (chỉ trên nhánh, chưa vào `main`); lượt đo bốn nhánh (8 phiên mỗi nhánh, 2026-10-06): P kit mới 3,875 so với kit cũ 2,625, p = 0,057 (ngưỡng 0,05) → **trượt sát**, G2 5/8 (cần 6/8), reach và O1/O2 đạt → **không merge**; so với `superpowers:writing-plans` như phiên nguồn đã đọc (8/8): tốt hơn trên `plan-01`, Sonnet (p = 0,00047); chờ owner chọn đóng P5b hay đóng băng lần hai; rồi P5c, `c-cpp`). Phiên gần nhất: `docs/handoff/2026-10-06-p5b-run-result.md`. Lộ trình: `docs/plans/2026-09-26-v03-roadmap.md`. Lịch sử của file này, nguyên văn tới commit `b89eb36`: `docs/status-history.md`; mọi tham chiếu "status §N" hay "status §7 (xx)" viết trước 2026-09-26 trỏ về đó.

> **File này là bảng điều khiển, không phải nguồn sự thật.** Nó chỉ đếm và trỏ; nội dung thật nằm ở:
> - thiết kế: `docs/specs/2026-09-11-bearingkit-v2-design.md` (§13 bảng mốc, §15 log quyết định);
> - câu hỏi và quyết định của owner: `docs/specs/2026-09-12-d5-owner-questions.md` (nguồn thật duy nhất);
> - trạng thái phiên, luồng đang mở: file mới nhất trong `docs/handoff/`;
> - kế hoạch: `docs/plans/`; đo đạc: `docs/compat/` và các spec sprint; host: `docs/hosts.md`.

---

## 1. Đang ở đâu

Mốc **v0.3**, mục 7 của thứ tự v0.3: năm file stack. `node.md`, `python.md`, `php-laravel.md` và `shell.md` đã vào `main`; còn `c-cpp` (toolchain MSYS2 UCRT64 đã cài 2026-10-01, chờ thiết kế). So với skill nguồn, tám phiên xen kẽ mỗi bên: **không khác biệt rõ** (`node-01` p = 1,0; `py-01` p = 0,2; `php-01` p = 1,0). `php-laravel.md` trượt guard lần đầu vì không được đọc (0/8): khi `bk-build` là skill vào đầu, phiên ít chạy `detect-stack` và bỏ qua `stackFiles`; bản sửa (bước 1 mới của `bk-build`: chạy `detect-stack`, mở mọi file trong `stackFiles`) đo 2026-10-01: file mở 6/8 so với 1/8, p = 0,041, guard `php-01` và `build-01` đạt → merge (`docs/specs/2026-10-01-bk-build-stack-reach-design.md`). P4b (2026-10-01): `detect-stack` nêu `sql.md` khi cây có `*.sql` hay thư mục migration (và `shell.md`); trên `php-01` `sql.md` mở 8/8 (sàn không nêu: 0/8), `build-01` 8/8, so với nguồn không khác biệt rõ (p = 1,0) → merge (`docs/specs/2026-09-28-topic-stackfiles-design.md`). `shell.md` (2026-10-01): task `shell-01` (PowerShell 5.1) là task stack đầu tiên qua hiệu chỉnh (sàn Sonnet 4, 4, 5 trên 6 hazard); kit có file so với kit chưa có: H trung bình 5,75 so với 4,38, p = 0,0016, **lặp lại được vào ngày khác** (2026-10-02: 5,88 so với 3,75, p = 0,0003); so với `fullstack-dev-skills` p = 0,0005 (tốt hơn trên task này); **so với chữ của nguồn** (hai skill của Antigravity-Core bọc thành plugin): để tự nhiên thì không phiên nào mở nguồn (0/8, 2026-10-01); khi mỗi bên được bảo dùng skill của mình (2026-10-02, sau một bản sửa đăng ký thêm một luật quyền, theo quyết định của owner) nguồn được đọc 8/8 và **không khác biệt rõ** (kit 5,13 so với 4,13, p = 0,34; một phiên kit ra script hỏng ở đường thường, H = 0; "làm theo" nguồn 5/8); không câu nào được nói `shell.md` tốt hơn nguồn; `detect-stack` giờ trả hồ sơ cho dự án không manifest có script hay SQL (`docs/specs/2026-10-01-stack-shell-design.md`). Bước 0 (2026-09-30): không merge, giữ nhánh; manh mối đo riêng ở P5. Sáu sprint lifecycle đầu đã xong (`bk-review`, test case `bk-audit`/`bk-next`, khung benchmark, `bk-debug`, `bk-test`, `bk-build`); còn `bk-spec` + `bk-plan` (P5), `bk-ship` + `bk-close` (P6), cổng v0.3 (P7).

| Đếm được hôm nay | Số | Lệnh / nguồn (chạy lại 2026-09-26) |
|---|---|---|
| Skill trong catalog §5.1 | **18/18** (17 skill và `bk-protocol`) | `ls skills/` |
| Nguồn trong `upstream/sources.json` | **23**: 12 `reference`, 6 `ideas-only` (một ghi "clean-room"), 5 `adapt` (hai có giới hạn phạm vi ghi trong cột mode) | `node -e` đọc file |
| Nguồn cần nội dung (adapt + ideas-only) đã xong | **3/11** (superpowers, karpathy, claude-plugins-official một phần); mattpocock đang làm (3 mục dẫn xuất) | cùng file |
| Nguồn có `derived` (chữ thật đã port) | **4** nguồn, **28** mục dẫn xuất trên **26** file kit | `_build/v03-prep/recount-status-numbers.cjs` |
| Mục trong `NOTICE` | **3** (anthropics/claude-plugins-official, mattpocock/skills, obra/superpowers) | `grep '^##' NOTICE` |
| Kiểm kê từng mục (§5.2) | **1.295** mục của **22/22** nguồn: 46 absorb, 610 idea, 639 drop, 0 lệch | `node scripts/inventory-items.cjs totals docs/specs/2026-09-18-item-inventory.md` |
| Test | **206/206** xanh trên Windows (chạy lại 2026-10-05 trên `main`, chạy một mình, bốn lượt đều xanh; `bench-node-01` và `bench-py-01` từng trượt khi suite chạy cùng lúc với lệnh khác, chạy riêng thì xanh) (trên worktree không có `_build/upstream`: một test bỏ qua) | `node --test tests/*.test.cjs` |
| Prompt activation | **96** ở `phase-1.jsonl`, **6** ranh giới, **2** acceptance | `evals/activation/*.jsonl` |
| Case trong `skills/<name>/tests/` | **17/17** skill, **55** case (`bk-protocol` không cần) | `recount-status-numbers.cjs` |
| File stack `bk-build/references/stacks/` | **7/8** trên `main` (`typescript-react`, `kotlin`, `sql`, `node`, `python`, `php-laravel`, `shell`) | `ls` |
| Task benchmark trong `evals/bench/` | **14** trên `main` (`build-01`, `debug-01`, `node-01`, `php-01`, `py-01`, `shell-01`, `shell-01-src` (cùng fixture, nhánh S là nguồn đã bọc), `spec-01` (chấm bằng hai người đọc mù), `probe-review-authored`, `review-01`…`04`, `test-01`) | `ls evals/bench/*/task.json` |
| Hàng nguồn trong ma trận | **39** | `grep -c '^\| [0-9]' docs/specs/2026-09-10-coverage-matrix.md` |
| Host đã qua acceptance | **2/7** (Claude Code, Antigravity; bảy host của `docs/hosts.md`, trong đó Copilot CLI và Factory Droid chung một mục. §2 mục 11 là chỉ số khác: 2/6 host owner thực dùng, câu 8) | `docs/hosts.md` |
| Bootstrap protocol | **6.485/6.500** ký tự | proxy của `tests/session-start.test.cjs`, đo lại 2026-09-26 |
| Bản cài hằng ngày | `e410f4d` ở cả scope user lẫn local (2026-10-01, owner nói có); kho Antigravity làm mới từ checkout chính ở `e410f4d`, `doctor` sáu `ok`, một `skip`; `main` đi trước bằng commit không đụng `skills/`, `hooks/`, `scripts/`, `agents/` | `claude plugin list`, `bearingkit doctor`, `git diff --stat e410f4d main`, 2026-10-02 |

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
| **v0.3** | **đang làm**: catalog đủ; sprint lifecycle tới `bk-build` xong; còn một file stack (`c-cpp`, toolchain đã có), `bk-spec`/`bk-plan`, `bk-ship`/`bk-close`, cổng | `docs/plans/2026-09-26-v03-roadmap.md` |
| v0.4 | chưa bắt đầu: pack tuỳ chọn, hook push/deploy (Biome/Pint, câu 9), acceptance Gemini CLI / Cursor / Codex | spec §13 |
| v1.0 | chưa bắt đầu: outcome benchmark đủ 12 task, `upstream-watch`, README EN+VI, CI, marketplace, publish từ history squash | spec §13 |

## 4. Đang chờ owner

- **38/38 câu D5 có quyết định** (`docs/specs/2026-09-12-d5-owner-questions.md`). Mới nhất: câu 38 (2026-09-27), cách đo ba file stack còn lại của P4 (`c-cpp`: toolchain đã cài 2026-10-01, chờ thiết kế).
- Việc chờ owner của phiên đang mở: mục Decisions waiting của handoff mới nhất.

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

- **v0.3**: 8 file stack; `bk-spec`/`bk-plan`, `bk-ship`/`bk-close` (có `--verify`, câu 34); một lượt chấp nhận Antigravity ngắn (câu 34, đã duyệt).
- **v0.4**: pack tuỳ chọn kiểm kê chứng minh được; hook push/deploy; acceptance thật cho Gemini CLI, Cursor, Codex, Copilot CLI trên máy khác (câu 8).
- **v1.0**: outcome benchmark 12 task; `upstream-watch`; README EN+VI; CI; marketplace; publish từ history squash sau khi grep tên project riêng.

## 7. Cách cập nhật file này

1. Ở bước đóng phiên, **thay** các ô và dòng "Cập nhật", không chèn thêm đoạn "Trước đó…": lịch sử thuộc handoff và `docs/status-history.md`.
2. Đổi một ô thì đổi cả ô bằng chứng; không có bằng chứng thì ghi "chưa đo".
3. Không thêm quyết định, câu hỏi hay luận điểm mới: chúng thuộc `d5-owner-questions.md` hoặc spec.
4. Số không chạy lệnh lại trong phiên thì ghi "thừa hưởng" kèm ngày, hoặc bỏ.
5. Giữ file dưới khoảng 15 KB; vượt thì chuyển phần cũ sang `docs/status-history.md` nguyên văn (quyết định của owner 2026-09-26).
