## 2026-06-16 - Accessible Icon-Only Buttons in Sidebar
**Learning:** Icon-only logout buttons in sidebars are frequently missed for accessible labels, breaking navigation for screen readers. Further, setting `focus:outline-none` without providing a `focus-visible` fallback makes it impossible for keyboard users to track focus.
**Action:** Always add `aria-label` and `title` to icon-only buttons, paired with `focus-visible` utility classes (e.g., `focus-visible:ring-2 focus-visible:ring-white/30`) to guarantee an accessible and visually clear experience.
