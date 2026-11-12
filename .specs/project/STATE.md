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
- **2026-11-12** — App runs locally only for now (no remote repository, no deploy).
- **2026-11-12** — `cacheComponents` disabled: it requires the Node runtime and conflicts with `output: 'export'`.
- **2026-11-12** — Emotion SSR registry (`useServerInsertedHTML`) added to fix hydration error #418 from Chakra styles.
- **2026-11-12** — Navigation flyouts built as a custom WAI-ARIA disclosure hook (hover + keyboard), not Chakra `Menu`.
- **2026-11-12** — JSON uses an own recursive-descent parser to keep big numbers and report duplicate keys with positions; worker above 100 KB.
- **2026-11-12** — XML: `fast-xml-validator` for well-formedness plus an own multiple-root check (the validator accepts several roots); `fast-xml-builder` for beautify. HTML entities such as `&nbsp;` are accepted by the validator.
- **2026-11-12** — XML beautify drops processing-instruction contents (builder limitation) and shows a notice when that happens.
- **2026-11-12** — XSD inference narrows types incrementally (no sample storage) and falls back to a repeatable `xs:choice` when sibling order varies. Generation always runs in a Web Worker.
- **2026-11-12** — Connection string: empty port = engine default; Oracle URI omits credentials; Redis allows password-only userinfo.

## Blockers

- None.

## Open Questions

- Remote repository host (GitHub vs Cursor-hosted) — not yet created.

## Todos

- M1 complete locally. Next: choose remote host and deploy target, then plan M2.

## Deferred Ideas

- JSON Schema validation, XSD-based XML validation (WASM), connection string parser/converter, persistence, shareable URLs, light theme, i18n, command palette, PWA.

## Lessons

- Chakra + Emotion in the App Router needs an SSR style registry, otherwise the first render hydrates with mismatched styles.
- `xs:sequence` inferred from first appearance breaks on documents with varying child order; verify generated schemas with `xmllint`.
- Audit accessibility with axe/Lighthouse on the production build: fieldset legends do not count as headings for heading order.

## Preferences

- Model guidance tip: not yet shown.
