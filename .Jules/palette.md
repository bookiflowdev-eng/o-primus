## 2024-08-04 - Fixed Logout Button A11y and Keyboard Focus (AppShell.tsx)
**Learning:** Icon-only buttons using Tailwind `focus:outline-none` can become completely invisible to keyboard navigators on dark backgrounds unless explicit `focus-visible` offset styling is appended.
**Action:** Always append `.focus-visible:ring-offset-black` or specific offset colors (e.g. `focus-visible:ring-offset-[#030303]`) matching the surrounding surface when removing the default outline.
