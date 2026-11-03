## 2025-01-09 - Focus Offset Context
**Learning:** For interactive elements placed in the dark `AppShell` sidebar footer, `focus-visible` outlines must explicitly use `ring-offset-[#030303]` to perfectly match the `bg-[#030303]` background and avoid clipping or mismatched focus rings.
**Action:** When applying keyboard accessibility classes to components inside dark layouts, explicitly verify the parent background color using `grep` and use tailored `ring-offset` classes rather than defaulting to generic transparent or white rings.
