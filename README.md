# Default Template

A GitHub template repository incorporating the **`ai-system`** framework for AI-assisted software development, pre-configured with an **opencode local trigger workflow**.

---

## What's Included

### `ai-system/` — AI-Assisted Development System

A vendor-neutral, model-agnostic framework for AI-assisted software development. Provides structured documentation, command-driven workflows, and quality gates that work identically across any AI coding tool.

```
ai-system/
├── protocols/          # Entry, tiering, QA, escalation, verification
├── agents/             # Function-based roles (Planner, Architect, Implementer, etc.)
├── commands/           # Reusable command pipelines (execute-feature, dev-cycle, etc.)
├── standards/          # Engineering principles
├── planning/           # Task queue and project plan
├── memory/             # Decisions and lessons
├── index/              # Repo map and dependency graph
├── testing/            # Test plan and results
├── checkpoints/        # Session log and in-progress tracking
├── summaries/          # Development history
└── integrations/       # Optional tool integration examples
```

### `ai-context.md` — Session entry point

The first file any AI agent reads to get a 30-second project orientation.

### `MIGRATION.md` — Upgrade guide

For teams upgrading from `ai-system` v1 to v2.

### `.github/workflows/opencode.yml` — Opencode local trigger

Enables running opencode agents directly from issue comments and PR review comments using `/oc`, `/opencode`, `/design`, `/od`, and `/opendesign` commands. Delegates to the central workflow runner in the [sotonye-dagogo-dev/github-workflows](https://github.com/sotonye-dagogo-dev/github-workflows) repository.

---

## How to Use This Template

### 1. Create a Repository from This Template

Click **"Use this template"** on GitHub to create a new repository.

### 2. Clone and Bootstrap

```bash
git clone <your-new-repo-url>
cd <your-repo>
```

Then, in your AI tool, run the bootstrap command:

```
Execute command: ai-system/commands/bootstrap-project.md
Directive: [describe your project, e.g., "Next.js + Node.js marketplace app"]
```

### 3. Start Development

```
Execute command: ai-system/commands/dev-cycle.md
```

### 4. Use Opencode (Optional)

Comment `/oc` on any issue or PR to trigger an opencode agent session via the configured workflow.

---

## Prerequisites & Suggestions

- **GitHub Organization**: For teams, set up an org-level secrets and environments to share across repos using this template.
- **Repository Secrets**: If using the opencode workflow, ensure `GITHUB_TOKEN` has the necessary permissions (contents write, pull requests write, issues write).
- **AI Tool**: Any AI coding tool that can read `ai-context.md` at session start (CLI, IDE extension, API loop, or autonomous agent).
- **GitHub Workflows Repo**: The opencode trigger workflow references `sotonye-dagogo-dev/github-workflows`. Ensure this repository is accessible within your org, or update the workflow reference accordingly.

---

## References

- **`ai-system` Framework Docs**: See [Sotonye0808/ai-system-template](https://github.com/Sotonye0808/ai-system-template) for the canonical `ai-system` documentation and philosophy.
- **Opencode Workflows**: See [sotonye-dagogo-dev/github-workflows](https://github.com/sotonye-dagogo-dev/github-workflows) for the central workflow runners.

---

## License

See [LICENSE](./LICENSE).
