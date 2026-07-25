# Architecture History

> **Metadata**
> - last-updated-by: execute-feature
> - last-verified-against-code: 2026-07-25
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

---

## Entry 2 — Template Designer Overhaul

**Date:** 2026-07-24 to 2026-07-25

**Description:**
Replaced static TemplateEditor (font picker, 4 color presets, 4 sliders) with a full drag-and-drop WYSIWYG canvas designer. Introduced layer-based template model with TemplateLayer union type supporting text, image, shape, and barcode layers. Added TemplateLibrary with localStorage CRUD + JSON import/export. Added CookieConsent GDPR banner. Implemented SEO meta injection.

**Key Decisions:**
- Layer-based template model instead of fixed fields (flexible composition)
- TemplateDesigner as self-contained component (reusable in multiple contexts)
- TemplateLibrary as modal (not sidebar) — simpler UX for template management
- CookieConsent at z-[60] to always be visible above modals
- templateImporter stubs for DOCX/PDF with image overlay fallback

**Files Added:**
- `src/components/TemplateDesigner.tsx`
- `src/components/TemplateLibrary.tsx`
- `src/components/CookieConsent.tsx`
- `src/lib/templateStore.ts`
- `src/lib/templateImporter.ts`
- `src/lib/seo.ts`

**Supersedes:** Original TemplateEditor architecture

---

## Entry 3 — Responsiveness & Modal Stacking

**Date:** 2026-07-25

**Description:**
Tightened up responsive behavior across all components. Made TemplateDesigner sidebar stack below canvas on mobile. Fixed z-index layering between TemplateLibrary, mobile preview overlay, and CookieConsent. Improved mobile touch targets, padding, and scroll behavior.

**Key Decisions:**
- Three-tier z-index: z-50 (in-page modals), z-[60] (full-screen overlays), z-[70]+ (reserved)
- TemplateDesigner switches from `flex-row` to `flex-col` at `lg` breakpoint
- Property panel sidebar capped at `max-h-[300px]` on mobile with overflow-y-auto
- CookieConsent buttons stack vertically on `max-sm` screens
- Added `custom-scrollbar` utility class globally

**Supersedes:** Previous single z-50 convention for all overlays
