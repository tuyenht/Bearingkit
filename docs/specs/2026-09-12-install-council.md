# D4 — Council về cách cài: một lệnh chung, hay lệnh của từng host

> **TRẠNG THÁI: ĐỀ XUẤT. CHƯA CÓ HIỆU LỰC. CHỜ OWNER CHỐT.**
>
> Tài liệu này **không** sửa đổi bất cứ điều gì đang có hiệu lực. `docs/specs/2026-09-11-bearingkit-v2-design.md` vẫn là thiết kế hiện hành y nguyên, kể cả §1 Non-goals ("No kit installer"). Không một dòng mã, spec hay plan nào được sửa theo tài liệu này cho tới khi owner chốt. Nếu owner bác, tài liệu này ở lại như bản ghi lý do bác — không phải như thứ đã bị bỏ quên.
>
> **Xuất xứ.** Đây là D4 trong `docs/handoff/2026-09-11-owner-directives.md`, tức chỉ thị 2 của owner. Chữ của owner **chỉ nằm trong khối nguyên văn** của file đó; mọi câu trong tài liệu này là chữ của phiên D4 (2026-09-12), kể cả phần diễn giải ý owner — không được trích như lời owner. Mọi số và mọi lệnh dưới đây đều kèm cách xác minh; cái nào chưa xác minh thì ghi rõ "chưa xác minh".

---

## 1. Câu hỏi được giao

Chỉ thị 2 (nguyên văn ở `docs/handoff/2026-09-11-owner-directives.md`, khối đầu file) yêu cầu: một cách cài chung, đơn giản, dễ dàng cho mọi công cụ, nhưng khi cài thì tự áp đặc thù từng host — và nói rõ đây là mở lại quyết định spec v2 đã bác, xử lý theo COUNCIL.

Phiên D4 tách yêu cầu thành hai nghĩa, vì chúng dẫn tới hai kết luận trái nhau:

- **Nghĩa yếu** — một điểm vào duy nhất, đứng trên lệnh cài của chính từng host.
- **Nghĩa mạnh** — một installer tự ghi vào cấu hình từng host, cài được cả nơi host không có lệnh cài (tức installer v1 quay lại).

---

## 2. Spec v2 đã bác cái gì, ở đâu

| Nơi | Nguyên văn |
|---|---|
| `2026-09-11-bearingkit-v2-design.md:28` (§1 Non-goals) | "A universal installer or an at-runtime shim. Superpowers rejects those for the same reason the kit does: they do not load the bootstrap at session start." |
| `:16` (§1 Goal 2) | "Install with the host's own command… **No kit installer, no links, no generated files except the Antigravity copy**." |
| `:35` (§2.1) | "Content over machinery. A line of tooling exists only when it keeps skill content correct or measurable." |
| `:36` (§2.2) | "**One source, native install per host.** `skills/` is the product; each host gets a manifest in that host's own format and nothing more." |
| §3 (bảng Hosts and bootstrap) | Mỗi host một lệnh cài; Antigravity là ngoại lệ duy nhất (`npx bearingkit antigravity install`) |
| `docs/handoff/2026-09-11.md:31` | "A universal installer or links into host profiles (v1 `install.cjs`): replaced by each host's own install." |
| `:32` | "`npx skills` or any at-runtime shim as the primary channel: it does not load the bootstrap." |
| `:34` | "…**marketplace-first install**; path-string hooks; …" |

---

## 3. Lịch sử installer v1 (đọc commit và mã, không đọc tóm tắt)

`a4a3143` scaffold → `72778b1` adapters → **`c19ace9`** installer ra đời (259 dòng + 100 dòng test) → 7 commit sửa → **`156ab09`** xoá. Chết ở **311 dòng `scripts/install.cjs` + 176 dòng `tests/install.test.cjs` + 6 file `adapters/`**. **9 commit** chạm `scripts/install.cjs` (đếm bằng `git log --oneline --full-history -- scripts/install.cjs`).

