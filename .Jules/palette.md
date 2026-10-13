## 2024-05-15 - Dark Background Focus Rings
**Learning:** When adding `focus-visible` offset outlines to interactive elements on dark backgrounds (like the `bg-[#030303]` sidebar footer), standard transparent or default offsets can appear clipped or unmatched.
**Action:** Always explicitly specify offset colors (e.g., `focus-visible:ring-offset-[#030303]`) that perfectly match the surrounding container's background to ensure accessible and visually seamless keyboard focus rings.
