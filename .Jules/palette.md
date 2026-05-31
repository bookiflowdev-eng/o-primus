## 2024-05-31 - Focus Visibility on Dark Backgrounds
**Learning:** Icon-only buttons with `focus:outline-none` on dark backgrounds (like `#000000` or `#18181B`) can completely hide keyboard focus state, heavily degrading accessibility.
**Action:** Always pair `focus:outline-none` with explicit `focus-visible` fallback classes (e.g., `focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-1 focus-visible:ring-offset-black`) to ensure keyboard navigability remains visible.
