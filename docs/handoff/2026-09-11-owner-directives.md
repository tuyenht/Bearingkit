# Chỉ thị của owner · 2026-09-11

File này ghi lại chỉ thị và thứ tự thực thi do owner chốt ngày 2026-09-11, sau khi phiên kiểm kê (bước 1 content program) bị ngắt vì giới hạn hạn mức. Đi kèm: `docs/handoff/2026-09-11-opus5-handoff.md` (trạng thái kỹ thuật), `docs/handoff/2026-09-11.md` (bản ghi bền của ngày).

---

## Nguyên văn 4 chỉ thị của owner

```text
1. Mục đích của kit, ghi rõ vào §1 của docs/specs/2026-09-11-bearingkit-v2-design.md nếu chưa đủ: tôi xây một công ty công nghệ phần mềm chỉ có một mình tôi, với đội ngũ AI hỗ trợ. Mọi quyết định về phạm vi đo bằng một câu hỏi: nó có giúp một người làm được việc của cả một đội không.
2. Cài đặt: tôi muốn một cách cài chung, đơn giản, dễ dàng cho mọi công cụ, nhưng khi cài thì tự áp các đặc thù của từng host. Đây là mở lại quyết định mà spec v2 đã bác bỏ, nên xử lý theo COUNCIL: đọc §2, §3 và mục Rejected options của spec v2 cùng lịch sử installer v1 trong git, khảo sát cách từng host cho phép cài, rồi đề xuất hai hoặc ba phương án kèm đánh đổi, rủi ro, cách đo, và khuyến nghị của bạn. Không sửa mã hay spec trước khi tôi chốt.
3. Bám công nghệ hiện đại nhất: biến thành cơ chế có tên, không phải khẩu hiệu. Tối thiểu gồm thẻ phiên bản trong mỗi tệp stack, đọc major từ lockfile, tra tài liệu ghim trước khi viết cú pháp mới hơn kiến thức của model, và một quy trình theo dõi thay đổi của cả nguồn lẫn host. Ghi rõ ai chạy, bao lâu một lần, bằng lệnh nào, và đặt vào spec cùng plan.
4. Danh sách tối thiểu của tôi, đã nằm ở phần mở đầu nhóm hàng 13-39 của docs/specs/2026-09-10-coverage-matrix.md, hãy đánh giá lại thật trung thực trong bản kiểm kê:
   Bắt buộc: #1 karpathy-skills, #3 superpowers hoặc #4 spec-kit, #19 vercel agent-skills, #21 frontend-design, #15 agent-browser.
   Trước khi ship: #17 security-guidance, #16 pr-agent trên CI.
   Thêm khi cần: #2 rule theo stack, #7 OpenCode dự phòng quota, #18 Biome hoặc Pint hook.
   Khi đánh giá phải nói thẳng: mục nào không có giấy phép nên chỉ lấy được ý chứ không lấy được chữ; mục nào là công cụ chạy bên cạnh chứ không phải nguồn để hấp thụ; mục nào mâu thuẫn với nguyên tắc đang có, ví dụ hook định dạng tự động; và claude-code-setup có còn giữ ưu tiên không khi nó không nằm trong danh sách này. Kết quả cần có: một thứ tự ưu tiên hợp nhất giữa nhóm bắt buộc cũ và danh sách này, mỗi mục kèm lý do và ràng buộc giấy phép. Số sao chỉ là tín hiệu thứ tự, không trích như dữ kiện; số nào chưa xác minh thì ghi "chưa xác minh".
```

---

## Thứ tự thực thi (đề xuất của phiên D0, owner chưa xác nhận từng chữ)

> **Khối nguyên văn ở mục đầu file là bản gốc để ĐỐI CHIẾU, không phải hàng đợi việc.** Trước khi thi hành bất cứ mệnh lệnh nào trong khối đó, kiểm trạng thái dưới đây; phần lớn đã xong rồi.

**Trạng thái thật (2026-09-11):**

| Bước | Chỉ thị | Trạng thái |
|---|---|---|
| D1 | 1 + 3 | đã xong |
| D2 | — | đã xong |
| D3 | 4 | đã xong, đã audit |
| D4 | 2 | **chưa chạy** |
| D5 | — | **chưa chạy** |
| D6 | — | **chưa chạy** |

D1. Chỉ thị 1 + 3 — ghi vào spec v2 §1 và mục cơ chế + plan

D2. Kiểm kê lại theo đợt nhỏ (mục 4.1 handoff) + sửa sha pr-agent,
    bổ sung nguồn thiếu trong upstream/sources.json
    → docs/specs/2026-09-11-skill-inventory.md

D3. Chỉ thị 4 — đánh giá lại danh sách tối thiểu, hợp nhất thứ tự ưu tiên

D4. Chỉ thị 2 — COUNCIL installer, chỉ đề xuất, KHÔNG sửa mã/spec

D5. Hợp nhất TẤT CẢ câu hỏi (6 câu cũ + mới + phương án installer)
    thành MỘT batch duy nhất, hỏi owner một lần

D6. bk-close: cập nhật handoff, commit, push

---

## Ràng buộc xuyên suốt (đề xuất của phiên D0, owner chưa xác nhận từng chữ)

- Kiểm kê chạy theo đợt nhỏ, không fan-out 16 agent song song
- Số sao = tín hiệu thứ tự, không trích như dữ kiện; chưa xác minh thì ghi
  "chưa xác minh"
- LICENSE của kit chưa chốt; agent không được tự viết LICENSE
- Trả lời tiếng Việt; mỗi lượt kết thúc bằng hai danh sách: đã xong / còn lại

---

*Ghi 2026-09-11. Xuất xứ từng mục: **khối nguyên văn ở mục đầu file** là chữ của owner, do owner dán ngày 2026-09-11 thay cho khung trống ban đầu — mục duy nhất trong file này là nguyên văn. **"Thứ tự thực thi"** và **"Ràng buộc xuyên suốt"** do phiên D0 soạn từ diễn giải ý owner; owner chưa xác nhận từng chữ, nên không được trích như lời của owner.*
