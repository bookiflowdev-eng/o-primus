## 2026-08-30 - Enhance Icon-Only Buttons
**Learning:** Icon-only buttons (like LogOut) frequently lack ARIA labels and focus states in this app's design system, making them inaccessible to screen readers and keyboard users (especially against dark backgrounds like `#030303`).
**Action:** Always add `aria-label`, `title`, `aria-hidden="true"` on the inner SVG, and explicitly define `focus-visible:ring-offset-[COLOR]` to ensure focus rings are visible.
