# Handoff · 2026-10-26 · phiên cloud (Linux): suite xanh trên Linux, suite dọn thư mục tạm, CI trên Windows và Linux tự đếm thư mục tạm; công tắc `PAUSE`; Windows chỉ chạy trên runner GitHub, chưa chạy trên máy owner

Phiên cloud, Linux (Node `v22.22.0`), trên nhánh `claude/adoring-einstein-sjl4he`, cắt từ `main` ở `b7fb847`. Không merge, không đẩy lên `main`. **Phiên owner đọc trước:** handoff này chỉ ghi việc của phiên cloud; trạng thái của dự án vẫn là Block 2 của `docs/handoff/2026-10-16-p6-stage0.md`.

`docs/autopilot/state.md` đọc đầu phiên: `State: PAUSE`, nên phần 1 chỉ làm đúng hai việc brief nêu tên; phần 2, 3 và 4 làm theo ba lời owner sau đó (mục "Phần 2", "Phần 3", "Phần 4"; phần 3 và 4 chỉ đổi `.github/workflows/test.yml` và handoff này). Phiên không sửa `docs/status.md`, `docs/autopilot/decisions.md`, `AGENTS.md`, `state.md`, handoff khác hay `skills/` (brief cấm), nên dòng "sáu test đỏ trên Linux" ở `docs/handoff/2026-10-16-p6-stage0.md:51` vẫn ghi là việc còn mở (`docs/autopilot/decisions.md:309` ghi sáu test đó, và ghi nguyên nhân là đoán, chưa kiểm); `docs/status.md` không có dòng nào về Linux (dòng Test ở `docs/status.md:25` chỉ ghi Windows).

## Lời mở phiên của owner

Brief gồm Việc 1 (suite xanh trên Linux, giữ nguyên hành vi trên Windows) và Việc 2 (chỉ khi Việc 1 xong và còn credit: test tự xóa thư mục tạm), với luật: chỉ nhánh của phiên, không đo, không bench, mỗi commit qua cổng (suite chạy một mình trên bản cuối, reviewer chỉ đọc mới cho mỗi commit).

## Đỏ trước (Việc 1)

Lượt suite một mình đầu tiên (`node --test "tests/**/*.test.cjs"`, trên `b7fb847`):

```
# tests 279
# pass 267
# fail 8
# cancelled 0
# skipped 4
```

Tám test đỏ, không phải sáu như ghi chú cũ. Sáu test ở `docs/autopilot/decisions.md:309` khớp: hai test của `bench.test.cjs` khớp tên, bốn test của `record-guardrail.test.cjs` khớp theo file (dòng đó chỉ ghi số thứ tự test); hai test kia là thêm:

| # | Test | File |
|---|---|---|
| 1 | the dry run of each task prints the planned floor sessions and runs nothing | `tests/bench-ship-close.test.cjs` |
| 2 | a session sees the task directory first on its PATH | `tests/bench.test.cjs` |
| 3 | a session that outlives its kill is given up as an orphan after the grace period | `tests/bench.test.cjs` |
| 4 | plan-run pins paths that exist at the frozen commit; … | `tests/plan-run.test.cjs` |
| 5 | appends a guardrail run to the newest state for the directory | `tests/record-guardrail.test.cjs` |
| 6 | records an independent review with its scope | `tests/record-guardrail.test.cjs` |
| 7 | records without --session by creating the state for the directory, … | `tests/record-guardrail.test.cjs` |
| 8 | a second record the same day in the same directory lands in the same file, not a new one | `tests/record-guardrail.test.cjs` |

## Nguyên nhân và cách sửa (commit `7bd0c5a`)

