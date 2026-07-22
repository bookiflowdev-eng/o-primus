## 2024-05-24 - Accessibility for Icon-only LogOut Button
**Learning:** Using `focus:outline-none` on interactive elements like the LogOut button requires proper fallback `focus-visible` styling with specific offset colors (`focus-visible:ring-offset-[#030303]`) matching the complex layered backgrounds to maintain keyboard navigation visibility.
**Action:** When replacing `focus:outline-none`, always define custom ring offsets matched to the container's background color in the dark UI context, and ensure `aria-hidden="true"` is set on SVG icons.
