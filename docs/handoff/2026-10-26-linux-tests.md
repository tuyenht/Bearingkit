# Handoff · 2026-10-26 · phiên cloud (Linux): suite xanh trên Linux, suite dọn thư mục tạm; công tắc `PAUSE`; chưa chạy trên Windows

Phiên cloud, Linux (Node `v22.22.0`), trên nhánh `claude/adoring-einstein-sjl4he`, cắt từ `main` ở `b7fb847`. Không merge, không đẩy lên `main`. **Phiên owner đọc trước:** handoff này chỉ ghi việc của phiên cloud; trạng thái của dự án vẫn là Block 2 của `docs/handoff/2026-10-16-p6-stage0.md`.

`docs/autopilot/state.md` đọc đầu phiên: `State: PAUSE`, nên phiên chỉ làm đúng hai việc brief nêu tên. Phiên không sửa `docs/status.md`, `docs/autopilot/decisions.md`, `AGENTS.md`, `state.md`, handoff khác hay `skills/` (brief cấm), nên dòng "sáu test đỏ trên Linux" ở `docs/handoff/2026-10-16-p6-stage0.md:51` vẫn ghi là việc còn mở (`docs/autopilot/decisions.md:309` ghi sáu test đó, và ghi nguyên nhân là đoán, chưa kiểm); `docs/status.md` không có dòng nào về Linux (dòng Test ở `docs/status.md:25` chỉ ghi Windows).

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
4. **plan-run (1 test)**. Không phải do Linux: bản clone của cloud là clone nông (`git rev-parse --is-shallow-repository` ra `true`, 75 commit), nên commit đóng băng `afa1a46…` (định nghĩa ở `evals/analysis/plan-run.cjs:40`) không có; test kiểm nó ở `tests/plan-run.test.cjs:51`. Sửa môi trường bằng `git fetch --unshallow origin` (500 commit), không sửa file nào. Phiên cloud sau sẽ gặp lại nếu clone nông.

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

## Không làm, nói thẳng

- **Không chạy trên Windows.** Mọi khẳng định "Windows không đổi" là suy luận từ mã (và reviewer đọc lại), chưa kiểm. Riêng hook `after` cấp file chỉ đã chạy trên Node 22, Linux.
- Không sửa `scripts/bench.cjs` để `bin` có khoảng trắng chạy được ngoài Windows; chỉ sửa test.
- Wrapper `.sh` cần thư mục tạm cho phép chạy file (không `noexec`), và giả định đường dẫn tạm không chứa `"`, `$`, backtick hay `\`.
- Không chạy phép đo hay bench nào; lệnh `bench --dry-run` chỉ chạy bên trong suite.
- Không cập nhật `docs/status.md`, nhật ký, handoff cũ; không merge; không đẩy `main`.

## Bước tiếp theo cho phiên owner

1. Trên Windows: `node --test "tests/**/*.test.cjs"` trên nhánh này; kỳ vọng 279/279 (trừ skip của máy owner) và `%TEMP%` không có thêm `bk-*` sau lượt, hoặc chỉ những thư mục Windows còn giữ mở (xem best effort ở trên).
2. Nếu xanh và owner nêu tên: merge (việc của owner); rồi đóng mục "sáu test đỏ trên Linux" trong handoff mới của phiên owner, ghi nhật ký, và nếu cần thêm Linux vào dòng Test ở `docs/status.md:25`.

## Đã xong

- `7bd0c5a`: 8 test đỏ trên Linux nay xanh (7 bằng sửa test, 1 bằng bỏ clone nông); suite 279, 275 pass, 0 fail, 4 skip.
- `745aae6`: suite không còn để lại `bk-*` (102 thành 0, đo bằng `TMPDIR` riêng).
- Handoff này; nhánh `claude/adoring-einstein-sjl4he` đã đẩy.

## Còn lại

- Chạy suite trên Windows (owner); merge là của owner.
- Ghi một mục nhật ký và đóng mục "sáu test đỏ trên Linux" trong handoff mới của phiên owner.
