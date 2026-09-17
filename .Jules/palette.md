
## 2026-09-17 - Focus States and ARIA Labels on Navigation Layouts
**Learning:** In Next.js layout structures like AppShells and Navbars, interactive icon-only buttons (like user profile and logout buttons) frequently lack visible keyboard focus states because of `focus:outline-none` resets, and miss ARIA labels. Transparent or dark theme backgrounds require explicitly testing different `ring-offset` utilities (`transparent` or exact hex) to remain visible.
**Action:** When reviewing layout components, explicitly check for `focus-visible:ring-* focus-visible:ring-offset-*` fallbacks accompanying any `focus:outline-none` utilities, and ensure ARIA labels exist on all icon-only interactions.
