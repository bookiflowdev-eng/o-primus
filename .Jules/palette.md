## 2026-11-07 - AppShell LogOut Button Accessibility
**Learning:** The focus-visible offset color on interactive elements within the AppShell footer must strictly match its dark `bg-[#030303]` background to prevent mismatched focus rings.
**Action:** Always verify parent background colors using `grep -n -C 20` when adding focus styles.
