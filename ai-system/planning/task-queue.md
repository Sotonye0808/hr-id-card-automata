# Task Queue

> **Metadata**
> - last-updated-by: execute-feature
> - last-verified-against-code: 2026-07-28
> - staleness-policy: update as tasks are completed or added

> **Overview:** Immediate actionable tasks, ordered by priority.

---

## Current Tasks

| Priority | Complexity | Task | Status |
|----------|-----------|------|--------|
| P0 | M | **Fix TemplateLibrary blank-screen crash** — `listTemplates()` in useState throws on missing consent; wrap in try-catch | Complete |
| P0 | L | **Front/back dual-sided template support** — `hasBackSide` flag + `backLayers[]` on `DesignerTemplate`, side toggle in designer + preview | Complete |
| P1 | M | **Responsive canvas auto-scaling** — ResizeObserver-driven zoom to fit canvas within container, zoom in/out/reset controls | Complete |
| P1 | M | **Lifted designerTemplate state** — sync between App.tsx and TemplateEditor via props so IDCard preview stays current | Complete |
| P1 | M | **Responsive TemplateDesigner** — stack sidebar below canvas on mobile, wrap toolbar | Complete |
| P1 | M | **Modal z-index stacking** — ensure modals aren't obscured (TemplateLibrary z-50, preview z-[60], CookieConsent z-[60]) | Complete |
| P1 | M | **Mobile preview refinements** — improved padding, scroll, touch targets | Complete |
| P2 | S | **custom-scrollbar CSS** — add missing utility class for overflow containers | Complete |
| P2 | S | **Responsive CSS refinements** — mobile breakpoint adjustments to panels, buttons, layout | Complete |
| P0 | XL | **Touch controls via pointer events** — replaced mouse-only handlers with unified pointer (mouse + touch + pen) for drag/resize/rotate | Complete |
| P0 | M | **Rotation handle & support** — added rotation handle on selected layers + reset button + render rotation in preview | Complete |
| P0 | M | **Responsive canvas overflow fix** — replaced hardcoded maxWidth with CSS-controlled responsive sizing | Complete |
| P1 | M | **Wide-screen canvas preview** — template designer canvas shown in right panel when designer tab is active | Complete |
| P1 | M | **TemplateLibrary consent crash fix** — `checkConsent()` changed from throwing to returning boolean; all storage functions handle missing consent gracefully | Complete |
| P1 | M | **useMemo optimization** — TemplateEditor designer template computation wrapped in useMemo to prevent re-render thrashing | Complete |
| P0 | M | **Icon-based resize/rotate handles** — replaced colored dots with lucide-react icons (Move/RotateCcw), 28px touch targets | Complete |
| P0 | M | **Undo/redo history** — 50-step history ref, undo/redo via toolbar buttons + Cmd/Ctrl+Z keyboard shortcuts | Complete |
| P0 | M | **Gradient backgrounds** — linear/radial gradient support for shape layers, color pickers in property panel | Complete |
| P0 | M | **Glassmorphism effects** — backdrop blur + opacity controls for shape and image layers | Complete |
| P0 | M | **Border controls** — width/color/style (solid/dashed/dotted) for image and shape layers | Complete |
| P0 | M | **Toast notification system** — ToastProvider + useToast hook, success/error/info variants, 3.5s auto-dismiss | Complete |
| P1 | M | **Rotation in layout panel** — added rotation slider to legacy element position controls | Complete |
| P1 | M | **Enhanced design panel** — element weight/rounded controls, additional palette color | Complete |
| P0 | M | **Icon-based resize/rotate handles** — replaced colored dots with lucide-react icons (Move/RotateCcw), 28px touch targets | Complete |
| P0 | M | **Undo/redo history** — 50-step history ref, undo/redo via toolbar buttons + Cmd/Ctrl+Z keyboard shortcuts | Complete |
| P0 | M | **Gradient backgrounds** — linear/radial gradient support for shape layers, color pickers in property panel | Complete |
| P0 | M | **Glassmorphism effects** — backdrop blur + opacity controls for shape and image layers | Complete |
| P0 | M | **Border controls** — width/color/style (solid/dashed/dotted) for image and shape layers | Complete |
| P0 | M | **Toast notification system** — ToastProvider + useToast hook, success/error/info variants, 3.5s auto-dismiss | Complete |
| P1 | M | **Rotation in layout panel** — added rotation slider to legacy element position controls | Complete |
| P1 | M | **Enhanced design panel** — element weight/rounded controls, additional palette color | Complete |
| P0 | M | **Fix TemplateDesigner blank page crash** — `undo`/`redo` useCallback referenced `setActiveLayers` before declaration (TDZ ReferenceError). Reordered hook definitions. | Complete |
| P0 | M | **Dynamic employee DataEntry based on template** — DataEntry now accepts `designerTemplate`, extracts `{{variable}}` placeholders from text layers, and dynamically shows input fields for non-standard variables. Extra fields stored in `data.extraFields`. | Complete |
| P0 | M | **Canvas-based template renderer** — new `src/lib/templateRenderer.ts` renders designer template layers (text/shape/image/barcode) to offscreen canvas with gradient/glassmorphism support for PDF/DOCX export embedding | Complete |
| P0 | M | **Template-based PDF/DOCX exports** — PDF and DOCX exports now use `templateRenderer.ts` to render designer template (front + back) as embedded images per employee. Falls back to legacy layout when no designer template. | Complete |
| P0 | M | **Template-aware CSV import** — extra template fields detected during CSV import and mapped to `extraFields` on employee records | Complete |
| P2 | M | **PDF/DOCX export progress refinements** — better progress reporting during canvas-based rendering | Pending |
| P3 | S | **Clean up unused deps** — express, @google/genai, dotenv (not in package.json — already clean) | N/A |
| P3 | M | **Service Worker / PWA manifest** — offline support, app icon, theme-color | Pending |
| P2 | M | Wire ActivityBoard component to real app state | Pending |
| P2 | S | Add export progress error states | Pending |
| P2 | M | Implement image drag-and-drop upload | Pending |
| P3 | L | Add chunked export for large employee batches | Pending |
| P1 | M | **Clean employee defaults** — removed SAMPLE_EMPLOYEES, empty initial batch, no seeded defaults on createEmployeeRecord | Complete |
| P1 | M | **Template-driven DataEntry** — only show fields referenced in active designer template text layers; fallback to all standard fields when no template | Complete |
