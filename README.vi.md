# Bearingkit

**Workflow mã nguồn mở cho AI coding agent.** · [bearingkit.dev/vi](https://bearingkit.dev/vi/) · [English](README.md)

Bearingkit gồm một giao thức và 17 skill, thay cho cả chồng plugin chồng chéo nhau. Bạn nói điều mình muốn bằng **tiếng Việt hoặc tiếng Anh tự nhiên**: bộ công cụ điều hướng AI agent tới đúng bước, và được thiết kế để đưa việc đi từ đặc tả tới phát hành, dừng lại chờ bạn trước mọi thay đổi rủi ro, và trình bằng chứng trước khi nói là xong. Hiện chạy trên **Claude Code** và **Antigravity** app 2.0 từ cùng một nguồn skill; Gemini CLI, Cursor, Codex, Copilot CLI và Factory Droid đã có manifest và sẽ được ghi là hỗ trợ khi qua bài nghiệm thu.

> Pre-release, đang phát triển: chưa có bản phát hành công khai và chưa có gói npm (package version 0.1.0, đang hướng tới v0.3). Bearingkit là dự án độc lập, không liên kết với Anthropic hay Google. Mọi con số dưới đây đều truy được về repo — phần lớn ở [`docs/status.md`](docs/status.md), nơi ghi rõ cách đo.

## Vì sao một bộ thay cho cả chồng plugin

Cách thường gặp là cài cả đống: gói quy trình, gói rà code, gói TDD, thêm plugin chính hãng. Từng gói đều tốt. Gộp lại thì chúng giành nhau cùng một yêu cầu, chồng chéo quy tắc, cùng nạp vào context trước khi bạn gõ, và nằm lại khi bạn đổi công cụ. Bearingkit là đống đó, được đọc từng mục và đang được chắt lọc thành một hệ thống:

- **23 nguồn đã nghiên cứu, 17 trong số đó là mã nguồn mở** (Superpowers, plugin chính thức của Anthropic, mattpocock/skills, spec-kit…; danh sách đủ ở `upstream/sources.json`). **1.295 mục nguồn** từ 22 nguồn (skill, lệnh, agent, file quy tắc) đã kiểm kê từng cái: 46 sẽ chuyển thể, 610 giữ làm ý tưởng, 639 loại bỏ. Mọi file chuyển thể đều ghi nguồn; giấy phép nằm trong [`NOTICE`](NOTICE). Phần nào vay mượn, phần nào của riêng dự án, theo từng thành phần: [`PROVENANCE.md`](PROVENANCE.md) (tiếng Anh).
- **Một bộ điều hướng.** Protocol gọi tên ý định trước, rồi mở một skill — thay vì nhiều gói cùng giành một yêu cầu.
- **Nhẹ.** Context cố định khoảng 4.000 token trên Claude Code, ngân sách 5.000 (đo ngày 23/09/2026, trước skill thứ 17).
- **Bật theo từng dự án.** Cài một lần cho máy; dự án chưa bật thì không thấy gì — trên cả hai host đã nghiệm thu.
- **Một nguồn, nhiều host.** Đổi qua lại giữa Claude Code và Antigravity không phải viết lại quy tắc.

## Nói như nói với đồng nghiệp

Không phải nhớ lệnh gạch chéo. Mỗi skill có cụm từ kích hoạt bằng tiếng Việt và tiếng Anh. 44 trên 96 câu trong bộ test kích hoạt hiện nay là tiếng Việt; trên bộ lõi 60 câu (sáu loại yêu cầu: câu hỏi, sửa nhỏ, tính năng, lỗi, review, ship), điều hướng đạt precision và recall ≥ 0,9 trên Claude Code và Antigravity 2.0, đo ngày 16–17/09/2026 (Claude Code: recall 0,958, precision 1,000). Lần đo đó có trước `bk-db`, `bk-ops`, `bk-map`, `bk-research` và `bk-perf`; câu cho các skill này đã có trong bộ test nhưng chưa đo lại. Routing không phải thước đo chất lượng code. Câu thật trong bộ test:

| Bạn nói | Skill được mở |
|---|---|
| *Thêm xuất CSV cho trang hóa đơn.* | `bk-spec` |
| *Form đăng nhập báo lỗi 500 sau khi đổi mật khẩu.* | `bk-debug` |
| *Soi giúp diff này trước khi tôi đẩy.* · *Nhánh này merge được chưa?* | `bk-review` |
| *Xong phần xuất hóa đơn rồi, ship đi.* | `bk-ship` |
| *Tiếp theo làm gì? Tôi đang dở việc gì trong repo này?* | `bk-next` |
| *Kết phiên giúp tôi, ghi bàn giao để phiên sau đọc.* | `bk-close` |

## Từ yêu cầu tới phát hành, không phải dắt tay agent

Các skill chuyển giao cho nhau theo chuỗi cố định — **spec → plan → build → test → review → ship → close** — mỗi bước kết thúc bằng việc gọi tên bước sau. Chuỗi **dừng lại chờ bạn ở mọi chỗ cần con người quyết định** — tại các điểm COUNCIL, và sau khi sửa lỗi thì dừng trước khi commit:

- **Cổng tự chủ.** ACT: test, refactor giữ nguyên hành vi, tài liệu, sửa lỗi tầng ứng dụng, thay đổi nhỏ trong kế hoạch đã duyệt — làm rồi báo. COUNCIL: schema và migration, auth, phân quyền, thanh toán, xoá dữ liệu, hợp đồng giữa module, hệ thống từ xa hoặc production — đề xuất rồi chờ. Không chắc thì tính là COUNCIL.
- **Vừa vặn.** Tính năng đi qua đặc tả; thay đổi nhỏ loại ACT trong ba file đi tới build kèm test; lỗi phải tìm gốc rễ trước khi sửa, sau ba lần thất bại thì mở hội đồng; câu hỏi thì được trả lời.
- **Bằng chứng trước, tuyên bố sau.** Có mốc `file:dòng` hoặc ghi "chưa kiểm chứng"; con số kèm cách đo hoặc ghi "chưa đo"; phép kiểm "sạch" chỉ được tin sau khi chứng minh nó có thể trượt.
- **Đường nóng có thêm một đôi mắt** — auth, thanh toán, upload, phân tách tenant, migration, hợp đồng API ngoài — tốt nhất bởi model hoặc host khác.
- **Phiên làm việc có trí nhớ.** `bk-close` ghi bàn giao đối chiếu với git; `bk-next` tiếp tục từ trạng thái thật của repo.

## Tiến độ — nói thật

| | Hôm nay |
|---|---|
| Skill | 17 skill cùng protocol; `bk-build` mở quy tắc stack cho TypeScript/React, Kotlin, SQL, Node, Python, PHP/Laravel, Shell, C/C++ |
| Host | Đã nghiệm thu: Claude Code, Antigravity app 2.0. Nạp theo dự án, chưa nghiệm thu đủ: Antigravity IDE. Đã có manifest: Gemini CLI, Cursor, Codex, Copilot CLI, Factory Droid |
| Điều hướng bằng ngôn ngữ tự nhiên | Việt + Anh; precision và recall ≥ 0,9 trên bộ lõi 60 câu, cả hai host đã nghiệm thu (đo 16–17/09/2026, trước năm skill mới nhất) |
| So với skill nguồn | đã so: `bk-review`, `bk-debug`, `bk-plan` và năm file stack. Phần lớn không khác biệt rõ (mẫu nhỏ; ở phần lớn task, cả hai bên chưa tách được khỏi việc không dùng skill); một task lập kế hoạch với một model nghiêng về kit; với PowerShell, kit vượt mức sàn và một gói không có skill shell, nhưng không vượt nguồn của chính nó. Ở những task có ghi chi phí, kit tốn khoảng 1,3–3 lần nguồn (số liệu từng task trong `docs/specs`), nên **chưa task nào đạt chuẩn v1.0** (tỷ lệ đạt ít nhất bằng nguồn *và* ít token hơn) |
| Gói npm, có mặt trên các marketplace | chưa có |

**Cách đưa ra tuyên bố.** Mỗi skill sẽ được đánh giá so với chính các nguồn nó chắt lọc từ — cùng task, fixture, model và host, một lần có kit và một lần với nguồn. Khi chưa có phép so đó, skill được ghi là "chưa so"; kết quả không lặp lại được cũng được ghi lại.

**Vậy sao dùng ngay bây giờ?** Không phải vì một skill mạnh hơn — mà vì một hệ thống thống nhất, có cổng an toàn, thay cho cả chồng plugin bạn sẽ phải tự ráp, tự dung hoà và tự duy trì, bằng tiếng Việt hoặc tiếng Anh, trên hơn một agent.

**Sẽ đo tiếp**

1. **Một bộ đấu với cả chồng** — Bearingkit so với tổ hợp các gói phổ biến tự ráp, trên cùng task: kích hoạt sai, lỗi, token ([thiết kế đề xuất](docs/specs/2026-10-08-kit-vs-stack-proposal.md)).
2. **Cổng an toàn khi bị thử thách** — task có bẫy (migration, xoá dữ liệu, đẩy production): agent tự làm mà không hỏi bao nhiêu lần, có kit và không kit.
3. **Cái giá của việc đổi công cụ** — một dự án trên hai host: số file phải duy trì, quy tắc bị lệch.

## Lộ trình

- **v0.3** (đang làm): chắt lọc và đo các skill vòng đời còn lại (`bk-spec`, `bk-ship`, `bk-close`), cổng v0.3.
- **v0.4**: gói tuỳ chọn, hook cho push và deploy, nghiệm thu trên Gemini CLI, Cursor và Codex.
- **v1.0**: benchmark kết quả 12 task so với nguồn, `upstream-watch` báo thay đổi của từng nguồn; phát hành: có mặt trên các marketplace, README tiếng Anh và tiếng Việt, CI, và lịch sử công khai đã gộp gọn.

Kế hoạch chi tiết: [`docs/plans/2026-09-26-v03-roadmap.md`](docs/plans/2026-09-26-v03-roadmap.md).

## Cài đặt

Cài một lần trên mỗi máy, rồi bật trong từng dự án cần dùng. Chép nguyên khối dưới đây; `$HOME` dùng được trong cả bash lẫn PowerShell.

```
# Một lần trên mỗi máy: clone repository (chưa có gói npm)
git clone https://github.com/tuyenht/Bearingkit.git $HOME/bearingkit

# Claude Code: thêm marketplace và cài plugin
claude plugin marketplace add https://github.com/tuyenht/Bearingkit
claude plugin install bearingkit@bearingkit

# Chỉ cho Antigravity: cài kho skill
node $HOME/bearingkit/bin/bearingkit.cjs install --host antigravity

# Trong từng dự án cần dùng
cd path/to/your-project
node $HOME/bearingkit/bin/bearingkit.cjs activate
node $HOME/bearingkit/bin/bearingkit.cjs status
```

`activate` chỉ ghi `.claude/settings.local.json` và `.agents/plugins.json` trong dự án (git bỏ qua cả hai trong bản clone); `status` cho biết host nào đang bật. Chi tiết từng host, cách gỡ, phát triển: [README tiếng Anh](README.md) và [`docs/hosts.md`](docs/hosts.md).

## Giấy phép và hỗ trợ

MIT hôm nay và cả ngày mai — xem [LICENSE](LICENSE), ghi chú bên thứ ba ở [NOTICE](NOTICE). Muốn đưa Bearingkit vào đội của bạn (thiết lập quy trình agent, chỉnh cổng an toàn theo stack, đào tạo): [hello@bearingkit.dev](mailto:hello@bearingkit.dev).
