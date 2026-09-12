# Handoff · 2026-09-11 (phiên Opus 5, bước 1 content program bị ngắt)

File này **bổ sung**, không thay thế `docs/handoff/2026-09-11.md`. File kia vẫn là bản ghi tri thức bền (Block 1) và resume payload của ngày. File này chỉ ghi những gì phiên này đã đọc, đã xác minh, đã quyết và đang dở, để phiên sau không phải làm lại.

Bối cảnh: phiên chạy bước 1 của `docs/plans/2026-09-11-content-program.md` (kiểm kê mọi nguồn trong ma trận). Đã đọc xong tài liệu nền, đã clone đủ nguồn, đã viết brief cho agent, đã phóng 16 agent nghiên cứu song song — **cả 16 agent chết cùng lúc vì HTTP 429 "Fable limit"**, không agent nào ghi được file kết quả. Không có file nào trong repo bị sửa trong phiên này.

---

## 1. Trạng thái hiện tại — đã đọc, đã xác minh

### 1.1 Tài liệu đã đọc trọn vẹn trong phiên

| Tài liệu | Đã đọc |
|---|---|
| `AGENTS.md` (gốc repo) | toàn bộ (nạp qua `CLAUDE.md`) |
| `docs/handoff/2026-09-11.md` | toàn bộ, cả hai block |
| `docs/plans/2026-09-11-content-program.md` | toàn bộ (4 bước + rules cho mỗi sprint) |
| `docs/plans/2026-09-10-content-backlog.md` | toàn bộ (nguồn bắt buộc + follow-up hàng 13–24) |
| `docs/specs/2026-09-11-bearingkit-v2-design.md` | toàn bộ §1–§16 |
| `docs/specs/2026-09-10-coverage-matrix.md` | toàn bộ, hàng 1–39 + bảng đo |
| `docs/specs/2026-09-10-bearingkit-v1-design.md` | §7 (7.1 catalog 17 skill, 7.2 optional, 7.3 template + handoff chain, 7.4 removed), §12 upstream learning, §18 field lessons L1–L20 |
| `upstream/sources.json` | toàn bộ (17 nguồn) |
| `NOTICE` | toàn bộ (một mục duy nhất: obra/superpowers) |
| `.gitignore` | toàn bộ (`_build/` bị ignore) |
| frontmatter 11 `skills/*/SKILL.md` | toàn bộ phần đầu mỗi file |

### 1.2 Trạng thái repo (xác minh bằng lệnh)

- Branch `main`, working tree sạch lúc mở phiên, `main` = `origin/main`.
- **Chỉ có 11 thư mục skill tồn tại**: `bk-audit`, `bk-build`, `bk-close`, `bk-debug`, `bk-next`, `bk-plan`, `bk-protocol`, `bk-review`, `bk-ship`, `bk-spec`, `bk-test`. Sáu skill trong catalog §5.1 **chưa có thư mục**: `bk-map`, `bk-research`, `bk-design`, `bk-perf`, `bk-db`, `bk-ops`. Đúng luật §5.2 ("a skill enters the catalog only when the inventory shows work for it") — inventory sẽ quyết.
- References đang có: `bk-protocol/references/` 9 file (`correction-cues`, `council`, `evidence`, `gate-patterns`, `handoff-template`, `host-tools`, `meta-routing`, `personas`, `rba-lite`); mỗi skill lifecycle có đúng 1 file đã hấp thụ từ Superpowers: `bk-spec/references/brainstorming.md`, `bk-plan/references/writing-plans.md`, `bk-build/references/executing.md`, `bk-test/references/tdd.md`, `bk-debug/references/systematic-debugging.md`, `bk-review/references/code-review-exchange.md`, `bk-ship/references/finishing.md`.
- Thư mục gốc: `AGENTS.md CHANGELOG.md CLAUDE.md GEMINI.md NOTICE README.md _build agents bin docs evals gemini-extension.json hooks package.json scripts skills tests upstream`.

### 1.3 Nguồn đã có bản sao cục bộ (đường dẫn + sha đã xác minh phiên này)

