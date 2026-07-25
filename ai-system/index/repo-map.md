# Repo Map

> **Metadata**
> - last-updated-by: update-ai-system
> - last-verified-against-code: 2026-07-25
> - staleness-policy: auto-regenerable — update when project structure changes

> **Overview:** Directory structure with purpose of each folder and key files.

---

```
hr-id-card-automata/
├── .github/workflows/       # GitHub Actions workflows (opencode trigger)
├── ai-system/               # AI-assisted development framework
├── dist/                    # Production build output (auto-generated)
├── public/                  # Static assets (sample CSV)
│   └── sample-employee-batch.csv
├── scripts/
│   └── verify.ts           # Verification/unit test script
├── src/
│   ├── main.tsx            # React entry point
│   ├── App.tsx             # Main app shell (state, routing, export)
│   ├── types.ts            # TypeScript interfaces
│   ├── index.css           # Global styles + Tailwind + CSS variables
│   ├── lib/
│   │   ├── employeeStore.ts    # Data layer (parse, persist, image pipeline)
│   │   ├── templateStore.ts    # Template CRUD (localStorage), JSON import/export, legacy migration
│   │   ├── templateImporter.ts # Import images/DOCX/PDF as tracing backgrounds
│   │   └── seo.ts              # Dynamic SEO meta tag injection
│   └── components/
│       ├── DataEntry.tsx       # Employee data form + image upload
│       ├── IDCard.tsx          # Live card preview (legacy + designer template modes)
│       ├── TemplateEditor.tsx  # Combined editor (design/layout tabs + designer tab)
│       ├── TemplateDesigner.tsx # WYSIWYG canvas editor with drag/resize/layer panel
│       ├── TemplateLibrary.tsx # Save/load/rename/delete/import/export templates
│       ├── CookieConsent.tsx   # GDPR consent banner
│       ├── ImportWizard.tsx    # CSV/XLSX/clipboard import with field mapping
│       └── ActivityBoard.tsx   # Decorative batch processor UI
├── .env.example            # Environment variable template
├── index.html              # HTML shell
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite configuration
└── ai-context.md           # AI system session entry point
```
