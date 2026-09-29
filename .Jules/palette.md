## 2024-05-20 - LogOut Button Accessibility and Focus

**Learning:** When applying `focus-visible` utility classes to interactive icon-only elements placed over dark backgrounds (e.g., `#030303` in `AppShell.tsx`), default focus rings may blend in or clip awkwardly. Additionally, decorative SVG icons within these buttons must be explicitly hidden from screen readers using `aria-hidden="true"` to prevent redundant or confusing announcements when an `aria-label` is already present.
**Action:** Always pair `focus-visible:ring-*` with explicit `focus-visible:ring-offset-*` colors that perfectly match the underlying container background. Enforce `aria-hidden="true"` on internal SVGs for icon-only buttons to guarantee a clean accessibility tree.
