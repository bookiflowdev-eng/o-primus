## 2023-10-11 - [Accessible Icon-Only Buttons]
**Learning:** Icon-only interactive elements in dark themes (like the AppShell sidebar footer) require explicitly localized `aria-label` and `title` attributes (e.g., 'Se déconnecter'). For focus states, they must use a `ring-offset` matching the exact background color to avoid clipping.
**Action:** Always verify background color, add localized attributes, and explicitly hide internal SVG icons with `aria-hidden="true"`.
