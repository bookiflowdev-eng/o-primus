## 2024-05-18 - Dark Theme Focus Visibility
**Learning:** When applying `focus-visible` styles to interactive elements on deeply dark backgrounds (e.g., `#030303`, `black`), the default browser focus ring or even standard white focus rings can blend in or look muddy if an appropriate offset color is not provided. Explicitly defining `focus-visible:ring-offset-[color]` to match the parent background color ensures the focus ring remains crisp, distinct, and visually separated from the element itself, drastically improving keyboard accessibility.
**Action:** Always pair `focus-visible:ring-2` with an explicit `focus-visible:ring-offset-2` and `focus-visible:ring-offset-[backgroundColor]` when styling interactive components over non-white backgrounds.

## 2024-05-18 - Decorative Icon Accessibility
**Learning:** Simply adding `aria-label` or `title` to an icon-only button is not always sufficient for robust screen reader support. If the inner decorative `<svg>` element (e.g., from `lucide-react`) is not explicitly hidden, some screen readers might redundantly announce it or misinterpret its presence, leading to a confusing audio experience.
**Action:** When adding accessible labels (`aria-label`, `title`) to icon-only buttons, always ensure the internal decorative SVG icons themselves are explicitly marked with `aria-hidden="true"`.
