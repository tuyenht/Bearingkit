# Handoff · 2026-10-08 · phiên 5: (đang viết; tiêu đề điền lúc đóng phiên)

Nhánh `main`. Phiên 5, owner mở bằng lời dưới đây. Lời đó thay resume prompt của `docs/handoff/2026-10-08-p5b-record-on-main.md`; nó được chép nguyên văn vào đây là việc ghi đầu tiên của phiên, như chính nó yêu cầu.

## Lời mở phiên của owner (nguyên văn)

Phiên tiếp của Bearingkit, máy owner, C:\Projects\Bearingkit. Prompt này thay resume prompt trong docs/handoff/2026-10-08-p5b-record-on-main.md; việc ghi đầu tiên của phiên là chép nguyên văn nó vào handoff mới.

CẤM: chạy node evals/analysis/plan-run.cjs dưới bất kỳ dạng nào; xóa nhánh p5b-bk-plan; cập nhật bản cài hằng ngày; sửa AGENTS.md; ghi RUN; chạy phiên đo nào khi tôi chưa duyệt bản đăng ký của nó.

Đọc trước: docs/autopilot/state.md; docs/specs/2026-10-06-autopilot-design.md cả file (chỗ nào AGENTS.md dòng 19 lệch spec thì spec thắng: thay đổi 6 đã có hiệu lực); docs/autopilot/decisions.md mục 15 đến 18; docs/handoff/2026-10-08-p5b-record-on-main.md; docs/status.md.

Kiểm đầu phiên, mỗi lệnh một mình: nếu docs/autopilot/.lock tồn tại thì dừng và báo tôi; git status (sạch, main); git fetch origin; đầu main và p5b-bk-plan khớp handoff; không có tiến trình bench hay driver đang sống. Khi sắp ghi gì vào repo: ghi khóa trước, rồi get_usage, node bin/bearingkit.cjs doctor (năm ok, một skip, một FAIL ở dòng skills/ cho tới khi tôi cập nhật bản cài; số khác thì chép nguyên văn), suite node --test tests/*.test.cjs (229/229, timeout trên 300 giây; test node-01 nhạy tải, trượt thì chạy lại).

Lời của tôi cho phiên này: bộ đếm kiểm toán là 1 (hai lần kiểm toán trong phiên 4 đã đọc mục 1 đến 18); ghi nguyên văn câu này vào nhật ký, ghi rõ đây là cách đọc của owner. Tôi nhận hai bài học ở cuối spec P5b: ghi tên model đầy đủ và kiểm init của phiên đầu trước khi đếm; chọn task guard chạm tới bản chữ được đổi.

Việc, theo thứ tự, làm tự động theo khuyến nghị tốt nhất, không hỏi lại những gì nằm trong repo, chỉ thêm và hoàn tác được:
1. Sửa tài liệu cũ: docs/plans/2026-09-26-v03-roadmap.md (P5a đóng chưa merge, P5b đã vào main); thêm một dòng ở đoạn Status đầu docs/specs/2026-10-03-bk-plan-design.md trỏ xuống mục "P5b closed"; thêm "với to-tickets: chưa so" vào nhãn trong docs/status.md và đưa file này về dưới khoảng 15 KB (chữ cũ chuyển sang docs/status-history.md). Soạn sẵn chữ thay cho đoạn Status của spec tự lái và dòng 19 của AGENTS.md thành một file đề xuất để tôi commit; không tự commit hai chỗ đó.
2. P5c: đọc định nghĩa ở docs/handoff/2026-10-03-close.md (Next work mục 3), docs/handoff/2026-10-02-shell-replicated-source.md (Block 2 điểm 1), docs/handoff/2026-09-30-p4-step0-measured.md, và bản chữ trên nhánh p4-step0-scope bằng git show, không checkout. Viết đề xuất thiết kế kèm bản đăng ký dự kiến (tên model đầy đủ, kiểm init, guard chạm tới bản chữ), commit thành spec ghi rõ PROPOSED, rồi dừng trình tôi. "Làm P5c" chỉ tới đó: mở khóa bộ chạy và chạy phiên đo chỉ sau khi tôi duyệt.

Nếu công tắc là PAUSE: vẫn làm hai việc trên theo lời này, không dùng các thay đổi của luật tự lái. Nếu không có việc gì làm được: không commit, không viết handoff hay dòng nhật ký, chỉ báo cáo và dán git status.

Mỗi commit qua cổng: suite chạy trên bản chữ cuối; reviewer mới mỗi commit, tối đa năm vòng; bước nặng (đăng ký, kết quả đo, merge) thêm reviewer đối kháng; sau khi rà chỉ chép câu của reviewer. Sau mỗi thay đổi dưới skills/ hay số đếm: chạy _build/v03-prep/recount-status-numbers.cjs và đọc lại cả docs/status.md. Không tự clear giữa các phase; dừng với handoff ở 80% ngữ cảnh. Trả lời bằng tiếng Việt; cuối mỗi khối việc có "Đã xong" và "Còn lại"; đóng phiên bằng handoff, dòng phiên trong nhật ký, git status dán nguyên.
