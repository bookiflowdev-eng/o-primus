## 2024-07-28 - AppShell LogOut Button Accessibility
**Learning:** Icon-only interactive elements lacking explicit semantic text cause redundant or unclear announcements for screen readers. Furthermore, `focus:outline-none` on buttons without `focus-visible` states impairs keyboard navigation visibility.
**Action:** Always provide localized `aria-label` and `title` for context, mark internal decorative SVG icons with `aria-hidden="true"`, and supplement `focus:outline-none` with robust `focus-visible` classes (e.g., ring utilities matched with explicit offset colors that suit the background).
