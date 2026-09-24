## 2026-09-24 - AppShell Focus Ring Offset
**Learning:** Interactive elements in dark sidebar footers need explicit focus ring offsets (like ring-offset-[#030303]) to avoid clipping and correctly match the background.
**Action:** Always check the explicit background color (e.g. bg-[#030303]) when adding focus-visible styles to dark UI elements.
