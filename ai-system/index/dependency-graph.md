# Dependency Graph

> **Metadata**
> - last-updated-by: bootstrap-project
> - last-verified-against-code: 2026-07-22
> - staleness-policy: auto-regenerable — update when module relationships change

> **Overview:** Module relationships and dependency flow within the HR ID Card Automata codebase.

---

```
main.tsx
  └── App.tsx
        ├── components/DataEntry.tsx
        ├── components/IDCard.tsx
        │     └── lib/employeeStore.ts (renderTransformedImage)
        ├── components/TemplateEditor.tsx
        ├── components/ImportWizard.tsx
        │     └── lib/employeeStore.ts (parseEmployeeCsv, parseEmployeeXlsx, etc.)
        ├── components/ActivityBoard.tsx
        └── lib/employeeStore.ts (loadPersistedBatch, savePersistedBatch)
              ├── localStorage
              └── IndexedDB

External Dependencies:
  react, react-dom          → UI
  vite                      → Build/dev server
  @tailwindcss/vite         → Tailwind plugin
  tailwindcss               → Utility CSS
  lucide-react              → Icons
  motion                    → Animations (ActivityBoard only)
  jspdf                     → PDF export
  docx                      → DOCX export
  xlsx                      → XLSX import parsing
  typescript                → Type checking
  tsx                       → Script runner (verify.ts)

Unused Dependencies (to clean up):
  express
  @google/genai
  dotenv
```
