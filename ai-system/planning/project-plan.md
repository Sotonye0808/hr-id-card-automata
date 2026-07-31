# Project Plan

> **Metadata**
> - last-updated-by: execute-feature
> - last-verified-against-code: 2026-07-31
> - staleness-policy: update after each sprint

> **Overview:** High-level feature checklist and development roadmap.

---

## Features

### Core (Implemented)
- [x] Employee data entry form (name, role, department, serial ID, issue date)
- [x] Profile image upload with preview
- [x] Image transform controls (scale, offset, crop)
- [x] Live ID card preview with template theming
- [x] Template customization (fonts, color presets, element positions)
- [x] CSV/XLSX import with field mapping wizard
- [x] Drag-and-drop template designer with text/image/shape/barcode layers
- [x] Template library with save/load/rename/delete/export/import JSON
- [x] Template import from images (PNG/JPG), DOCX, PDF as tracing backgrounds
- [x] Cookie consent banner (GDPR-compliant localStorage notice)
- [x] Dynamic SEO meta tag injection (Open Graph, Twitter Cards, JSON-LD)
- [x] Batch PDF export
- [x] Batch DOCX export
- [x] localStorage + IndexedDB persistence
- [x] Dark/light theme toggle
- [x] Employee list management (select, duplicate, delete)
- [x] Responsive mobile layout with overlay preview
- [x] Responsive canvas auto-scaling with zoom controls
- [x] Front/back dual-sided template support
- [x] Dynamic DataEntry based on template text layer variables
- [x] Canvas-based template renderer for exports
- [x] Front/back card sides in PDF/DOCX exports
- [x] Template-aware CSV import with extra field mapping

### In Progress
- [ ] Import wizard polish (validation edge cases)
- [ ] Export pipeline stabilization (progress reporting, error handling)

### Recently Completed
- [x] Clean employee defaults — empty batch on start, no seeded defaults
- [x] Template-driven DataEntry — fields shown based on template layers (text/text, image/image upload), prefilled with template defaults
- [x] Layer-based employee data binding — per-layer values stored via extraFields (`_tl_<id>` / `_il_<id>`)
- [x] Undo/redo only records actual changes (no no-op history entries)
- [x] Multiple template saves — "Save As New" in TemplateLibrary creates new template IDs
- [x] Fix blank page on "Add row" — `templateHasImages` was undeclared in DataEntry; now derived from `hasImageLayers`
- [x] Graceful cross-device image handling — unloadable image refs (device-local paths) clear via `onError` and show the upload dropzone instead of crashing
- [x] Build/lint/test health — `npm run lint`, `npm run build`, `npm run verify` all green
- [x] Back side captured in preview and PDF/DOCX exports — `hasBackSide` set on back edits; detection data-driven off `backLayers`
- [x] TemplateLibrary Save overwrites selected template; Save As New creates copies

### Planned
- [ ] ActivityBoard component wiring (batch processor, audit journal)
- [ ] Image drag-and-drop upload support
- [ ] Print-optimized card layout
- [ ] Export as image (PNG)
- [ ] Service Worker / PWA manifest for offline support
