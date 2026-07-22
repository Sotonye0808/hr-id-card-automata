# Repair System

> **Metadata**
> - last-updated-by: bootstrap-project
> - last-verified-against-code: 2026-07-22
> - staleness-policy: append entries as new error patterns are discovered

> **Overview:** Known error patterns and their resolutions for the HR ID Card Automata codebase. Add entries as new error patterns are discovered.

---

## Known Error Patterns

| Error/Symptom | Likely Cause | Resolution | Status |
|---------------|-------------|------------|--------|
| Images not persisting across sessions | IndexedDB open failure or quota exceeded | Check browser storage quota; ensure `openDatabase()` resolves | Documented |
| CSV import field mapping incorrect | Unrecognized column header alias | Add alias to `HEADER_ALIASES` map in `employeeStore.ts` | Documented |
| Export hangs on large batch | Browser memory/performance limit | Process in smaller batches; add chunked export | Documented |
| Image transform not applying in export | `renderTransformedImage` canvas failing on null source | Add null guard before canvas operations | Documented |
