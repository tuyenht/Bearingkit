# Soát 5 nguồn `adapt` sau lần chạy `upstream-watch` ngày 2026-11-26

Theo lời owner "Soát 5 nguồn" (mục 112 của `docs/autopilot/decisions.md`). Đầu vào: báo cáo [`2026-11-26.md`](2026-11-26.md) và bộ nhớ tạm `~/.bearingkit/state/upstream-cache/`. Chỉ đọc: không sửa `skills/`, `hooks/` hay `upstream/sources.json`. Chữ của nguồn là dữ liệu chưa tin cậy; ở đây chỉ ghi ý, không chép chữ. Người đọc: skill `bk-audit` (chạy tách, ba subagent Sonnet đọc diff), phiên chính kiểm lại các ý then chốt.

Kết luận: **cập nhật có chọn lọc**, không đồng bộ lại toàn bộ. Mọi việc sửa dưới đây chạm `skills/`, `hooks/` hoặc `upstream/sources.json`, nên chờ lời nêu tên của owner.

## Mỗi nguồn

| Nguồn | Đổi gì | Kết luận |
|---|---|---|
| `obra/superpowers` (5.1.0 → `v7.0.2`) | viết lại phần lớn; phần chạy kế hoạch bằng subagent theo mô hình mới | cập nhật một phần |
| `anthropics/claude-plugins-official` | `code-review` bỏ thang điểm tin cậy 0–100; `code-modernization` có version 1.1.0 (bản gốc không ghi); `patterns.py` chỉ sửa regex | cập nhật `major-upgrade.md`; còn lại nhỏ |
| `mattpocock/skills` | vài câu | nhỏ |
| `anthropics/skills`, `tuyenht/Antigravity-Core` | `headOnly`: không tải nội dung | **chưa soát** (cần tải thêm, việc của owner) |

## Khuyến nghị theo thứ tự

1. **Lời giao thức có bị nạp hai lần không.** Chú thích trong mã mới của nguồn nói Claude Code đọc cả `additional_context` lẫn `hookSpecificOutput` mà không gộp trùng; `hooks/session-start.cjs:36-41` xuất cả ba trường. **Bằng chứng ngược:** trong phiên chính `79298385` (app Claude, 2026-11-26), khối `<bearingkit-protocol>` chỉ có một lần trong ngữ cảnh. Vậy trên host này chưa thấy lỗi; host khác: chưa kiểm. Việc nên làm: một phép thử nhỏ trên từng host trước khi sửa.
2. **Điểm mù của danh sách theo dõi.** Ba tệp mà `skills/bk-build/references/major-upgrade.md` lấy ý (`modernize-uplift.md`, `version-delta-analyst.md`, `uplift-migrator.md`) có trong nguồn gốc của `upstream/sources.json` nhưng không ở danh sách đường dẫn được theo dõi, nên báo cáo không hiện chúng dù `modernize-uplift.md` đổi 618 dòng. Thêm ba đường dẫn này.
3. **`major-upgrade.md` thiếu bốn quy tắc** (đã kiểm ở nguồn): tra phiên bản đích kèm ngày hết hỗ trợ, không theo trí nhớ; công cụ migrate chỉ chạy trên bản sao tạm; bộ test trỏ tới cơ sở dữ liệu hay dịch vụ không phải máy cục bộ thì dừng hỏi; lên nhiều phiên bản lớn thì đi từng nấc, mỗi nấc build và qua test.
4. **`skills/bk-ship/references/finishing.md:26`** còn lựa chọn "discard"; nguồn đã đưa 'discard' ra khỏi menu mặc định; chỉ còn khi người dùng yêu cầu rõ và gõ chữ discard xác nhận. Thêm: không tự `--force` khi `git worktree remove` bị từ chối; test đỏ trên bản đã merge thì dừng và giữ nhánh.
5. **`skills/bk-build/references/executing.md`:** ghi mốc BASE trước khi giao việc và xét từ mốc đó (không dùng `HEAD~1`); luôn ghi model khi giao subagent; người làm và người duyệt không tự sinh subagent; vòng sửa cuối giao một người; lỗi nhỏ vào danh sách hoãn. Không lấy: sổ theo dõi tiến độ, tự quyết thay vì dừng hỏi, vòng sửa 5 lượt (trái cổng quyết định và trần 3 vòng).
6. **`skills/bk-review/references/code-review-exchange.md`:** người duyệt chỉ đọc; không tự sinh subagent; spec không nhắc một hành vi không có nghĩa là được phép; có mục liệt kê điều đã gác lại và vì sao.
7. **`skills/bk-test/references/tdd.md`:** nêu trước thay đổi nào làm test đỏ; thêm anti-pattern: test chỉ bắt chữ hay hằng số, test chữ của tệp thay vì chạy nó, test lại framework; chạy cả bộ test.
8. **`skills/bk-plan/references/writing-plans.md`:** thêm ràng buộc chung, đầu vào/đầu ra mỗi task, điểm người duyệt cần soi, cách chia task. **Owner quyết:** nguồn đã đảo quy tắc "code cho mọi bước" (nay chỉ chữ ký hàm kèm test); kit ghi ngược lại ở `writing-plans.md:31`, và `vertical-slices.md:3` cố ý giữ.
9. **Sửa một dòng** (ưu tiên thấp): `brainstorming.md` (phản mục tiêu; spec ghi các phương án đã cân nhắc), `characterization.md` (so sánh không chạy được là lỗi), `codebase-map.md` (dùng sơ đồ phụ thuộc có sẵn trước khi tự viết parser), `business-rules.md` (P0 rộng hơn), `meta-routing.md`, `feedback-loop.md`, `tdd.md` (mỗi điểm test nói bắt được gì, bỏ sót gì).

Không cần cập nhật: `systematic-debugging.md`, `first-contact.md`, `security-lens.md`, `vertical-slices.md`.

Giữ nguyên, không theo nguồn: thang điểm 0–100 và ngưỡng 80 trong `review-lenses.md` (nguồn bỏ, thay bằng một quy tắc xung đột với cách soi trường hợp biên của kit); từ nay là chữ riêng của kit. Hai tệp prompt người duyệt mà kit ghi là nguồn đã bị xóa ở nguồn: dòng ghi nguồn cần sửa khi sửa các tệp đó.

## Phương án bị loại

- Đồng bộ lại toàn bộ theo superpowers v7: xung đột cổng quyết định, việc dừng hỏi, thư mục `docs/superpowers/` kit cấm.
- Không cập nhật gì: bỏ ngỏ điểm mù theo dõi và lựa chọn "discard" nguồn đã gỡ.
- Đảo quy tắc "code cho mọi bước" mà không hỏi owner: trái `vertical-slices.md:3`.

## Hệ quả cho các phép đo

Các so sánh "kit so với nguồn" trước đây đo với Superpowers 5.1.0. Với bản `v7.0.2`: **chưa so**. Skill nào được sửa thì đo lại cả hai bên (quy tắc của owner, 2026-09-24). Sau khi xử lý, ghi `reviewed.sha` cho từng nguồn trong `upstream/sources.json`, kể cả nguồn quyết định không sửa, để lần chạy sau không báo lại.
