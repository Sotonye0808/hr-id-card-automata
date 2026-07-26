# Task Queue

> **Metadata**
> - last-updated-by: execute-feature
> - last-verified-against-code: 2026-07-26
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
| P3 | S | **Clean up unused deps** — express, @google/genai, dotenv (not in package.json — already clean) | N/A |
| P0 | L | **Canvas-based export renderer** — `exportRenderer.ts` that draws all layer types (text with variable substitution, images, shapes, barcodes) with gradients/glassmorphism/borders/rotation onto canvas for PDF/DOCX embedding | Complete |
| P0 | M | **Dynamic data entry fields** — `DataEntry` shows fields based on `getTemplateVariables()` so only variables used in active template are displayed | Complete |
| P0 | M | **End-to-end template export** — PDF and DOCX exports now render designer template via canvas renderer instead of hardcoded layout | Complete |
| P0 | M | **Back side in export** — front and back rendered as separate pages per employee in both PDF and DOCX | Complete |
| P0 | S | **Remove unused docx imports** — AlignmentType, TableCell, TableRow, WidthType no longer needed after export rewrite | Complete |
| P0 | M | **Fix default migration to use template variables** — changed hardcoded text to {{fullName}}/{{department}}/{{role}}/{{idNumber}}/{{issueDate}} so exports reflect real employee data | Complete |
| P0 | M | **Mobile canvas accessibility** — TemplateDesigner now renders inline below TemplateEditor on small screens (lg:hidden), mobile preview context-aware for template tab | Complete |
| P0 | S | **Canvas wrapper position:relative** — prevents absolute-positioned canvas from escaping its layout parent | Complete |
| P1 | M | **Template text context in DataEntry** — extracts non-variable text from template layers and shows as contextual hints above employee input fields | Complete |
| P3 | M | **Service Worker / PWA manifest** — offline support, app icon, theme-color | Pending |
| P2 | M | Wire ActivityBoard component to real app state | Pending |
| P2 | S | Add export progress error states | Pending |
| P2 | M | Implement image drag-and-drop upload | Pending |
| P3 | L | Add chunked export for large employee batches | Pending |
