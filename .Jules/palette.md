## 2024-05-24 - Initial Palette Journal\n**Learning:** Started tracking UX improvements.\n**Action:** Will log critical insights here.
## 2026-08-19 - Icon-Only Button Accessibility
**Learning:** Icon-only interactive elements (like the AppShell LogOut button) are completely inaccessible to screen reader users and keyboard navigation if they lack `aria-label`, `title`, and `focus-visible` styling. Adding `aria-hidden="true"` to the internal decorative SVG ensures screen readers don't redundantly announce or misinterpret the graphic.
**Action:** Always pair `focus:outline-none` with `focus-visible:ring-2` (or similar) on interactive elements to maintain keyboard focus visibility. Include localized `aria-label` and `title` for context.
