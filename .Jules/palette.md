## 2026-06-05 - Accessible Icon-Only Buttons
**Learning:** Icon-only buttons using 'focus:outline-none' completely break keyboard navigation visibility. Also, lack of 'aria-label' and 'title' makes them unusable for screen readers and confusing for users on hover.
**Action:** Always add 'aria-label' (localized, e.g., 'Se déconnecter'), 'title', and an explicit fallback 'focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-1 focus-visible:ring-offset-black' when applying 'focus:outline-none' on icon buttons.
