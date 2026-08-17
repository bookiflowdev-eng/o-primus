## 2026-08-17 - AppShell LogOut Button Accessibility
**Learning:** Icon-only buttons lacking aria-label, title, and visible focus rings against dark backgrounds is a common pattern that impairs accessibility.
**Action:** Add aria-label and title for context, use focus-visible classes with explicit offsets matching the background for keyboard navigation, and hide purely decorative SVG icons from screen readers using aria-hidden='true'.
