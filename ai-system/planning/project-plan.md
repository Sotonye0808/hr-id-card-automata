# Project Plan

> **Metadata**
> - last-updated-by: update-ai-system
> - last-verified-against-code: 2026-07-26
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
- [x] Gradient/glassmorphism/border design features for all layer types (text, shape, image)
- [x] Toast notification system for user actions
- [x] Undo/redo history stack (50 steps)
- [x] Touch-enabled controls (drag, resize, rotate) via unified pointer events
- [x] Single canvas instance (no duplicate designer in sidebar)

### Recently Completed
- [x] Dynamic data entry fields based on template variables (getTemplateVariables → DataEntry templateVariables prop)
- [x] Canvas-based export renderer (exportRenderer.ts) — faithfully reproduces all layer types with gradients, glassmorphism, borders, rotation
- [x] Back side in export — front and back rendered as separate pages in PDF and DOCX
- [x] End-to-end template-export pipeline: designer template → canvas renderer → PDF/DOCX
- [x] Removed unused imports (TableCell, TableRow, WidthType, AlignmentType from docx)

### Recently Completed
- [x] Custom template variables: DataEntry dynamically renders inputs for all `{{variable}}` placeholders including custom ones beyond the 5 standard fields
- [x] CSV/XLSX/clipboard import captures unknown header columns as `customFields` for custom template variables
- [x] ImportWizard unmapped columns flow into `customFields` instead of being dropped
- [x] Export renderer resolves arbitrary `{{variable}}` placeholders via `data.customFields`
- [x] IDCard preview resolves custom variables with extracted `resolveTextVariables()` helper
- [x] TemplateDesigner auto-sets `hasBackSide` when back layers are added

### In Progress
- [ ] Import wizard polish (validation edge cases)
- [ ] Export pipeline stabilization (progress reporting, error handling)

### Planned
- [ ] ActivityBoard component wiring (batch processor, audit journal)
- [ ] Image drag-and-drop upload support
- [ ] Print-optimized card layout
- [ ] Export as image (PNG)
- [ ] Service Worker / PWA manifest for offline support
