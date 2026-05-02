
## 2026-05-02 - Systemic Absence of Keyboard Focus Indication
**Learning:** The project relies heavily on `focus:outline-none` across interactive components (buttons, links, icon-buttons) to hide default browser outlines. However, `focus-visible` fallbacks were systematically omitted in multiple critical components (e.g., `AppShell`, `Navbar`, and the core `Button` component), leading to severe keyboard accessibility issues where users could not determine the currently focused element.
**Action:** When removing default outlines using `focus:outline-none`, always ensure a corresponding `focus-visible:ring-*` or similar state is provided. This rule should be enforced universally, especially in core reusable UI components like `Button`.