| Nguồn | Đường dẫn cục bộ | sha / version | Cách xác minh |
|---|---|---|---|
| obra/superpowers 5.1.0 | `C:\Users\tuyen\.claude\plugins\cache\superpowers-marketplace\superpowers\5.1.0` | thư mục version `5.1.0`; marketplace repo HEAD `91cb319aedbfa57b67b2460b38c1a80d38b0137f` (2026-05-06) | `ls`, `git -C <marketplace> log -1` |
| anthropics/claude-plugins-official | `_build/upstream/claude-plugins-official` | `3b600518a637492d37c9877aeb49c2a55d939c04` | `git rev-parse HEAD` |
| jeffallan/claude-skills (plugin `fullstack-dev-skills` 0.4.14) | `C:\Users\tuyen\.claude\plugins\cache\fullstack-dev-skills\fullstack-dev-skills\0.4.14` | version 0.4.14; marketplace repo HEAD `5e8b6b8ff4007414f91f980771047b6136600c34` (2026-05-01) | `ls`, `marketplace.json`, `git log -1` |
| multica-ai/andrej-karpathy-skills | `_build/upstream/multica-ai_andrej-karpathy-skills` | `2c606141936f1eeef17fa3043a72095b4765b9c2` | clone depth 1, khớp `sources.json` |
| addyosmani/agent-skills | `_build/upstream/addyosmani_agent-skills` | `6ca0cd7db39b41b1c37e26d335c507ee92382c6d` | clone, khớp `sources.json` |
| mattpocock/skills | `_build/upstream/mattpocock_skills` | `3cca18b368ae95cdbdebbff572ccafa662551015` | clone, khớp `sources.json` |
| github/spec-kit | `_build/upstream/github_spec-kit` | `c173bf19a6654e3b05386ec3599349a55282b897` | clone, khớp `sources.json` |
| anthropics/skills | `_build/upstream/anthropics_skills` | `34040c9c568585f6929bedeaad110ad08f079624` | clone, khớp `sources.json` |
| vercel-labs/agent-skills | `_build/upstream/vercel-labs_agent-skills` | `063bee94c3f4df8453406c830b0a7df0f2860278` | clone, khớp `sources.json` |
| PatrickJS/awesome-cursorrules | `_build/upstream/PatrickJS_awesome-cursorrules` | `b044f956f021b6e8877f16781bcfc466a6a120e9` | clone, khớp `sources.json` |
| cloudflare/skills | `_build/upstream/cloudflare_skills` | `b052c32bab7dd493513260228a36c88294f343f1` | clone, khớp `sources.json` |
| vercel-labs/agent-browser | `_build/upstream/vercel-labs_agent-browser` | `8c15ff9f71ae60c7e99e66afe1e2d4b9bf414fe2` | clone, khớp `sources.json` |
| The-PR-Agent/pr-agent | `_build/upstream/The-PR-Agent_pr-agent` | `101dcafc41ca447cbc748871e10dfa579017a6ee` | clone — **KHÁC** sha trong `sources.json` (`1421c673effb7644239e18fdea5403ccf04bb190`) |
| Spartan AI Toolkit (đã cài) | `C:\Users\tuyen\.claude\commands\spartan.md` + `C:\Users\tuyen\.claude\commands\spartan\*.md` + `C:\Users\tuyen\.claude\rules\**` + một phần `C:\Users\tuyen\.claude\agents\*` | không có version string tìm thấy | `ls`, đọc `update.md` |
| ClaudeKit (claudekit-engineer) | `C:\Projects\claudekit-research\claudekit-engineer` | `898c4a5cddac05b919e2c9ce922460f5662d511b` (2026-05-13) | `git log -1` |
| Kit cũ của owner = **Antigravity-Core** | `C:\Projects\Antigravity-Core` | VERSION `5.0.1`, HEAD `1774280ee0d559d337f8f3a7014e45ce9d974f11` (2026-03-17), remote `github.com/tuyenht/Antigravity-Core.git` | `cat VERSION`, `git log -1`, `git remote -v` |
| Skillmark (hàng 7) | `C:\Projects\claudekit-research\skillmark` | chưa đọc sha | `ls` |
| DB knowledge base (cho `bk-db`) | `C:\Projects\DatabasePerformance` + skill `C:\Users\tuyen\.claude\skills\database-playbook\SKILL.md` | — | `ls`, đọc frontmatter |

Nguồn **chưa fetch** (chưa cần cho bước 1 theo plan): microsoft/playwright-mcp (hàng 17), modelcontextprotocol/servers (23), vercel-labs/skills (24), biomejs/biome (20), Aider (26), context7 (6), google-gemini/gemini-skills (38, đang chờ quyết định).

### 1.4 Giấy phép đã xác minh trong phiên này

- **jeffallan/claude-skills**: MIT. `LICENSE` có ở `.../0.4.14/LICENSE`; `marketplace.json` khai `"license": "MIT"`; GitHub API `repos/jeffallan/claude-skills` → `MIT`, pushed `2026-08-07T20:19:18Z`, 11.412 sao. (Ma trận hàng 8 trước đây chỉ ghi "MIT" không nguồn — nay có nguồn.)
- **Spartan / c0x12c/ai-toolkit**: repo tồn tại, public, chưa archive, pushed `2026-06-18`, 99 sao, branch mặc định `master`. `gh api repos/c0x12c/ai-toolkit/license` → **404 Not Found**; listing contents gốc không có `LICENSE`. → **Không có file giấy phép** ⇒ giữ nguyên chế độ ideas-only, không lấy một chữ nào. (`spartan-stratos/ai-toolkit` → 404, không tồn tại.)
- **ClaudeKit**: `LICENSE` mở đầu "Copyright (c) 2024-2025 ClaudeKit. All Rights Reserved.", phần mềm được cấp phép chứ không bán ⇒ **proprietary**, ideas-only clean-room.
- **Antigravity-Core**: `LICENSE` là "PROPRIETARY LICENSE, Copyright (c) 2026 Antigravity-Core. All Rights Reserved." nhưng repo thuộc chính owner (`tuyenht`) ⇒ văn bản do owner tự viết được adapt; văn bản bên thứ ba vendored bên trong thì **không**.
- **obra/superpowers**: MIT, Copyright (c) 2025 Jesse Vincent — đã nằm trong `NOTICE` kèm toàn văn.
- Các giấy phép khác giữ nguyên như `upstream/sources.json` đã ghi (đã verified 2026-09-11, không đọc lại phiên này).

