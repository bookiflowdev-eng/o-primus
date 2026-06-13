## 2026-06-13 - Icon-only LogOut Accessibility
**Learning:** Icon-only elements without explicit labels lack context for screen readers and pointer users, while `focus:outline-none` on dark backgrounds degrades keyboard navigation accessibility.
**Action:** Always provide localized `aria-label` and `title` attributes (e.g., 'Se déconnecter') to icon-only buttons and append explicit `focus-visible` ring styles to maintain keyboard focus visibility.
