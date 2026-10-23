## 2023-10-23 - Accessible Icon Buttons in Dark Bento UI
**Learning:** Icon-only buttons embedded in dark "bento-style" layouts (like the AppShell footer with `bg-[#030303]`) require specific offset colors to maintain focus ring visibility without visual clipping.
**Action:** When adding `focus-visible` to interactive elements on dark backgrounds, explicitly extract the parent wrapper's background color (e.g., `#030303`) and apply matching offset classes like `focus-visible:ring-offset-[#030303]` alongside the primary ring color (`ring-white/[0.2]`).
