# Project Plan

> **Metadata**
> - last-updated-by: execute-feature
> - last-verified-against-code: 2026-07-28
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
- [x] Template-driven DataEntry — fields shown only when referenced in template
- [x] Undo/redo — only tracks meaningful changes (skip grab without move)
- [x] Multi-template save support — "Save as New" in TemplateLibrary creates copies
- [x] Image-layer-aware DataEntry — profile media and transform controls shown only when template has image layers
- [x] Template-default-aware employee creation — `createEmployeeRecord` accepts field defaults from template text layers

### Planned
- [ ] ActivityBoard component wiring (batch processor, audit journal)
- [ ] Image drag-and-drop upload support
- [ ] Print-optimized card layout
- [ ] Export as image (PNG)
- [ ] Service Worker / PWA manifest for offline support
