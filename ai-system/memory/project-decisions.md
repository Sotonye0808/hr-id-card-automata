# Project Decisions

> **Metadata**
> - last-updated-by: execute-feature
> - last-verified-against-code: 2026-07-25
> - staleness-policy: append each time a significant decision is made

> **Overview:** Log of significant project decisions. Add entries as decisions are made.

---

## Decision 1 — Modal Z-Index Layering Convention

**Date:** 2026-07-25

Established a three-tier z-index layering for overlays:
- **z-50**: In-page modals (TemplateLibrary, ImportWizard)
- **z-[60]**: Full-screen overrides (mobile preview overlay, CookieConsent banner)
- **z-[70]+**: Reserved for future use (toasts, notifications, emergency overlays)

Rationale: `backdrop-filter` on parent panels creates stacking contexts that can clip child z-index ranges. Using distinct tiers prevents overlap and ensures the right element is always on top without fighting specificity.

---

## Decision 2 — Front/Back Dual-Sided Template Model

**Date:** 2026-07-25

Represent dual-sided ID cards by adding an optional `backLayers: TemplateLayer[]` array and a `hasBackSide: boolean` flag to `DesignerTemplate`. The `TemplateDesigner` component shows a "Front/Back" toggle in the toolbar that switches which layer set is displayed and edited. The `IDCard` preview shows a "Show Back"/"Show Front" button when `hasBackSide` is true and `backLayers` is non-empty.

Rationale: Simpler than adding a `side` field to each layer (which would require filtering everywhere). Templates without a back side remain unchanged — `backLayers` is absent or empty. The two-arrays approach makes save/load trivial and avoids coupling layer identity to side.

---

## Decision 3 — Lifted DesignerTemplate State Between App and TemplateEditor

**Date:** 2026-07-25

`DesignerTemplate` state is now managed in `App.tsx` and passed down to `TemplateEditor` via `designerTemplate`/`onDesignerTemplateChange` props, instead of having `TemplateEditor` own its own local state. This ensures the `IDCard` preview (rendered in App.tsx) always reflects the latest designer changes without duplication or sync problems.

Rationale: The `IDCard` preview in `App.tsx` needs access to the current designer template. Previously, `TemplateEditor` had its own local state that the App couldn't see, causing the preview to show stale data.
