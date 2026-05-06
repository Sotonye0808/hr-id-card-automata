# System Architecture

Overview: HR ID Card Automata is a client-only single-page application (SPA) built with React + Vite. The core responsibilities are: template management (JSON-driven), image processing (client canvas), rendering (live preview), and export (PDF/DOCX). Storage is local-first using localStorage for configs and IndexedDB for binary image assets.

---

## Architecture Diagram

Client (Browser)
↓
React + Vite SPA
├─ Components (TemplateEditor, DataEntry, IDCard, ActivityBoard)
├─ Core Engines (Template Engine, Image Processor, Export Engine)
└─ Storage (localStorage, IndexedDB)

---

## Module Breakdown

| Module          | Responsibility                              | Key Files                            | Dependencies           |
| --------------- | ------------------------------------------- | ------------------------------------ | ---------------------- |
| UI Components   | Render editor, data entry, preview          | src/components/\*                    | React, Tailwind        |
| Template Engine | Parse JSON templates, provide layout coords | src/types.ts, App.tsx                | none                   |
| Image Processor | Read/transform images on canvas             | src/components/ImageCropper (future) | Canvas API             |
| Export Engine   | Generate PDF/DOCX from canvas/templates     | src/modules/export/\* (planned)      | jsPDF / pdf-lib / docx |
| Storage         | Persist templates and images locally        | IndexedDB/localStorage               | Dexie (optional)       |

---

## Data Flow

Standard flow:
User input (DataEntry) → UI state → Template Engine → Canvas Renderer (IDCard) → Export Engine → File download

Data persistence flow:

- Templates and UI preferences → localStorage
- Uploaded image blobs → IndexedDB (or base64 in-memory when small)

---

## Configuration Points

| Config Key     | Purpose            | Location     | Default                    |
| -------------- | ------------------ | ------------ | -------------------------- |
| templateConfig | Card layout values | localStorage | src/App.tsx INITIAL_CONFIG |
| exportOptions  | PDF/DOCX settings  | UI           | PDF quality, page size     |

---

## Tech Stack

| Layer    | Technology             | Version           |
| -------- | ---------------------- | ----------------- |
| Frontend | React + Vite           | see package.json  |
| Styling  | Tailwind CSS           | see package.json  |
| Exports  | jsPDF / pdf-lib / docx | optional dev deps |

---

## Known Constraints & Technical Debt

- Single-threaded rendering in main thread for now; large batches could require Web Workers.
- No server backend — exports done client-side; very large batches may hit memory limits.

---

## Architecture History

| Date       | Change                                     | Reason                                                                    |
| ---------- | ------------------------------------------ | ------------------------------------------------------------------------- |
| 2026-05-06 | Initial SPA scaffolded by Google AI Studio | Bootstrapped project and replaced dashboard concept with HR ID card focus |
