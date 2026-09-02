## 2024-05-15 - [Dark Theme Focus & Icon A11y]
**Learning:** In dark themes, standard focus visible rings (often white or light colored) can blend in or become imperceptible without explicit ring offsets matching the background color. Additionally, icon-only buttons require semantic aria-labels in the localized language to be accessible.
**Action:** Always provide explicit `focus-visible:ring-offset-<color>` matching the parent background in dark UI components, and attach localized `aria-label` / `aria-hidden` attributes to icon buttons.
