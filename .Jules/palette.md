# Palette Journal

## 2024-05-24 - Accessibility for icon-only LogOut button
**Learning:** Icon-only interactive elements (such as `LogOut` buttons) frequently use `focus:outline-none` but lack `focus-visible` fallback styles. Against dark backgrounds, default focus styles are often invisible, and without an `aria-label`, screen readers provide no context.
**Action:** Always verify that icon-only buttons have explicit `aria-label` and `title` attributes, and replace simple `focus:outline-none` with explicit `focus-visible` ring styles (e.g., `focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-1 focus-visible:ring-offset-black`) to maintain keyboard navigation visibility.
