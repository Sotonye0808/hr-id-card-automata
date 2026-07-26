# System Architecture

> **Metadata**
> - last-updated-by: update-ai-system
> - last-verified-against-code: 2026-07-26
> - staleness-policy: re-verify if >10 sessions old or after major scope changes

> **Overview:** High-level architecture of the HR ID Card Automata application — a fully client-side SPA for generating, customizing, and batch-exporting employee ID cards.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                          index.html                               │
│                             │                                     │
│                     src/main.tsx                                  │
│                             │                                     │
│                     ┌─── src/App.tsx ───┐                        │
│                     │   (State Hub)     │                        │
│                     │                   │                        │
│  ┌────────────┬─────┼───────────────────┼──────┬──────────┐      │
│  │            │     │                   │      │          │      │
│  ▼            ▼     ▼                   ▼      ▼          ▼      │
│ DataEntry   IDCard  TemplateEditor  ImportWizard CookieConsent   │
│  (Form)   (Preview) (Designer+Lib)   (Import)   (GDPR Banner)    │
│                                                                    │
│  ┌────────────────────────────────────────────────────┐           │
│  │              src/lib/                               │           │
│  │  employeeStore.ts  │  templateStore.ts              │           │
│  │  templateImporter.ts  │  seo.ts                     │           │
│  │  CSV/XLSX Parse │ Image Pipeline │ Template CRUD    │           │
│  │  Image/DOCX/PDF Import │ SEO Meta Injection         │           │
│  └────────────────────────────────────────────────────┘           │
│                           │                                       │
│                 ┌─────────────────┐                               │
│                 │   Browser APIs   │                              │
│                 ├─────────────────┤                               │
│                 │ localStorage    │                               │
│                 │ IndexedDB       │                               │
│                 │ FileReader      │                               │
│                 │ Canvas          │                               │
│                 └─────────────────┘                               │
│                                                                    │
│  ┌────────────────────────────────────────────────────┐           │
│  │              Export Pipeline                        │           │
│  │  jsPDF → PDF │ docx → DOCX                          │           │
│  └────────────────────────────────────────────────────┘           │
└──────────────────────────────────────────────────────────────────┘
```

---

## Module Breakdown

### App Shell (`src/App.tsx`)
Central state management via React `useState`. Manages:
- Employee list state (create, update, delete, reorder)
- Template configuration (legacy CardConfig + DesignerTemplate)
- Tab navigation (employees / template / export)
- Import wizard modal state
- Export progress tracking
- Theme (light/dark)
- Cookie consent state
- Dynamic SEO meta tag injection on mount

### Components
| Component | Responsibility | Props |
|-----------|---------------|-------|
| `DataEntry` | Employee form fields + image upload + transform controls + template text context hints | `data, onChange, templateVariables?, templateTextContext?` |
| `IDCard` | Live card rendering — supports legacy CardConfig and new DesignerTemplate | `config, data, designerTemplate?` |
| `TemplateEditor` | Sidebar editor: design tab (canvas config, fonts, presets), layout tab (canvas dimensions) — canvas rendering is in the right preview panel | `config, onChange, onReset, designerTemplate?, onDesignerTemplateChange?` |
| `TemplateDesigner` | WYSIWYG canvas editor with drag/resize/rotate (via unified pointer events for mouse + touch), undo/redo history (50 steps), icon-based resize/rotate handles (larger for touch), layer panel, property inspector per layer type (including gradient, glassmorphism, border controls), front/back side toggle, responsive auto-zoom. Accessible on mobile via inline rendering below TemplateEditor controls. | `template, onChange` |
| `TemplateLibrary` | Save/load/rename/delete templates, export/import JSON files, toast feedback | `currentTemplate, onLoadTemplate, onClose` |
| `CookieConsent` | GDPR-compliant banner with Accept/Dismiss, persists consent flag | `onAccept, onDismiss` |
| `Toast` | Toast notification context with animated success/error/info toasts, auto-dismiss | children (context provider) |
| `ImportWizard` | Two-step modal: field mapping → row selection | `headers, rawRows, onConfirm, onCancel` |
| `ActivityBoard` | Decorative batch processor UI (cosmetic, not wired) | none |

### Data Layer (`src/lib/`)
| Module | Responsibility |
|--------|---------------|
| `employeeStore.ts` | Employee CRUD, CSV/XLSX import, image render pipeline, IndexedDB persistence |
| `templateStore.ts` | Template CRUD (localStorage), JSON import/export, legacy CardConfig migration, consent gate, `getTemplateVariables()` to scan text layers for `{{variable}}` patterns |
| `templateImporter.ts` | Import images/DOCX/PDF as tracing backgrounds for template design |
| `exportRenderer.ts` | Canvas-based designer template renderer — draws all layer types (text with variable substitution, images with crop/transform, shapes, barcodes) with gradients, glassmorphism, borders, and rotation onto a `<canvas>` element for embedding in PDF/DOCX |
| `Toast.tsx` | Toast notification context — `ToastProvider` wraps App, `useToast()` hook for triggering toasts |
| `seo.ts` | Dynamic injection of Open Graph, Twitter Card, and JSON-LD structured data |

### Persistence
- **localStorage**: Employee metadata, template config, theme preference, named templates, active template ID, cookie consent flag
- **IndexedDB**: Employee image data URLs (stored separately to avoid localStorage size limits)

### Export Pipeline
- **PDF**: `jsPDF` — renders designer template to canvas via `exportRenderer.ts`, then embeds canvas image per employee; supports front and back sides (separate pages)
- **DOCX**: `docx` — renders designer template to canvas via `exportRenderer.ts`, then embeds canvas as `ImageRun` per employee; supports front and back sides
- **Data Entry**: `DataEntry` component dynamically shows fields based on `getTemplateVariables()` — only variables used in the active template's text layers are displayed. Additionally, `templateTextContext` extracts the non-variable text from template layers and shows it as context hints above each input field.
- **Template Variables**: Text layers support `{{fullName}}`, `{{department}}`, `{{role}}`, `{{idNumber}}`, `{{issueDate}}` substitution in both preview and export

---

## Data Flow

```
User Input → App.tsx state → Component re-render → Persist (useEffect)
                                                       ↓
                                              localStorage + IndexedDB
                                                       ↓
                                              Load on next app start

