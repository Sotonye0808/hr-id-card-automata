# HR ID Card Automata

A privacy-first, offline-capable web application for designing, customizing, and batch-exporting employee ID cards. Features a full drag-and-drop visual template designer with layer-based editing, template library, canvas-based export, and PDF/DOCX batch export.

![HR ID Card Automata](https://hr-id-card-automata.vercel.app/og-image.png)

---

## Features

- **Drag-and-Drop Template Designer** — Add text fields (with `{{variable}}` support), images (logos, signatures, photos), shapes, and barcodes on a visual canvas. Drag, resize, rotate, and reorder layers with snap-to-grid, icon-based handles, and full undo/redo (50 steps).
- **Touch-Optimized Controls** — Unified pointer events (mouse, touch, pen) for drag, resize, and rotate. 28px touch targets with lucide icons.
- **Gradient & Glassmorphism** — Linear/radial gradients and glassmorphism (backdrop blur + opacity) on text, shape, and image layers via the property inspector.
- **Border Controls** — Customize border width, color, and style (solid/dashed/dotted) for text, image, and shape layers.
- **Layer Panel** — Toggle visibility, lock/unlock, reorder z-index, reset rotation, delete. Per-layer property inspector (font, color, size, position, rotation, opacity, image source, gradients, borders, glassmorphism).
- **Front & Back Sides** — Templates support dual-sided ID cards with separate layer sets for front and back. Toggle between sides in the designer and preview.
- **Template Library** — Save named templates to localStorage, load, rename, delete, export as JSON, import from JSON files. Toast feedback on manual save only.
- **Import Templates** — Upload PNG/JPG images as tracing backgrounds. Supports DOCX and PDF import (as background overlay).
- **Employee Data Import** — CSV, XLSX, and clipboard paste with auto-detected field mappings. Two-step import wizard for mapping and row selection.
- **Dynamic Data Entry** — Employee form fields adapt to variables used in the active template (`{{fullName}}`, `{{department}}`, `{{role}}`, `{{idNumber}}`, `{{issueDate}}`). Template text context shown as hints above each field.
- **Canvas-Based Export** — PDF and DOCX exports render the designer template faithfully via `exportRenderer.ts`, preserving gradients, glassmorphism, borders, rotation, and layer layout. Supports front and back sides as separate pages.
- **Responsive Layout** — On wide screens: side-by-side controls + canvas. On mobile: stacked layout with controls above an inline canvas. Mobile preview button opens the designer or card preview as context-appropriate.
- **Toast Notifications** — Subtle feedback toasts for manual save, load, import, export (not for auto-saves).
- **Cookie Consent** — GDPR-compliant banner explaining localStorage usage for theme and template storage.
- **Dark/Light Theme** — Toggle with local persistence.
- **Offline Capable** — Fully client-side. No data leaves the browser. Ready for PWA deployment.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:3000`.

### Build

```bash
npm run build
```

Output in `dist/`.

### Preview Production Build

```bash
npm run preview
```

---

## Architecture

```
src/
├── App.tsx                    # State hub — employees, template, export
├── main.tsx                   # Entry point
├── types.ts                   # TypeScript types (CardConfig, DesignerTemplate, TemplateLayer, etc.)
├── index.css                  # Global styles, CSS variables, sheet themes
├── components/
│   ├── DataEntry.tsx           # Employee form fields + image upload + template context hints
│   ├── IDCard.tsx              # Live preview (legacy + designer template modes, front/back flip)
│   ├── TemplateEditor.tsx      # Combined editor (design/canvas tabs) with library access
│   ├── TemplateDesigner.tsx    # WYSIWYG canvas editor with undo/redo, icon handles, property panels
│   ├── TemplateLibrary.tsx     # Save/load/rename/delete/import/export templates
│   ├── CookieConsent.tsx       # GDPR consent banner
│   ├── Toast.tsx               # Toast notification system with context provider
│   ├── ImportWizard.tsx        # CSV/XLSX field mapping wizard (2-step)
│   └── ActivityBoard.tsx       # Decorative batch processor UI
└── lib/
    ├── employeeStore.ts        # Employee CRUD, CSV/XLSX parse, image pipeline, IndexedDB
    ├── templateStore.ts        # Template CRUD, JSON import/export, legacy migration, variable detection
    ├── templateImporter.ts     # Image/DOCX/PDF import parsers
    ├── exportRenderer.ts       # Canvas-based designer template renderer for PDF/DOCX
    └── seo.ts                  # Dynamic meta tag injection (OG, Twitter, JSON-LD)
```

### Data Flow

```
User Input → App.tsx state → Component re-render → Persist (useEffect)
                                                           ↓
                                                  localStorage + IndexedDB
                                                           ↓
                                                  Load on next app start
```

Template flow:

```
Template Library (save/load) → localStorage (named templates + active ID)
                                          ↓
                              TemplateDesigner ↔ App.tsx state (front + back layers)
                                          ↓
                                    IDCard (live preview, front/back toggle)
                                          ↓
                              exportRenderer.ts → Canvas → PDF / DOCX
```

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

## Usage

1. **Add Employees** — Use the Employees tab to enter employee data manually or import from CSV/XLSX. Fields shown depend on the active template's variable usage. Template text context appears as hints above each field.
2. **Design Template** — Go to the Template tab. On wide screens the interactive canvas is on the right; on mobile it appears below the controls. Add text, image, shape, and barcode layers. Drag, resize, rotate with icon handles. Undo/redo via buttons or Ctrl+Z/Ctrl+Shift+Z.
3. **Style Elements** — Apply gradients, glassmorphism effects, borders, and colors from the Properties panel. Select a layer on the canvas to edit its properties.
4. **Front & Back** — Toggle between front and back sides in the designer. The preview shows a flip button when the template has back layers. Export includes both sides as separate pages.
5. **Save Template** — Click the library icon in the Template Engine header. Save, load, rename, delete, or export/import JSON. Toast confirms manual saves only.
6. **Preview** — On wide screens the preview panel shows the card with employee data. On mobile use the Preview button in the header. Preview context changes based on active tab (designer vs card preview).
7. **Export** — Go to the Export tab to generate PDF or DOCX for all employees. Uses the current designer template faithfully — all layers, effects, variables, and both sides.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 + Vite | Frontend framework and build tool |
| Tailwind CSS v4 | Utility-first styling |
| TypeScript | Type safety |
| jsPDF | PDF export |
| docx | DOCX export |
| xlsx | XLSX import |
| lucide-react | Icons |
| motion | Animations |

---

## AI-Assisted Development

This project uses the **`ai-system`** framework for AI-assisted development. See `ai-system/` for structured documentation, command-driven workflows, and quality gates.

---

## License

See [LICENSE](./LICENSE).
