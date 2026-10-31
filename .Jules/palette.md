## 2024-05-18 - AppShell Dark Sidebar Accessibility Constraints
**Learning:** The AppShell sidebar footer uses a dark Bento-style box (`bg-[#030303]`). Default browser focus rings or generic `focus-visible` classes clash and blend into this dark background.
**Action:** Always explicitly specify `ring-offset` matching the exact background color (`focus-visible:ring-offset-[#030303]`) alongside a contrasting ring color (`focus-visible:ring-white/[0.3]`) when implementing keyboard navigation for interactive elements in these dark layout regions.
