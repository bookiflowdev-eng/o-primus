## 2026-05-01 - Focus Visibility on Dark Themes
**Learning:** When suppressing default focus rings using `focus:outline-none` (often done for mouse users to avoid unseemly borders), it completely removes keyboard navigability unless explicitly replaced. On dark themes, standard browser focus outlines are often hard to see anyway.
**Action:** Always pair `focus:outline-none` with explicit `focus-visible:ring-2 focus-visible:ring-white/30` (or similar high-contrast variants) to ensure custom, accessible focus indicators are provided exclusively for keyboard navigation.
