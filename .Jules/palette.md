## 2023-10-27 - AppShell Accessibility Improvement
**Learning:** `focus:outline-none` is frequently used across this app's interactive elements (like `Link` and `button` in `AppShell.tsx`), removing essential keyboard focus indicators. This creates a recurring accessibility pattern issue.
**Action:** Always check interactive elements using `focus:outline-none` and enforce adding a visible fallback using Tailwind's `focus-visible` utility (e.g., `focus-visible:ring-2 focus-visible:ring-white/30`).
