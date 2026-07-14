## 2026-07-14 - OmniBar Accessibility Fix
**Learning:** Icon-only buttons often miss ARIA labels, making them inaccessible. Hidden-on-hover actions (like delete attachments) must have focus-within classes to be accessible via keyboard.
**Action:** Applied aria-labels, aria-hidden to decorative svgs, and focus-visible utilities to all buttons in the Nexus OmniBar.
