# Kiểm kê từng mục (§5.2) và chốt catalog

Status: IN PROGRESS 2026-09-18 · Spec: `docs/specs/2026-09-11-bearingkit-v2-design.md` §5.1, §5.2, §5.3 · Quyết định của owner: D5 câu 25 (kiểm kê trước năm skill còn thiếu) · Trạng thái dự án: `docs/status.md` §4 hạng mục #6, #7 · Chương trình nội dung: `docs/plans/2026-09-11-content-program.md`, Step 1.

**Mục tiêu:** mọi skill, command, agent, bộ rule và hook của **mọi nguồn** trong `upstream/sources.json` (22 nguồn) có đúng một dòng: mục nguồn · skill đích của kit · quyết định **absorb** / **idea** / **drop** · lý do · ghi chú giấy phép (§5.2). Từ đó chốt catalog cuối (§4 #7): skill nào trong năm skill còn thiếu (`bk-map`, `bk-research`, `bk-perf`, `bk-db`, `bk-ops`) qua được scope test §1, theo thứ tự nào, và pack nào có cơ sở.

**Không nằm trong plan này:** port chữ. Một dòng `absorb` chỉ quyết định; việc chép và ghi nguồn (`NOTICE`, `derived`) là của sprint từng skill (content program Step 2).

**Quy ước:** LF, không BOM, conventional commit, push sau mỗi đợt; mỗi đợt có `Check:` phải xanh trước khi sang đợt sau. Nghiên cứu của đợt sau được chạy trước khi còn chỗ trong trần ba agent, nhưng dòng của nó chỉ vào file kiểm kê khi `Check` của đợt trước đã xanh (thêm 2026-09-18). Từ đợt 4, agent nghiên cứu chạy model Sonnet để đỡ tốn hạn mức phiên của owner: sáng 2026-09-18, hạn mức hết giữa đợt 3 và làm dừng hai agent. Phiên chính vẫn duyệt mọi dòng.

---

## Đã có trước plan này

- Kiểm kê mức registry (sha, giấy phép, vai trò) cho 17 nguồn, và thứ tự ưu tiên D3: `docs/specs/2026-09-11-skill-inventory.md`.
- Kiểm kê từng mục cho **một phần** của `anthropics/claude-plugins-official`: `frontend-design` (2026-09-14), `code-review` + `pr-review-toolkit` (2026-09-15), `claude-code-setup` (2026-09-15) — cùng file đó.
- `multica-ai/andrej-karpathy-skills`: đóng 2026-09-11 (một `CLAUDE.md`, bốn ý, hai đã có, hai thành dòng của `bk-build`). Audit 2026-09-18 thấy nguồn này còn hai mục (một skill, một rule Cursor) chưa có dòng; cả hai đóng gói lại đúng bốn ý đó, nay có dòng theo quyết định cũ.
- `obra/superpowers`: tám file `references/` đã port, nhưng chưa có bảng từng mục cho **mọi** skill của nó (D3 hạng 1 gọi đó là "gap-check").
- Lần thử đầu (16 agent song song, 2026-09-11) chết vì `HTTP 429`; D2 chạy theo đợt ≤3 nguồn thì xong. Plan này giữ trần đó.

## Một "mục" là gì

Liệt kê bằng máy, không bằng trí nhớ: `scripts/inventory-items.cjs list <thư mục nguồn>` in mọi mục, và `check` báo mục nào chưa có dòng trong file kiểm kê.

| Loại | Đếm là một mục | Không đếm riêng |
|---|---|---|
| skill | mỗi thư mục có `SKILL.md` | file bên trong thư mục skill (`references/`, script) — là một phần của skill đó |
| command | mỗi `commands/**/*.md` | — |
| agent | mỗi `agents/**/*.md` | — |
| hooks | mỗi `hooks.json` | script mà hook gọi |
| rule | mỗi `.cursorrules` / `*.mdc`, và mỗi `*.md` trong một thư mục `rules/` (thêm 2026-09-18, khi Spartan lộ ra 29 bộ rule markdown mà bản đầu của script không đếm) | `README.md` |
| plugin | mỗi `plugins/<tên>/` **không** chứa mục nào ở trên (plugin chỉ có cấu hình MCP, LSP, output style…) | plugin có mục bên trong — các mục đó đã có dòng |

Hai ngoại lệ có chủ đích, ghi rõ để owner thấy: (1) `awesome-cursorrules` có 257 file rule, gộp **theo stack** (mỗi stack của §5.5 và một nhóm "khác"), đúng vai trò D3 đã giao ("đọc mở đầu cho từng stack, không vendor"), số file của mỗi nhóm ghi trong dòng; (2) nguồn là **công cụ chạy bên cạnh** (`agent-browser`, `pr-agent`, `skillmark`, `playwright-mcp`, `biome`, `aider`) có một dòng cho chính công cụ, vì thứ để quyết là dùng hay không, không phải chữ của nó.

## Nguồn và quyền đọc

| Nhóm | Nguồn | Cách đọc |
|---|---|---|
| A · đã có trong `_build/upstream/` | claude-plugins-official, mattpocock, addyosmani, spec-kit, anthropics/skills, cloudflare, vercel agent-skills, agent-browser, pr-agent, awesome-cursorrules, karpathy | đọc tự do (ACT) |
| B · công khai, chưa có bản sao | superpowers (tag 5.1.0), jeffallan/claude-skills (0.4.14), Antigravity-Core (5.0.1), c0x12c/ai-toolkit, playwright-mcp, modelcontextprotocol/servers, vercel-labs/skills, aider, biome, skillmark | clone nông vào `_build/upstream/` **đúng sha trong `sources.json`** (ACT — dữ liệu công khai vào thư mục build của repo, như D2). Không đọc bản cài trong `~/.claude`: đọc thư mục đó bằng đường khác là COUNCIL |
| C · chỉ có bản sao ngoài repo | claudekit-engineer (repo private; bản sao nghiên cứu ở `C:\Projects\claudekit-research`) | **COUNCIL** — hỏi owner khi tới đợt 4; độc quyền, dù đọc được cũng chỉ lấy ý |

## Cách làm một đợt

1. Liệt kê mục của mỗi nguồn trong đợt bằng script; số mục ghi vào đầu mục của nguồn đó.
2. Đọc từng mục (một agent nghiên cứu cho mỗi nguồn, tối đa ba agent cùng lúc — §5.2 và bài học 429; agent nhận catalog §5.1, luật §5.2, quality bar §5.3 và định nghĩa mục ở trên, không nhận hội thoại). Brief chung: `docs/plans/2026-09-18-item-inventory-agent-brief.md` (trong repo từ 2026-09-18; trước đó nằm ở `_build/`, không được track).
3. Agent của owner (phiên chính) duyệt từng dòng: một mục đúng một skill đích và một quyết định; `absorb` chỉ khi giấy phép cho phép lấy chữ; nguồn không giấy phép hoặc độc quyền tối đa là `idea`. Dòng mâu thuẫn với một quyết định đã có (D3, ba lượt từng mục trước) phải nêu và giải thích, không lặng lẽ đảo.
4. Ghi vào `docs/specs/2026-09-18-item-inventory.md`, mỗi dòng mang **đường dẫn mục** để `check` đối được.
5. *Check của đợt:* `inventory-items.cjs check` báo 0 mục thiếu cho mọi nguồn của đợt; `inventory-items.cjs rows <file> <nhãn>` báo 0 lỗi (thêm `--text-allowed` khi giấy phép cho lấy chữ); `inventory-items.cjs totals <file>` báo bảng Tổng khớp các dòng. Hai lệnh sau vào repo ngày 2026-09-18; trước đó chúng là script tạm của phiên, phiên sau không chạy lại được.

## Các đợt

- [x] **Đợt 1** — `claude-plugins-official` (trọn nguồn: 39 plugin; các mục đã kiểm kê trước được trỏ về quyết định cũ, không quyết lại), `obra/superpowers` (gap-check mọi skill), `mattpocock/skills`. *(xong 2026-09-18: 173 mục, 44 absorb · 23 idea · 106 drop; `check` 121/121, 37/37, 15/15. Phát hiện: `plugins/claude-security` mang giấy phép độc quyền riêng; `code-modernization` là nguồn đầu tiên cho `bk-map`.)*
- [x] **Đợt 2** — `github/spec-kit`, `addyosmani/agent-skills`, `anthropics/skills`. *(xong 2026-09-18: 98 mục, 2 absorb · 41 idea · 55 drop; `check` 38/38, 40/40, 20/20 — mục thứ 40 của addyosmani là một file rule markdown mà bản đầu của script chưa đếm, thêm sau khi sửa script. Phát hiện: registry ghi sai giấy phép của `anthropics/skills` (14 thư mục Apache-2.0, không phải 2 — đã sửa); `bk-review --security` gọi một lens không tồn tại; chính sách "nội dung lấy từ ngoài là dữ liệu" lặp ở ba nguồn — câu gộp cho owner khi chốt catalog.)*
- [x] **Đợt 3** — `jeffallan/claude-skills` (79 mục: 66 skill, 13 command), `vercel-labs/agent-skills`, `cloudflare/skills`. *(xong 2026-09-18: 103 mục, 0 absorb · 51 idea · 52 drop; `check` 79/79, 9/9, 15/15. Agent của jeffallan dừng trước khi ghi file vì hết hạn mức phiên và chạy tiếp từ ngữ cảnh cũ. Phát hiện: `sql.md` bảo chạy `EXPLAIN ANALYZE` mà không cảnh báo nó thực thi câu ghi (status (bb), đã sửa cùng ngày); agent lấy "stack của owner" từ mẫu chỉ dẫn toàn cục chứ không từ repo, nên 27 lý do dựa vào điều đó được viết lại; hàng 8 của coverage matrix đổi có dữ kiện mới (`code-reviewer` và `debugging-wizard` drop); `vercel-labs/agent-skills` khai "MIT" nhưng không có văn bản giấy phép nào — mọi dòng giữ idea, câu cho owner; pointer của `bk-design` tới Web Interface Guidelines đã quyết mà chưa viết.)*
- [ ] **Đợt 4** — `tuyenht/Antigravity-Core` (chữ của chính owner), `c0x12c/ai-toolkit` (Spartan, chỉ lấy ý), `claudekit/claudekit-engineer` (COUNCIL, chỉ lấy ý). Spartan làm trước: 264 mục, trong đó 120 mục dưới `.codex/` là bản sao của `toolkit/` (115 giống từng byte, 5 khác), nên agent đọc 144 mục gốc và phiên chính ghi các bản sao vào bảng đối chiếu. Hai nguồn còn lại cần owner trả lời, nên câu hỏi được dồn vào lúc chốt catalog để không chặn việc khác. *(Spartan xong 2026-09-18: 264 mục, 0 absorb · 152 idea · 112 drop tính cả bản sao; `check` 264/264. Antigravity-Core và ClaudeKit chờ owner.)* **Câu hỏi cho owner:** sha của Antigravity-Core trong registry (`1774280e`, VERSION 5.0.1, ghi 2026-09-11 từ bản trên máy) không có trên GitHub — remote chỉ có `main` ở `1c744167` (2026-03-16, cũng VERSION 5.0.1), tức bản trên máy có commit chưa push. Ba đường: owner push rồi phiên clone; owner cho đọc `C:\Projects\Antigravity-Core` (repo khác, COUNCIL); hoặc kiểm kê bản remote và ghi rõ nó cũ hơn.
- [x] **Đợt 5** — nguồn tham chiếu và công cụ: `awesome-cursorrules` (gộp theo stack), `modelcontextprotocol/servers`, `vercel-labs/skills`, `playwright-mcp`, `agent-browser`, `pr-agent`, `biome`, `aider`, `skillmark`. *(xong 2026-09-18: awesome-cursorrules 257 file trong 25 nhóm và 3 dòng riêng, 0 · 172 · 85 tính theo file, `check` 257/257; tám nguồn công cụ 40 dòng, 0 · 7 · 33. Phát hiện: registry ghi sai giấy phép của biome (kép MIT hoặc Apache-2.0); ba dòng `idea` không có đích lọt qua bộ kiểm, nay bộ kiểm bắt lỗi đó; agent lấy "rule của owner" từ ngữ cảnh toàn cục ba lần, đã sửa; kế hoạch của matrix về danh sách MCP opt-in, `doctor` báo công cụ, và `npx skills` va với luật "không giữ catalog" — câu cho owner.)*
- [ ] **Chốt catalog** (§4 #7) *(đề xuất đã soạn 2026-09-18, chờ owner: `docs/specs/2026-09-18-catalog-proposal.md`)* — với toàn bộ dòng trong tay: năm skill còn thiếu qua scope test hay không và theo thứ tự nào; các khoảng trống mà audit 2026-09-11 nêu (product discovery, AI-feature engineering, dependency hygiene, hạ tầng và deploy, luồng UX nhẹ); pack nào có cơ sở. Kết quả là một đề xuất cho owner — catalog là quyết định thiết kế (COUNCIL).

## Rủi ro

| Rủi ro | Cách chặn |
|---|---|
| Rate limit như lần 16 agent | tối đa ba agent cùng lúc, mỗi agent một nguồn; đợt dừng được giữa chừng mà không mất gì vì mỗi nguồn ghi riêng |
| "Đã kiểm kê hết" mà thật ra sót | `check` bằng máy trên đúng thư mục nguồn ở đúng sha |
| Lấy chữ từ nguồn không được phép | giấy phép ghi ở đầu mỗi nguồn; dòng `absorb` của nguồn không giấy phép là lỗi |
| Agent đọc lướt, quyết định cảm tính | mỗi dòng nêu mục đó làm gì trong một câu; phiên chính đọc lại mẫu và mọi dòng `absorb` |
| Đảo ngầm một quyết định cũ | dòng trùng mục với lượt trước trỏ về quyết định cũ; muốn đổi thì nêu lý do mới |