**Nó làm gì** (đọc `156ab09^:scripts/install.cjs`): junction `core/skills/bk-*` vào `~/.claude/skills/`; link `core/rules`; merge 3 đăng ký hook vào `settings.json`; thêm 5 deny rule; chèn dòng `@<kit>/core/AGENTS.md` vào `~/.claude/CLAUDE.md`; backup 2 file của host. Antigravity: sinh `rules/AGENTS.md` (`trigger: always_on`), sinh `hooks.json` từ template, sinh launcher `.cjs`, copy thư mục thật + marker `.bearingkit-copy`.

**Ba dữ kiện rút ra:**

1. **6 trong 9 commit là chạy theo quirk của một host**: `7f98420` (junction) → `5befc30` (copy) → `5152cba` (copy thành mặc định); `dd2e46b` (hook phải tương đối, không nháy); `2e521fa` (host note). Installer phổ quát **không** loại bỏ việc theo host — nó dồn việc đó vào một file.
2. **Nó chết vì `--plugin-dir` và lệnh plugin của host làm lớp link thành thừa**, không phải vì không nạp được bootstrap. Lesson đã ghi ở `docs/handoff/2026-09-11.md`: *"WHEN a host can load a plugin from a directory THEN test with that flag before building any install mechanism NOT after."*
3. **Nó không chết hẳn.** Phần Antigravity sống tiếp thành `scripts/antigravity.cjs` (108 dòng) + `tests/antigravity-install.test.cjs` (57 dòng). v2 **vẫn đang có** một installer, chỉ thu về đúng host không có lệnh cài.

---

## 4. Khảo sát 8 host: cách cài, và script hoá được tới đâu

| Host | Cách cài | Không tương tác? | Đặc thù phải áp | Nguồn và cấp |
|---|---|---|---|---|
| **Claude Code** | `/plugin marketplace add` + `/plugin install` trong phiên; **và CLI**: `claude plugin marketplace add <url\|path\|repo>`, `claude plugin install <p>@<m> -y --scope user --json`, kèm `validate`, `details`, `list`, `update` | **Có** | hook SessionStart in plugin root (`${CLAUDE_PLUGIN_ROOT}`) | **Xác minh tại chỗ 2026-09-12**: `claude plugin --help`, `... marketplace add --help`, `... install --help` |
| **Antigravity 2.0** | Không có lệnh cài. Plugin = thư mục con **thật** của `~/.gemini/config/plugins/`; scanner không theo junction | Chỉ qua bản copy của kit | rule `always_on` + host note + dòng kit-root + 3 script | **Xác minh bằng đo** 2026-09-10/11: v1 §3, commit `5152cba`, `docs/hosts.md:24` |
| **Gemini CLI** | `gemini extensions install <url\|path>`; `gemini extensions update` | Có (chưa chạy) | `gemini-extension.json` → `GEMINI.md` import | Cấp 2: README Superpowers 5.1.0 (bản đã cài trong cache) + manifest trong repo. **Chưa chạy trên máy này** |
| **Factory Droid** | `droid plugin marketplace add` + `droid plugin install` | Có (chưa chạy) | như Claude Code | Cấp 2: README Superpowers 5.1.0. **Chưa xác minh** |
| **Copilot CLI** | `copilot plugin marketplace add` + `copilot plugin install` | Có (chưa chạy) | như Claude Code | Cấp 2: README Superpowers 5.1.0. **Chưa xác minh** |
| **Codex CLI / App** | `/plugins` → tìm → chọn *Install Plugin*; app: sidebar Plugins | **Không** — giao diện | bootstrap **chưa biết** | Cấp 2: README Superpowers 5.1.0. **Chưa xác minh** liệu có thêm được marketplace bên thứ ba, hay buộc phải nằm trong `openai/plugins` |
| **Cursor** | `/add-plugin <name>` trong chat, hoặc tìm trong marketplace | **Không** — giao diện | hook `sessionStart`, đường dẫn tương đối | Cấp 2: README Superpowers 5.1.0. **Chưa xác minh** |
| **OpenCode** | Sửa tay `opencode.json`, mảng `plugin` với spec git | Có — **nhưng là ghi file cấu hình host**, đúng thứ v2 cấm | plugin JS riêng | **Đọc trực tiếp** `.opencode/INSTALL.md` trong cache Superpowers 5.1.0 |

