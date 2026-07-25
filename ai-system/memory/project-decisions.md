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
