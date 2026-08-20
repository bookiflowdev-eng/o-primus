## 2026-08-20 - Focus Visible Offset Constraints
**Learning:** When retrofitting existing components with focus-visible for keyboard accessibility against dark backgrounds (#000000 or #050505), adding ring-offset with specific colors matching the background is necessary to prevent the focus ring from blending into visually noisy environments or looking like a bug.
**Action:** Always include ring-offset explicitly configured for the surrounding background color rather than relying on default transparent offsets.
