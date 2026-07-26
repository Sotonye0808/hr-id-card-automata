# Development History

> **Metadata**
> - last-updated-by: update-ai-system
> - last-verified-against-code: 2026-07-26
> - staleness-policy: append at the end of each significant development phase

> **Overview:** High-level summary of development milestones and phases.

---

## v0.1 — Initial Setup and Core Features

**Date:** 2026-07-22

**Summary:**
- Project initialized with Vite + React 19 + TypeScript + Tailwind CSS v4
- Employee data entry form with image upload and transform controls implemented
- Live ID card preview with customizable template (fonts, colors, layout)
- CSV/XLSX import with field mapping wizard
- Batch PDF and DOCX export
- localStorage + IndexedDB persistence
- ai-system v2 framework installed and bootstrapped
- GitHub Actions opencode workflow configured

## v0.2 — Dynamic Template Designer Overhaul

**Date:** 2026-07-24 to 2026-07-25

**Summary:**
- Replaced legacy TemplateEditor with full drag-and-drop WYSIWYG canvas editor
- Added layer-based template model (text, image, shape, barcode layers)
- Implemented TemplateDesigner with drag/resize/rotate, snap-to-grid, layer panel, per-layer property inspectors
- Built TemplateLibrary modal with save/load/rename/delete/export/import JSON
- Created templateImporter for image/DOCX/PDF → tracing background imports
- Added CookieConsent GDPR-compliant localStorage banner
- Implemented dynamic SEO meta tag injection (Open Graph, Twitter Cards, JSON-LD)
- Updated IDCard to render from new layer-based DesignerTemplate with legacy fallback
- Rewrote README, metadata.json, and ai-system docs to reflect new architecture
- All package.json deps verified as actively used; no unused dependencies

## v0.3 — Responsiveness & Modal Stacking Sprint

**Date:** 2026-07-25

**Summary:**
- Made TemplateDesigner responsive: sidebar stacks below canvas on mobile, toolbar wraps
- Fixed modal z-index stacking: mobile preview at z-[60], CookieConsent at z-[60], TemplateLibrary at z-50
- Improved mobile preview dialog with better padding, scroll behavior, touch targets
- TemplatedEditor sub-tabs converted to CSS grid for consistent sizing
- Added missing `custom-scrollbar` CSS utility class
- Added responsive CSS breakpoint refinements to panels, buttons, and layout grid
- CookieConsent buttons stack vertically on very small screens
- Verified build succeeds with no regressions

## v0.4 — Back-of-Card, Responsive Canvas & Bug Fixes

**Date:** 2026-07-25

**Summary:**
- Fixed TemplateLibrary blank-screen crash: `listTemplates()` in useState initializer now wrapped in try-catch to handle missing localStorage consent gracefully
- Added front/back dual-sided template support: `hasBackSide` flag + optional `backLayers[]` on `DesignerTemplate`, side toggle button in TemplateDesigner toolbar, flip button in IDCard preview
- Made TemplateDesigner canvas responsive: auto-scaling via ResizeObserver that fits canvas to container, zoom in/out/reset controls with percentage display, proper overflow handling on mobile
- Synced `designerTemplate` state between App.tsx and TemplateEditor via lifted state + `onDesignerTemplateChange` callback so IDCard preview always reflects current designer changes
- Improved desktop preview section to use `max-w-full` wrapper and pass `designerTemplate` to IDCard
- Updated all ai-system docs: system-architecture (front/back flow, responsive zoom), project-context (back-of-card scope), project-plan (completed items), dev-history (this entry), project-decisions (back-of-card decision added)

## v0.5 — Touch Controls, Rotation & Responsive Canvas Sprint

**Date:** 2026-07-26

