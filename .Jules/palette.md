
## 2025-02-14 - Accessible Hidden Actions
**Learning:** Hover-revealed action buttons (like those inside VaultModal using `opacity-0 group-hover:opacity-100`) are completely inaccessible to keyboard users, preventing them from deleting or renaming architectures.
**Action:** When using `opacity-0 group-hover:opacity-100` on an actions container, always add `focus-within:opacity-100` (or `focus:opacity-100` / `focus-visible:opacity-100` to the buttons themselves) so keyboard tabbing naturally reveals the hidden actions.
