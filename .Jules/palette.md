## 2024-05-24 - Missing Focus and Accessibility Attributes
**Learning:** Found that multiple buttons in the `NexusWorkspace` view mode and device mode selectors lack proper `aria-label` and consistent keyboard focus states (`focus-visible`).
**Action:** Always add `aria-label` to icon-only buttons or those acting as toggle switches, and ensure `focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-1 focus-visible:ring-offset-black` is present where `focus:outline-none` is used or implicit.
