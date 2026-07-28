# Development History

> **Metadata**
> - last-updated-by: execute-feature
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

## v0.7 — Dynamic DataEntry & Template-Based Exports

**Date:** 2026-07-28

**Summary:**
- Made employee DataEntry dynamic: accepts `designerTemplate` prop, scans text layers for `{{variable}}` placeholders, and renders input fields for non-standard variables automatically
- Added `extraFields: Record<string, string>` to `UserData`/`EmployeeRecord` types for storing custom template field values
- Created `templateRenderer.ts` — canvas-based renderer for designer templates that renders text/shape/image/barcode layers (with gradient and glassmorphism support) to offscreen canvas for PDF/DOCX embedding
- Updated PDF export to use `templateRenderer.ts`: renders front and back of card as embedded images per employee, with fallback to legacy layout
- Updated DOCX export to use `templateRenderer.ts`: embeds front and back card images, with legacy fallback
- Updated CSV/XLSX import: extra template fields detected and mapped to `extraFields` on employee records during import wizard confirmation
- Updated IDCard text layer resolution to handle `{{extraField}}` variables via `data.extraFields`
- All ai-system docs refreshed: system-architecture (templateRenderer, export pipeline), project-context (dynamic DataEntry, template-based exports), task-queue (new tasks), project-plan (completed items), dev-history (this entry)