1. **record-guardrail (4 test)**. Đã kiểm: test truyền cwd `'C:/proj-…'` chưa resolve; `scripts/record-guardrail.cjs:32` gọi `path.resolve(--cwd)` rồi tìm hoặc tạo state theo đường đã resolve; `State.latest` (`scripts/lib/state.cjs:74`) chỉ so chuỗi sau `norm()` (đổi `\` thành `/`). Trên Linux `'C:/proj-a'` là đường dẫn tương đối, thành `<cwd>/C:/proj-a`: ở hai test đầu recorder không thấy state test đã tạo, ở hai test sau `State.latest` của test không thấy state recorder đã tạo. Cách sửa: `tests/record-guardrail.test.cjs:16` thêm `dirOf = path.resolve`, bốn test tìm state dùng `dirOf('C:/proj-…')` (dòng 20, 33, 48, 57). Windows (suy luận, không chạy): `path.resolve('C:/proj-a')` là `C:\proj-a`, `norm` ra `C:/proj-a`, đúng chuỗi trước đây.
2. **bench (2 test)**. Đã kiểm: `scripts/bench.cjs:132-134` chạy `bin` qua `cmd.exe` trên win32, nhưng ở nơi khác gọi `spawn(bin, args)`, nên `bin` = `"node <file>"` là tên chương trình không tồn tại; log chỉ cho thấy raw rỗng và `orphan` là false; rằng đó là lỗi spawn (ENOENT, nhánh `error` ở `scripts/bench.cjs:164`) là suy ra từ mã, rồi được xác nhận gián tiếp vì sửa `bin` thì hai test xanh. Cách sửa: `tests/bench.test.cjs:535` thêm `nodeBin(file)`: trên win32 trả đúng chuỗi cũ `node <file>`; ở nơi khác viết một wrapper `#!/bin/sh` chạy `exec "<process.execPath>" "<file>"`, nên pid bị kill là pid của node. Dùng ở `sleeper` và hai lời gọi ở dòng 568, 570. Hệ quả phụ (suy luận từ mã; bằng chứng duy nhất là lượt đầu test này chạy 4 ms, dưới limit 0,3 s): test "a session its kill ends is cut, not an orphan" trước đây xanh trên Linux chỉ vì cùng lỗi spawn; nay nó kiểm thật việc kill. Không sửa `scripts/bench.cjs`.
3. **bench-ship-close dry run (1 test)**. Đã kiểm: `DST` của fixture là đường dẫn Windows (`evals/bench/ship-01/build.cjs:94`, tương tự ship-02, close-01); trên Linux nó được resolve theo cwd, và từ gốc repo `ancestorMemoryFiles` (`scripts/evals.cjs:220`) thấy `CLAUDE.md` của repo nên lệnh dry run từ chối (`scripts/bench.cjs:259`). Cách sửa: `tests/bench-ship-close.test.cjs:200` chạy dry run với cwd `os.tmpdir()`. Windows (suy luận): `DST` tuyệt đối, đường bench không đọc `process.cwd()` (reviewer cũng xác nhận), nên cwd không đổi gì. Giới hạn: trên Linux test này không còn kiểm phép soát bộ nhớ theo `DST` thật, vì `DST` vốn không có nghĩa ngoài Windows.
4. **plan-run (1 test)**. Không phải do Linux: bản clone của cloud là clone nông (`git rev-parse --is-shallow-repository` ra `true`, 75 commit), nên commit đóng băng `afa1a46…` (định nghĩa ở `evals/analysis/plan-run.cjs:40`) không có; test kiểm nó ở `tests/plan-run.test.cjs:51`. Sửa môi trường bằng `git fetch --unshallow origin` (500 commit), không sửa file nào ở phần 1. Phiên cloud sau sẽ gặp lại nếu clone nông; từ `a62c307` (phần 2) thông báo của test nói rõ nguyên nhân (assert nay ở `tests/plan-run.test.cjs:55`).

Review của commit `7bd0c5a`: 1 vòng, must-fix 0; hai should-fix về chú thích đã làm trước commit (chữ "each test that looks the state up"; trả chú thích orphan 2026-09-25 về trên test orphan). Should-fix không làm: cập nhật `docs/status.md` và handoff cũ (brief cấm; ghi ở đầu file này).

## Xanh sau (Việc 1)

Suite một mình trên bản cuối, trước commit `7bd0c5a`:

```
# tests 279
# pass 275
# fail 0
# cancelled 0
# skipped 4
```

Bốn test skip trên máy này: `cpp-01` (không có cmake), một subtest O2 của Python (không có pytest), `shell-01` (không có PowerShell), task review (không có `_build/upstream`).

## Việc 2: dọn thư mục tạm (commit `745aae6`)

Đếm bằng một `TMPDIR` riêng cho mỗi lượt suite (chỉ trên máy cloud): **102** mục còn lại sau một lượt trước khi sửa (tất cả `bk-*`; `bearingkit-*` và `bench-fixture-*` vốn đã được dọn), **0** sau khi sửa; số test không đổi (279, 275 pass, 0 fail, 4 skip). Lượt cổng với `/tmp` mặc định: số mục `bk-*|bearingkit-*|bench-fixture-*` trước và sau lượt đều là 311 (số dư của các lượt trước khi sửa; không xóa).

Cách làm: `tests/fixtures/tmpdir.cjs:17` (`tmpdir(prefix)`) tạo thư mục bằng `fs.mkdtempSync` dưới `os.tmpdir()` với đúng tiền tố cũ và ghi lại; hook `after` của `node:test` ở dòng 11 xóa chúng khi các test của file chạy xong (best effort: `maxRetries: 3`, lỗi bị nuốt, để một thư mục Windows còn giữ mở không làm file đỏ). Dùng ở `tests/activation.test.cjs`, `antigravity-evals`, `antigravity-install`, `doctor`, `evals`, `inventory-items`, `record-guardrail`, `state` và `tests/fixtures/fake-kit.cjs`; bỏ các `require('node:os')` không còn dùng. Không test nào đổi điều nó kiểm. Review: 1 vòng, must-fix 0; hai should-fix (hai `os` thừa ở `doctor` và `evals`) đã làm trước lượt cổng.

## Phần 2 · Audit theo lời owner (cùng phiên)

Lời owner, nguyên văn: "Audit kỹ các xử lý cũng như các phản hồi ở trên; cho tôi các khuyến nghị tốt nhất phù hợp. Sau khi có các khuyến nghị, hãy thực hiện xử lý theo các khuyến nghị cho tôi. Cần chạy thế nào, có thể tự động được hoàn toàn thì tốt nhất nhé." Theo Resume prompt của `docs/handoff/2026-10-16-p6-stage0.md`, một câu chung như thế không phải lời nêu tên; phiên đã hỏi owner một lần, có nhãn, cho việc nặng nhất (CI: mục 12 của `docs/status.md`, chạy trên server GitHub). Commit `a62c307` (chỉ chữ thông báo của một test) được làm mà không hỏi, coi là việc ACT trong repo theo dòng Autonomy của `AGENTS.md`; đây là chỗ lệch khỏi phạm vi brief của phần 1, nói thẳng, và owner có thể bỏ nó khi merge. Lựa chọn owner chọn, nguyên văn: "Đẩy CI lên nhánh (Khuyến nghị)".

**Kết quả audit phần 1:**
- Đúng: 8 test đỏ, nguyên nhân và cách sửa; nay có thêm bằng chứng Windows từ CI (dưới đây).
- Sai, đã sửa trước commit `744c1b7`: bản nháp handoff ghi `docs/status.md` §4 có dòng về Linux (không có).
- Lỗ hổng: sau vòng review 2 của `744c1b7` còn sửa vài câu theo should-fix mà không ai đọc lại; bản này của handoff có reviewer riêng.
- Lỗ hổng: phần 1 ghi "chưa chạy trên Windows" và dừng ở đó; cách tự động kiểm được Windows là CI, nay đã làm.

**Đã làm ở phần 2:**
- `a62c307`: `tests/plan-run.test.cjs:52` nối thêm gợi ý "(this clone is shallow: git fetch --unshallow origin)" vào hai thông báo khi clone nông; không đổi điều test kiểm. Trên một clone `--depth 5`: test đỏ, thông báo có gợi ý; suite trên clone đủ: xanh.
- `3998187`, `51fc655`, `7577b24`: `.github/workflows/test.yml`: suite trên `ubuntu-latest` và `windows-latest`, Node 22 và `lts/*`, `fetch-depth: 0`, danh tính git cho các commit trong thư mục tạm; job Windows cài PHP 8.2 có `pdo_sqlite` (`shivammathur/setup-php@v2`). Không đo, không bench thật: lệnh `bench` duy nhất của suite là `--dry-run`, test runner dùng phiên giả.

**Cổng của phần 2:** mỗi commit có một lượt suite một mình trên bản cuối, xanh (279, 275 pass, 0 fail, 4 skip), đọc trước commit, commit ở lệnh riêng. Reviewer chỉ đọc: `a62c307` 1 vòng (must-fix 0; hai should-fix đã làm); `3998187` 2 vòng (0 và 0; khối `concurrency` thêm theo should-fix vòng 1 bị bỏ trước commit vì vòng 2 chỉ ra nó có thể hủy nhầm lượt chạy, nên bản commit là bản vòng 1 cộng hai câu chú thích); `51fc655` 1 vòng (0; ba should-fix đã làm); `7577b24` 2 vòng (1 must-fix: chú thích viện dẫn sai lượt chạy, đã sửa; rồi 0); handoff này: 2 vòng (vòng 1: 1 must-fix và 8 should-fix, đã sửa; vòng 2: 0 must-fix, hai should-fix đã sửa).

**CI (đọc từ log bằng công cụ GitHub):**

| Lượt | Commit | ubuntu 22 / lts | windows 22 / lts |
|---|---|---|---|
| 1 | `3998187` | xanh / xanh (279, 275 pass, 4 skip) | đỏ / đỏ: 279, 275 pass, **1 fail**, 3 skip; test đỏ: `tests/bench-php-01.test.cjs:82` ("green untouched", dòng 96) |
| 2 | `51fc655` | xanh / xanh (279, 275 pass, 4 skip) | xanh / xanh (279, **276 pass**, 0 fail, 3 skip; suy ra: `shell-01` chạy được vì runner có PowerShell, nên không skip như trên Ubuntu) |
| 3 | `7577b24` | xanh / xanh | xanh / xanh (chỉ đọc kết luận của job, không đọc lại số đếm) |

Node: `v22.23.4` và `v24.22.1` trên Windows, `v22.23.3` và `v24.21.0` trên Ubuntu (lượt 2). Nguyên nhân `php-01` đỏ trên Windows, đã kiểm ở lượt 2: PHP sẵn có của image có `PDO` nhưng không có `pdo_sqlite` và `sqlite3` trong `php -m`; setup-php cài PHP 8.2.35, bật hai extension, `php-01` xanh. Đây là môi trường của runner, không phải lỗi mã. Ba test skip trên Windows (dòng skip trong log): `cpp-01` (không có cmake ở `C:\msys64\ucrt64\bin`), subtest O2 của Python (không có pytest), task review (không có `_build/upstream`).

**Không làm ở phần 2 (đề xuất cho owner):**
- Hook SessionStart tự `git fetch --unshallow` cho phiên cloud: không làm, vì `.gitignore` bỏ `.claude/` có chủ ý ("project-level host config used only for compatibility probes"). Thay thế: thêm `git fetch --unshallow origin || true` vào Setup script của môi trường cloud (cài đặt của owner; chưa kiểm script chạy trước hay sau clone), hoặc dựa vào thông báo mới của `plan-run`.
- `package.json` ghi `engines: >=20`, nhưng lệnh suite cần Node ≥ 21 (glob của `node --test`; theo hiểu biết chung, chưa kiểm trên Node 20); CI không chạy Node 20. Sửa `engines` là việc của owner.
- `docs/status.md` mục 12 ("README EN+VI, CI, marketplace, publish…", **0/4**) chưa cập nhật; CI chỉ vào `main` khi owner merge.
- Log CI (job Windows Node 22, lượt 1, phiên đọc trực tiếp) cảnh báo `actions/checkout@v4`, `actions/setup-node@v4` nhắm Node 20 đã bị ép chạy Node 24 (đã đổi lên `v5` ở phần 3, `ae7b8df`).
- `setup-php` ghim theo tag `v2`, không theo SHA (đã ghim theo SHA ở phần 4, `62e8c93`).
- Khi push, GitHub báo Dependabot thấy 228 lỗ hổng trên nhánh mặc định (39 critical, 60 high, 105 moderate, 24 low). Chưa xem là ở file nào; chưa kiểm (xem phần 3).
- Không xóa 311 thư mục tạm của container cloud (container sẽ bị thu hồi).

## Phần 3 · Audit lần hai theo lời owner (cùng phiên)

Lời owner, nguyên văn: "Audit kỹ các xử lý cũng như các phản hồi ở trên; cho tôi các khuyến nghị tốt nhất phù hợp. Sau khi có các khuyến nghị, hãy thực hiện xử lý theo các khuyến nghị cho tôi." Phần này chỉ đổi `.github/workflows/test.yml` (CI mà owner đã chọn ở phần 2) và handoff này; không hỏi thêm.

**Kết quả audit phần 2:**
- Báo cáo cuối của phần 2 kết thúc phiên khi chưa đọc kết quả CI lượt 4 (commit handoff `13c156e`); đọc lại: kết luận của run là success (chưa đọc từng job).
- Bước 1 của "Bước tiếp theo" vẫn giao owner kiểm `%TEMP%` bằng tay, trong khi CI kiểm được việc này tự động; nay CI làm (dưới đây).
- Dependabot (228 cảnh báo, phần 2): `package.json` gốc không có dependency nào; các manifest và lockfile có phiên bản ghim cũ nằm trong fixture (ví dụ `evals/fixtures/sample-app/package.json`: `next` 15.1.0, cùng bản ở `evals/bench/review-03`, `review-04`; lockfile ở `evals/fixtures/sample-app`, `evals/fixtures/antigravity-stage`, `tests/fixtures/stacks/{node-pnpm,node-biome}`, `tests/fixtures/stacks/laravel/composer.lock`). Suy ra, chưa đối từng cảnh báo với file: các cảnh báo đến từ fixture, không phải từ mã kit chạy. Không sửa: đổi phiên bản của fixture là việc của owner (brief của phiên bảo dừng và báo trước mọi thay đổi hành vi đã đăng ký của fixture dưới `evals/bench/`; các fixture dưới `evals/fixtures/` và `tests/fixtures/` không thuộc việc brief nêu tên). Lưu ý thêm: trường `files` của `package.json` có `evals`, nên các manifest dưới `evals/` nằm trong gói nếu publish lên npm (`tests/` thì không); có nên loại ra hay không là việc của owner.
- Phần 1 ghi "`bearingkit-*` và `bench-fixture-*` vốn đã được dọn": đúng ở các lượt đếm trên máy cloud, nhưng CI lượt 5 cho thấy không phải lúc nào cũng đúng (dưới đây).

**Đã làm ở phần 3:**
- `ae7b8df`: `actions/checkout` và `actions/setup-node` lên `v5` (log lượt 5 tải `actions/checkout@v5` và `actions/setup-node@v5`; không còn cảnh báo Node 20). Suite chạy với một thư mục tạm rỗng của riêng nó (`TMPDIR`, `TEMP`, `TMP` = `$RUNNER_TEMP/suite-tmp`); một bước sau suite đếm những gì còn lại và chỉ cảnh báo (`::warning::`), không làm job đỏ.
- `32cee3b`: bước đó liệt kê thêm nội dung của mười mục đầu (ba tầng, tối đa 40 đường dẫn mỗi mục), mọi lần đọc đều có `try`, để lần sau lần ra test nào để lại.
- Cổng: mỗi commit có một lượt suite một mình trên bản cuối, xanh (279, 275 pass, 0 fail, 4 skip); các bước CI mới được mô phỏng trên máy cloud (đối chứng dương: một thư mục thêm vào thì có cảnh báo; thư mục thiếu hay không đọc được thì bước vẫn thoát 0). Reviewer: `ae7b8df` 1 vòng (0 must-fix; 3 should-fix đã làm); `32cee3b` 2 vòng (vòng 1: 2 must-fix, một `statSync` ngoài `try` có thể làm job đỏ và chú thích "each entry" sai với giới hạn mười mục, đã sửa; vòng 2: 0 must-fix, một should-fix đã làm); handoff phần 3: 2 vòng (vòng 1: 2 must-fix về câu chữ, đã sửa; vòng 2: 0 must-fix, một should-fix đã làm).

**CI phần 3 (đọc từ log bằng công cụ GitHub):**

| Lượt | Commit | ubuntu 22 / lts | windows 22 / lts |
|---|---|---|---|
| 4 | `13c156e` | xanh / xanh | xanh / xanh (chỉ đọc kết luận của run) |
| 5 | `ae7b8df` | xanh, 0 mục / xanh, **1 mục**: `bench-fixture-EjBTrk` | xanh, 0 mục / xanh, 0 mục (279, 276 pass, 0 fail, 3 skip) |
| 6 | `32cee3b` | xanh, 0 mục / xanh, 0 mục | xanh, 0 mục / xanh, 0 mục |

Kết luận về Việc 2: trên runner Windows, 4 lần đếm đều 0 mục; trên Ubuntu, 1 lần trong 4 lần đếm còn một thư mục `bench-fixture-*` (không phải `bk-*` của helper). Mọi test tạo `bench-fixture-` đều tự `rmSync` đồng bộ khi test xanh (`py-01`, `node-01`, `php-01` trong `finally`, các test khác ở cuối thân test); tiến trình con còn sống ghi lại sau khi xóa là phỏng đoán, chưa kiểm. Không chạy lại CI nhiều lần để săn lỗi này; lần sau nó xuất hiện, bước báo cáo in nội dung của nó.

## Phần 4 · Audit lần ba theo lời owner (cùng phiên)

Lời owner giống hệt lần hai. Phần này chỉ đổi `.github/workflows/test.yml` và handoff này.

**Kết quả audit phần 3:** phần 3 lại kết thúc mà chưa đọc số đếm thư mục tạm của lượt CI do chính commit handoff của nó (`541b383`, lượt 7) tạo ra, đúng lỗi phần 3 đã chỉ ra cho phần 2; nay đã đọc (dưới đây). Hai việc còn mở nằm trong phạm vi phiên: ghim `setup-php` theo SHA, và nguồn của thư mục `bench-fixture-*` còn sót.

**Đã làm:**
- `62e8c93`: `shivammathur/setup-php@eb7c497e18156a6bbabfef1d3a82760b9eda3962 # v2`, đúng commit mà tag `v2` trỏ tới trong log lượt 5 và 6. Hai action của `actions/` giữ theo tag; chú thích chỉ nói `setup-php` được ghim vì là action bên thứ ba, lý do giữ tag cho `actions/` là suy ra từ đó. Không có công cụ tự cập nhật bản ghim; đổi bằng tay. Cổng: suite một mình trên bản cuối xanh (279, 275 pass, 0 fail, 4 skip); reviewer 1 vòng (0 must-fix; 2 should-fix: một về danh sách commit trong handoff, đã làm; một tùy chọn về chú thích, không làm). Handoff phần 4: 2 vòng (vòng 1: 2 must-fix, thiếu lượt 7 trong số đếm và trỏ sai mục, đã sửa; vòng 2: 0 must-fix, bốn should-fix đã làm).
- CI lượt 7 (`541b383`): xanh cả 4 job; Windows 279, 276 pass, 0 fail, 3 skip; Ubuntu 279, 275 pass, 0 fail, 4 skip; thư mục tạm: 0 mục ở cả 4 job; bước suite trên Ubuntu khoảng 48 và 49 s.
- CI lượt 8 (`62e8c93`): xanh cả 4 job; Windows 279, 276 pass, 0 fail, 3 skip; log Windows tải đúng SHA đã ghim, PHP 8.2.35; thư mục tạm: 0 mục ở cả 4 job.

**Không làm:** không chạy thêm CI để săn thư mục `bench-fixture-*` còn sót. Từ lượt 5 đến lượt 8: 1 trong 8 lần đếm trên Ubuntu có nó (lượt 5, job `lts/*`, log in `v24.21.0`), 0 trong 8 lần đếm trên Windows. Nguồn chưa rõ. Hai giả thuyết đã xét, đều chưa kiểm: (1) một `spawnSync` có `timeout` chạy `node --test` (`evals/bench/test-01/build.cjs:69`, `build-01/build.cjs:52`, `node-01/build.cjs:54`, `debug-01/build.cjs:70`) chỉ giết tiến trình cha khi timeout (120 s, `node-01` 180 s) nổ, để tiến trình con ghi lại sau khi test xóa thư mục; yếu, vì suite trên Ubuntu chạy dưới 51 s ở mọi lượt đã đọc, kể cả lượt 5 có thư mục sót (`duration_ms` 45401 ở job `lts/*`), không tới timeout, và cơ chế này giống nhau trên hai hệ điều hành; (2) `evals/bench/node-01/build.cjs:101-103` giết cả cây trên Windows nhưng chỉ tiến trình con trực tiếp trên Linux; yếu, vì `evals/bench/node-01/app/bin/stock.cjs` và `app/src/*.cjs` không tạo tiến trình con nào (đã grep `spawn`, `child_process`, `exec(`). Bước báo cáo của CI sẽ in nội dung thư mục ở lần nó xuất hiện tiếp theo; sửa sau khi có dữ liệu đó.

## Không làm, nói thẳng

- **Không chạy trên máy owner.** Windows chỉ đã chạy trên runner GitHub (`windows-latest`); máy owner có thể khác (PHP, PowerShell, đường dẫn, `%TEMP%`).
- Không sửa `scripts/bench.cjs` để `bin` có khoảng trắng chạy được ngoài Windows; chỉ sửa test.
- Wrapper `.sh` cần thư mục tạm cho phép chạy file (không `noexec`), và giả định đường dẫn tạm không chứa `"`, `$`, backtick hay `\`.
- Không chạy phép đo hay bench nào; lệnh `bench --dry-run` chỉ chạy bên trong suite (máy cloud và CI).
- Không cập nhật `docs/status.md`, nhật ký, handoff cũ; không merge; không đẩy `main`.

## Bước tiếp theo cho phiên owner

1. Trên máy owner: `node --test "tests/**/*.test.cjs"` trên nhánh này; kỳ vọng xanh (trừ skip của máy owner). Việc đếm thư mục tạm nay CI làm tự động trên runner; trên máy owner chỉ cần xem nếu muốn.
2. Quyết định merge (việc của owner): nhận hay bỏ `a62c307` và CI (`3998187`, `51fc655`, `7577b24`, `ae7b8df`, `32cee3b`, `62e8c93`). Nếu nhận CI: mỗi lần push chạy 4 job, và push lên nhánh có PR mở chạy thêm 4 job cho PR; bước suite mất 44–47 s trên Ubuntu và 166–193 s trên Windows (lượt 2 và 3). Kết quả ở tab Actions; cảnh báo thư mục tạm in trong log của bước báo cáo (và, theo hiểu biết chung về GitHub, ở phần Annotations của run).
3. Sau merge: đóng mục "sáu test đỏ trên Linux" trong handoff mới của phiên owner, ghi nhật ký, cập nhật dòng Test (`docs/status.md:25`) và mục 12 nếu cần.

## Đã xong

- `7bd0c5a`: 8 test đỏ trên Linux nay xanh (7 bằng sửa test, 1 bằng bỏ clone nông); suite 279, 275 pass, 0 fail, 4 skip.
- `745aae6`: suite không còn để lại `bk-*` (102 thành 0, đo bằng `TMPDIR` riêng).
- `a62c307`: thông báo rõ khi clone nông.
- `3998187`, `51fc655`, `7577b24`: CI 4 job; Windows trên runner: 279, 276 pass, 0 fail, 3 skip (lượt 2).
- `ae7b8df`, `32cee3b`: action v5; CI tự đếm và liệt kê những gì suite để lại trong thư mục tạm (lượt 6, 7 và 8: 0 ở cả 4 job).
- `62e8c93`: `setup-php` ghim theo SHA.
- Handoff này; nhánh `claude/adoring-einstein-sjl4he` đã đẩy.

## Còn lại

- Chạy suite trên máy owner; merge là của owner.
- Ghi một mục nhật ký và đóng mục "sáu test đỏ trên Linux" trong handoff mới của phiên owner.
- Các đề xuất còn mở ở "Không làm ở phần 2" (Setup script, `engines`, mục 12 của `docs/status.md`, Dependabot), và ở kết quả audit phần 3 (có đưa `evals/` vào gói npm hay không).
- Thư mục `bench-fixture-*` thỉnh thoảng còn sót trên Ubuntu (1 lần trong 8 lần đếm, lượt 5 đến 8): chờ CI in nội dung của nó lần sau rồi mới sửa.
