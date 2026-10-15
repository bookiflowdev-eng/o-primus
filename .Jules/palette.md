## 2024-05-24 - Accessibility configuration for sidebars on dark themes
**Learning:** For interactive elements placed in the dark `AppShell` sidebar footer (like the LogOut button), `focus-visible` outlines must explicitly use `ring-offset-[#030303]` to perfectly match the `bg-[#030303]` background and avoid clipping or mismatched focus rings.
**Action:** When adding keyboard focus states to sidebar components, always verify the exact background color of the parent container using `grep` and explicitly match the `ring-offset` color to avoid visual glitches.