### 1.5 Số liệu cấu trúc đã đếm bằng lệnh (dùng lại được, khỏi đếm lại)

- **Superpowers 5.1.0** — 14 skill: `brainstorming`, `dispatching-parallel-agents`, `executing-plans`, `finishing-a-development-branch`, `receiving-code-review`, `requesting-code-review`, `subagent-driven-development`, `systematic-debugging`, `test-driven-development`, `using-git-worktrees`, `using-superpowers`, `verification-before-completion`, `writing-plans`, `writing-skills`.
- **claude-plugins-official** — 39 thư mục dưới `plugins/`: `agent-sdk-dev, clangd-lsp, claude-code-setup, claude-md-management, claude-security, code-modernization, code-review, code-simplifier, commit-commands, csharp-lsp, cwc-makers, example-plugin, explanatory-output-style, feature-dev, frontend-design, gopls-lsp, hookify, jdtls-lsp, kotlin-lsp, learning-output-style, lua-lsp, math-olympiad, mcp-server-dev, mcp-tunnels, php-lsp, playground, plugin-dev, pr-review-toolkit, project-artifact, pyright-lsp, ralph-loop, receipts, ruby-lsp, rust-analyzer-lsp, security-guidance, session-report, skill-creator, swift-lsp, typescript-lsp`; ngoài ra có `external_plugins/`.
- **fullstack-dev-skills 0.4.14** — 66 skill (đếm `ls skills | wc -l`), 9 project workflow command theo mô tả marketplace.
- **ClaudeKit** (`claude/` trong clone) — skills 89 entry, agents 13, hooks 23, rules 8, cộng `output-styles/`, `command-archive/`, `schemas/`, `scripts/`, `session-state/`, `settings.json`, `statusline.cjs`, `metadata.json`. Tên skill đáng chú ý: `agent-browser, agentize, ai-artist, ai-multimodal, ask, backend-development, better-auth, bootstrap, brainstorm, ck-autoresearch, ck-debug, ck-graphify, ck-help, ck-loop, ck-plan, ck-predict, ck-scenario, ck-security, code-review, coding-level, context-engineering, cook, copywriting, cti-expert, databases, deploy, design, devops, docs, docs-seeker, document-skills, excalidraw, find-skills, fix, frontend-design, frontend-development, git, gkg, google-adk-python, journal, llms, markdown-novel-viewer, mcp-builder, media-processing, mermaidjs-v11, mintlify, mobile-development, payment-integration, plans-kanban, preview, problem-solving, project-management, project-organization, react-best-practices, remotion, repomix, research, retro, scout, security-scan, sequential-thinking, shader, ship, shopify, show-off, skill-creator, stitch, tanstack, team, tech-graph, test, threejs` (+ `_shared`, `common`, `INSTALLATION.md`, `README.md`, `THIRD_PARTY_NOTICES.md`, `agent_skills_spec.md`, `install.ps1`, `install.sh`).
- **Antigravity-Core `.agent/`** — `agents/` 27 file, `skills/` 603 file (~63 thư mục), `rules/` 112 file, `workflows/` 36 file, `systems/` 6 file, `docs/` 30 file (đếm bằng `find -type f | wc -l`). Badge README tự khai 27 agents / 63 skills / 110 rules / 36 workflows / 6 protocols — **số badge, chưa đối chiếu**; số đếm file ở trên mới là số đã đo. Tên skill: `ai-ml-pipeline, ai-sdk-expert, api-patterns, app-builder, architecture, architecture-mastery, bash-linux, behavioral-modes, brainstorming, clean-code, cloudflare, code-review-checklist, context-hub-bridge, contract-testing, database-design, deployment-procedures, docker-expert, documentation-templates, frontend-design, game-development, geo-fundamentals, go-patterns, graphql-patterns, i18n-localization, inertia-performance, kubernetes-patterns, laravel-performance, lint-and-validate, mcp-builder, microservices-communication, mobile-design, monitoring-observability, nestjs-expert, nextjs-best-practices, nodejs-best-practices, nosql-patterns, parallel-agents, performance-profiling, plan-writing, powershell-windows, prisma-expert, prisma7-nextjs-guard, python-patterns, react-native-performance, react-patterns, react-performance, red-team-tactics, rust-patterns, seo-fundamentals, server-management, state-management, systematic-debugging, tailwind-patterns, tdd-workflow, terraform-iac, testing-mastery, testing-patterns, typescript-expert, ui-ux-pro-max, vector-databases, velzon-admin, vue-expert, vulnerability-scanner, webapp-testing` (+ `DEPENDENCY-GRAPH.md`, `README.md`). Cấp `.agent/` còn: `ARCHITECTURE.md, CHANGELOG.md, GEMINI.md, VERSION, agent.bat/ps1/sh, auto-healing.yml, benchmarks, dx-analytics.yml, examples, maintenance, memory, observability.yml, performance-budgets.yml, pipelines, project.json, reference-catalog.md, scripts, secret-scanning.yml, templates`.
- **Spartan** — 69 file trong `commands/spartan/` theo listing (ma trận hàng 5 ghi "70 command files", chênh 1, chưa đối chiếu lại); rules: `backend-micronaut/` 6, `core/` 3, `database/` 3, `frontend-react/` 1, `infrastructure/` 7, `shared-backend/` 1, `ux-design/` 1, cộng 8 file `.md` ở cấp `rules/`.
- **Hook ClaudeKit còn sống trong `~/.claude/settings.json`** (xác minh bằng `node -e`): `UserPromptSubmit` → `simplify-gate.cjs`; `PreToolUse` matcher `Write` → `descriptive-name.cjs`; `PreToolUse` matcher `Bash|Glob|Grep|Read|Edit|Write` → `scout-block.cjs` **và** `privacy-block.cjs`. Đúng 4 hook như kế hoạch migration đã ghi.

