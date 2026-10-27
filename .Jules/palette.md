## 2023-10-27 - [Focus Ring for Dark AppShell Background]
**Learning:** For interactive elements in the dark AppShell sidebar footer (e.g., `#030303` background), standard `focus-visible` offset colors clip or don't match the background, making keyboard navigation inaccessible.
**Action:** Always explicitly use `focus-visible:ring-offset-[#030303]` (or whatever the specific parent background is) when adding focus visible styles on dark backgrounds to ensure perfectly matched and non-clipped focus rings.
