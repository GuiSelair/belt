# JSX Beautify Specification

Route: `/beautify/jsx`

## Problem Statement

JSX snippets copied from DevTools, docs, AI outputs or minified bundles are hard to read. Developers need Prettier-quality formatting on the fly without setting up a local project.

## Goals

- [x] Output is identical to Prettier's for the same options.
- [x] Formatting never blocks typing (runs in a Web Worker).

## Out of Scope

| Feature                          | Reason                               |
| -------------------------------- | ------------------------------------ |
| Linting / ESLint rules           | Different concern                    |
| Other languages (CSS, HTML, ...) | YAGNI for v1                         |
| JSX → other formats              | Covered by transform.tools           |

---

## User Stories

### P1: Format JSX/TSX ⭐ MVP

**User Story**: As a developer, I want to paste JSX (or TSX) and get it beautifully formatted so that I can read and reuse it.

**Why P1**: Core tool.

**Acceptance Criteria**:

1. WHEN the user types/pastes JSX THEN the system SHALL format it with Prettier (standalone) inside a Web Worker and display it in a read-only editor (debounced ~300ms).
2. WHEN the user toggles "TypeScript" THEN the system SHALL parse the input as TSX (typescript parser) instead of babel.
3. WHEN the input has a syntax error THEN the system SHALL show Prettier's message with line/column and keep the last output marked as stale.
4. WHEN the Prettier bundle is loading for the first time THEN the system SHALL show a loading indicator and SHALL NOT load it on pages other than this tool (code splitting).
5. WHEN the input is a JSX fragment without wrapper (e.g. two sibling elements) THEN the system SHALL inform the user that a single root/fragment is required.

**Independent Test**: Paste a one-line component and verify formatted output with default options.

---

### P1: Formatting options ⭐ MVP

**User Story**: As a developer, I want to adjust common Prettier options so that the output matches my project style.

**Why P1**: Different teams use different styles.

**Acceptance Criteria**:

1. WHEN the user changes options THEN the system SHALL re-format with: print width (80/100/120), tab width (2/4), use tabs, single quotes, JSX single quotes, semicolons, trailing commas (all/es5/none), bracket same line.
2. WHEN the page loads THEN options SHALL default to Prettier defaults.

**Independent Test**: Toggle "single quotes" and verify string quotes change.

---

## Edge Cases

- WHEN the worker crashes or times out (> 5s) THEN the system SHALL terminate it, show an error and recreate it on next input.
- WHEN a new input arrives while formatting THEN the system SHALL discard stale results (only the latest request is rendered).
- WHEN input is empty THEN output SHALL be empty with no error.

---

## Requirement Traceability

| Requirement ID | Story                        | Task | Status |
| -------------- | ---------------------------- | ------ | ------- |
| JSX-01         | P1: Format in worker         | T10 | Verified |
| JSX-02         | P1: TSX support              | T10 | Verified |
| JSX-03         | P1: Syntax error reporting   | T10 | Verified |
| JSX-04         | P1: Lazy-load Prettier       | T10 | Verified |
| JSX-05         | P1: Formatting options       | T10 | Verified |
| JSX-06         | P1: Worker resilience        | T10 | Verified |

**Coverage:** 6 total, 6 mapped to tasks, 0 unmapped ✅

---

## Success Criteria

- [x] Output matches Prettier CLI for all test fixtures.
- [x] Prettier code is absent from the home page bundle.
