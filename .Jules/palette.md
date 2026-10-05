## 2026-10-05 - Match focus-visible ring-offset to parent background
**Learning:** When applying `focus-visible` ring offsets to interactive elements situated in customized dark containers (like the AppShell footer with `bg-[#030303]`), failing to match the `ring-offset` color to the specific background creates awkward visual clipping or mismatched colors.
**Action:** Always verify the immediate parent's background color (e.g. `bg-[#030303]`) and apply a matching offset class like `focus-visible:ring-offset-[#030303]` alongside the `ring-offset-2` spacing.
