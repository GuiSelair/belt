# Kanivete

The developer's Swiss army knife: a 100% client-side toolbox that runs
entirely in the browser. Nothing you paste is stored or sent anywhere.

## Tools

| Group           | Tool                      | Route                         |
| --------------- | ------------------------- | ----------------------------- |
| Beautify        | JSON Beautify / Minify    | `/beautify/json`              |
| Beautify        | JSX Beautify (Prettier)   | `/beautify/jsx`               |
| Beautify        | XML Beautify              | `/beautify/xml`               |
| Validation      | JSON Validation           | `/validation/json`            |
| Validation      | XML Validation            | `/validation/xml`             |
| Transformations | XML to XSD                | `/transformations/xml-to-xsd` |
| Helpers         | Connection String Builder | `/helpers/connection-string`  |

The header also links to [transform.tools](https://transform.tools) and
[webhook.cool](https://webhook.cool). Each tool does one job and links to
its related tools (for example, JSON Validation links to JSON Beautify).

## Stack

Next.js 16 (App Router, static export), React 19, TypeScript, Chakra UI 3,
CodeMirror 6, Web Workers for heavy processing, Vitest + Testing Library.

## Running locally

Requires Node.js 24.

```bash
npm install
npm run dev          # http://localhost:3000
```

To run the production build, export the static site and serve the `out`
folder with any static file server:

```bash
npm run build
npx serve out
```

## Scripts

| Script              | Description                   |
| ------------------- | ----------------------------- |
| `npm run dev`       | Development server            |
| `npm run build`     | Static export to `out/`       |
| `npm run lint`      | ESLint                        |
| `npm run typecheck` | Route type generation + `tsc` |
| `npm test`          | Unit and component tests      |
| `npm run format`    | Prettier                      |

XSD tests validate the generated schemas with `xmllint` when it is installed
(it ships with macOS).

## Project structure

```text
src/
  app/            routes (thin pages that render a feature screen)
  components/     shared UI: navigation, editor, tool layout, form fields
  features/       one folder per tool: lib (pure logic), workers, screens
  lib/            shared hooks and the Web Worker client
  registry/       tools, groups and external links (single source of truth)
  theme/          Chakra system: tokens and semantic tokens
```

Specs, designs and decisions live in `.specs/`.

To add a tool, create its feature folder and route, then add one entry to
`src/registry/tools.ts`; the menu picks it up automatically.
