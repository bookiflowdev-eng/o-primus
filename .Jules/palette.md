## 2025-02-20 - [AppShell Accessibility]
**Learning:** In dark-themed interfaces, standard `focus:outline-none` removes critical keyboard navigation context. Additionally, icon-only buttons (like LogOut) completely fail screen reader users without explicit ARIA labels.
**Action:** Always pair `focus:outline-none` with a high-contrast `focus-visible:ring-*` fallback and ensure every icon-only interactive element has an `aria-label` and `title` in the appropriate localization (French for this app).
