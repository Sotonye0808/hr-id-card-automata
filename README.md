# HR ID Card Automata

A privacy-first, offline-capable web application for designing, customizing, and batch-exporting employee ID cards. Features a full drag-and-drop visual template designer with layer-based editing, template library, and PDF/DOCX export.

![HR ID Card Automata](https://hr-id-card-automata.vercel.app/og-image.png)

---

## Features

- **Drag-and-Drop Template Designer** — Add text fields, images (logos, signatures, photos), shapes, and barcodes on a visual canvas. Drag, resize, rotate, and reorder layers with snap-to-grid support. **Touch-enabled** — drag, icon-based resize/rotate handles, and rotation work on mobile via unified pointer events.
- **Undo / Redo** — Full undo/redo history (50 steps) for all layer operations (add, delete, move, resize, rotate, property changes).
- **Gradient & Glassmorphism** — Apply linear/radial gradients and glassmorphism (backdrop blur + opacity) to text, shape, and image layers directly from the property inspector.
- **Border Controls** — Customize border width, color, and style (solid/dashed/dotted) for text, image, and shape layers.
- **Layer Panel** — Toggle visibility, lock/unlock, reorder (z-index), reset rotation, and delete layers. Each layer has a dedicated property inspector (font, color, size, position, rotation, opacity, image source, gradients, borders, glassmorphism).
- **Toast Notifications** — Subtle feedback toasts for save, load, import, export, and other actions.
- **Template Library** — Save named templates to localStorage, load, rename, delete, export as JSON, and import from JSON files.
- **Import Templates** — Upload PNG/JPG images as tracing backgrounds to derive layout. Supports DOCX and PDF import (as background overlay).
- **Employee Data Import** — Import employee lists from CSV, XLSX, or paste from clipboard. Auto-detects field mappings.
- **Batch Export** — Generate PDF or DOCX files for all employees in the queue. Export renders your designer template (all layers, gradients, glassmorphism, borders, rotation, front/back sides) via canvas — not a hardcoded table layout. Falls back to legacy format when no designer template is defined.
- **Cookie Consent** — GDPR-compliant banner explaining localStorage usage for theme and template storage.
- **Dark/Light Theme** — Toggle between dark and light mode with local persistence.
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
│   ├── DataEntry.tsx           # Employee form fields + image upload
│   ├── IDCard.tsx              # Live preview (legacy + designer template modes)
│   ├── TemplateEditor.tsx      # Combined editor (design/layout tabs)
│   ├── TemplateDesigner.tsx    # WYSIWYG canvas editor with undo/redo, icon handles, property panels
│   ├── TemplateLibrary.tsx     # Save/load/rename/delete/import/export templates
│   ├── CookieConsent.tsx       # GDPR consent banner
│   ├── Toast.tsx               # Toast notification system with context provider
│   ├── ImportWizard.tsx        # CSV/XLSX field mapping wizard
│   └── ActivityBoard.tsx       # Decorative batch processor UI
└── lib/
    ├── employeeStore.ts        # Employee CRUD, CSV/XLSX parse, image pipeline, IndexedDB
    ├── templateStore.ts        # Template CRUD, JSON import/export, legacy migration
    ├── templateImporter.ts     # Image/DOCX/PDF import parsers
    ├── renderTemplateToCanvas.ts # Canvas-based template rendering for PDF/DOCX export
    └── seo.ts                  # Dynamic meta tag injection
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
Template Library (save/load) → localStorage (named templates)
                                          ↓
                               TemplateDesigner ↔ App.tsx state
                                          ↓
                          ┌──────────────────┴──────────────────┐
                          ↓                                     ↓
                    IDCard (live preview,             Export Pipeline (PDF/DOCX)
                    front/back toggle)                     ↓
                                                   renderDesignerTemplateToCanvas()
                                                   → offscreen canvas → embed in output
```

---

## Usage

1. **Add Employees** — Use the Employees tab to enter employee data manually or import from CSV/XLSX.
2. **Design Template** — Go to the Template tab. The right panel shows the interactive drag-and-drop canvas. Add text, image, shape, and barcode layers. Drag to position, use icon-based handles to resize/rotate. Undo/redo via toolbar buttons or Ctrl+Z/Ctrl+Shift+Z.
3. **Style Elements** — Apply gradients, glassmorphism effects, borders, and colors to text, shape, and image layers from the Properties panel on the right.
4. **Configure Canvas** — Use the Design and Canvas tabs in the left panel to set canvas dimensions, background color, and typography presets.
5. **Save Template** — Click the library icon to save your design. Export as JSON for sharing. Toast notifications confirm saves.
6. **Preview** — The right panel shows a live preview of the card with employee data, including dual-sided front/back support.
7. **Export** — Go to the Export tab to generate PDF or DOCX for all employees. The export renders your designer template (all layers, gradients, glassmorphism, borders, rotation, front/back sides) via canvas. Falls back to the legacy table layout if no designer template layers exist.

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
