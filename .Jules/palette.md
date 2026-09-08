## 2024-05-15 - Accessible Icon-Only Buttons in Dark Mode
**Learning:** When replacing `focus:outline-none` on interactive elements in dark-themed layouts, an offset color matching the parent background (e.g., `focus-visible:ring-offset-[#030303]`) is critical to ensure the focus ring remains visually distinct.
**Action:** Always specify an appropriate offset color with `focus-visible` classes, and ensure icon-only buttons include both `aria-label` (for screen readers), `title` (for pointer tooltips), and `aria-hidden="true"` on the SVG to prevent redundant announcements.
