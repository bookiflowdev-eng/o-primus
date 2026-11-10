## 2026-11-10 - [AppShell Logout Button Accessibility]
**Learning:** Icon-only buttons embedded in dark theme footers (like AppShell bg-[#030303]) require explicit `focus-visible:ring-offset-[color]` to match their parent container, ensuring the focus ring isn't clipped or miscolored, alongside semantic `aria-label` and `title`s.
**Action:** Always verify parent background color and apply matching `ring-offset` when implementing `focus-visible` on interactive elements in dark/isolated layout regions.