Template Library (save/load) → localStorage (named templates list + active template JSON)
                                         ↓
                              TemplateDesigner ↔ App.tsx state (front + back layers)
                                         ↓
                                    IDCard (live preview, front/back toggle)
                                         ↓
                                Import: image/DOCX/PDF → templateImporter → layout layers

Export flow:

```
Employee data + DesignerTemplate → exportRenderer (canvas draw)
       ↓
  For each employee:
    render front side layers (text variable substitution)
    render back side layers if hasBackSide
       ↓
  Canvas → data URL → jsPDF (PDF) / docx ImageRun (DOCX)
```

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Fully client-side | No server needed; data never leaves user's machine |
| localStorage + IndexedDB | localStorage for metadata (small), IndexedDB for images (large) |
| Tab-based navigation | Simple, no routing library needed for single-view app |
| Canvas-based image pipeline | Full control over crop/scale/offset without external lib |
| Unified pointer events for drag/resize/rotate | Single event model (`pointerdown`/`pointermove`/`pointerup`) works across mouse, touch, and pen; avoids redundant mouse + touch handler code |
| All-in-one App.tsx | Single state hub for simplicity (no state management lib) |
| Layer-based template model | Flexible composition of text/image/shape/barcode elements |
| Front/back template sides | `hasBackSide` flag + optional `backLayers[]` for dual-sided ID cards |
| Auto-scaling canvas | ResizeObserver-driven zoom to fit canvas within viewport on all screen sizes |
| Backward-compat migration | `migrateCardConfigToDesignerTemplate()` converts old CardConfig to new DesignerTemplate format |
| Icon-based resize/rotate handles | Replaced colored dots with lucide-react icons (`Move`, `RotateCcw`) in 28px touch targets for better usability |
| Undo/redo via ref-based history | `historyRef` stores up to 50 snapshots of layers; `undo`/`redo` callbacks restore snapshots on pointer-up, add/delete/move |
| Gradient + glassmorphism as first-class props | `GradientConfig` and `GlassmorphismConfig` embedded in `ShapeLayerProps` and `ImageLayerProps`; rendered via inline `background` and `backdropFilter` styles |
| Toast notification system | `ToastProvider` context + `useToast()` hook; auto-dismiss after 3.5s; success/error/info variants with `motion` animations |
