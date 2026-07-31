# Project Decisions

> **Metadata**
> - last-updated-by: execute-feature
> - last-verified-against-code: 2026-07-31
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

---

## Decision 4 — Template Image Refs Are Self-Contained; Unloadable Refs Degrade Gracefully

**Date:** 2026-07-31

Template image layers and employee image uploads are stored as data URLs (blobs) captured via `FileReader.readAsDataURL`, so exported template JSON and persisted batches embed the actual image bytes and remain portable across devices. This satisfies the requirement that template saves must not break when loaded on another device.

As an assumption guard, `DataEntry` image previews attach an `onError` handler: any reference that fails to load (e.g. a device-local file path baked into a template exported from another machine) is cleared and the upload dropzone is shown instead, so the user can simply input an image on their device. The canvas export renderer already wraps image loading in try/catch and draws an "Image error"/"No image" placeholder rather than crashing.

Rationale: Keeps the common case (blob-backed templates) unchanged while guaranteeing no crash path for the rare, hand-edited or cross-device local-path case.

---

## Decision 5 — Library "Save" Overwrites the Selected Template; "Save As New" Creates a Copy

**Date:** 2026-07-31

The TemplateLibrary follows a classic Open/Save/Save-As workflow: tapping a library item selects it (highlight), pressing **Save** overwrites that selected template with the current designer state — preserving the selected template's id, name, and `createdAt` while stamping a fresh `updatedAt` — and **Save As New** persists a copy under a new id/name. When nothing in the list is selected, Save falls back to writing the current designer template under its own id with the name field.

Rationale: Users repeatedly overwrote the wrong template because Save always wrote to the designer's current id, and multi-template management was only possible via "Save As New". Tying Save to the visible selection makes "save to it and overwrite" explicit and keeps "save as new" as the dedicated path for creating new entries.
