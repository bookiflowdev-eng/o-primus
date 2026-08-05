## 2024-08-05 - Localization of Accessibility Labels
**Learning:** When adding ARIA labels or titles to components (like the LogOut button), they must match the localized language of the surrounding UI to prevent confusing screen reader pronunciations. The existing UI often uses French (e.g., "Se déconnecter"), while code files might be named or structured in English.
**Action:** Always verify the surrounding user-facing text language before adding hardcoded accessibility strings.
