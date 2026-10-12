## 2026-10-12 - Focus Ring Visibility on Dark Themes
**Learning:** When adding focus rings (`focus-visible:ring`) to interactive elements nested inside darkly colored containers (like the AppShell footer with `bg-[#030303]`), the default offset color often clips or blends in seamlessly, rendering the focus ring invisible.
**Action:** Always explicitly specify a `focus-visible:ring-offset-*` color that matches the exact background color of the parent container to ensure the focus ring remains distinct and accessible.
