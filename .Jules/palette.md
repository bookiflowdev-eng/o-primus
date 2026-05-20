## 2024-05-20 - Ensure icon-only buttons have accessible names
**Learning:** Icon-only buttons frequently miss screen reader context and tooltips for hover states.
**Action:** Always add `aria-label` and `title` to elements relying solely on icons. Ensure focus states are accessible (`focus-visible`).
