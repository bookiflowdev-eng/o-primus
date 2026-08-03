## $(date +%Y-%m-%d) - Focus visibility against dark backgrounds
**Learning:** When using utility classes to hide UI elements on hover (like `opacity-0 group-hover:opacity-100` on the delete attachment button), keyboard focus states will be completely invisible unless explicitly styled with `focus:opacity-100 focus-within:opacity-100` alongside the standard `focus-visible:ring` styles.
**Action:** When adding hover-reveal actions, always ensure a corresponding `focus-within:opacity-100 focus:opacity-100` exists for keyboard users.