**Dữ kiện quyết định của khảo sát** (xác minh 2026-09-12 bằng `command -v`): trên máy này **chỉ có `claude`** trên PATH. `gemini`, `droid`, `copilot`, `opencode`, `codex`, `cursor-agent` đều không có. Antigravity là app GUI, không có CLI. Nên "mọi công cụ" hôm nay = **2 host**.

---

## 5. Dữ kiện mới kể từ lúc v2 bác (xác minh 2026-09-12)

**Claude Code có đường cài không tương tác, và `marketplace add` nhận cả đường dẫn cục bộ.**

```
claude plugin marketplace add <source>     # "Add a marketplace from a URL, path, or GitHub repo"
claude plugin install <plugin>@<market>    # -y, --scope user|project|local, --json
claude plugin validate <path> | list | details | update
```

Hệ quả: (a) gỡ luôn vướng mắc repo còn private — `docs/hosts.md:16` hiện phải dặn dùng đường dẫn cục bộ qua slash-command; (b) mọi thao tác cài trên host này làm được **mà không cần chạm `settings.json` hay `CLAUDE.md`**.

**Khoảng trống tài liệu (không phải lỗi, là thiếu):** spec v2 §3 và `docs/hosts.md:16` chỉ ghi dạng slash-command trong phiên; đường CLI này chưa có ở đâu trong repo.

---

## 6. Ba phương án

### A — Một trang cài duy nhất, không thêm dòng mã nào

| Cột | |
|---|---|
| **Cơ chế** | Giữ nguyên v2. Gom toàn bộ lệnh cài vào **một khối duy nhất** trong `README.md` + `docs/hosts.md`, mỗi host một dòng, kèm biến thể đường dẫn cục bộ khi repo còn private. Bổ sung đường CLI của Claude Code (§5) — đang thiếu |
| **Đánh đổi** | Rẻ nhất, 0 dòng mã, không mâu thuẫn với bất cứ điều gì đã chốt. Nhưng "một cách cài chung" chỉ đúng ở mức tài liệu: owner vẫn gõ lệnh khác nhau cho từng host |
| **Rủi ro** | Quên chạy lại `antigravity install` sau khi cập nhật kit — **đã xảy ra**: bản copy v2 rớt host note và prompt tính năng hỏng đúng như hôm trước (`3d7b4eb`). Tài liệu trôi khỏi thực tế host |
| **Cách đo** | Số bước từ máy sạch đến acceptance pass (§11) trên mỗi host; `docs/hosts.md` chứa đúng lệnh CLI đã xác minh; số file cấu hình host do kit ghi = 0 |

### B′ — A cộng **chỉ** `bearingkit doctor` (không có wrapper install) ⭐

| Cột | |
|---|---|
| **Cơ chế** | `bearingkit doctor`, **chỉ đọc**: bản copy ở `~/.gemini/config/plugins/bearingkit` có khớp `skills/` trong repo không, có host note không, có dòng kit-root không, có đủ 3 script không, marker có trỏ đúng kit này không; `claude plugin list` / `validate` (đọc); chạy `hooks/session-start.cjs` xem có in protocol và plugin root. Lệch → **in đúng câu lệnh cần gõ** cho host đó (kèm biến thể đường dẫn cục bộ), **không tự chạy** |
| **Đánh đổi** | Vẫn gõ hai lệnh thay vì một — thứ **chưa gây sự cố nào**. Đổi lại: ~60–80 dòng, **không có đường ghi nào**, không phụ thuộc cờ CLI của host nào, và owner vẫn có **một điểm vào duy nhất** để biết phải làm gì |
| **Rủi ro** | Doctor báo OK sai vì bỏ sót một trường. Giảm bằng: dùng lại đúng các khẳng định đã có trong `tests/antigravity-install.test.cjs`, nhưng chạy trên bản copy **sống** thay vì fixture. Không có rủi ro ghi. Doctor đọc `~/.claude` và `~/.gemini` — đọc, không ghi; mọi thao tác ghi vẫn là lệnh owner tự gõ |
| **Cách đo** | (1) dựng lại đúng sự cố `3d7b4eb` — bản copy thiếu host note → doctor thoát khác 0; (2) bản copy cũ hơn `skills/` trong repo → thoát khác 0; (3) chạy trong HOME giả, so cây thư mục trước/sau: **0 byte ghi ra**; (4) số lần acceptance hỏng vì bản copy lệch, đo ở mỗi release gate → mục tiêu 0; (5) ≤80 dòng |

