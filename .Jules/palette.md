## 2024-10-10 - AppShell Sidebar Keyboard Navigation
**Learning:** In the dark AppShell sidebar footer, interactive elements like the LogOut button must explicitly define their keyboard focus ring offset color using `ring-offset-[#030303]` to perfectly match the `bg-[#030303]` background and avoid clipping or mismatched focus rings.
**Action:** Always verify the explicit background color of the wrapping container before applying `focus-visible:ring-offset-*` classes to ensure seamless keyboard navigation visuals in custom UI structures.
