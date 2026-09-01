## 2024-05-24 - Hide Decorative Icons in Icon-Only Buttons
**Learning:** When adding `aria-label`s to parent icon-only buttons, the internal decorative SVGs (like `LogOut`) must be explicitly marked with `aria-hidden="true"` to prevent screen readers from redundantly announcing or misinterpreting them.
**Action:** Always add `aria-hidden="true"` to SVG components inside buttons that already have `aria-label` or `title` attributes.
