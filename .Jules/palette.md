
## 2024-05-18 - [Icon-Only Button Accessibility in Dark Theme]
**Learning:** Icon-only buttons with `focus:outline-none` on dark backgrounds can become completely invisible to keyboard users. Just adding `aria-label` isn't enough; they also require a visible focus indicator with sufficient contrast against the dark background.
**Action:** When converting icon-only buttons, always combine `aria-label` and `title` with a fallback `focus-visible` ring (e.g. `focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-1 focus-visible:ring-offset-black`) to ensure both screen reader support and keyboard navigation visibility.
