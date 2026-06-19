## 2026-06-19 - Focus-visible and ARIA fallback on interactives
**Learning:** The codebase relies heavily on `focus:outline-none` which hides focus indicators from keyboard users. Also, icon-only buttons like LogOut sometimes lack `aria-label` attributes.
**Action:** Always provide `focus-visible` utility fallbacks (e.g. `focus-visible:ring-2 focus-visible:ring-white/30`) when overriding outlines, and always check that interactives with no text have `aria-label` or `title` set for screen readers and tooltips.
