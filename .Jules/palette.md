## 2026-11-02 - AppShell Sidebar Footer Accessibility
**Learning:** Interactive elements in the dark AppShell sidebar footer must explicitly use `ring-offset-[#030303]` to perfectly match the `bg-[#030303]` background and avoid clipping or mismatched focus rings. Accessibility labels should be localized in French.
**Action:** Add explicit offset styling with corresponding background colors for nested components, and ensure ARIA labels match the application's localized language.
