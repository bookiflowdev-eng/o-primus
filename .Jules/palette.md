## 2024-07-16 - Accessible Icon-Only Buttons in Dark Themes
**Learning:** Icon-only buttons often lack essential context for screen readers and miss visible focus states for keyboard users in dark themes. Simply using `focus:outline-none` creates an accessibility barrier.
**Action:** Always add `aria-label`, `title`, and mark internal icons with `aria-hidden="true"`. Furthermore, replace bare `focus:outline-none` with explicit `focus-visible:ring-2 focus-visible:ring-offset-2` using a ring-offset color that matches the specific dark background (e.g., `#030303`).