### C — Installer phổ quát thật (v1 redux)

| Cột | |
|---|---|
| **Cơ chế** | Kit tự ghi vào cấu hình từng host: link/copy skills, merge hook vào `settings.json`, chèn import, ghi `opencode.json`; mở rộng cho 8 host |
| **Đánh đổi** | Cài được cả nơi host không cho. Đổi lại, kit trở thành kẻ sở hữu cấu hình máy owner |
| **Rủi ro** | Đúng ba thứ đã xảy ra: 6/9 commit installer là chạy theo quirk một host (§3); backup / merge / idempotent / uninstall là bề mặt lỗi vĩnh viễn; và nó đụng thẳng ranh giới COUNCIL trong `AGENTS.md` (chạm `~/.claude`, `~/.gemini`) — mỗi lần chạy là một lần xin phép. Thêm nữa: mọi host **đã** có lệnh cài riêng, nên C làm lại việc host đã làm |
| **Cách đo** | Không có phép đo nào biện minh được cho C khi Antigravity — host duy nhất thiếu lệnh cài — đã có lời giải 108 dòng |

### Phương án B (đã cân nhắc, đã rút)

Một lệnh `bearingkit install` **chạy** lệnh cài của từng host (≈100–150 dòng), cộng doctor. Rút lại ở lượt rà 2026-09-12, lý do ở §7.

---

## 7. Khuyến nghị: **A + B′**. Bỏ hẳn wrapper install. Không làm C.

**Vì sao B trượt `v2 §2.1`** ("a line of tooling exists only when it keeps skill content correct or measurable"). Phần `install` của B: không chạm nội dung skill; không đo gì; không làm đúng thứ gì đang sai — hai lệnh kia đã chạy được, đã có test, đã qua acceptance trên cả hai host. Nó chỉ rút hai lệnh xuống một. **Trượt test.** Với 2 host, B rút gọn thành wrapper quanh hai lệnh đã tồn tại; đó là tiện nghi, không phải nhu cầu.

**Điểm quyết định khiến B′ mạnh hơn B:** `tests/antigravity-install.test.cjs` chứng minh *script sẽ ghi* host note. **Không có gì chứng minh bản copy đang nằm trên đĩa có nó.** Đó đúng là chỗ `3d7b4eb` chui lọt. Doctor là thứ duy nhất đo được trạng thái **sống** trên host — cái mà không test nào làm được. Nó thoả `§2.1` theo nghĩa đen, cả hai vế: giữ nội dung skill **đúng**, và **đo được**.

**Phần trả lời được cho chỉ thị 2:** B′ vẫn cho owner một điểm vào duy nhất — doctor in ra đúng lệnh cho từng host. Khác B ở chỗ nó **nói thay vì làm**; mà nửa "nói" mang gần hết giá trị và không mang rủi ro nào.

**Nói thẳng về nghĩa mạnh:** nếu owner muốn C, bằng chứng nói **không nên mở lại**. Không có dữ kiện mới nào ủng hộ, và chính lịch sử git cho thấy installer phổ quát không giảm được việc theo host.

**Điều gì đã đổi / KHÔNG đổi kể từ lúc bác (2026-09-11):**

- *Đã đổi:* Claude Code có đường CLI không tương tác nhận đường dẫn cục bộ (§5); trên máy này chỉ có 1 trong 7 CLI host.
- *KHÔNG đổi:* vẫn mỗi host một lệnh cài riêng; Antigravity vẫn không có lệnh cài; Codex và Cursor vẫn cài qua giao diện; lý do thật khiến installer v1 chết vẫn đúng nguyên; không có bằng chứng mới nào ủng hộ việc kit ghi vào cấu hình host.