**Summary:**
- Replaced mouse-only event handlers in TemplateDesigner with unified pointer events (`onPointerDown`/`pointermove`/`pointerup`) that work across mouse, touch, and pen — no redundant mouse + touch handler code
- Added rotation handle (orange dot above each selected layer) for visual rotation; rotation snaps to 5-degree increments
- Added rotation reset button in layer properties panel
- Rotation is now rendered in both TemplateDesigner canvas and IDCard preview via `transform: rotate()`
- Canvas now shows in the right preview panel on wide screens when Template Designer tab is active — full interactive editing instead of static preview
- Fixed mobile canvas overflow: replaced hardcoded `maxWidth` with `maxWidth: 100%` plus `!important` CSS override; container uses `overflow: auto` with `-webkit-overflow-scrolling: touch`
- Fixed TemplateLibrary blank-screen bug: changed `checkConsent()` from throwing to returning boolean, all storage functions now silently return on missing consent instead of crashing
- Added `useMemo` protection in TemplateEditor to prevent designer template re-computation on every render
- Made DesignerIDCard preview responsive with `aspectRatio` CSS instead of fixed height
- Added `touch-action: none` on canvas elements and `touch-action: manipulation` on container to prevent browser gesture interference
- `document.body.style.userSelect = "none"` during drag/resize/rotate to prevent text selection
- Updated all ai-system docs and README to reflect new capabilities

### Sprint: Dynamic Design Enhancements (2026-07-26)
- Replaced colored resize/rotate dots with lucide-react icons (`Move` / `RotateCcw`) in 28px touch-target containers for better usability and touch control
- Added undo/redo history stack (50 steps) via `historyRef` + `pushHistory` on pointer-up/add/delete/move; toolbar buttons (Undo2/Redo2 icons) + keyboard shortcuts (Cmd/Ctrl+Z / +Shift+Z)
- Added `GradientConfig` and `GlassmorphismConfig` types; gradient (linear/radial) and glassmorphism (backdrop blur + opacity) controls in shape and image layer property panels
- Added border customization (width, color, style solid/dashed/dotted) for shape and image layers in both property panels and renderers
- Created `Toast.tsx` component with `ToastProvider` context + `useToast()` hook; success/error/info animated toasts with 3.5s auto-dismiss
- Integrated toasts across App.tsx (save/import/export), TemplateLibrary (save/load/delete/rename/import/export), TemplateDesigner (file import)
- Added rotation slider to legacy element position controls in TemplateEditor layout tab
- Enhanced TemplateEditor design tab with element weight/rounded controls and additional accent color picker
- Added `ElementPosition.rotation` field to support rotation in legacy CardConfig
- Updated metadata.json, README, system-architecture.md, project-context.md, design-system.md, and task-queue.md

## v0.6 — TemplateEngine Blank Page Fix & Documentation Sync

**Date:** 2026-07-26

**Summary:**
- Fixed critical blank-page crash in TemplateDesigner: `undo`/`redo` `useCallback` deps referenced `setActiveLayers` before its `const` declaration, hitting the temporal dead zone and throwing a `ReferenceError` during render. Reordered hook definitions so `setActiveLayers` is defined before `undo`/`redo`.
- Removed duplicate `activeLayers`/`setActiveLayers`/`currentLayers` variables that were left after the reorder.
- Updated all ai-system docs: dev-history (this entry), lessons-learned (TDZ lesson), task-queue (fix item), repo-map freshness

## v0.7 — Dual TemplateDesigner Removal, Expanded Design Features & Doc Sync

**Date:** 2026-07-26

