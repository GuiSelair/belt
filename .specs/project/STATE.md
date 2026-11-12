# State

## Decisions

- **2026-11-12** — Project name: **Kanivete**. Location: `~/Documents/kanivete`.
- **2026-11-12** — UI language: English only (v1).
- **2026-11-12** — Theme: dark only (v1), based on primary blue `#0131CD`.
- **2026-11-12** — Connection String engines: PostgreSQL, MySQL, MongoDB, Redis, Oracle (Easy Connect Plus), ClickHouse, SQL Server (`sqlserver://`). URI format only in v1 (W3C defines no connection string formats; each engine/driver defines its own). Other formats deferred to M2.
- **2026-11-12** — Connection String v1 = builder (with suggested common params like `sslmode`) + automatic percent-encoding that warns the user. Parser and format conversion deferred to M2.
- **2026-11-12** — Framework: Next.js 16.4 (latest stable at the time), App Router, static export.
- **2026-11-12** — Code editor: CodeMirror 6 via `@uiw/react-codemirror`.
- **2026-11-12** — UI library: Chakra UI 3 (replaces shadcn/Radix).
- **2026-11-12** — No Tailwind for now: granular styling via Emotion (e.g. CodeMirror) or plain CSS. Reconsider Tailwind only if styling becomes complex.
- **2026-11-12** — Home: top menu + centered hero (name, tagline, all brand colors) + 2 featured links (JSON Beautify, XML → XSD). Full catalog removed from home.
- **2026-11-12** — Header gets a "Links" menu for external sites: transform.tools and webhook.cool (new tab).

## Blockers

- None.

## Open Questions

- Remote repository host (GitHub vs Cursor-hosted) — not yet created.
- Hover-to-open flyout with Chakra: Chakra `Menu` opens on click by default; evaluate `HoverCard`/`Popover` or controlled `Menu` keeping keyboard a11y — resolve in Design.

## Todos

- Approve specs → Design phase for App Shell (registry + layout architecture).

## Deferred Ideas

- JSON Schema validation, XSD-based XML validation (WASM), connection string parser/converter, persistence, shareable URLs, light theme, i18n, command palette, PWA.

## Lessons

- (none yet)

## Preferences

- Model guidance tip: not yet shown.
