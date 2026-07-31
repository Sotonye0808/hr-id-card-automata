# Dependency Graph

> **Metadata**
> - last-updated-by: update-ai-system
> - last-verified-against-code: 2026-07-31
> - staleness-policy: auto-regenerable — update when module relationships change

> **Overview:** Module relationships and dependency flow within the HR ID Card Automata codebase.

---

```
main.tsx
  └── App.tsx
        ├── components/DataEntry.tsx
        │     └── lib/templateRenderer.ts (hasImageLayers, layer value resolution)
        ├── components/IDCard.tsx
        │     ├── lib/employeeStore.ts (renderTransformedImage)
        │     └── lib/templateRenderer.ts (getLayerEmployeeValue)
        ├── components/TemplateEditor.tsx
        │     ├── components/TemplateDesigner.tsx
        │     │     └── lib/templateImporter.ts (importFromImage/Docx/Pdf)
        │     ├── components/TemplateLibrary.tsx
        │     │     └── lib/templateStore.ts (listTemplates, saveTemplate, etc.)
        │     └── lib/templateStore.ts (migrateCardConfigToDesignerTemplate)
        ├── components/ImportWizard.tsx
        │     └── lib/employeeStore.ts (detectFieldMappings)
        ├── components/CookieConsent.tsx
        │     └── lib/templateStore.ts (getConsented)
        ├── components/ActivityBoard.tsx
        ├── lib/employeeStore.ts (loadPersistedBatch, savePersistedBatch, createEmployeeRecord, etc.)
        │     ├── localStorage
        │     └── IndexedDB
        ├── lib/templateStore.ts (getConsented, loadTemplate, saveTemplate, etc.)
        ├── lib/templateRenderer.ts (extractTemplateDefaults, hasImageLayers, renderTemplateToCanvas)
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
