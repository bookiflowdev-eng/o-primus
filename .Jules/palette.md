
## 2024-05-18 - Added ARIA labels and focus styles to icon-only LogOut button
**Learning:** Icon-only buttons with `focus:outline-none` can be completely invisible to keyboard users and screen reader users if no alternative label or focus style is provided. The dark theme necessitates bright focus rings (`focus-visible:ring-white/30` etc.).
**Action:** Always add `aria-label` and `title` to icon-only interactive elements, and append `focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-1 focus-visible:ring-offset-black` to elements that have `focus:outline-none` globally.
