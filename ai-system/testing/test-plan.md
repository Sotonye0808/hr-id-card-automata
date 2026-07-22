# Test Plan

> **Metadata**
> - last-updated-by: bootstrap-project
> - last-verified-against-code: 2026-07-22
> - staleness-policy: update as test coverage changes

> **Overview:** Test strategy and coverage for the HR ID Card Automata.

---

## Test Approach

- **Unit/Integration**: `scripts/verify.ts` run via `tsx` — mocks localStorage and IndexedDB
- **Type Checking**: `tsc --noEmit` (npm run lint)
- **Manual Testing**: Browser-based visual verification

## Test Suites

### Data Layer (`employeeStore.ts`)
| Test | Type | Coverage |
|------|------|----------|
| CSV parsing | Unit | Header normalization, row parsing, edge cases |
| XLSX parsing | Unit | Via xlsx library |
| Clipboard parsing | Unit | Tab-separated and comma-separated detection |
| Employee CRUD | Unit | Create, duplicate, ID generation |
| Persistence round-trip | Integration | localStorage + IndexedDB save/load |
| Image rendering | Unit | Canvas-based transform pipeline |

### Components
| Test | Type | Coverage |
|------|------|----------|
| Data entry form | Manual | Field input, image upload, transform controls |
| ID card preview | Manual | Template theming, image rendering |
| Template editor | Manual | Font, color, layout changes |
| Import wizard | Manual | Step navigation, field mapping, row selection |

### Export
| Test | Type | Coverage |
|------|------|----------|
| PDF export | Manual | Single/batch, with/without images |
| DOCX export | Manual | Single/batch, with/without images |
