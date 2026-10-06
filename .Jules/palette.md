## 2026-10-06 - LogOut Keyboard Focus Contrast
**Learning:** Dark-mode sidebars (like AppShell) often swallow standard focus rings. For interactive elements placed in  backgrounds,  outlines must explicitly use  to perfectly match the background and avoid clipping or mismatched focus rings.
**Action:** When adding `focus-visible` to icon buttons in dark, custom-background containers, actively verify the parent wrapper's background color (e.g. via grep or inspecting utility classes) and apply an exact matching `ring-offset-[color]` to guarantee the ring renders cleanly.
## 2025-02-18 - LogOut Keyboard Focus Contrast
**Learning:** Dark-mode sidebars (like AppShell) often swallow standard focus rings. For interactive elements placed in `#030303` backgrounds, `focus-visible` outlines must explicitly use `ring-offset-[#030303]` to perfectly match the background and avoid clipping or mismatched focus rings.
**Action:** When adding `focus-visible` to icon buttons in dark, custom-background containers, actively verify the parent wrapper's background color (e.g. via grep or inspecting utility classes) and apply an exact matching `ring-offset-[color]` to guarantee the ring renders cleanly.
