# Repair System

> **Metadata**
> - last-updated-by: fix-build
> - last-verified-against-code: 2026-07-31
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
| Blank page when clicking "Add row" on the employee panel | `src/components/DataEntry.tsx` referenced `templateHasImages` which was never defined → `ReferenceError` during render → React unmounts the tree | Define `templateHasImages` via the existing `hasImageLayers(designerTemplate)` helper | Fixed 2026-07-31 |
| Vercel build failure: `The character "}" is not valid inside a JSX element` in `DataEntry.tsx` | Stray `)}` used to close the Profile Media section instead of `</div>` | Replace the `)}` with the matching `</div>` (patched in 6744242; verified against current build) | Fixed 2026-07-31 |
| `npm run lint` fails on `TemplateLibrary.tsx` | `onClick={handleSave}` — a `(asNew: boolean) => void` handler is not assignable to `MouseEventHandler` | Wrap as `onClick={() => handleSave(false)}` | Fixed 2026-07-31 |
| `npm run lint` fails on `scripts/verify.ts` | Fake `localStorage`/`indexedDB` classes did not satisfy `Storage`/`IDBFactory` | Add `length`/`clear`/`key` to `FakeLocalStorage` and `cmp`/`databases`/`deleteDatabase`/typed `open()` to `FakeIndexedDB`; cast the window stub | Fixed 2026-07-31 |
| `npm run verify` fails: `assert.match(duplicate.idNumber, /-02$/)` | Stale assertion — `duplicateEmployeeRecord` intentionally preserves the source `idNumber` | Assert the duplicate keeps the source `idNumber` while receiving a fresh `id` | Fixed 2026-07-31 |
| Template/employee image layer renders a broken image after loading a template on a different device | `src` stored a device-local file path (not a self-contained data URL) | DataEntry image previews now `onError`-clear unloadable refs so the upload dropzone reappears; canvas renderers already draw an "Image error"/"No image" placeholder instead of crashing | Mitigated 2026-07-31 |

---

## Prevention Notes

- Any JSX that conditionally renders sibling blocks must balance every `{ ... }` expression with its matching `}` and every open element with a `</...>`. The esbuild errors at the *first* unbalanced token, so the reported line is where parsing breaks, not where the mistake was made.
- Every boolean used inside a render expression must be derived from props/state (e.g. `templateHasImages`) — never reference an undeclared identifier, as it becomes a render-time `ReferenceError` that blanks the whole page.
- Template image layers are always stored as self-contained data URLs (uploads and imports use `FileReader.readAsDataURL`), so exported JSON captures the image blob and is portable across devices.
