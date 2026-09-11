## 2024-05-15 - Interactive Focus vs Hover States
**Learning:** Adding `hover:` styles to an element without explicitly providing `focus-visible:` or `focus:` equivalents creates a critical accessibility gap for keyboard users, making interactive elements invisible during navigation against dark backgrounds.
**Action:** Always pair visual hover indicators on buttons with an explicit `focus-visible:` ring (including `ring-offset` matching the background) to ensure equitable keyboard accessibility.