---

## 2. Quyết định đã chốt (và lý do)

### 2.1 Chốt từ trước, KHÔNG mở lại (spec v2 §15 + handoff tối 2026-09-11)

1. Hình dạng v2 theo Superpowers: `skills/` ở gốc, manifest riêng cho từng host, một bootstrap mỗi host, **không installer**, **không lớp rule theo host**, đo đạc chỉ ở mốc phát hành. Lý do: nội dung quan trọng hơn máy móc; `--plugin-dir` khiến installer v1 thành thừa.
2. Giữ từ v1: catalog 17 skill và các gate của chúng, tiền tố `bk-`, văn bản protocol, state store + `record-guardrail`, `detect-stack`, evals runner, luật provenance, hợp đồng token. v1 §3 và §18 vẫn là bản ghi có thẩm quyền.
3. Rule ngôn ngữ → `skills/bk-build/references/stacks/`; security baseline → nằm trong protocol; 4 persona ghép với 4 file agent viết tay; hook cưỡng chế hoãn sang v0.4 dạng tuỳ chọn.
4. **Inventory (§5.2) là thứ chốt catalog cuối cùng và các gói tuỳ chọn.** Product discovery, UX, AI-feature, dependency hygiene là **pack**, không phải core, cho tới khi inventory nói khác.
5. Host ngoài Claude Code và Antigravity chỉ được liệt kê là "supported" sau khi qua acceptance test.
6. Superpowers được port dưới dạng **substance, không phải structure**; meta-skill không được liệt kê thành skill; `writing-skills` trở thành static check trong `tests/skills.test.cjs`.
7. Luật §5.2: mỗi mục nguồn ứng với **đúng một** skill của kit và **đúng một** quyết định (absorb / idea / drop). Không lấy chữ từ nguồn chưa xác minh giấy phép permissive; nguồn không giấy phép chỉ đóng góp ý tưởng, viết lại clean-room.
8. Hàng 38 (`google-gemini/gemini-skills`) giữ nguyên trạng thái owner đã quyết cho tới khi owner trả lời.

### 2.2 Về LICENSE của kit — **CHƯA CHỐT, đang chờ owner**

- `package.json` khai MIT; **repo chưa có file `LICENSE`**.
- Dòng bản quyền (tên + năm) là quyền của owner. Đã có lệnh cấm rõ: **agent không được tự viết file LICENSE** (nằm trong danh sách "rejected options" của handoff tối 2026-09-11).
- ⇒ Phiên sau không được tạo `LICENSE`. Chỉ hỏi.

### 2.3 Quyết định phương pháp của phiên này (ACT, đã thực thi)

- Một agent nghiên cứu cho mỗi nguồn, chạy song song, **không nhận lịch sử chat**; mỗi agent chỉ nhận một file brief chung + phần scope riêng của nguồn đó.
- Brief chứa: catalog + ý định từng skill, danh sách pack tuỳ chọn, luật quyết định absorb/idea/drop, quality bar §5.3, danh sách những gì kit **đã** hấp thụ (để agent không đề xuất trùng), danh sách những thứ kit cố tình **không** mang (để map thẳng sang `drop`), 8 stack đã định.
- Nguồn thiếu bản sao → shallow clone (`--depth 1`) vào `_build/upstream/` (đã gitignore), sha ghi lại để đưa vào `upstream/sources.json`.
- Mỗi agent ghi đúng một file `NN-<nguồn>.md` vào scratchpad, cấu trúc 6 mục: Source / Items (bảng) / Gaps / Stack notes / Counts / Verdict.

---

