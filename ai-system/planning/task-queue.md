# Task Queue

> **Metadata**
> - last-updated-by: execute-feature
> - last-verified-against-code: 2026-07-25
> - staleness-policy: update as tasks are completed or added

> **Overview:** Immediate actionable tasks, ordered by priority.

---

## Current Tasks

| Priority | Complexity | Task | Status |
|----------|-----------|------|--------|
| P0 | XL | **New types** — `TemplateLayer`, `DesignerTemplate`, `TemplateMeta`, `LayerType` (text/image/shape/barcode) | Complete |
| P0 | XL | **TemplateDesigner component** — canvas with drag/resize/rotate, layer panel, property inspector | Complete |
| P0 | L | **TemplateLibrary component** — save/load/delete/rename templates, export/import JSON | Complete |
| P0 | L | **templateStore** — CRUD operations for named templates in localStorage | Complete |
| P1 | L | **templateImporter** — parse image, DOCX, PDF → background image for tracing | Complete |
| P1 | M | **CookieConsent component** — GDPR banner, persist consent flag | Complete |
| P1 | M | **Update IDCard** — render from new layer-based template model | Complete |
| P1 | M | **Update App.tsx** — integrate template designer, library, cookie consent | Complete |
| P1 | S | **Update index.html** — meta tags, OG tags, Twitter cards, JSON-LD | Complete |
| P1 | S | **Rewrite README.md** — screenshots, features, usage, architecture overview | Complete |
| P2 | S | **Update metadata.json** — add majorCapabilities | Complete |
| P2 | S | **Update system-architecture.md** — reflect new modules | Complete |
| P2 | S | **Update project-context.md** — expand scope to include template designer | Complete |
| P2 | M | **SEO component** — dynamic meta injection via react-helmet-async or manual | Complete |
| P3 | S | **Clean up unused deps** — express, @google/genai, dotenv | Pending |
| P3 | M | **Service Worker / PWA manifest** — offline support, app icon, theme-color | Pending |
| P1 | S | Add null guard in renderTransformedImage for missing source | Pending |
| P1 | M | Wire ActivityBoard component to real app state | Pending |
| P2 | S | Add export progress error states | Pending |
| P2 | M | Implement image drag-and-drop upload | Pending |
| P3 | L | Add chunked export for large employee batches | Pending |
