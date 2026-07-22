# System Architecture

> **Metadata**
> - last-updated-by: bootstrap-project
> - last-verified-against-code: 2026-07-22
> - staleness-policy: re-verify if >10 sessions old or after major scope changes

> **Overview:** High-level architecture of the HR ID Card Automata application — a fully client-side SPA for generating, customizing, and batch-exporting employee ID cards.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│                   index.html                          │
│                      │                                │
│              src/main.tsx                             │
│                      │                                │
│              ┌─── src/App.tsx ───┐                    │
│              │   (State Hub)     │                    │
│              │                   │                    │
│  ┌───────────┼───────────────────┼──────────┐        │
│  │           │                   │          │        │
│  ▼           ▼                   ▼          ▼        │
│ DataEntry  IDCard  TemplateEditor  ImportWizard       │
│  (Form)   (Preview)  (Customizer)  (Import)           │
│                                                        │
│  ┌────────────────────────────────────────────┐        │
│  │         src/lib/employeeStore.ts            │        │
│  │  CSV/XLSX Parse │ Image Pipeline │ Persist  │        │
│  └────────────────────────────────────────────┘        │
│                        │                               │
│              ┌─────────────────┐                       │
│              │   Browser APIs   │                      │
│              ├─────────────────┤                       │
│              │ localStorage    │                       │
│              │ IndexedDB       │                       │
│              │ FileReader      │                       │
│              │ Canvas          │                       │
│              └─────────────────┘                       │
│                                                        │
│  ┌────────────────────────────────────────────┐        │
│  │         Export Pipeline                     │        │
│  │  jsPDF → PDF │ docx → DOCX                  │        │
│  └────────────────────────────────────────────┘        │
└──────────────────────────────────────────────────────┘
```

---

## Module Breakdown

### App Shell (`src/App.tsx`)
Central state management via React `useState`. Manages:
- Employee list state (create, update, delete, reorder)
- Template configuration (colors, fonts, layout)
- Tab navigation (employees / template / export)
- Import wizard modal state
- Export progress tracking
- Theme (light/dark)

### Components
| Component | Responsibility | Props |
|-----------|---------------|-------|
| `DataEntry` | Employee form fields + image upload + transform controls | `data, onChange` |
| `IDCard` | Live card rendering with CSS theming | `data, template, onImageRender` |
| `TemplateEditor` | Font picker, color presets, element position sliders | `template, onChange` |
| `ImportWizard` | Two-step modal: field mapping → row selection | `employees, onConfirm, onClose` |
| `ActivityBoard` | Decorative batch processor UI (cosmetic, not wired) | none |

### Data Layer (`src/lib/employeeStore.ts`)
Pure functions for all data operations:
- `parseEmployeeCsv()` / `parseEmployeeXlsx()` / `parseClipboardText()` — import parsers
- `renderTransformedImage()` — canvas-based crop → scale → offset pipeline
- `loadPersistedBatch()` / `savePersistedBatch()` — two-tier persistence
- `detectFieldMappings()` — auto-detection of CSV/XLSX column headers

### Persistence
- **localStorage**: Employee metadata + template config + theme preference
- **IndexedDB**: Employee image data URLs (stored separately to avoid localStorage size limits)

### Export Pipeline
- **PDF**: `jsPDF` — draws table rows, images, and footer per employee
- **DOCX**: `docx` — builds document with Table, ImageRun, Paragraph + PageBreak

---

## Data Flow

```
User Input → App.tsx state → Component re-render → Persist (useEffect)
                                                       ↓
                                              localStorage + IndexedDB
                                                       ↓
                                              Load on next app start
```

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Fully client-side | No server needed; data never leaves user's machine |
| localStorage + IndexedDB | localStorage for metadata (small), IndexedDB for images (large) |
| Tab-based navigation | Simple, no routing library needed for single-view app |
| Canvas-based image pipeline | Full control over crop/scale/offset without external lib |
| All-in-one App.tsx | Single state hub for simplicity (no state management lib) |
