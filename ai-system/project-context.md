# Project Context

> **Metadata**
> - last-updated-by: bootstrap-project
> - last-verified-against-code: 2026-07-22
> - staleness-policy: re-verify if >10 sessions old or after major scope changes

> **Overview:** Why this project exists, who it serves, and what constraints govern development. Agents should read this to understand the "why" behind the work.

---

## Project Purpose

HR ID Card Automata is a privacy-first, offline-capable web application that enables HR departments to generate, customize, and batch-export employee ID cards without sending sensitive employee data to any external server. It replaces manual card design workflows with a streamlined digital tool that supports CSV/XLSX imports, live preview, and PDF/DOCX batch export.

---

## Target Users

| User Type | Needs | Key Interactions |
|-----------|-------|-----------------|
| HR Administrator | Import employee list, assign photos, batch export cards | CSV/XLSX import, image upload, batch export |
| HR Manager | Customize card template (colors, fonts, layout) | Template editor, color presets |
| IT Support | Deploy as static site, no backend maintenance | Build and host dist/ folder |

---

## Business Constraints

- Must work fully offline after initial load
- No employee data may be sent to external servers
- Must support batch export to PDF and DOCX
- Must handle standard CSV and XLSX formats from HR systems
- Must run in modern browsers (Chrome, Firefox, Edge, Safari)

---

## Current Project Phase

Phase: Active Development

Active sprint focus: Core feature completion — import wizard refinement, export pipeline stabilization, template customization polish.

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

(Note: `@google/genai` and `dotenv` are listed in package.json but unused — remnants from earlier iteration.)
