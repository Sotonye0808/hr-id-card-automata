# Project Context

> **Metadata**
> - last-updated-by: execute-feature
> - last-verified-against-code: 2026-07-26
> - staleness-policy: re-verify if >10 sessions old or after major scope changes

> **Overview:** Why this project exists, who it serves, and what constraints govern development. Agents should read this to understand the "why" behind the work.

---

## Project Purpose

HR ID Card Automata is a privacy-first, offline-capable web application that enables HR departments to generate, customize, and batch-export employee ID cards without sending sensitive employee data to any external server. It replaces manual card design workflows with a streamlined digital tool that supports CSV/XLSX imports, drag-and-drop template design, live preview, and PDF/DOCX batch export.

---

## Target Users

| User Type | Needs | Key Interactions |
|-----------|-------|-----------------|
| HR Administrator | Import employee list, assign photos, batch export cards | CSV/XLSX import, image upload, batch export |
| HR Manager | Design and customize ID card templates visually | Template designer canvas, layer panel, property inspector |
| IT Support | Deploy as static site, no backend maintenance | Build and host dist/ folder |

---

## Business Constraints

- Must work fully offline after initial load
- No employee data may be sent to external servers
- Must support batch export to PDF and DOCX
- Must handle standard CSV and XLSX formats from HR systems
- Must run in modern browsers (Chrome, Firefox, Edge, Safari)
- Must provide GDPR-compliant cookie/localStorage consent notice
- Must support template persistence via localStorage with user consent

---

## Current Project Phase

Phase: Active Development

Active sprint focus: End-to-end template-export wiring — export renders designer template faithfully via canvas renderer, including front/back sides; employee data entry fields adapt dynamically to template variables.

---

## Tech Decisions Already Made

| Decision | Reason |
|----------|--------|
| React 19 + Vite | Modern, fast dev experience with HMR |
| Tailwind CSS v4 | Utility-first styling with minimal bundle overhead |
| Fully client-side | Privacy-first: no employee data leaves the browser |
| localStorage + IndexedDB | Two-tier storage avoids size limits on images |
| jsPDF + docx | In-browser export without server-side rendering |
| No routing library | Simple tab navigation sufficient for single-view app |
| Layer-based template model | Flexible composition vs. fixed-field approach |
| Canvas-based drag-and-drop | Native browser APIs, no heavy library dependency |

---

## In Scope

- Drag-and-drop visual template designer with text/image/shape/barcode layers
- Touch-enabled drag, resize, and rotate via unified pointer events (mouse + touch + pen)
- Icon-based resize/rotate handles (28px touch targets using Move/RotateCcw icons)
- Undo/redo history stack (50 steps) for all layer operations
- Gradient backgrounds (linear/radial) for text, shape, and image layers
- Glassmorphism effects (backdrop blur + opacity) for text, shape, and image layers
- Border customization (width, color, style: solid/dashed/dotted) for text, shape, and image layers
- Rotation handle and rotation reset in layer properties
- Rotation property in layout panel for legacy element positioning
- Front/back dual-sided template support with side toggle
- Template library with save/load/rename/delete/export/import (JSON)
- Toast notification system for save/load/import/export feedback
- Import templates from images (PNG/JPG), DOCX, PDF as tracing backgrounds
- Responsive canvas auto-scaling with zoom controls; non-overflowing on mobile via max-width constraints
- Wide-screen preview shows interactive template canvas when designer tab is active
- GDPR-compliant cookie/localStorage consent banner with graceful fallback (no crash when consent is missing)
- Dynamic SEO meta tag injection (Open Graph, Twitter Cards, JSON-LD)
- Dark/light theme with local persistence
- Backward compatibility with legacy CardConfig template format
- Dynamic employee data entry fields based on template text layer variables ({{fullName}}, {{department}}, {{role}}, {{idNumber}}, {{issueDate}})
- Canvas-based export renderer (`exportRenderer.ts`) that faithfully reproduces designer template layers in PDF/DOCX via canvas drawing
- End-to-end template-export pipeline: designer template → canvas renderer → PDF/DOCX image embedding
- Back-of-card export: front and back sides rendered as separate pages per employee in both PDF and DOCX

---

## Out of Scope

- User authentication / multi-user support
- Cloud sync or backup
- Server-side rendering
- Mobile native app (PWA only)
- Real-time collaboration
- Integration with HRIS/HRMS systems

---

## External Integrations

| Service | Purpose | Auth Method |
|---------|---------|------------|
| None | All processing is client-side | N/A |

(Note: No unused dependencies in package.json — `@google/genai`, `express`, and `dotenv` were removed in a previous cleanup.)
