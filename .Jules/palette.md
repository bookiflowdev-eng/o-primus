## 2026-09-26 - [AppShell Accessibility Optimization]
**Learning:** For interactive elements placed in dark sections like the `#030303` background footer in AppShell, basic focus outlines can look clipped, hard to see or mismatch the background.
**Action:** When adding `focus-visible` outlines for accessibility, always explicitly match the `ring-offset` color to the background color (e.g. `focus-visible:ring-offset-[#030303]`) to ensure a perfectly seamless and clear focus state that does not bleed or clip.
