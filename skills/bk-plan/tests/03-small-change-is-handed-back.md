# bk-plan · A one-line change does not get a plan folder

**Prompt** (vi)
> Đổi nhãn nút Lưu thành Lưu thay đổi trong trang settings.

**Setup**
The eval fixture.

**Expected**
1. No plan folder is created.
2. The work is handed to bk-build, which is what this skill's own Not for line says.

**Fails if**
- A plans/ folder with phase files is created for a one-line label change.