**Summary:**
- Removed auto-save toast from `handleDesignerTemplateChange` in App.tsx — toast now only fires on manual saves (TemplateLibrary save button)
- Improved IDCard preview to show both front and back card sides simultaneously when `hasBackSide` is true
- Removed duplicate TemplateDesigner from TemplateEditor's "designer" tab — canvas now lives solely in the right preview panel, eliminating the two-iteration layout issue
- Simplified TemplateEditor to two tabs: "Design" (canvas config, fonts, presets) and "Canvas" (dimensions), both operating directly on DesignerTemplate properties
- Made preset palette changes sync to DesignerTemplate canvasColor for real-time preview reflection
- Enlarged resize/rotate handles from h-7/w-7 (28px) to h-9/w-9 (36px) with icons sized 14-16px for better touch targets
- Changed resize handle icons from generic Move to Maximize2 with directional hints (rotated for vertical/horizontal)
- Added glassmorphism, gradient, and border controls to text layer property panel (TextLayerPropsPanel) — previously only available for shape/image layers
- Updated text layer rendering (both TemplateDesigner canvas and IDCard preview) to apply gradient, glassmorphism, and border styles
- Fixed responsive canvas overflow by restructuring with wrapper div that dimensions to `canvasWidth * zoom` × `canvasHeight * zoom`
- Updated dependency-graph.md to reflect TemplateDesigner is now rendered directly in App.tsx (right panel) rather than inside TemplateEditor
- Updated all ai-system docs, README, metadata.json to reflect text layer design features and simplified component relationships

## v0.8 — End-to-End Template-Export Wiring & Dynamic Data Entry

**Date:** 2026-07-26

**Summary:**
- Created `exportRenderer.ts` — canvas-based renderer that draws all designer template layers (text with `{{variable}}` substitution, images with crop/transform, shapes with gradients/glassmorphism/borders, barcodes) onto a `<canvas>` for embedding in PDF/DOCX exports
- Rewrote PDF export (`exportPdf`) in App.tsx to use `renderDesignerTemplateToCanvas()` — renders front side layers per employee, with back side as separate page when `hasBackSide` is true; falls back to simple text layout when no designer template exists
- Rewrote DOCX export (`exportDocx`) in App.tsx to use `renderDesignerTemplateSideToCanvas()` — embeds canvas images as docx `ImageRun` per employee with front/back support
- Added `getTemplateVariables()` to `templateStore.ts` — scans all text layers in a DesignerTemplate for `{{variable}}` patterns and returns known fields used
- Updated `DataEntry.tsx` to accept `templateVariables` prop — each input field (fullName, role, department, idNumber, issueDate) is now conditionally rendered based on template usage; all fields shown when no template uses variables (backward compatible)
- Removed unused docx imports (`AlignmentType`, `TableCell`, `TableRow`, `WidthType`) from App.tsx
- Updated all documentation: README (dynamic fields, export renderer, back side export), metadata.json (new capabilities), system-architecture.md (exportRenderer module, updated export flow), project-context.md (in-scope items), repo-map.md (new file), dependency-graph.md (new dependency), project-plan.md (completed items), dev-history.md (this entry)

## v0.9 — Mobile Designer Access, Template Variable Defaults & Documentation Sync

**Date:** 2026-07-26

**Summary:**
- Fixed default migration (`migrateCardConfigToDesignerTemplate`) to use `{{variable}}` syntax (e.g., `{{fullName}}`, `{{department}}`, `{{role}}`, `{{idNumber}}`, `{{issueDate}}`) instead of hardcoded text — ensures exports, preview, and data entry all reflect actual employee data
- Added `{{issueDate}}` text layer to default migrated template so the field appears in DataEntry
- Added `templateTextContext` prop to DataEntry — extracts non-variable text from template layers and displays it as context hints above each input field
- Made TemplateDesigner accessible on mobile by rendering it inline below TemplateEditor controls in the left panel (`lg:hidden`), so mobile users can see and interact with the canvas
- Updated mobile preview modal to be context-aware: shows TemplateDesigner when the Template tab is active, IDCard preview otherwise
- Fixed canvas absolute positioning by adding `position: relative` to the canvas wrapper div — ensures the absolute-positioned canvas is properly contained within its parent
- Updated README with current feature set, architecture diagram, and usage notes
- Updated metadata.json with new capabilities
- Updated all ai-system docs: project-plan (completed items), dev-history (this entry), task-queue (new completions)
