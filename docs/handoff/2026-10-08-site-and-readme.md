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
