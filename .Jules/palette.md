
## 2026-06-27 - Focus counterparts for hidden-on-hover
**Learning:** Implementing `opacity-0 group-hover:opacity-100` hides elements visually but can break keyboard accessibility if users tab to them and they remain invisible. Additionally, keyboard focus on dark backgrounds requires explicit fallback colors.
**Action:** Always pair hidden-on-hover classes with `focus:opacity-100` and provide robust focus styles like `focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-1 focus-visible:ring-offset-black`.