## 3. Việc đang dở — chính xác ở đâu

1. **16 agent inventory đã phóng, cả 16 chết.** Lỗi: `HTTP 429 rate_limit — "You've reached your Fable limit"`, model `claude-fable-5-1`. Hai agent kịp in một câu mở đầu, **không agent nào ghi được file kết quả**.
2. Thư mục kết quả `…\scratchpad\inventory\` hiện **chỉ có `BRIEF.md`**, không có file `01-*.md` … `16-*.md` nào.
3. Phân công 16 agent đã soạn xong (nguồn → file output → scope) — xem mục 4.1, chép lại nguyên trạng.
4. **Chưa có file `docs/specs/<ngày>-skill-inventory.md`.** Chưa bắt đầu gộp.
5. **Không có file nào trong repo bị sửa.** Thay đổi duy nhất trên đĩa: 10 clone mới trong `_build/upstream/` (gitignored) và `BRIEF.md` trong scratchpad.
6. `upstream/sources.json` **chưa** được cập nhật với sha mới của pr-agent, cũng chưa có mục cho fullstack-dev-skills / Spartan / ClaudeKit / kit cũ / Skillmark.

---

## 4. Việc còn lại, theo thứ tự thực thi

> **Thứ tự thực thi D1–D6 (đề xuất của phiên D0, owner chưa xác nhận từng chữ) nằm ở `docs/handoff/2026-09-11-owner-directives.md`; đọc file đó trước, nó quyết định thứ tự các mục 4.x dưới đây (kiểm kê là D2).**
>
> **D4 (chỉ thị 2 — cách cài) đã chạy 2026-09-12. Kết quả ở `docs/specs/2026-09-12-install-council.md`: ba phương án A / B′ / C, khuyến nghị **A + B′**, khảo sát 8 host, lịch sử installer v1, và hai lỗi hồ sơ được phân loại (`v2 §1:28` = dữ kiện sai, ACT sửa ở D6, nội dung sửa đã soạn sẵn ở §8.1 của file đó; `handoff 2026-09-11:34` marketplace-first = xung đột chủ trương, chờ owner). Toàn bộ file đó là **ĐỀ XUẤT, chưa có hiệu lực**: không mã, spec v2, plan hay `docs/hosts.md` nào bị sửa theo nó. Câu hỏi của D4 nằm ở mục 4.5 dưới đây.**

### 4.1 Chạy lại inventory (bước 1 content program)

Chạy **theo đợt nhỏ** (xem gotcha 5.1), không phóng 16 agent một lượt. Phân công giữ nguyên:

| # | Nguồn | Đường dẫn agent phải đọc | Chế độ | File output |
|---|---|---|---|---|
| 01 | obra/superpowers 5.1.0 | cache Superpowers (1.3) | adapt — đã absorb, chỉ soát thiếu sót | `01-superpowers.md` |
| 02 | anthropics/claude-plugins-official | `_build/upstream/claude-plugins-official` | adapt | `02-claude-plugins-official.md` |
| 03 | fullstack-dev-skills 0.4.14 | cache plugin | reference | `03-fullstack-dev-skills.md` |
| 04 | Spartan AI Toolkit | `~/.claude/commands/spartan*`, `~/.claude/rules/**`, 9 agent Spartan | ideas-only | `04-spartan.md` |
| 05 | ClaudeKit + tàn dư trên máy | clone + `~/.claude/hooks`, rules, agents, output-styles | ideas-only clean-room | `05-claudekit.md` |
| 06 | mattpocock/skills | `_build/upstream/mattpocock_skills` | adapt | `06-mattpocock-skills.md` |
| 07 | addyosmani/agent-skills | `_build/upstream/addyosmani_agent-skills` | ideas-only (absorb chỉ khi hơn hẳn) | `07-addyosmani-agent-skills.md` |
| 08 | karpathy-skills | `_build/upstream/multica-ai_andrej-karpathy-skills` | ideas-only | `08-karpathy-skills.md` |
| 09 | github/spec-kit | `_build/upstream/github_spec-kit` | ideas-only | `09-spec-kit.md` |
| 10 | anthropics/skills | `_build/upstream/anthropics_skills` | adapt **chỉ** frontend-design + mcp-builder | `10-anthropics-skills.md` |
| 11 | vercel-labs/agent-skills | `_build/upstream/vercel-labs_agent-skills` | reference | `11-vercel-agent-skills.md` |
| 12 | awesome-cursorrules | `_build/upstream/PatrickJS_awesome-cursorrules` | reference (không vendor, gom nhóm, không 1 hàng/rule set) | `12-awesome-cursorrules.md` |
| 13 | cloudflare/skills | `_build/upstream/cloudflare_skills` | reference | `13-cloudflare-skills.md` |
| 14 | Kit cũ của owner (Antigravity-Core) | `C:\Projects\Antigravity-Core` + `database-playbook` + `C:\Projects\DatabasePerformance` | adapt (chỉ chữ của owner) | `14-owner-previous-kit.md` |
| 15 | vercel-labs/agent-browser | `_build/upstream/vercel-labs_agent-browser` | reference | `15-agent-browser.md` |
| 16 | The-PR-Agent/pr-agent | `_build/upstream/The-PR-Agent_pr-agent` | reference | `16-pr-agent.md` |

Trọng tâm đã soạn cho vài nguồn (giữ lại khi viết prompt mới):
- **01**: với mỗi skill nguồn, mở reference tương ứng trong kit và nói rõ *đã có* hay *còn thiếu quy tắc nào*.
- **02**: đọc sâu `code-review`, `pr-review-toolkit` (6 agent: code-reviewer, code-simplifier, comment-analyzer, pr-test-analyzer, silent-failure-hunter, type-design-analyzer), `frontend-design`, `claude-code-setup` + references của nó, `security-guidance/hooks/patterns.py`; 12 plugin LSP + output styles + playground/receipts/math-olympiad → mỗi cái một hàng `drop` kèm lý do.
- **05**: mỗi hook ClaudeKit *chặn cái gì và vì sao*; skill nào vendor lại nguồn khác → `drop: duplicate of <nguồn gốc>`; hỏi riêng `~/.claude/rules/review-audit-self-decision.md` là của ClaudeKit hay do owner tự viết.
- **12**: không liệt kê 100+ rule set; đếm theo thư mục, chọn 1–3 set tốt nhất cho mỗi stack trong 8 stack, phần còn lại gom nhóm kèm số đếm.
- **14**: nêu chính xác file chứa RBA fail conditions, known-failure guard (`prisma7-nextjs-guard`), asset budgets (`performance-budgets.yml`), design-critic, database playbook, các dòng protocol chưa có trong `bk-protocol/SKILL.md`, và design dataset.

### 4.2 Gộp thành inventory

`docs/specs/<ngày>-skill-inventory.md` theo §5.2: mỗi mục nguồn = 1 skill + 1 quyết định + lý do + ghi chú giấy phép. Giải quyết xung đột khi hai nguồn cùng đòi một chỗ (luật: một mục nguồn chỉ ứng với một skill).

### 4.3 Chốt catalog + pack

Đề xuất danh mục skill cuối cùng (17 hiện tại: giữ / bỏ / thêm) và các gói tuỳ chọn (`bk-product`, `bk-ux`, `bk-agent`, `bk-deps`, `bk-preview`, `bk-guard`, và pack mới nếu inventory chứng minh được), mỗi mục kèm bằng chứng là số hàng inventory đổ vào nó.

### 4.4 Cập nhật provenance

`upstream/sources.json`: sửa sha pr-agent, thêm các nguồn còn thiếu (fullstack-dev-skills, Spartan, ClaudeKit, kit cũ, Skillmark, Antigravity docs) với mode tương ứng; cập nhật cột Status trong ma trận cho nguồn nào đã kiểm kê xong.

### 4.5 Gom câu hỏi cho owner, hỏi **một lần** ở cuối

Danh sách hiện tại (chưa ai trả lời): (1) hàng 38 gemini-skills; (2) dòng bản quyền cho `LICENSE`; (3) host nào owner thực dùng thêm (Gemini CLI / Cursor / Codex / Copilot CLI); (4) pack nào bắt buộc phải là core; (5) Phase 0 trên workstation; (6) hai dòng protocol verbatim + design dataset từ kit cũ.

D3 sinh thêm 7 câu nữa, nằm ở `docs/specs/2026-09-11-skill-inventory.md` mục "Questions for D5" (danh sách tối thiểu là stack chạy hay hàng đợi port; mode của spec-kit; provenance của frontend-design; browser tool; có tạo `bk-design` ngay không; Biome có hook hay không). D5 hỏi cả 13 trong một lượt.

**Cập nhật 2026-09-12.** Con số "13" ở trên đã cũ hai lần. Một lượt verification ngày 2026-09-11 thêm hai câu (#8 nghĩa của "hoặc" giữa #3 và #4; #9 dựng lại `_build/upstream/` theo sha), và D4 thêm sáu câu (#10–#15) về cách cài — cả tám đều nằm cùng chỗ, mục "Questions for D5" của `docs/specs/2026-09-11-skill-inventory.md`. Đếm hiện tại: 6 câu ở mục 4.5 này + 15 câu ở inventory = **21 câu cho D5**. Câu thứ bảy của D4 — *host nào owner thật sự dùng ngoài Claude Code và Antigravity* — không tạo mục mới vì trùng câu (3) ngay trên; D4 chỉ bổ sung một dữ kiện cho nó: xác minh 2026-09-12 bằng `command -v`, trên máy này **chỉ có `claude`** trên PATH, còn `gemini`, `droid`, `copilot`, `opencode`, `codex`, `cursor-agent` đều không có — tức "mọi công cụ" hôm nay thực tế là 2 host. Đề xuất và lý lẽ đứng sau #10–#15 ở `docs/specs/2026-09-12-install-council.md` (ĐỀ XUẤT, chưa có hiệu lực).

### 4.6 Đóng phiên

`bk-close`: viết handoff, commit (conventional commit, không dòng attribution), push.

### 4.7 Sau bước 1 (đã có trong handoff tối 2026-09-11, không đổi)

Bước 2 sprint từng skill theo thứ tự vòng đời bắt đầu từ `bk-spec`; bước 3 stack files; bước 4 release gate v0.2. Open thread 1–3 khi app Antigravity mở và khi có quota.

---

## 5. Gotcha và ràng buộc đã phát hiện

1. **Giới hạn model là ràng buộc thật của việc fan-out.** 16 agent song song trên Fable → cả 16 chết 429 trong vài giây, mất trắng công. Bài học (ứng viên cho lessons log): *WHEN dispatching research agents in parallel THEN size the batch to the quota window and checkpoint each agent's output to disk NOT fire all of them at once* — bằng chứng: 16/16 agent chết 2026-09-11, không file nào được ghi.
2. **Scratchpad không bền.** `BRIEF.md` nằm trong scratchpad theo session id; phiên sau sẽ có đường dẫn khác và **không thấy file này**. Nội dung brief phải viết lại (hoặc đặt vào một chỗ bền như `_build/` hay `docs/`) trước khi chạy lại — xem 6.4 để dựng lại.
3. **Drift sha pr-agent**: clone mới `101dcafc…` ≠ `sources.json` `1421c673…`. Phải chốt: cập nhật sha hay pin lại bản cũ. Song song đó, mâu thuẫn giấy phép chưa giải: `sources.json` ghi MIT (đọc LICENSE 2026-09-11), danh sách của owner ghi AGPL — phải đọc `LICENSE` trong clone để kết luận.
4. **Spartan không có file giấy phép** (API 404) ⇒ tuyệt đối không lấy chữ; mọi hàng là idea hoặc drop.
5. **ClaudeKit proprietary** ⇒ clean-room, chỉ ý tưởng.
6. **Antigravity-Core**: proprietary nhưng của chính owner ⇒ được adapt chữ của owner; nhưng trong đó có **nhiều skill trùng tên với nguồn khác** (`frontend-design`, `mcp-builder`, `brainstorming`, `systematic-debugging`, `tdd-workflow`, `plan-writing`, `parallel-agents`, `react-best-practices`, `cloudflare`, `ui-ux-pro-max`, `velzon-admin`, `prisma-expert`…) — phải kiểm tra attribution từng cái, cái nào vendored thì drop và trỏ về nguồn gốc.
7. **anthropics/skills** không có giấy phép cấp gốc; chỉ `frontend-design` và `mcp-builder` có `LICENSE.txt` Apache-2.0 ⇒ chỉ hai skill đó được absorb.
8. **karpathy-skills và vercel-labs/agent-skills** không có file giấy phép ⇒ ideas-only, dù nội dung hữu ích.
9. **awesome-cursorrules là CC0** (được phép vendor) nhưng quyết định của kit là **không vendor**; stack file vẫn là chữ của kit.
10. **`_build/` bị gitignore** ⇒ 10 clone mới chỉ tồn tại cục bộ; muốn bền thì sha phải vào `upstream/sources.json`.
11. **Hook `scout-block` của kit cũ vẫn sống** trong `~/.claude/settings.json` và **chặn mọi lệnh Bash có chuỗi `node_modules` hoặc `.git` trong văn bản lệnh**. Dùng `git -C <path> …` thì an toàn, nhưng tránh viết `.git` trong lệnh.
12. **`npm` không có trên PATH** trong tool shell ⇒ chạy test bằng `node --test tests/*.test.cjs` (44 test xanh lần cuối).
13. **Heredoc lớn hoặc heredoc kèm perl trong Bash fail ở parse time** và chạy rỗng ⇒ ghi file bằng Write tool.
14. **Mâu thuẫn cần để ý khi gộp inventory**: catalog §5.1 nói 17 core skill nhưng **chỉ 11 thư mục tồn tại**; hợp đồng token §12 tính listing cho 17 skill (≤1.700). Thêm/bớt skill làm đổi con số đó, nhưng **không đo trong phiên nội dung** — đo ở release gate (§11).
15. **Ma trận hàng 5 ghi Spartan "70 command files"**, listing hôm nay thấy 69 — chênh 1, chưa đối chiếu; đừng trích số cũ khi chưa đếm lại.
16. Quy ước repo thắng mặc định của skill: spec ở `docs/specs/`, plan ở `docs/plans/`, handoff ở `docs/handoff/`; **không** tạo `.planning/` hay `docs/superpowers/`.

---

## 6. Đường dẫn và lệnh dùng lại

### 6.1 Repo

```
C:\Projects\Bearingkit        # branch main, sạch lúc mở phiên
docs/specs/2026-09-11-bearingkit-v2-design.md      # spec hiện hành (§5 luật inventory)
docs/specs/2026-09-10-coverage-matrix.md           # 39 hàng nguồn
docs/specs/2026-09-10-bearingkit-v1-design.md      # §3 host mechanics, §7 catalog, §18 field lessons
docs/plans/2026-09-11-content-program.md           # 4 bước, đang ở bước 1
docs/plans/2026-09-10-content-backlog.md           # thứ tự nguồn bắt buộc
docs/handoff/2026-09-11.md                         # bản ghi bền của ngày
upstream/sources.json · NOTICE                     # provenance
skills/                                            # 11 thư mục (10 task + bk-protocol)
```

### 6.2 Lệnh

```bash
node --test tests/*.test.cjs                       # 44 test, npm không có trên PATH
git -C _build/upstream/<repo> rev-parse HEAD       # lấy sha clone
gh api repos/<owner>/<repo> --jq '[.license.spdx_id, .archived, .pushed_at, .stargazers_count] | @tsv'
gh api repos/<owner>/<repo>/license --jq '.license.spdx_id'   # 404 = không có file giấy phép
```

Vòng lặp clone đã dùng (chạy trong `_build/upstream`, tên thư mục = `owner__repo` với `/`→`_`):

```bash
git clone -q --depth 1 "https://github.com/<owner>/<repo>" "<owner>_<repo>"
```

### 6.3 Nguồn chưa fetch nếu cần cho bước sau

`microsoft/playwright-mcp`, `modelcontextprotocol/servers`, `vercel-labs/skills`, `biomejs/biome`, `Aider-AI/aider`, `google-gemini/gemini-skills` (chờ quyết định hàng 38).

### 6.4 Dựng lại brief cho agent (scratchpad cũ sẽ mất)

Brief gồm 7 khối, viết lại theo đúng thứ tự này:

1. **Ràng buộc**: chỉ đọc, không sửa gì trong `C:\Projects\Bearingkit`; không in biến môi trường hay giá trị giống secret; không trích số chưa tự đếm.
2. **Catalog + ý định từng skill**: 12 skill vòng đời (`bk-map`, `bk-research`, `bk-spec`, `bk-audit`, `bk-plan`, `bk-build`, `bk-test`, `bk-debug`, `bk-review`, `bk-ship`, `bk-close`, `bk-next`) và 4 skill domain (`bk-design`, `bk-perf`, `bk-db`, `bk-ops`), mỗi cái một dòng ý định lấy từ v1 §7.1; `bk-protocol` là bootstrap ẩn, nơi nhận mọi mục mang tính luật phiên (autonomy gate, router, evidence, council, definition of done, security baseline, host tool map, 4 persona).
3. **Pack tuỳ chọn**: `bk-product`, `bk-ux`, `bk-agent`, `bk-deps`, `bk-preview`, `bk-guard`, ứng viên `bk-mcp`, `bk-cloudflare`; nếu không khớp thì ghi `pack: <tên đề xuất>` hoặc `none` kèm lý do.
4. **Thứ kit cố tình không mang** (map thẳng `drop`, lý do "out of scope by design"): command sản phẩm/startup/gọi vốn, workflow Terraform, skill theo framework dạng skill riêng (đi vào stack file), router kiểu slash-command, rule set always-on nặng token, thứ host/vendor đã ship (LSP, DevTools plugin), skill định dạng tài liệu (docx/pdf/pptx/xlsx), persona ngoài 4 cái.
5. **Luật quyết định**: mỗi mục nguồn = 1 skill + 1 quyết định trong {absorb, idea, drop}; absorb chỉ khi giấy phép permissive đã xác minh **và** mục đó hơn/bổ sung so với ý định skill, phải nêu file reference đích; idea bắt buộc cho nguồn không giấy phép hoặc proprietary; drop phải kèm lý do cụ thể.
6. **Quality bar §5.3**: body ≤100 dòng (Read first / Steps / Gates / Evidence to paste / Next step); mọi quy tắc truy được về nguồn hoặc field lesson; ≥3 test prompt; activation prompt EN+VI; qua acceptance trên 2 host. Substance over structure.
7. **Kit đã có gì** (để không đề xuất trùng): 8 reference đã hấp thụ từ Superpowers + 9 reference chung trong `bk-protocol/references/` — liệt kê như mục 1.2 ở trên.
8. **Định dạng output**: 6 mục `## Source` / `## Items` (bảng `| # | Item (path) | What it does | Kit skill | Decision | Reason | License note |`) / `## Gaps` / `## Stack notes` / `## Counts` / `## Verdict`; ≤400 dòng; tiếng Anh; trả lời cuối chỉ gồm đường dẫn file + dòng counts.
9. **8 stack đã định**: `typescript-react`, `node`, `python`, `php-laravel`, `sql`, `shell`, `kotlin`, `c-cpp`; stack khác ghi là ứng viên.

---

*Ghi bởi phiên Opus 5 ngày 2026-09-11 sau khi phiên Fable bị ngắt vì giới hạn hạn mức. Không có phân tích mới trong file này; mọi dữ kiện đều đã được xác minh trong phiên hoặc trích từ tài liệu đã đọc.*
