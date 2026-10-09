## 2024-05-18 - AppShell Dark Mode Focus Visibility
**Learning:** In the dark-themed AppShell sidebar footer, the standard `focus:outline-none` class completely obscures keyboard navigation focus. Using standard tailwind ring utilities (`focus-visible:ring-2`) is insufficient because the ring blends into the `#030303` background.
**Action:** Always pair `focus-visible:ring` with explicit `ring-offset` utilities that exactly match the dark background color (e.g., `focus-visible:ring-offset-[#030303]`) to ensure the focus ring contrasts effectively and is not clipped or invisible.
