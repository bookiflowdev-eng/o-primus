## 2024-05-15 - [Accessible AppShell Footer Actions]
**Learning:** Icon-only buttons in the dark AppShell sidebar footer require specific `focus-visible` offset colors (`ring-offset-[#030303]`) to match the surrounding `bg-[#030303]` background and avoid clipping or mismatched focus rings.
**Action:** Always verify the specific wrapper background color in layout components before applying `focus-visible` offset utilities to ensure visually distinct and cohesive keyboard navigation states.
