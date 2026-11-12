# App Shell Specification

## Problem Statement

Every tool needs a consistent, accessible frame: discoverable navigation, a shared editor experience and a predictable layout. Without a shared shell, each tool would re-implement layout, menus and editor setup (violating DRY) and adding tools would require touching many files.

## Goals

- [ ] Any tool is reachable from any page in ≤ 2 interactions (hover/focus group → click tool).
- [ ] Adding a tool requires only a tool module + one registry entry.
- [ ] Full keyboard operability of navigation and editors; Lighthouse Accessibility ≥ 95.

## Out of Scope

| Feature                         | Reason                       |
| ------------------------------- | ---------------------------- |
| Light theme / theme toggle      | Dark-only decision for v1    |
| i18n                            | English-only decision for v1 |
| Search / command palette        | Deferred (Future)            |
| Persisting editor content       | No persistence in v1         |

---

## User Stories

### P1: Tool registry ⭐ MVP

**User Story**: As a maintainer, I want a single registry describing every tool (id, name, description, group, route, icon) so that navigation, home catalog and routes are derived from one source.

**Why P1**: Foundation for Open/Closed principle and DRY across the app.

**Acceptance Criteria**:

1. WHEN a tool is added to the registry THEN the system SHALL list it in its group menu without any other code change.
2. WHEN the registry defines groups THEN the system SHALL render them in the order: Beautify, Validation, Transformations, Helpers.
3. WHEN a group has no tools THEN the system SHALL NOT render that group in the menu.

**Independent Test**: Add a fake tool entry in a test registry and assert it appears in the rendered menu.

---

### P1: Grouped top navigation with flyout menus ⭐ MVP

**User Story**: As a developer, I want a top menu grouped by category that opens a floating panel on hover so that I can find tools quickly.

**Why P1**: Core navigation requirement and main UX differentiator.

**Acceptance Criteria**:

1. WHEN the user hovers a group trigger THEN the system SHALL open a floating panel listing that group's tools (name + short description).
2. WHEN the user focuses a group trigger and presses Enter/Space/ArrowDown THEN the system SHALL open the panel and allow arrow-key navigation between items.
3. WHEN the user presses Escape or moves pointer/focus away THEN the system SHALL close the panel and return focus to the trigger (keyboard case).
4. WHEN the current route belongs to a tool THEN the system SHALL mark its group trigger and item as active (`aria-current="page"` on the item).
5. WHEN the viewport is below the `md` breakpoint THEN the system SHALL replace the flyouts with an accessible menu button opening a drawer with groups as sections.
6. WHEN the header renders THEN the system SHALL show the Kanivete logo/wordmark linking to home.

**Independent Test**: Navigate the whole menu using only keyboard and only mouse; verify panel open/close and active states.

---

### P1: "Links" menu with external sites ⭐ MVP

**User Story**: As a developer, I want a header menu with curated external sites (e.g. transform.tools, webhook.cool) so that I can reach complementary tools not available in Kanivete.

**Why P1**: Explicit product requirement (complement, not copy).

**Acceptance Criteria**:

1. WHEN the header renders THEN the system SHALL show a "Links" menu trigger, visually separated from the tool groups, with the same hover/focus flyout behavior.
2. WHEN the flyout opens THEN it SHALL list, from a dedicated external-links registry (name, URL, short description):
   - transform.tools — `https://transform.tools` — "Polyglot web converter"
   - webhook.cool — `https://webhook.cool/` — "Inspect and test webhooks"
3. WHEN the user activates an item THEN the system SHALL open the URL in a new tab with `target="_blank"` and `rel="noopener noreferrer"`.
4. WHEN an item renders THEN it SHALL indicate it opens externally (external-link icon + accessible label such as "transform.tools (opens in a new tab)").
5. WHEN a link is added to the external-links registry THEN it SHALL appear in the menu without other code changes.

**Independent Test**: Open the Links menu via mouse and keyboard; activate each item and confirm a new tab opens; inspect `target` and `rel`.

---

### P1: Home page hero and featured links ⭐ MVP

**User Story**: As a developer, I want a striking home page that tells me what Kanivete is and points me to its flagship tools so that I can start quickly.

**Why P1**: Entry point and brand showcase of the platform.

**Acceptance Criteria**:

1. WHEN the user opens `/` THEN the system SHALL render the top navigation menu, and a vertically and horizontally centered hero below it.
2. WHEN the hero renders THEN it SHALL show the project name "Kanivete" as the single `h1` and a tagline describing it as the developer's pocket knife (e.g. "The Swiss army knife for developers — beautify, validate and transform data right in your browser.").
3. WHEN the home renders THEN all brand colors SHALL be visibly present: blue `#0131CD` (background/surfaces), white `#FFFFFF` (text) and green `#B9FC01` (highlight — e.g. a word of the name/tagline or the CTAs), respecting the contrast rules.
4. WHEN the hero renders THEN below the tagline it SHALL show two featured links: **JSON Beautify** (`/beautify/json`) and **XML → XSD** (`/transformations/xml-to-xsd`).
5. WHEN featured links render THEN their label and route SHALL be taken from the tool registry by tool id (no duplicated names/routes).
6. WHEN a featured link is activated (click or Enter) THEN the system SHALL navigate to the tool route.

