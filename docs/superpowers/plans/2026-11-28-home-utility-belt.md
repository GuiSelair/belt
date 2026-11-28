# Home Utility Belt Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the full-proportion option B utility belt to the lower third of
the “Belt” wordmark in the home hero without reducing its accessibility or
readability.

**Architecture:** A focused `UtilityBelt` component renders a decorative SVG
using the existing Chakra theme tokens. `HomeHero` positions it over the real
heading text while preserving the current heading, spark decorations, tagline,
and links.

**Tech Stack:** React 19, TypeScript, Chakra UI 3, Vitest, Testing Library

## Global Constraints

- Apply the utility belt only to the large home hero title.
- Keep the header brand unchanged.
- Keep “Belt” as real text in the page's only `h1`.
- Hide the decorative SVG from assistive technologies and keyboard focus.
- Use no raster image and add no dependency.
- Use graphite and lime colors from the existing theme.

---

### Task 1: Home hero utility belt

**Files:**

- Create: `src/components/home/UtilityBelt.tsx`
- Modify: `src/components/home/HomeHero.tsx`
- Test: `src/components/home/HomeHero.test.tsx`

**Interfaces:**

- Consumes: Chakra's `chakra.svg` and existing `brand.green` and `navy` tokens.
- Produces: `UtilityBelt(): JSX.Element`, a decorative SVG marked with
  `data-utility-belt`.

- [ ] **Step 1: Write the failing integration test**

Add this test to `src/components/home/HomeHero.test.tsx`:

```tsx
it('renders the home utility belt as a decorative graphic', () => {
  const { container } = renderWithProviders(<HomeHero />);

  const utilityBelts = container.querySelectorAll('[data-utility-belt]');
  expect(utilityBelts).toHaveLength(1);
  expect(utilityBelts[0]).toHaveAttribute('data-belt-variant', 'option-b-full');
  expect(utilityBelts[0]).toHaveAttribute('aria-hidden', 'true');
  expect(utilityBelts[0]).toHaveAttribute('focusable', 'false');
});
```

- [ ] **Step 2: Run the focused test and verify the red state**

Run:

```bash
npm test -- src/components/home/HomeHero.test.tsx
```

Expected: one failure because `[data-utility-belt]` does not exist.

- [ ] **Step 3: Create the decorative SVG**

Create `src/components/home/UtilityBelt.tsx`:

```tsx
'use client';

import { chakra } from '@chakra-ui/react';

export function UtilityBelt() {
  return (
    <chakra.svg
      aria-hidden="true"
      focusable="false"
      data-utility-belt=""
      data-belt-variant="option-b-full"
      viewBox="0 0 400 92"
      position="absolute"
      left="50%"
      bottom="-0.05em"
      transform="translateX(-50%)"
      width="2.08em"
      height="auto"
      overflow="visible"
      pointerEvents="none"
      zIndex="1"
    >
      <path
        d="M16 20 C104 42 296 42 384 20 L380 48 C292 70 108 70 20 48 Z"
        fill="navy.950"
      />
      <path
        d="M21 25 C111 47 289 47 379 25"
        fill="none"
        stroke="navy.700"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M70 43 L126 50 L121 80 Q97 90 72 77 Z"
        fill="navy.900"
        stroke="brand.green"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path
        d="M330 43 L274 50 L279 80 Q303 90 328 77 Z"
        fill="navy.900"
        stroke="brand.green"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <rect
        x="158"
        y="38"
        width="84"
        height="52"
        rx="11"
        fill="brand.green"
        stroke="navy.950"
        strokeWidth="7"
      />
      <path d="M181 59 L200 47 L219 59 L212 77 H188 Z" fill="brand.blue" />
    </chakra.svg>
  );
}
```

- [ ] **Step 4: Integrate the belt into the home title**

Import `UtilityBelt` in `src/components/home/HomeHero.tsx` and render it after
the text:

```tsx
<SparkLines placement="topStart" />
Belt
<UtilityBelt />
<SparkLines placement="bottomEnd" delay={1.2} />
```

- [ ] **Step 5: Run the focused test and verify the green state**

Run:

```bash
npm test -- src/components/home/HomeHero.test.tsx
```

Expected: all three `HomeHero` tests pass.

- [ ] **Step 6: Run complete verification**

Run:

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

Expected: every command exits with code 0.

- [ ] **Step 7: Review the home visually**

Start the development server and inspect the home at desktop and mobile
viewports. Confirm that the title remains readable, the belt stays on the lower
third, the buckle remains centered, the spark decorations do not collide, and
the header brand is unchanged.

- [ ] **Step 8: Commit the implementation**

```bash
git add src/components/home/HomeHero.test.tsx \
  src/components/home/HomeHero.tsx \
  src/components/home/UtilityBelt.tsx
git commit -m "feat: add utility belt to home logo"
```
