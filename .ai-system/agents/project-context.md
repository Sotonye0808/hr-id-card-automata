# Project Context

Overview: HR ID Card Automata streamlines manual HR work for producing printed ID cards. The app accepts employee records (name, ID, role, photo), provides simple image positioning/cropping, and renders printable output matching the provided sample layout. It targets HR staff and office administrators who need a reliable, offline-capable tool for batch ID generation.

---

## Project Purpose

This project converts simple employee data into printable ID cards using a JSON-driven template. It reduces repetitive manual doc editing by offering batch processing, live previews, and direct export to PDF or Word.

---

## Target Users

| User Type  | Needs                                             | Key Interactions                                    |
| ---------- | ------------------------------------------------- | --------------------------------------------------- |
| HR Admin   | Fast batch ID generation, visual cropping, export | Upload CSV / images, edit template, export PDF/DOCX |
| Operations | Receive print-ready files                         | Download/export multi-page PDF or DOCX              |

---

## Business Constraints

- Must work offline / local-first
- No external database — all data stored locally
- Produce print-ready output that matches the supplied sample layout

---

## Current Project Phase

Phase: Active Development

Active sprint focus: Align default template to the sample and polish exports + docs

---

## Tech Decisions Already Made

| Decision                  | Reason                                     |
| ------------------------- | ------------------------------------------ |
| Local-first SPA           | Simplicity, offline use, no infra required |
| Template-driven rendering | Makes styles/config portable               |

---

## Out of Scope

- Centralised server storage / authentication
- Complex image retouching beyond crop/scale/position

---

## External Integrations

| Service | Purpose                     | Auth Method |
| ------- | --------------------------- | ----------- |
| None    | Not required for core flows | —           |
