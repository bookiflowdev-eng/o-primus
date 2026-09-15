## 2024-09-15 - Add Accessible Labels to LogOut Button
**Learning:** Icon-only interactive elements lacking labels degrade the experience for screen readers and tooltips. Additionally, decorative SVG icons within these elements should be hidden to avoid redundant announcements.
**Action:** When adding accessible labels (, ) to icon-only buttons, ensure the internal decorative SVG icons themselves are explicitly marked with  to prevent screen readers from redundantly announcing or misinterpreting them.
## 2024-09-15 - Add Accessible Labels to LogOut Button
**Learning:** Icon-only interactive elements lacking labels degrade the experience for screen readers and tooltips. Additionally, decorative SVG icons within these elements should be hidden to avoid redundant announcements.
**Action:** When adding accessible labels (aria-label, title) to icon-only buttons, ensure the internal decorative SVG icons themselves are explicitly marked with aria-hidden=true to prevent screen readers from redundantly announcing or misinterpreting them.
