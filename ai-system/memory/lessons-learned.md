# Lessons Learned

> **Metadata**
> - last-updated-by: execute-feature
> - last-verified-against-code: 2026-07-29
> - staleness-policy: append each time a lesson is identified

> **Overview:** Lessons learned during development. Add entries as new insights arise.

---

## Lesson 1 — `backdrop-filter` Creates Stacking Context

**Date:** 2026-07-25

CSS properties like `backdrop-filter` and `transform` create new stacking contexts on their elements. When a child uses `position: fixed`, its z-index is resolved within the nearest stacking context, not the root. To avoid modal overlap issues, use explicit higher z-index values (e.g., z-[60]) for the topmost overlays (mobile preview, cookie consent) and keep in-page modals at z-50.

## Lesson 2 — Components with `position: fixed` Escape Parent Overflow

**Date:** 2026-07-25

Modals rendered inside deeply nested components (e.g., TemplateLibrary inside TemplateEditor inside a panel) still display correctly because `position: fixed` positions relative to the viewport regardless of DOM depth. However, their z-index may be constrained by ancestor stacking contexts, so explicit z-index layering is essential.

## Lesson 3 — Responsive Layout with Flex Children and `overflow: hidden`

**Date:** 2026-07-25

When making a side-by-side flex layout (canvas + property panel) responsive to stack vertically on mobile, switch from `flex-row` to `flex-col` at the breakpoint. Use `lg:flex-row` for desktop and default `flex-col` for mobile. Set `max-h` on the sidebar on mobile to prevent it from taking too much vertical space.

## Lesson 4 — React `useState` Initializers Can Crash Rendering

**Date:** 2026-07-25

A function passed to `useState(fn)` runs during render. If it throws (e.g., `listTemplates()` checks localStorage consent and throws), the component crashes. The overlay `<div>` may already be rendered before the crash, causing a "blank screen" appearance. Always wrap fallible state initializers in try-catch, or use lazy initialization with `useState(() => { try { ... } catch { return fallback; } })`.

## Lesson 5 — Lifting State Between Parent and Child Modal Components

**Date:** 2026-07-25

When a child component (TemplateEditor) manages state that a sibling or parent (IDCard preview in App.tsx) needs to display, lift the state to the common ancestor and pass it down via props. Otherwise, the two components drift out of sync and the preview shows stale data. Use a callback prop (`onDesignerTemplateChange`) to let the child notify the parent of changes.

## Lesson 6 — Unified Pointer Events Over Mouse + Touch

**Date:** 2026-07-26

For drag-and-drop interactions that need to work across mouse, touch, and pen, use the Pointer Events API (`pointerdown`, `pointermove`, `pointerup`) instead of maintaining separate mouse and touch event handlers. `pointerdown` on elements + `window.addEventListener("pointermove"/"pointerup")` provides a single code path. Use `setPointerCapture` if available, or attach listeners to `window`. Always set `touch-action: none` on draggable elements to prevent browser gesture interference, and set `document.body.style.userSelect = "none"` during drag to prevent text selection.

## Lesson 7 — Temporal Dead Zone in `useCallback` Dependency Arrays

**Date:** 2026-07-26

When multiple `const` hooks (useCallback, useState, etc.) reference each other, the order of declaration matters. `useCallback` dependency arrays are evaluated immediately when the hook runs. If a dependency refers to a `const` declared **after** the current hook, it is in the temporal dead zone and accessing it throws a `ReferenceError`, causing the component to unmount with a blank page.

Always define dependencies (e.g., `setActiveLayers`) before the callbacks that reference them (`undo`/`redo`). React hooks run in order, so a `useCallback` can safely use a `const` declared earlier in the same render, but not one declared later.

## Lesson 8 — Canvas Rendering for PDF/DOCX Export Embedding

**Date:** 2026-07-28

For PDF/DOCX exports that need to render visual templates, the most reliable approach without external dependencies (html2canvas) is to render layers onto an offscreen `<canvas>` element using native Canvas 2D API, then embed the resulting data URL (PNG) via `jsPDF.addImage()` or `docx` `ImageRun`. Text rendering on canvas requires explicit `ctx.font` setup. Use `ctx.save()`/`ctx.restore()` around each layer for isolated transforms (rotation, opacity). Handle barcodes as styled placeholder text since actual barcode generation would require an additional library. Handle gradients via `createLinearGradient`/`createRadialGradient` and image objectFit via manual aspect-ratio calculations.

## Lesson 9 — Undo/Redo Should Gate on Actual Change, Not Interaction

**Date:** 2026-07-29

Pointer events fire `pointerdown` → `pointerup` even on simple clicks without movement. If `pushHistory` fires on every pointer-up unconditionally, the undo stack fills with no-op entries that dilute meaningful undo actions. Always track whether a drag/resize/rotate actually changed the layer state (e.g., compare final position/size/rotation to initial values via a `didMove`/`didResize`/`didRotate` flag) before pushing to history.

## Lesson 10 — Layer-Based Employee Data Binding Over Placeholder-Scanning

**Date:** 2026-07-29

Scanning text layer content for `{{variable}}` placeholders is fragile — templates without variables produce no input fields at all. A more robust approach is to iterate over template layers directly: each text layer → text input, each image layer → image upload, shape/barcode → skip. Store per-layer employee overrides in `extraFields` with prefixed keys (`_tl_<layerId>` for text, `_il_<layerId>` for images). This ensures every editable layer always gets a corresponding input, and the template's default content serves as the initial prefill.
