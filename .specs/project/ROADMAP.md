# Roadmap

**Current Milestone:** M1 — Foundation & MVP Tools
**Status:** Planning

---

## M1 — Foundation & MVP Tools

**Goal:** A deployable static site with the full navigation shell and all six v1 tools working client-side.
**Target:** All P1 acceptance criteria of the specs below verified; Lighthouse Accessibility ≥ 95.

### Features

**App Shell** (`.specs/features/app-shell/spec.md`) - PLANNED

- Chakra UI 3 provider + theme tokens; Emotion/plain CSS for granular styles (e.g. CodeMirror)
- Tool registry as single source of truth (routes, menu, featured links)
- Top navigation with grouped hover/focus flyout menus + mobile menu
- "Links" menu with external sites (transform.tools, webhook.cool — new tab)
- Home page: centered hero with name, tagline, all brand colors, featured links (JSON Beautify, XML → XSD)
- Shared tool layout (input/output editors, toolbar, status/error area)
- CodeMirror dark theme following brand colors

**JSON Tools** (`.specs/features/json-tools/spec.md`) - PLANNED

- JSON Beautify (indent options, minify)
- JSON Validation (error with line/column, inline editor diagnostics)

**JSX Beautify** (`.specs/features/jsx-beautify/spec.md`) - PLANNED

- Prettier-based formatting in a Web Worker with common options

**XML Tools** (`.specs/features/xml-tools/spec.md`) - PLANNED

- XML Validation (well-formedness, line/column diagnostics)
- XML → XSD (schema inference from sample XML, in a Web Worker)

**Connection String Builder** (`.specs/features/connection-string-builder/spec.md`) - PLANNED

- Form-based URI builder for PostgreSQL, MySQL, MongoDB, Redis, Oracle, ClickHouse, SQL Server
- Suggested common params per engine (e.g. `sslmode`)
- Automatic percent-encoding with user warning

---

## M2 — Power Features

**Goal:** Deepen existing tools.

### Features

**JSON Schema Validation** - PLANNED
**XML validation against XSD (WASM, e.g. libxml2)** - PLANNED
**Connection String Parser** (paste URI → editable fields) - PLANNED
**Connection String format conversion** (URI ↔ JDBC / ADO.NET / key-value) - PLANNED

---

## Future Considerations

- Optional local persistence of last input per tool
- Shareable URLs (state encoded in hash, never sent to a server)
- Light theme + toggle
- i18n (pt-BR)
- Command palette (⌘K) for tool search
- Full tool catalog on home (if the number of tools grows)
- PWA / offline support
