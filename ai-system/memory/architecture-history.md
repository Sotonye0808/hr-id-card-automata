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

---

## Entry 4 — Dynamic Data Wiring, Multi-Template Save & Undo/Redo Fixes

**Date:** 2026-07-28

**Description:**
Made the employee DataEntry fully aware of template content: image layers in the template trigger profile media inputs, text layer variables map to dynamic input fields, and default values from template text are pre-filled in new employee records. The TemplateLibrary now supports "Save as New" to create template copies with new IDs, enabling true multi-template management. Undo/redo in TemplateDesigner now only records meaningful changes (actual moves/resizes/rotations), not trivial grab-and-release interactions. Auto-save is debounced to avoid excessive writes.

**Key Decisions:**
- `hasImageLayers()` helper in templateRenderer.ts to detect image layers
- `extractTemplateDefaults()` to extract field defaults from template text context
- `createEmployeeRecord()` extended with optional `fieldDefaults` parameter
- Debounced (500ms) auto-save in App.tsx — avoids toast and localStorage spam during rapid canvas edits
- History push only on actual change — compare start vs end values before snapshotting
- "Save as New" generates new ID via `crypto.randomUUID()` — true multi-template instead of overwrite

**Files Changed:**
- `src/lib/templateRenderer.ts` — added `extractTemplateDefaults()`, `hasImageLayers()`, `TemplateFieldDefault` interface
- `src/lib/employeeStore.ts` — added `TemplateFieldDefault` interface, extended `createEmployeeRecord` with fieldDefaults parameter
- `src/components/DataEntry.tsx` — conditionally show image upload/transform/crop only when template has image layers
- `src/components/TemplateDesigner.tsx` — undo/redo only pushes history on actual position/size/rotation change
- `src/components/TemplateLibrary.tsx` — added "Save as New" button that creates template copy with new ID
- `src/App.tsx` — debounced auto-save, pass template field defaults to employee creation

**Supersedes:** Previous undo/redo pushed history on every pointer-up including no-op grabs
