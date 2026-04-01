## 2025-04-01 - Icon-only Buttons Accessibility
**Learning:** Found an accessibility issue pattern specific to this app's components, where icon-only buttons (like LogOut in AppShell.tsx) lacked `aria-label`, `title`, and explicit keyboard `focus-visible` styles.
**Action:** Always include `aria-label`, `title`, explicit `focus-visible` styling (e.g., `focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-white/30`), and `aria-hidden="true"` on the SVG itself to ensure proper screen reader support and keyboard navigation for icon-only buttons.
