# HR ID Card Automata

A privacy-first, offline-capable web application for designing, customizing, and batch-exporting employee ID cards. Features a full drag-and-drop visual template designer with layer-based editing, template library, and PDF/DOCX export.

![HR ID Card Automata](https://hr-id-card-automata.vercel.app/og-image.png)

---

## Features

- **Drag-and-Drop Template Designer** — Add text fields, images (logos, signatures, photos), shapes, and barcodes on a visual canvas. Drag, resize, rotate, and reorder layers with snap-to-grid support. **Touch-enabled** — drag, icon-based resize/rotate handles, and rotation work on mobile via unified pointer events.
- **Undo / Redo** — Full undo/redo history (50 steps) for layer operations (add, delete, move, resize, rotate). Only records actual changes — clicks without movement are ignored.
- **Gradient & Glassmorphism** — Apply linear/radial gradients and glassmorphism (backdrop blur + opacity) to shape and image layers directly from the property inspector.
- **Border Controls** — Customize border width, color, and style (solid/dashed/dotted) for image and shape layers.
- **Layer Panel** — Toggle visibility, lock/unlock, reorder (z-index), reset rotation, and delete layers. Each layer has a dedicated property inspector (font, color, size, position, rotation, opacity, image source, gradients, borders, glassmorphism).
- **Toast Notifications** — Subtle feedback toasts for save, load, import, export, and other actions.
- **Template Library** — Save named templates to localStorage, load, rename, delete, export as JSON, import from JSON files, and **"Save as New"** to create template copies with unique IDs for true multi-template management.
- **Import Templates** — Upload PNG/JPG images as tracing backgrounds to derive layout. Supports DOCX and PDF import (as background overlay).
- **Layer-Based Employee Data Entry** — Employee form generates inputs based on template layers: each text layer → text input, each image layer → image upload, each prefilled with the template's default content. Also shows `{{variable}}`-referenced standard fields. Shape and barcode layers are excluded from data entry.
- **Employee Data Import** — Import employee lists from CSV, XLSX, or paste from clipboard. Auto-detects field mappings including extra template fields.
- **Template-Based Batch Export** — PDF and DOCX exports render the designer template (front and back) per employee using a canvas-based renderer. Falls back to legacy layout when no designer template exists.
- **Front/Back Card Export** — When templates have a back side, PDF and DOCX exports automatically include the back of each card.
- **Live Preview with Front/Back Toggle** — Preview cards with front and back side toggling.
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
│   ├── DataEntry.tsx           # Template-driven employee form (shows fields from template text layers + image upload when template has image layers)
│   ├── IDCard.tsx              # Live preview (legacy + designer template modes)
│   ├── TemplateEditor.tsx      # Combined editor (design/layout tabs + designer tab)
│   ├── TemplateDesigner.tsx    # WYSIWYG canvas editor with undo/redo, icon handles, property panels
│   ├── TemplateLibrary.tsx     # Save/load/rename/delete/import/export templates
│   ├── CookieConsent.tsx       # GDPR consent banner
│   ├── Toast.tsx               # Toast notification system with context provider
│   ├── ImportWizard.tsx        # CSV/XLSX field mapping wizard
│   └── ActivityBoard.tsx       # Decorative batch processor UI
└── lib/
    ├── employeeStore.ts        # Employee CRUD, CSV/XLSX parse, image pipeline, IndexedDB
    ├── templateStore.ts        # Template CRUD, JSON import/export, legacy migration
    ├── templateRenderer.ts     # Canvas-based template rendering for PDF/DOCX exports
    ├── templateImporter.ts     # Image/DOCX/PDF import parsers
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
                                    IDCard (live preview)
```

---

## Usage

1. **Add Employees** — Use the Employees tab to enter employee data manually or import from CSV/XLSX. Start with an empty batch and add rows as needed.
2. **Design Template** — Go to the Template tab. Use the "Designer" tab to open the drag-and-drop canvas. Add text, image, shape, and barcode layers. Drag to position, use icon-based handles to resize/rotate. Undo/redo via toolbar buttons.
3. **Style Elements** — Apply gradients, glassmorphism effects, and borders to shape and image layers from the Properties panel. Set rotation in the Layout tab.
4. **Save Template** — Click the library icon to save your design. Use "Save As New" to keep multiple template versions. Export as JSON for sharing. Toast notifications confirm saves.
5. **Preview** — The right panel shows a live preview of the card with employee data. Toggle between front and back when the template has both sides.
6. **Layer-Based Data Entry** — The employee entry form shows inputs for every text and image layer in the template, prefilled with the template's default content. Standard fields (fullName, department, role, idNumber, issueDate) are shown when referenced via `{{variable}}` placeholders. When no designer template is active, all standard fields appear.
7. **Export** — Go to the Export tab to generate PDF or DOCX for all employees. Exports render the full designer template (front and back) as embedded card images.

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
