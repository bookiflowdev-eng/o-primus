
## 2024-05-24 - Focus-Visible Background Color Matching
**Learning:** When adding focus-visible classes for keyboard accessibility to interactive elements inside dark themes (like the AppShell sidebar footer), explicitly verifying and using offset colors (e.g., `focus-visible:ring-offset-[#030303]`) that perfectly match the surrounding background color is crucial to avoid clipped or mismatched focus rings.
**Action:** Always verify the parent's background color (e.g., using `grep`) before applying offset utilities in Tailwind to maintain seamless visual integration during focus states.
