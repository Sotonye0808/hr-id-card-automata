# Task Queue

> **Metadata**
> - last-updated-by: update-ai-system
> - last-verified-against-code: 2026-07-25
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
| P3 | S | **Clean up unused deps** — express, @google/genai, dotenv (not in package.json — already clean) | N/A |
| P3 | M | **Service Worker / PWA manifest** — offline support, app icon, theme-color | Pending |
| P2 | M | Wire ActivityBoard component to real app state | Pending |
| P2 | S | Add export progress error states | Pending |
| P2 | M | Implement image drag-and-drop upload | Pending |
| P3 | L | Add chunked export for large employee batches | Pending |
