# Lessons Learned

> **Metadata**
> - last-updated-by: execute-feature
> - last-verified-against-code: 2026-07-25
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
