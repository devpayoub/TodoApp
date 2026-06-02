# VRcafe Haarlem – Todo App (Astro)

## Context and Goals

This document defines the UI design system and architectural structure for a Todo application inspired by VRcafe Haarlem.

The goal is to strictly reuse the VRcafe Haarlem design language while applying it to a functional Todo app built in Astro.

The system must:
- Preserve the original VRcafe design tokens
- Enforce consistency and accessibility
- Support modular frontend architecture
- Be implementation-ready

---

# Design System (VRcafe Haarlem – ORIGINAL TOKENS)

## Brand

- Product/brand: VRcafe Haarlem
- URL: https://www.vrcafehaarlem.nl/en/
- Audience: readers and knowledge seekers
- Product surface: content site adapted into Todo app UI

---

## Style Foundations

- Visual style: clean, functional, implementation-oriented

### Typography
- font.family.primary = Rubik
- font.family.stack = Rubik, serif
- font.size.base = 16px
- font.weight.base = 400
- font.lineHeight.base = 24px

### Typography Scale
- xs = 15px
- sm = 16px
- md = 19.2px
- lg = 20px
- xl = 22px
- 2xl = 22.4px
- 3xl = 23.2px
- 4xl = 24px

---

### Color Palette (STRICT TOKENS – DO NOT MODIFY)

- color.text.primary = #ffffff
- color.surface.base = #000000
- color.text.tertiary = #36f2aa
- color.text.inverse = oklch(0.705 0.213 47.604)
- color.surface.muted = #c267ff

---

### Spacing Scale

- space.1 = 4px
- space.2 = 12px
- space.3 = 16px
- space.4 = 24px
- space.5 = 32px
- space.6 = 40px

---

### Radius & Motion

- radius.xs = 6px
- motion.instant = 150ms
- motion.fast = 300ms

---

## Accessibility (NON-NEGOTIABLE)

- WCAG 2.2 AA compliance required
- Keyboard-first interaction required
- Focus-visible must always be visible
- Contrast must remain sufficient in all states

---

## Writing Tone

- Concise
- Functional
- Implementation-focused

---

## Rules: DO

- Use semantic design tokens only
- Every component must define all states:
  default, hover, focus-visible, active, disabled, loading, error
- Responsive behavior must be defined for all components
- Keyboard, pointer, and touch interactions must be specified
- All UI states must be testable

---

## Rules: DON'T

- Do not use raw hex values in components (except token source)
- Do not introduce one-off spacing or typography
- Do not hide focus indicators
- Do not use ambiguous labels
- Do not ship incomplete state definitions

---

# Todo App Component System (Built on VRcafe Design)

## Layout Structure

### Desktop
- Left sidebar: Categories
- Right panel: Tasks

### Mobile
- Single column layout
- Categories collapse into dropdown

---

## Core Components

### TodoApp (Root)
- Composes entire system
- Connects state + UI
- Must not contain business logic

---

### TodoInput

Purpose:
- Create new tasks

States:
- default
- hover
- focus-visible
- active
- disabled
- error (empty input)

Behavior:
- Enter submits task
- Button click submits task
- Empty submission blocked

Accessibility:
- Must have label or aria-label
- Must support keyboard-only interaction

---

### Category System

Categories:
- Werk
- Persoonlijk
- Vrije tijd

States:
- default
- active
- focus-visible
- disabled

Behavior:
- Category selection filters or assigns tasks
- Must persist selection state

---

### TodoList

Behavior:
- Group tasks by category
- Render dynamically per category
- Support empty state per category

Edge cases:
- No tasks → show EmptyState component

---

### TodoItem

Actions:
- toggle completion
- delete task

States:
- default
- completed
- hovered
- focused
- deleting (animated removal)

Keyboard:
- Enter / Space → toggle complete
- Delete → remove task

---

## Data & Persistence Rules

- Must use localStorage
- Must persist:
  - tasks
  - categories
  - completion state
- State must survive refresh

---

## Accessibility Requirements

Must ensure:
- Full keyboard navigation
- Visible focus indicators at all times
- Screen reader compatibility
- Semantic HTML usage
- No color-only meaning

---

## Anti-Patterns

- Mixing UI + storage logic
- Hardcoding colors outside tokens
- Missing empty states
- Missing focus-visible states
- Non-responsive layouts
- Unstructured component logic

---

## QA Checklist

- [ ] Can add tasks
- [ ] Can delete tasks
- [ ] Can toggle completion
- [ ] Categories work correctly
- [ ] Data persists on refresh
- [ ] UI works on mobile
- [ ] Keyboard navigation works fully
- [ ] Focus states visible everywhere
- [ ] Empty states implemented
- [ ] VRcafe design tokens respected