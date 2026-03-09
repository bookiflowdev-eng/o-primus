## 2024-05-24 - Accessibility Label for LogOut Button
**Learning:** Found an icon-only button without an accessible name (`LogOut` icon) in `AppShell.tsx`. Verified that the application uses French for accessibility labels and added an appropriate `aria-label`.
**Action:** Always verify the application's primary language when providing `aria-label` values for accessibility to avoid regressions for users of screen readers.
