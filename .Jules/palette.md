
## 2024-05-18 - AppShell Dark Mode Focus Visibility
**Learning:** In the dark `#030303` sidebar footer, standard `focus-visible:ring-2` is invisible without an offset. The exact matching offset `focus-visible:ring-offset-[#030303]` is crucial so the focus ring doesn't clip into the dark container edge or look disjointed.
**Action:** Always extract the exact parent background color using a wide context `grep -C 20` when adding focus rings to edge-aligned sidebar elements.