---

## 8. Hai lỗi hồ sơ — **khác hạng, không để chung**

### 8.1 `v2 §1:28` — dữ kiện sai, đã xác minh bằng mã → **ACT, sửa được ở D6, không cần owner chốt**

Câu đang ghi: *"A universal installer or an at-runtime shim. Superpowers rejects those for the same reason the kit does: they do not load the bootstrap at session start."*

**Bằng chứng câu này sai với installer v1:** `156ab09^:scripts/install.cjs` → `ensureImport()` chèn dòng `@<kit>/core/AGENTS.md` vào `~/.claude/CLAUDE.md` (host nạp file này lúc mở phiên), và `antigravityInstall()` sinh `rules/AGENTS.md` với `trigger: always_on`. **Cả hai host đều được installer v1 nạp bootstrap lúc mở phiên.** Mệnh đề chỉ đúng với shim `npx skills`.

Cùng hạng với lỗi Skillmark/MIT: dữ kiện kiểm chứng được, sửa mà không đổi quyết định nào. **Quyết định Non-goal giữ nguyên**; chỉ lý do được sửa, và lý do thật **mạnh hơn** lý do đang ghi.

**Nội dung sửa đề xuất** (tách một câu thành hai, giữ nguyên vị trí trong Non-goals):

> - A universal installer that writes into host profiles. Every host ships its own install command, and `--plugin-dir` together with the host's own plugin install made the link layer unnecessary (v1's `scripts/install.cjs`, deleted in `156ab09`); the one host without an install command, Antigravity, is served by the copy script named in §3.
> - An at-runtime shim. Superpowers rejects those for the same reason the kit does: they do not load the bootstrap at session start.

### 8.2 `handoff:34` vs `v2 §1:16` — hai chủ trương xung đột → **chờ owner**

`docs/handoff/2026-09-11.md:34` liệt kê "marketplace-first install" trong Rejected options; `v2 §1:16` và §3 lại lấy marketplace làm đường cài chính. Không có dữ kiện nào sai ở đây — hai câu đều là chủ trương, viết ở hai thời điểm, trái nhau.

Nghiêng về phía "dòng ở handoff là mục thời v1 bị chép tiếp": toàn bộ phần còn lại của `:34` đều là mục v1 (`25 skill`, `/kn-`, `path-string hooks`, `docs/superpowers/`), và `2026-09-10-bearingkit-v1-design.md:81` ghi rõ *"the marketplace stays a secondary channel"*. **Nhưng** handoff đó viết *sau* khi v2 đã chốt, nên không loại trừ được nó có ý hẹp hơn (ví dụ: chưa lấy marketplace làm đường chính khi repo còn private và chưa chạy acceptance). Đoán sai thì đoán trúng vào kênh cài chính của kit. → **owner chốt** (câu hỏi ở `docs/specs/2026-09-11-skill-inventory.md`, "Questions for D5").

---

## 9. Chưa xác minh, chưa cần cho quyết định này

- Codex và Cursor có cho thêm marketplace bên thứ ba không, hay buộc phải nằm trong marketplace chính thức.
- `gemini extensions install` với đường dẫn cục bộ.
- `claude plugin install` chạy thật (chưa chạy: chạm `~/.claude` = COUNCIL theo `AGENTS.md`; nếu chạy thì chạy trên profile cách ly trước).
- Cơ chế bootstrap của Codex (đã là "wired, pending" trong v2 §3).

---

*Viết 2026-09-12 bởi phiên D4. Chữ trong tài liệu này là chữ của phiên, không phải của owner; nguyên văn chỉ thị 2 nằm ở `docs/handoff/2026-09-11-owner-directives.md`. Phương án B bị rút ở chính lượt này sau khi owner yêu cầu áp `§2.1` lên nó và nêu phương án B′; bản ghi giữ lại B ở §6 để lý do rút không biến mất. Không sửa mã, spec v2, plan hay hosts.md theo tài liệu này.*
