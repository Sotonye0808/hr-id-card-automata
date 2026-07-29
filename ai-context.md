# Project AI Context

> **Metadata**
> - last-updated-by: update-ai-system
> - last-verified-against-code: 2026-07-28
> - staleness-policy: re-verify before trusting if project structure has changed

> **Overview:** Local-first, single-page PWA built with React 19 + Vite + TypeScript + Tailwind CSS v4 that helps HR teams turn employee records and photos into printable, batch-exportable ID cards. Fully client-side — data persisted to localStorage and IndexedDB, exports generated in-browser via jsPDF and docx.

---

## Quick Reference

| Field            | Value                                    |
| ---------------- | ---------------------------------------- |
| Project Name     | HR ID Card Automata                      |
| Type             | Single-Page Application                  |
| Primary Language | TypeScript                               |
| Frontend         | React 19 + Vite 6                        |
| Backend          | None (fully client-side)                 |
| Database         | localStorage + IndexedDB                 |
| Styling          | Tailwind CSS v4 + CSS custom properties  |
| Deployment       | Static site (Vite build → dist/)         |

---

## Key Modules

| Module          | Location              | Purpose                                   |
| --------------- | --------------------- | ----------------------------------------- |
| App Shell       | src/App.tsx           | Main app state, routing, import/export    |
| Data Entry      | src/components/DataEntry.tsx | Dynamic employee data form + image upload (template-aware) |
| ID Card Preview | src/components/IDCard.tsx    | Live card preview with front/back toggle |
| Template Editor | src/components/TemplateEditor.tsx | Font, color, layout customization |
| Import Wizard   | src/components/ImportWizard.tsx | CSV/XLSX/clipboard import with mapping |
| Template Renderer | src/lib/templateRenderer.ts | Canvas-based template rendering for exports |
| Data Layer      | src/lib/employeeStore.ts | Persistence, CSV/XLSX parsing, image transforms |

---

## Entry Point

The AI system documentation lives in `ai-system/`.

Start with: `ai-system/protocols/entry-protocol.md`

---

## Active Development Focus

Dynamic template-driven data entry with image-layer-aware inputs, multi-template management via "Save as New", debounced auto-save, and clean undo/redo that only tracks meaningful changes.
