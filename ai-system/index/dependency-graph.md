# Dependency Graph

> **Metadata**
> - last-updated-by: update-ai-system
> - last-verified-against-code: 2026-07-26
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
        │     ├── components/TemplateLibrary.tsx
        │     │     └── lib/templateStore.ts (listTemplates, saveTemplate, etc.)
        │     └── lib/templateStore.ts (migrateCardConfigToDesignerTemplate)
        ├── components/TemplateDesigner.tsx (rendered in right panel, not sidebar)
        │     └── lib/templateImporter.ts (importFromImage/Docx/Pdf)
        ├── components/ImportWizard.tsx
        │     └── lib/employeeStore.ts (detectFieldMappings)
        ├── components/CookieConsent.tsx
        │     └── lib/templateStore.ts (getConsented)
        ├── components/ActivityBoard.tsx
        ├── lib/employeeStore.ts (loadPersistedBatch, savePersistedBatch)
        │     ├── localStorage
        │     └── IndexedDB
        ├── lib/templateStore.ts (getConsented, loadTemplate, migrateCardConfigToDesignerTemplate)
        ├── lib/exportRenderer.ts (renderDesignerTemplateToCanvas, renderDesignerTemplateSideToCanvas)
        └── lib/seo.ts (injectMetaTags)

External Dependencies:
  react, react-dom          → UI
  vite                      → Build/dev server
  @tailwindcss/vite         → Tailwind plugin
  tailwindcss               → Utility CSS
  lucide-react              → Icons
  motion                    → Animations (ActivityBoard)
  jspdf                     → PDF export
  docx                      → DOCX export
  xlsx                      → XLSX import parsing
  typescript                → Type checking
  tsx                       → Script runner (verify.ts)
  @vitejs/plugin-react      → React support in Vite

Note: All dependencies in package.json are actively used. No unused deps to clean.
```
