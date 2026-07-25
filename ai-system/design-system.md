# Design System

> **Metadata**
> - last-updated-by: execute-feature
> - last-verified-against-code: 2026-07-25
> - staleness-policy: re-verify if design tokens change

> **Overview:** Documented UI patterns, design tokens, and conventions used in the HR ID Card Automata.

---

## Visual Style

- **Theme System**: Light/dark mode via `data-theme` attribute on `<html>` element
- **CSS Custom Properties**: `--bg`, `--surface`, `--text`, `--muted`, `--border`, `--accent`, `--accent-soft`, `--paper-*` drive all theming
- **Card Themes**: Midnight (dark blue), Emerald (green), Vulcan (purple/red), Amethyst (purple/teal) — 4 preset color palettes
- **Fonts**: 4 options applied via CSS classes (`sheet-font-*`)

## Component Patterns

- **Tab Navigation**: Segmented control (pill-style) for switching views — now includes "Designer" tab for canvas editor
- **Canvas Editor**: Drag-and-drop layer positioning with snap-to-grid (8px), resize handles (SE, S, E), layer panel for z-index/visibility/lock management
- **Layer Property Panels**: Context-sensitive property inspectors per layer type (text: content/font/color/size, image: upload/fit/radius, shape: type/fill/border/radius, barcode: format/value/color)
- **Template Library**: Modal with save/load/rename/delete/export/import actions
- **Cookie Consent**: Fixed bottom banner with Accept/Dismiss, only shown before consent given
- **Modal Wizard**: Two-step import wizard with back/next navigation
- **Form Controls**: Styled input groups with labels, consistent spacing
- **Image Upload**: File picker (PNG/JPG) with preview and transform controls
- **Export Progress**: Phase/percentage/status display during batch operations

## Layout Structure

- **Desktop**: Two-column layout — left panel (active tab content), right panel (ID card preview)
- **Mobile**: Single column with overlay preview toggled by button
- **Cards**: `sheet-theme-*` classes apply background and accent colors from template config
- **Designer Canvas**: Center-aligned canvas with grid background, layer outlines on selection
