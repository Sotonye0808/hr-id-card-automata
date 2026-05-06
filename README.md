# HR ID Card Automata

Small PWA to generate HR ID cards from employee data. Supports local-first workflows, image upload & basic cropping, live preview, and export to PDF/DOCX.

## Quickstart (local)

Prerequisites: Node.js (16+)

1. Install dependencies:

```bash
npm install
```

2. Run the dev server:

```bash
npm run dev
```

3. Open http://localhost:3000

## Purpose

This repo is a streamlined PWA for HR teams to batch-create ID cards using a JSON-driven template. It is local-first (no external DB), supports offline use, and exports PDFs or DOCX files.

The default preview follows the provided sample layout: heading, employee table row, photo block, and developer credit footer.

## Notes

- The UI includes a Template Editor and a Batch/Activity panel for exports.
- Batch entry supports manual rows and CSV import.
- A sample CSV is available at `/sample-employee-batch.csv` and from the app UI.
- Employee photos are stored locally in IndexedDB, while batch metadata and template settings are kept in localStorage.
- The sample template used as the default comes from `.ai-system/docs/Staff_IDS_2026_54e4476f.html`.
- Batch exports generate all queued employees into the same PDF or DOCX file, with page breaks between records.

Built by S.D. — link included in the app footer.
