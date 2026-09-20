## 2025-02-17 - [Accessible Icon-Only Action Buttons]
**Learning:** Adding accessible labels (`aria-label`, `title`) to icon-only buttons requires explicitly marking the internal decorative SVG icons themselves with `aria-hidden="true"` to prevent screen readers from redundantly announcing or misinterpreting them.
**Action:** When adding accessibility properties to interactive elements without text nodes, remember to disable the decorative icon from screen-readers along with setting `aria-label` and `title`.
