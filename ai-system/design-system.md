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
- **TemplateDesigner**: Side-by-side flex on desktop (`lg:flex-row`), stacked on mobile (`flex-col`). Property panel sidebars capped at `max-h-[300px]` on small screens with scroll.
- **Cards**: `sheet-theme-*` classes apply background and accent colors from template config
- **Designer Canvas**: Center-aligned canvas with grid background, layer outlines on selection

## Z-Index Layering

Three-tier convention:
- **z-50**: In-page modals (TemplateLibrary, ImportWizard)
- **z-[60]**: Full-screen overrides (mobile preview overlay, CookieConsent banner)
- **z-[70]+**: Reserved for future use (toasts, notifications)

This prevents overlap issues caused by `backdrop-filter` creating stacking contexts on parent elements.

## Responsive Patterns

- **Breakpoints**: Use Tailwind defaults (`sm: 640px`, `md: 768px`, `lg: 1024px`)
- **Flex/Float layouts**: Default to `flex-col` on mobile, switch to `flex-row` at breakpoint (e.g., `lg:flex-row`)
- **Modals**: Full-width on mobile with `p-2 sm:p-4`, auto-height with `max-h-[90vh]`
- **Overlay preview**: Uses `z-[60]` to appear above all other elements, with scrollable content area
- **Buttons**: Padding reduced on mobile (`p-3` → `p-2`), icon-only actions use `grid-cols-3` on small screens
- **Scrollbars**: Custom thin scrollbar via `.custom-scrollbar` class for overflow containers
