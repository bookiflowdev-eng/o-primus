## 2024-11-05 - Add ARIA label and focus styles to icon-only buttons
**Learning:** Icon-only buttons without `aria-label` or focus styles are not accessible to screen readers or keyboard users. This is a common pattern in the codebase. When adding focus styles to elements inside a dark component, the background color must be considered to ensure the focus ring is visible and appropriate offset colors are used.
**Action:** Add `aria-label` to the LogOut button in `src/components/layout/AppShell.tsx` and proper `focus-visible` offset colors that match the `#030303` background.