**Independent Test**: Render home; assert one `h1` "Kanivete", the tagline, and two links pointing to `/beautify/json` and `/transformations/xml-to-xsd`; run axe with zero contrast violations.

---

### P1: Shared tool layout and editor ⭐ MVP

**User Story**: As a developer, I want every tool to share the same layout (title, description, toolbar, input/output editors, status area) so that the experience is predictable.

**Why P1**: Avoids duplicated UI code and keeps consistency.

**Acceptance Criteria**:

1. WHEN a tool page renders THEN the system SHALL show title (h1), description, a toolbar slot for options/actions and a content area.
2. WHEN a tool uses code blocks THEN the system SHALL use a shared CodeMirror editor component with the brand dark theme, line numbers, language mode and read-only mode for outputs.
3. WHEN the user activates "Copy" on an output THEN the system SHALL copy it to the clipboard and announce "Copied" via an `aria-live` region.
4. WHEN the viewport is ≥ `lg` THEN input and output SHALL be side by side; below it they SHALL stack vertically.
5. WHEN a tool reports an error THEN the system SHALL display it in an accessible status area (`role="alert"`) with clear, human-readable text.
6. WHEN the user activates "Clear" THEN the system SHALL empty the input and output.
7. WHEN the user activates "Load sample" THEN the system SHALL fill the input with a tool-specific example.

**Independent Test**: Render the layout with a dummy tool; verify slots, copy announcement, error alert and responsive classes.

---

### P1: Brand theme and contrast ⭐ MVP

**User Story**: As a user, I want a modern dark interface with highly legible text so that I can work comfortably for long periods.

**Why P1**: Explicit requirement; contrast is critical.

**Acceptance Criteria**:

1. WHEN any text renders THEN the system SHALL meet WCAG AA contrast (≥ 4.5:1 normal text, ≥ 3:1 large text/UI components).
2. WHEN an element receives keyboard focus THEN the system SHALL show a visible focus ring using green `#B9FC01`.
3. WHEN green is used as a background THEN text on it SHALL be primary blue or darker.
4. WHEN design tokens are defined THEN they SHALL live in a single Chakra UI theme (tokens/semantic tokens) exposed as CSS variables so Emotion/plain CSS reuse the same values; never hard-coded in components.
5. WHEN components are built THEN Chakra UI components and style props SHALL be the default; Emotion or plain CSS SHALL be used only for granular cases Chakra doesn't cover cleanly (e.g. CodeMirror theme).

**Independent Test**: Run axe/Lighthouse on home and one tool page with zero contrast violations.

---

### P2: Not-found page

**User Story**: As a user, I want a helpful 404 page so that I can get back to a tool when a URL is wrong.

**Acceptance Criteria**:

1. WHEN the route does not exist THEN the system SHALL render a 404 page with a link to home.

**Independent Test**: Visit an unknown route.

---

## Edge Cases

- WHEN JavaScript is still loading THEN the navigation links SHALL still be usable as plain links (server-rendered HTML).
- WHEN the Clipboard API is unavailable/denied THEN the system SHALL show an error message instead of failing silently.
- WHEN the user prefers reduced motion THEN flyout animations SHALL be disabled.

---

## Requirement Traceability

| Requirement ID | Story                        | Phase  | Status  |
| -------------- | ---------------------------- | ------ | ------- |
| SHELL-01       | P1: Tool registry            | Design | Pending |
| SHELL-02       | P1: Grouped top navigation   | Design | Pending |
| SHELL-03       | P1: Mobile navigation        | Design | Pending |
| SHELL-04       | P1: "Links" external menu    | Design | Pending |
| SHELL-05       | P1: Home hero                | Design | Pending |
| SHELL-06       | P1: Shared tool layout       | Design | Pending |
| SHELL-07       | P1: Shared CodeMirror editor | Design | Pending |
| SHELL-08       | P1: Brand theme & contrast   | Design | Pending |
| SHELL-09       | P2: Not-found page           | -      | Pending |
| SHELL-10       | P1: Home featured links      | Design | Pending |
| SHELL-11       | P1: Chakra UI setup + tokens | Design | Pending |

**Coverage:** 11 total, 0 mapped to tasks, 11 unmapped ⚠️

---

## Success Criteria

- [ ] Lighthouse Accessibility ≥ 95 on home and tool pages.
- [ ] Zero axe contrast violations.
- [ ] A new tool appears in the menu by editing only the tool registry; a new external link appears by editing only the external-links registry.
- [ ] Home shows all three brand colors with zero contrast violations.
