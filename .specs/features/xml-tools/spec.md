# XML Tools Specification

Routes: `/validation/xml` (XML Validation) and `/transformations/xml-to-xsd` (XML → XSD).

## Problem Statement

Integrations (SOAP, NF-e, legacy systems, config files) still rely on XML. Developers need to check well-formedness quickly and bootstrap an XSD from a sample document instead of writing the schema by hand.

## Goals

- [x] Validation errors report line/column for 100% of malformed fixtures.
- [x] Generated XSD is itself valid XML Schema and validates the source XML.

## Out of Scope

| Feature                             | Reason                                    |
| ----------------------------------- | ----------------------------------------- |
| Validating XML against a given XSD  | Deferred to M2 (WASM / libxml2)           |
| DTD validation                      | Legacy; YAGNI                             |
| XSD from multiple samples merged    | YAGNI for v1                              |
| XML → JSON and similar conversions  | Covered by transform.tools                |

---

## User Stories

### P1: Validate XML well-formedness ⭐ MVP

**User Story**: As a developer, I want to know if my XML is well-formed and where it breaks so that I can fix it.

**Why P1**: Core tool.

**Acceptance Criteria**:

1. WHEN the input is well-formed THEN the system SHALL show "Valid XML" plus summary (root element, element count, max depth, namespaces found).
2. WHEN the input is malformed THEN the system SHALL show message, line and column and highlight the position via CodeMirror lint diagnostics.
3. WHEN the user activates the error message THEN the editor SHALL move the cursor to the error position.
4. WHEN the user activates "Beautify" THEN the system SHALL output the XML indented (2 spaces default), preserving comments and CDATA.

**Independent Test**: Paste `<a><b></a>` and verify error position.

---

### P1: Generate XSD from XML ⭐ MVP

**User Story**: As a developer, I want to generate an XSD from a sample XML so that I can start a schema without writing it from scratch.

**Why P1**: Core differentiator tool.

**Acceptance Criteria**:

1. WHEN the user provides well-formed XML THEN the system SHALL generate an XSD (in a Web Worker) and show it in a read-only XML editor.
2. WHEN an element repeats under the same parent THEN the generated XSD SHALL set `maxOccurs="unbounded"`.
3. WHEN an element is absent in some occurrences of its parent THEN the XSD SHALL set `minOccurs="0"`.
4. WHEN text/attribute values are consistent THEN the system SHALL infer types: `xs:boolean`, `xs:integer`, `xs:decimal`, `xs:date`, `xs:dateTime`, falling back to `xs:string`.
5. WHEN elements have attributes THEN the XSD SHALL declare them with inferred types; `use="required"` when present in every occurrence, otherwise optional.
6. WHEN an element has both attributes and text THEN the XSD SHALL use `xs:simpleContent` with `xs:extension`.
7. WHEN the user selects the design style THEN the system SHALL support "Russian doll" (nested, default) and "Salami slice" (global elements with `ref`).
8. WHEN the root element declares a default namespace THEN the XSD SHALL set `targetNamespace` and `elementFormDefault="qualified"`.
9. WHEN the input is malformed THEN the system SHALL show the validation error instead of generating.
10. WHEN the user activates "Download" THEN the system SHALL download the XSD as `schema.xsd` (client-side Blob).

**Independent Test**: Generate an XSD from a sample with repeated elements and attributes; validate the sample against it with an external tool (e.g. xmllint) in tests fixtures.

---

### P2: Sequence vs all ordering option

**User Story**: As a developer, I want to choose `xs:sequence` or `xs:all` so that child order rules match my needs.

**Acceptance Criteria**:

1. WHEN the user selects "Strict order" (default) THEN the XSD SHALL use `xs:sequence`; WHEN "Any order" THEN `xs:all` where XSD rules allow it (falling back to sequence with a notice when children repeat).

**Independent Test**: Toggle the option and check the compositor.

---

## Edge Cases

- WHEN the XML has a prolog, comments or processing instructions THEN they SHALL be ignored for inference.
- WHEN an element is empty in all occurrences THEN the type SHALL be an empty `xs:complexType` (or `xs:string` if it has no attributes — documented choice).
- WHEN mixed content exists (text + child elements) THEN the XSD SHALL use `mixed="true"`.
- WHEN prefixed namespaces other than the default exist THEN the system SHALL show a notice that only the default namespace is mapped in v1.
- WHEN input exceeds 5 MB THEN the system SHALL warn that processing may take longer, still running in the worker.

---

## Requirement Traceability

| Requirement ID | Story                              | Task | Status |
| -------------- | ---------------------------------- | ------ | ------- |
| XML-01         | P1: Well-formedness + summary      | T11 | Verified |
| XML-02         | P1: Error line/col + lint          | T11 | Verified |
| XML-03         | P1: XML beautify                   | T11 | Verified |
| XSD-01         | P1: XSD generation in worker       | T12 | Verified |
| XSD-02         | P1: Occurrence inference           | T12 | Verified |
| XSD-03         | P1: Type inference                 | T12 | Verified |
| XSD-04         | P1: Attributes / simpleContent     | T12 | Verified |
| XSD-05         | P1: Russian doll / Salami slice    | T12 | Verified |
| XSD-06         | P1: Default namespace handling     | T12 | Verified |
| XSD-07         | P1: Download .xsd                  | T12 | Verified |
| XSD-08         | P2: sequence vs all                | T12 | Verified |

**Coverage:** 11 total, 11 mapped to tasks, 0 unmapped ✅

---

## Success Criteria

- [x] Every generated XSD in fixtures validates its source XML.
- [x] Type inference matches expectations on all fixtures.
