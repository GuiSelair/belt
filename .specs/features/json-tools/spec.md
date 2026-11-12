# JSON Tools Specification

Routes: `/beautify/json` (JSON Beautify) and `/validation/json` (JSON Validation).

## Problem Statement

Developers constantly receive minified or malformed JSON from logs, APIs and configs. They need to quickly format it for reading and to pinpoint exactly where it is broken, without pasting sensitive payloads into server-backed sites.

## Goals

- [x] Format a 5 MB JSON without freezing the UI (processing off the main thread above a size threshold).
- [x] Every syntax error reports line and column and is highlighted in the editor.

## Out of Scope

| Feature                      | Reason                                  |
| ---------------------------- | --------------------------------------- |
| JSON Schema validation       | Deferred to M2                          |
| JSON → other formats         | Already covered by transform.tools      |
| JSON5 / JSONC (comments)     | YAGNI for v1; strict JSON only          |
| Auto-repair of invalid JSON  | Ambiguous results; not requested        |

---

## User Stories

### P1: Beautify JSON ⭐ MVP

**User Story**: As a developer, I want to paste JSON and get it formatted so that I can read it.

**Why P1**: Core tool.

**Acceptance Criteria**:

1. WHEN the user types/pastes valid JSON THEN the system SHALL display formatted output (debounced, ~300ms) in a read-only JSON editor.
2. WHEN the user selects indentation (2 spaces, 4 spaces, tab) THEN the system SHALL re-format using that indentation. Default: 2 spaces.
3. WHEN the user activates "Minify" THEN the system SHALL output the JSON on a single line without whitespace.
4. WHEN the input is invalid THEN the system SHALL keep the last valid output visibly marked as stale and show the error with line/column.
5. WHEN the input exceeds the worker threshold (e.g. 100 KB) THEN the system SHALL process it in a Web Worker and show a loading indicator.

**Independent Test**: Paste minified JSON, toggle indent options and Minify; verify outputs.

---

### P1: Validate JSON ⭐ MVP

**User Story**: As a developer, I want to know if my JSON is valid and exactly where it breaks so that I can fix it fast.

**Why P1**: Core tool.

**Acceptance Criteria**:

1. WHEN the input is valid THEN the system SHALL show a success status ("Valid JSON") plus summary (root type, number of keys/items, size in bytes).
2. WHEN the input is invalid THEN the system SHALL show error message, line and column, and underline the position in the editor via CodeMirror lint diagnostics.
3. WHEN the user activates the error message THEN the editor SHALL move the cursor to the error position.
4. WHEN the input is empty THEN the system SHALL show a neutral state (no error).

**Independent Test**: Paste `{"a": 1,}` and verify error line/column and editor highlight.

---

### P2: Sort keys

**User Story**: As a developer, I want to sort object keys alphabetically so that I can compare JSON documents.

**Acceptance Criteria**:

1. WHEN "Sort keys" is enabled THEN the system SHALL recursively sort object keys in the beautified output, preserving array order.

**Independent Test**: Beautify `{"b":1,"a":{"d":1,"c":2}}` with sort enabled.

---

## Edge Cases

- WHEN the input has a BOM or leading/trailing whitespace THEN the system SHALL ignore it.
- WHEN numbers exceed `Number.MAX_SAFE_INTEGER` THEN the system SHALL preserve their original digits in the output (no precision loss).
- WHEN the input is a primitive (`"text"`, `42`, `null`) THEN the system SHALL treat it as valid JSON.
- WHEN duplicate keys exist THEN validation SHALL warn (not error) indicating the key and line.

---

## Requirement Traceability

| Requirement ID | Story                         | Task | Status |
| -------------- | ----------------------------- | ------ | ------- |
| JSON-01        | P1: Beautify (indent options) | T8, T9 | Verified |
| JSON-02        | P1: Minify                    | T8, T9 | Verified |
| JSON-03        | P1: Worker for large input    | T8, T9 | Verified |
| JSON-04        | P1: Validation status/summary | T8, T9 | Verified |
| JSON-05        | P1: Error line/col + lint     | T8, T9 | Verified |
| JSON-06        | P1: Big number preservation   | T8, T9 | Verified |
| JSON-07        | P2: Sort keys                 | T8, T9 | Verified |
| JSON-08        | P2: Duplicate keys warning    | T8, T9 | Verified |

**Coverage:** 8 total, 8 mapped to tasks, 0 unmapped ✅

---

## Success Criteria

- [x] 5 MB JSON formats with UI remaining responsive.
- [x] Error position matches the real syntax error in 100% of test fixtures.
