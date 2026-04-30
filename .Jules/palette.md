## 2025-02-23 - App-wide Missing Focus States
**Learning:** The codebase has a widespread pattern of disabling default focus rings using `focus:outline-none` on interactive elements (Links, Buttons, Navbar items) without providing a custom `focus-visible` fallback, making keyboard navigation virtually invisible and breaking accessibility.
**Action:** Always pair `focus:outline-none` with explicit `focus-visible` classes like `focus-visible:ring-2 focus-visible:ring-white/30` to ensure keyboard users can track their focus. Ensure a border radius is also applied for the ring to look polished.
