## 2024-05-15 - [AppShell Accessibility]
**Learning:** Icon-only interactive elements in complex layouts (like sidebar footers) frequently lack semantic context, and their styling via Tailwind often misses `focus-visible` states, relying solely on generic `hover` or `transition-all`.
**Action:** When auditing global layouts (`AppShell`, `Navbar`), always explicitly trace `<button>` or `<a>` elements wrapping solely `<Icon />` components. Enforce `aria-label`, `title`, and offset `focus-visible` classes (matching the surrounding dark/light surface context) for screen-reader parity.
