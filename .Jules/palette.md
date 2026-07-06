
## 2026-07-06 - A11y on Icon-Only Actions
**Learning:** Icon-only interactive elements (like the LogOut button in the AppShell footer) require explicit `aria-label` and `title` attributes (localized, e.g., 'Se déconnecter') to provide context to screen readers and pointer-device users. Also, the internal decorative SVG icons themselves must be marked with `aria-hidden="true"`, and the button must include a `focus-visible` ring offset (matching the background color) to ensure the focus ring remains visually distinct against dark backgrounds.
**Action:** Ensure all icon-only buttons include `aria-label`, `title`, and `aria-hidden="true"` on the icon itself, alongside specific `focus-visible:ring-offset-*` colors on dark themes.
