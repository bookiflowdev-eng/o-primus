## 2024-05-23 - AppShell Focus Rings and Background Matching
**Learning:** When applying `focus-visible` offset styling to elements within deeply nested sidebar footers (e.g., `AppShell`), the outer background color isn't always immediately obvious and can cause focus rings to clip or blend poorly if not explicitly matched with a `ring-offset` value.
**Action:** Always verify the direct container's background color (e.g. `bg-[#030303]`) and use `focus-visible:ring-offset-[COLOR]` on focusable UI components in these areas to ensure contrast and clear visibility for keyboard users.
