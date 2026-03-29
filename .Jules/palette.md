
## 2026-03-29 - Accessibility of Icon-only Interactive Elements in AppShell
**Learning:** Structural components like the AppShell sidebar often use icon-only interactive elements to save space, but without explicit 'aria-label', 'title', 'focus-visible' styling, and 'aria-hidden' on the SVG, these become completely inaccessible to screen readers and keyboard users.
**Action:** Add explicit accessibility patterns to icon-only interactive elements to ensure they are understandable by assistive technologies and display tooltips for mouse users, and enhance keyboard navigation visibility.
