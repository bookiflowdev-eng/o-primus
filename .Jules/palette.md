## 2024-05-16 - Add ARIA Labels and Focus States to Icon-Only Buttons
**Learning:** Icon-only buttons (like `LogOut`) frequently lack context for screen readers and keyboard users. `focus:outline-none` is often used to remove default browser rings but if not replaced with `focus-visible`, it causes poor keyboard accessibility against dark backgrounds.
**Action:** When finding `focus:outline-none` on interactive elements, replace it with or append `focus-visible:ring-2 focus-visible:ring-white/30` to maintain visibility, and ensure `aria-label` and `title` are added for context.
