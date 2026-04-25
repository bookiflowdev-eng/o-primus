## 2025-01-30 - Focus Indicators and Icon Accessibility
**Learning:** Icon-only interactive elements lacking focus indicators and ARIA descriptions severely impact keyboard navigation and screen reader accessibility, even if hover styles are present.
**Action:** When working on navigation or header components, proactively apply `focus-visible:ring-2` to links/buttons, explicitly define `aria-label` and `title` attributes on icon-only actions, and set `aria-hidden="true"` on their SVG icons to ensure a fully accessible experience.
