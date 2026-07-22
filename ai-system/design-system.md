# Design System

> **Metadata**
> - last-updated-by: bootstrap-project
> - last-verified-against-code: 2026-07-22
> - staleness-policy: re-verify if design tokens change

> **Overview:** Documented UI patterns, design tokens, and conventions used in the HR ID Card Automata.

---

## Visual Style

- **Theme System**: Light/dark mode via `data-theme` attribute on `<html>` element
- **CSS Custom Properties**: `--bg`, `--surface`, `--text`, `--muted`, `--border`, `--accent`, `--accent-soft`, `--paper-*` drive all theming
- **Card Themes**: Midnight (dark blue), Emerald (green), Vulcan (purple/red), Amethyst (purple/teal) — 4 preset color palettes
- **Fonts**: 4 options applied via CSS classes (`sheet-font-*`)

## Component Patterns

- **Tab Navigation**: Segmented control (pill-style) for switching views
- **Modal Wizard**: Two-step import wizard with back/next navigation
- **Form Controls**: Styled input groups with labels, consistent spacing
- **Image Upload**: File picker (PNG/JPG, 2MB limit) with preview and transform controls
- **Export Progress**: Phase/percentage/status display during batch operations

## Layout Structure

- **Desktop**: Two-column layout — left panel (active tab content), right panel (ID card preview)
- **Mobile**: Single column with overlay preview toggled by button
- **Cards**: `sheet-theme-*` classes apply background and accent colors from template config
