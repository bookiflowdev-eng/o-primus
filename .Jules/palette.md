## 2024-05-24 - Interactive Elements in Bento Layouts
**Learning:** When adding focus-visible states to interactive elements housed within specific nested layout components (like the dark `AppShell` sidebar footer Bento Box), the generic transparent or white ring offsets clip or look disjointed.
**Action:** Always explicitly read the specific background color of the wrapping container (e.g., `#030303` for the footer) and apply a matching `focus-visible:ring-offset-[COLOR]` to ensure the focus ring integrates seamlessly with the surrounding micro-layout.
