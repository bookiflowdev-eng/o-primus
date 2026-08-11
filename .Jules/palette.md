## 2026-08-11 - Icon-Only Button Accessibility
**Learning:** Icon-only buttons (like the AppShell logout) require explicit `aria-label` and `title` for screen readers and tooltips, while the decorative SVG must be hidden with `aria-hidden="true"`.
**Action:** Always verify icon-only buttons have descriptive labels matching the localized language (e.g. 'Se déconnecter') and focus-visible outlines tailored to the dark theme context.
