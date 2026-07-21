## 2025-02-27 - Button Component Keyboard Accessibility
**Learning:** The global `Button` UI component relied on `focus:outline-none` without providing an alternative focus indicator, rendering keyboard navigation completely invisible across the application.
**Action:** Always append `focus-visible:ring-2` with appropriate offset colors (e.g., `focus-visible:ring-offset-2 focus-visible:ring-offset-black`) to base component styles when removing default browser outlines to ensure keyboard accessibility against dark backgrounds.
