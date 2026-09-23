
## 2024-05-18 - Sidebar Action Button A11y
**Learning:** For elements placed in the dark AppShell sidebar footer (like the LogOut button), `focus-visible:ring-offset-[#030303]` provides the exact matching offset color needed for the `focus-visible` outline.
**Action:** Always ensure keyboard visibility explicitly defines `ring-offset-[#030303]` when adding focus states for interactive items in the `bg-[#030303]` footer section of the app shell to avoid clipping or mismatched colors.
