# Architecture History

> **Metadata**
> - last-updated-by: bootstrap-project
> - last-verified-against-code: 2026-07-22
> - staleness-policy: append each time architecture changes

> **Overview:** Record of architectural decisions and changes over time.

---

## Entry 1 — Initial Architecture

**Date:** 2026-07-22

**Description:**
Initial project architecture established as a fully client-side SPA. Single App.tsx state hub with tab-based navigation, localStorage + IndexedDB persistence, canvas-based image pipeline, and in-browser PDF/DOCX export.

**Key Decisions:**
- All-in-one App.tsx state management (no Redux/Zustand)
- Tab-based navigation (no React Router)
- Two-tier storage (localStorage for metadata, IndexedDB for images)
- Canvas-based image transform pipeline
- jsPDF + docx for client-side export

**Supersedes:** None (initial entry)
