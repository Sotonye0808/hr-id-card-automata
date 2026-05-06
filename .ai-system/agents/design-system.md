# Design System

> **Overview:** HR ID Card Automata uses a warm paper-like visual language with compact editorial controls and a sample-sheet preview that feels like a printable document rather than a dashboard. The interface should stay fast and simple on desktop while collapsing into icon-first controls and an overlay-based preview on mobile. Agents building UI must treat the preview sheet as the primary artifact and the controls as supporting tools.

---

## Visual Language

> **Section summary:** Core visual identity — colours, typography, spacing.

### Colour Palette

| Token        | Value   | Usage                       |
| ------------ | ------- | --------------------------- |
| primary      | #0f766e | buttons, links, CTAs        |
| secondary    | #d97706 | accents, highlights         |
| background   | #f3efe6 | page background             |
| surface      | #fffaf0 | cards, modals               |
| text-primary | #172033 | main body text              |
| text-muted   | #627086 | labels, captions            |
| danger       | #dc2626 | errors, destructive actions |
| success      | #16a34a | confirmations               |

### Typography

| Style     | Font               | Size           | Weight  |
| --------- | ------------------ | -------------- | ------- |
| Heading 1 | Cormorant Garamond | 2.25rem+       | 700-900 |
| Heading 2 | Manrope            | 1.25rem-1.5rem | 700-800 |
| Body      | Manrope            | 0.9rem-1rem    | 400-600 |
| Caption   | Manrope            | 0.7rem-0.8rem  | 700-800 |
| Code      | IBM Plex Mono      | 0.75rem-0.9rem | 400-600 |

### Spacing Scale

4px base unit: 4, 8, 12, 16, 24, 32, 48, 64

---

## Component Patterns

> **Section summary:** Standard UI components used across the project. New components should follow these patterns before inventing new ones.

### Buttons

- Primary: filled accent pill for export and commit-style actions.
- Secondary: outlined pill for add, duplicate, import, and navigation actions.
- Destructive: red outlined or filled button for removal actions, with confirmation where data loss is likely.
- Disabled state: reduced opacity, no hover lift, and clear aria-disabled semantics.

### Forms

- Input fields: rounded, high-contrast, full-width, with visible focus rings and compact labels.
- Error messages: inline beneath the affected control, concise, and action-oriented.
- Submit buttons: show progress text and disable while export or persistence is running.

### Navigation

- Desktop uses a sticky top bar plus a segmented panel switcher.
- Mobile collapses header actions into a menu and keeps the main workflow in a single vertical stack.
- Mobile preview opens as a dismissible overlay instead of forcing a long scroll.

### Cards / Containers

- Use rounded 24-28px containers with soft borders, subtle shadow, and light paper-like backgrounds.
- The preview container should preserve page proportions and allow internal scrolling for overflow.

### Modals / Dialogs

- Use overlays for mobile preview and any future full-screen picker flows.
- Dismiss with an obvious close control, outside click where appropriate, and keyboard escape.

---

## UX Principles

> **Section summary:** Guiding rules for how the interface should feel and behave.

1. [e.g. Always show loading state for async actions]
2. Destructive actions require confirmation when records can be lost.
3. Error messages must explain what the user can do to fix the problem.
4. Mobile-first layouts must remain usable at 320px wide.
5. Keep the preview sheet visible and proportionally accurate even when controls are collapsed.
6. Icon-first controls are acceptable on mobile when labels would make the toolbar too dense.

---

## Responsive Breakpoints

| Breakpoint | Value         | Target       |
| ---------- | ------------- | ------------ |
| sm         | [e.g. 640px]  | Mobile       |
| md         | [e.g. 768px]  | Tablet       |
| lg         | [e.g. 1024px] | Desktop      |
| xl         | [e.g. 1280px] | Wide screens |

---

## Accessibility Requirements

> **Section summary:** Minimum accessibility standards to follow.

- All interactive elements must have keyboard focus states
- Colour contrast must meet WCAG AA (4.5:1 for text)
- Images must have alt text
- Forms must have associated labels
