# M1 Tasks

Gate commands: **quick** = `npm test`; **build** = `npm run lint && npm run typecheck && npm test && npm run build`.

| ID | Task | Requirements | Depends on | Tests | Gate | Status |
| --- | --- | --- | --- | --- | --- | --- |
| T1 | Project tooling: Next config (static export), Prettier, EditorConfig, Vitest, scripts | — | — | none | build | Pending |
| T2 | Chakra system (tokens, semantic tokens, globalCss) + AppProviders + root layout | SHELL-08, SHELL-11 | T1 | none | build | Pending |
| T3 | Registry (groups, tools, external links, selectors, buildNavSections) | SHELL-01, SHELL-04.2/5 | T1 | unit | quick | Pending |
| T4 | Header navigation: desktop flyouts, Links menu, mobile drawer, skip link | SHELL-02, SHELL-03, SHELL-04 | T2, T3 | component | quick | Pending |
| T5 | Home hero + featured links + 404 | SHELL-05, SHELL-09, SHELL-10 | T3, T4 | component | quick | Pending |
| T6 | Shared libs (worker client, latest task, debounce, clipboard, text position, download) | SHELL-06 | T1 | unit | quick | Pending |
| T7 | Tool layout + CodeEditor + editor theme | SHELL-06, SHELL-07 | T2, T6 | none | build | Pending |
| T8 | JSON lib (parser, printer, format, summary) | JSON-01/02/04/05/06/07/08 | T6 | unit | quick | Pending |
| T9 | JSON Beautify + JSON Validation screens + worker | JSON-01..08 | T7, T8 | none | build | Pending |
| T10 | JSX lib + worker + screen | JSX-01..06 | T7 | unit | build | Pending |
| T11 | XML lib (validate, summary, beautify) + XML Validation screen | XML-01..03 | T7 | unit | build | Pending |
| T12 | XSD inference + writer + worker + XML → XSD screen | XSD-01..08 | T11 | unit | build | Pending |
| T13 | Connection string lib (engines, encode, build, validate, switch) | CONN-01..13 | T6 | unit | quick | Pending |
| T14 | Connection string screen | CONN-01..13 | T7, T13 | none | build | Pending |
