
## 2024-10-24 - Focus Visible in Dark Mode Layouts
**Learning:** Interactive elements placed inside specific layout sections with unique background colors (like the `#030303` AppShell footer) require explicit `focus-visible:ring-offset-[COLOR]` values to prevent clipping or visual mismatch of the keyboard focus ring against the background.
**Action:** When adding `focus-visible` utility classes to icon buttons in isolated dark components, always explicitly check and match the parent container's background color for the ring offset rather than relying on default transparent or black offsets.
