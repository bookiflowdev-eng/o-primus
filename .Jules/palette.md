## 2024-05-18 - AppShell LogOut Button Accessibility
**Learning:** For interactive elements placed against dark container backgrounds (like `#030303` in `AppShell` footer), generic `focus-visible` offset colors often cause clipping or mismatched rings. Explicitly matching the container's background hex is required.
**Action:** Use `focus-visible:ring-offset-[#<hex>]` rather than generic tailwind ring offset colors when dealing with dark/glassmorphic nested backgrounds.
