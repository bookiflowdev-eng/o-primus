
## 2024-05-24 - AppShell LogOut Button Accessibility
**Learning:** Icon-only buttons in dense navigation areas (like the AppShell footer) often lack accessible labels and keyboard focus states. The `#030303` dark background requires a specific `ring-offset-[#030303]` color to ensure the `focus-visible` ring does not clip or look disconnected from the dark container.
**Action:** Always verify the exact hex color of the parent container when adding `focus-visible` offset rings to interactive elements to ensure visual coherence. Use `aria-hidden="true"` on internal SVGs to prevent redundant screen reader announcements.
