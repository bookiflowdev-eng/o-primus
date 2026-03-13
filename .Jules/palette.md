## 2024-03-13 - Added ARIA Label and Tooltip to Icon-Only LogOut Button
**Learning:** Found an accessibility issue pattern specific to this app's components, where icon-only buttons lacked descriptive labels for screen readers and tooltips for mouse users. The UI terminology is natively written in French.
**Action:** Applied `aria-label` and `title` attributes with "Se déconnecter" to the LogOut button in `src/components/layout/AppShell.tsx` to improve accessibility and UX. Ensure future icon-only buttons include descriptive labels in French.
