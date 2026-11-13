# Belt

**Vision:** A fast, beautiful, 100% client-side Swiss army knife for developers — beautifiers, validators, transformations and helpers in one place, complementing (not copying) transform.tools.
**For:** Software developers (starting with the author's own daily workflow) who need quick, trustworthy data utilities without sending data to a server.
**Solves:** Everyday utilities are scattered across many sites, often with poor UX, ads, or server round-trips that leak sensitive data (credentials, payloads). Belt groups them under one consistent, accessible, private UI.

## Goals

- Every tool runs entirely in the browser: zero network requests carrying user input (verifiable via DevTools Network tab).
- Heavy processing never blocks the UI: typing in the editor stays responsive (no long tasks > 50ms on the main thread) for inputs up to 5 MB.
- WCAG 2.2 AA compliance across the app (contrast, keyboard navigation, focus visibility); Lighthouse Accessibility score ≥ 95.
- Adding a new tool requires only: a tool module + one registry entry (no edits to navigation, home or routing code).

## Tech Stack

**Core:**

- Framework: Next.js 16.4 (App Router, static export — `output: 'export'`)
- Language: TypeScript 5 (strict mode)
- UI runtime: React 19
- UI components: Chakra UI 3 (`@chakra-ui/react` + `@emotion/react`) — primary component library and design tokens
- Styling: Chakra style props/recipes first; Emotion (already a Chakra dependency) or plain CSS for granular cases (e.g. CodeMirror theming). No Tailwind in v1.
- Database: none (no persistence, no backend)

**Key dependencies:**

- `@uiw/react-codemirror` / CodeMirror 6 (+ `@codemirror/lang-json`, `lang-javascript`, `lang-xml`, `@codemirror/lint`) — all code blocks
- `prettier/standalone` (+ babel/estree plugins) — JSX beautify, executed in a Web Worker
- `fast-xml-parser` — XML validation with line/column and XML parsing for XSD inference
- Vitest + Testing Library — unit and component tests

**Optional (evaluated per feature):** WebAssembly libraries (e.g. libxml2 compiled to WASM) only where they bring clear value (e.g. XSD-based validation in a later milestone).

## Design Language

- **Primary:** Blue `#0131CD` — brand, primary surfaces, active states
- **Text:** White `#FFFFFF` — main foreground on blue/dark surfaces
- **Highlight:** Green `#B9FC01` — CTAs, focus rings, active indicators
- **Theme:** dark only (v1), backgrounds derived from the primary blue (deep navy tones)
- **Contrast rules (mandatory):**
  - White on `#0131CD` ≈ 9:1 ✅ (AAA)
  - Green on `#0131CD` ≈ 7.3:1 ✅ (AAA)
  - Blue text on green background ≈ 7.3:1 ✅ — green buttons use blue/dark text
  - Green on white ≈ 1.25:1 ❌ — never use green text on light backgrounds
- Brand colors are defined once as Chakra theme tokens (consumed as Chakra CSS variables by Emotion/plain CSS), never hard-coded.
- Navigation: top bar with grouped menus (**Beautify**, **Validation**, **Transformations**, **Helpers**) plus a **Links** menu with curated external sites (transform.tools, webhook.cool); hovering or focusing a group opens a floating panel listing its items.
- Home: top menu, centered hero (project name + tagline about being the developer's pocket knife) showcasing all brand colors, and two featured links below (JSON Beautify, XML → XSD).

## Scope

**v1 includes:**

- App shell: top navigation with grouped flyout menus, "Links" menu (transform.tools, webhook.cool — new tab), home page with hero and featured links
- Beautify: JSON Beautify, JSX Beautify
- Validation: JSON Validation, XML Validation
- Transformations: XML → XSD
- Helpers: Connection String URI Builder for PostgreSQL, MySQL, MongoDB, Redis, Oracle, ClickHouse and SQL Server (with common params suggestions and automatic percent-encoding warnings)
- English-only UI

**Explicitly out of scope:**

- Any backend, API route, database, analytics of user input, or accounts
- Persisting user input (localStorage, URL sharing) — revisit later
- Light theme and theme toggle
- Internationalization (i18n)
- Duplicating tools already well-served by transform.tools

## Constraints

- Technical: 100% frontend, statically exportable; no Server Actions or Route Handlers processing user data.
- Technical: CPU-heavy transformations run in Web Workers.
- Technical: Chakra UI (Emotion) requires a client-side provider; keep it in a single `'use client'` providers component so pages/layouts stay Server Components.
- Technical: Tailwind is excluded for now; reconsider only if Chakra + Emotion/plain CSS styling becomes complex.
- Code quality: SOLID, YAGNI, DRY, Next.js best practices (Server Components by default, `'use client'` only at interactive leaves), human-readable code.
- Code style: follow project lint/prettier config; single quotes; named functions; screen logic extracted to a hook named after the screen.
- Resources: single developer (author).
