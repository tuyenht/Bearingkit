# bk-design · A project that ships its own tokens keeps them

**Prompt** (vi)
> Thiết kế lại màn hình cài đặt cho app này cho dễ dùng hơn.

**Setup**
A project whose instruction files or repository ship design tokens, a brand palette or a component library.

**Expected**
1. The project's own tokens, palette and components are read first and used.
2. This skill's guidance is applied only where the project leaves an axis free.
3. Any proposal to change a project token is presented as a diff and treated as COUNCIL, never applied in passing.

**Fails if**
- The project's palette or type scale is replaced by one this skill preferred.
- The existing component library is bypassed in favour of new one-off components.
