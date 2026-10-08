# Handoff · 2026-10-08 · phiên phụ: trang bearingkit.dev, README và metadata

Phiên đám mây (Opus 5.5), không chạm `skills/`, `evals/`, `scripts/`, không đo gì. Owner yêu cầu trong phiên: chuẩn bị Bearingkit để trình bày công khai (đơn Claude Startups), owner đã mua `bearingkit.dev`, và cập nhật thẳng lên GitHub.

## Block 1 · What happened

- README: thêm "Why it exists", "Status", "Roadmap"; mọi con số chép từ `docs/status.md` (catalog 18/18, hai host qua acceptance, activation Claude Code 2026-09-16 recall 0,958 precision 1,000, chưa task benchmark nào đạt chuẩn v1.0). Sửa dòng lỗi thời về `bk-perf`.
- `site/index.html` (một trang, không JS, sáng/tối), `site/CNAME`, `.github/workflows/pages.yml`. Mô tả từng skill rút từ `description` trong `SKILL.md` của chính skill đó.
- `package.json`: `homepage`, `bugs`, `keywords`, `author`. `plugin.json`: `homepage` → https://bearingkit.dev, thêm keyword.
- Test trên container Linux: 223 đạt, 7 trượt, 3 bỏ qua. Bảy test trượt (`bench`, `evals`, `plan-run`, `record-guardrail`) trượt y hệt trên `origin/main` trong cùng container (bản clone nông, môi trường không phải máy owner), nên không do thay đổi này. Chưa chạy lại trên Windows.

## Block 2 · Còn lại (việc của owner)

1. GitHub → Settings → Pages: Source = "GitHub Actions"; Custom domain = `bearingkit.dev`; bật "Enforce HTTPS" khi chứng chỉ sẵn sàng.
2. DNS của `bearingkit.dev`: bốn bản ghi A tới 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153; bản ghi `www` CNAME tới `tuyenht.github.io` (theo tài liệu GitHub Pages; kiểm lại trên trang đó trước khi nhập).
3. Mục About của repo (proxy của phiên chặn API settings): description, website `https://bearingkit.dev`, topics.
4. Tạo các địa chỉ email `hello@` (đã ghi trên trang) và các địa chỉ owner chọn.
5. Chạy `node --test tests/*.test.cjs` trên máy Windows để xác nhận 233/233 như trước.

## Block 3 · 2026-10-09: site v3, README opening, About

- Site (EN và VI) dựng lại theo một cấu trúc: hero, vì sao, ba việc chính kèm khối "cơ chế đi kèm", hiện trạng (số đo, giới hạn, callout chưa chứng minh), cài đặt, phát triển công khai. Thang chữ: H1 32–48px, H2 26–32px, H3 19px, body 17px/1.7, đoạn văn tối đa 700px. Bản VI viết theo cách nói của dev Việt (skill, file, migration, production), không dịch câu.
- Số đo routing ghi rõ phạm vi và ngày: lõi 60 câu gồm sáu ý định, đo 2026-09-16/17, trước `bk-db`, `bk-ops`, `bk-map`, `bk-research`, `bk-perf` (`docs/status.md:46` ghi "thừa hưởng"). Câu ví dụ chỉ lấy từ phần đã đo; `bug-en-03` là câu route sai nên đã bỏ khỏi trang.
- Chi phí so với không dùng skill (1,9–2,1× trên ba task Sonnet, ≈7× trên review-01) thêm vào cạnh 1,3–3× so với nguồn (`docs/status.md:47`).
- Cài đặt: clone vào `$HOME/bearingkit`, không còn placeholder; `activate` và `status` đã chạy thử trong một project và HOME tạm.
- README, README.vi, `package.json`: tagline và câu mở đầu đổi sang "workflow mã nguồn mở cho AI coding agent"; ghi chưa có bản phát hành công khai (package 0.1.0, tag `0.1.0-phase1`, đang hướng tới v0.3), dự án độc lập.
- GitHub About và topics cập nhật qua trình duyệt của owner (proxy chặn API): bỏ `solo-founder`, thêm `ai-agents`.

Còn lại: 7 test trượt khi clone nông trên Linux (`record-guardrail` state null, `plan-run` cần đủ lịch sử, hai test chưa xem); `activate` in "store is not installed" cả khi chỉ dùng Claude Code; đo lại routing trên bộ 17 skill.
