## 2026-05-15 - Add Fallback to outline-none Elements
**Learning:** This codebase frequently uses `focus:outline-none` which hides focus indicators for keyboard users. Icon-only buttons are also sometimes missing `aria-label` and `title` tags.
**Action:** Always verify keyboard accessibility by pairing `focus:outline-none` with an appropriate `focus-visible` fallback. Ensure all icon-only buttons receive descriptive `aria-label` and `title` attributes.
