# Omega Projection Calculator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an Omega-branded savings projection calculator with withdrawals, savings-goal mode, graph/table results, and an A4 print report containing both views.

**Architecture:** A client-side Next.js and React application will hold calculator inputs and derive projections in a typed calculation module. A shared result series powers a chart and annual table; a print-only report renders both regardless of the visible result tab.

**Tech Stack:** Next.js, React, TypeScript, Recharts, CSS, browser print dialog.

**Spec:** `docs/superpowers/specs/2026-10-29-omega-projection-calculator-design.md`

## Global Constraints

- Use Next.js, React, and TypeScript as the implementation framework, with Vercel as the hosting target.
- Currency is euro for the first version.
- Keep all calculations and print preparation in the browser; do not add user accounts, a database, or server-side storage.
- Use the supplied Omega logo and the palette `#661E24`, `#988B54`, `#E1DECE`, `#6D5A0C`, and white.
- Keep the screenshot's fee, inflation, life-event, and delayed-start comparison calculations out of this version.
- Show the Sandyford consultation CTA and Central Bank regulation line on the web page and in the print report.
- The print report must include both graph and annual table, plus assumptions, date, CTA, explanatory note, and the Central Bank regulation footer.

## Review Focus

- Empty, non-numeric, or negative money inputs must be rejected or normalised before calculation; verify labels and visible validation.
- A 0% return and zero contributions must leave the lump sum unchanged; verify the result and annual growth values.
- Withdrawals that exceed available assets must never produce a negative balance; verify the depletion year is shown.
- A goal already met must return €0 required savings; verify goal mode and both monthly/annual labels.
- Long horizons must retain all years in the table and chart, and the A4 report must paginate without clipping or splitting rows; verify print preview at the maximum supported horizon.

---

### Task 1: Create the Next.js application shell and Omega theme

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/globals.css`
- Create: `public/omega-logo-white.png`

**Interfaces:**
- `app/page.tsx` renders `<ProjectionCalculator />` from `components/projection-calculator.tsx`.
- `app/layout.tsx` provides English (Ireland) metadata and imports `app/globals.css`.

- [ ] Create the Next.js project manifest with `dev`, `build`, and `start` scripts and runtime dependencies for Next.js, React, TypeScript, and Recharts.
- [ ] Add the app layout, title “Omega Savings Projection Calculator”, and global theme tokens from the approved palette.
- [ ] Copy the supplied white Omega logo to `public/omega-logo-white.png`.
- [ ] Add a minimal root page placeholder that imports the calculator component interface for the next task.
- [ ] Run `npm run build` after Tasks 2–6 are complete; expected result is a successful production build.

### Task 2: Implement the projection and goal calculation module

**Files:**
- Create: `lib/calculator.ts`
- Create: `lib/format.ts`

**Interfaces:**
- `ProjectionInput`: `initialAmount`, `contributionAmount`, `contributionFrequency`, `annualIncreasePercent`, `annualReturnPercent`, `years`, and optional `withdrawal`.
- `Withdrawal`: one-time `{ type: "one-time", amount, year }` or recurring `{ type: "recurring", amount, frequency, startYear }`, where recurring `frequency` is `monthly` or `annual`.
- `AnnualProjection`: `year`, `contributions`, `withdrawals`, `growth`, `balance`, and `cumulativeContributions`.
- `ProjectionResult`: `annualRows`, `finalBalance`, `totalContributions`, `totalWithdrawals`, `totalGrowth`, and optional `depletionYear`.
- `calculateProjection(input: ProjectionInput): ProjectionResult` simulates month-by-month growth and returns the annual series and totals.
- `calculateRequiredSaving(input: Omit<ProjectionInput, "contributionAmount"> & { targetAmount: number }): number | null` returns the required contribution at the selected frequency, or `null` for invalid input.
- `formatCurrency(value: number): string` formats whole euro amounts using `en-IE`.

- [ ] Define the calculation types and implement `calculateProjection` using annual rate divided by 12, interest on opening balance, then end-of-month contributions followed by withdrawals; annual contributions and withdrawals occur at year end.
- [ ] Apply annual contribution increases at the start of each year, cap withdrawals at the available balance, and record the first depletion year.
- [ ] Implement `calculateRequiredSaving` with a bounded binary search using the same monthly simulation and selected monthly/annual contribution frequency.
- [ ] Implement whole-euro formatting for the interface and report, retaining full precision for internal calculations.

### Task 3: Build the calculator controls and live result summary

**Files:**
- Create: `components/projection-calculator.tsx`
- Create: `components/calculator-inputs.tsx`
- Create: `components/results-panel.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- `ProjectionCalculator` owns `ProjectionInput`, display mode (`growth` or `goal`), and Basic/Advanced state.
- `CalculatorInputs` receives the current input, mode, and `onChange` callback.
- `ResultsPanel` receives `ProjectionInput`, `ProjectionResult`, and goal output.

- [ ] Add default inputs from the reference mockup: €10,000 starting amount, €300 monthly savings, 25 years, and 5% annual return. Use reference-aligned bounds of 1–40 years, 0–15% return, and 0–10% annual contribution increase.
- [ ] Build Basic/Advanced controls: Basic shows lump sum, monthly contribution, duration, and return; Advanced adds yearly increase, withdrawal setup, and growth/goal mode.
- [ ] Add monthly/annual contribution-frequency selection for goal mode and validate typed amounts and percentages before calculation.
- [ ] Derive the projection and goal result from `lib/calculator.ts` and display projected balance, total contributions, withdrawals, and growth.
- [ ] Confirm that a goal already reached after the withdrawal schedule shows €0 required savings and that monthly and annual goal frequencies are labelled correctly.
- [ ] Render a visible depletion state when scheduled withdrawals exhaust the balance.
- [ ] Add the Sandyford consultation CTA and Central Bank regulation line to the on-screen page footer.

### Task 4: Add the Graph/Table result views

**Files:**
- Create: `components/growth-chart.tsx`
- Create: `components/annual-table.tsx`
- Modify: `components/results-panel.tsx`

**Interfaces:**
- `GrowthChart` receives `annualRows` and renders projected balance alongside cumulative contributions.
- `AnnualTable` receives `annualRows` and renders year, contributions, withdrawals, growth, and closing balance.
- `ResultsPanel` owns the selected result tab and keeps the chart/table data tied to the same projection.

- [ ] Add keyboard-accessible Graph and Table tabs in the right results panel, with Graph selected by default.
- [ ] Render a responsive Recharts area/line chart with labels for projected balance and contributions.
- [ ] Render a year-by-year table that includes the full horizon and supports narrow screens without page-level horizontal overflow.
- [ ] Verify 0% return with an initial balance and no contributions, 40-year horizon, and withdrawal-depletion display manually in the completed calculator.

### Task 5: Build the A4 print report containing both result formats

**Files:**
- Create: `components/print-report.tsx`
- Modify: `components/results-panel.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- `PrintReport` receives the current input and `ProjectionResult`; it always renders both `GrowthChart` and `AnnualTable`.
- The print action calls `window.print()` and is labelled “Print / Save as PDF”.

- [ ] Add the report header, generation date, assumptions, summary figures, graph, complete annual table, projection note, CTA, and required regulation footer.
- [ ] Add `@page { size: A4 portrait; margin: 14mm; }` and print styles that hide interactive controls, show the report, repeat table headings, and avoid breaking rows.
- [ ] Include both graph and table in print output regardless of the active results tab.
- [ ] Verify print preview at a short and maximum horizon; confirm A4 page sizing, readable table text, chart visibility, repeated headings, and no clipped columns.

### Task 6: Document setup and prepare the Vercel preview

**Files:**
- Create: `README.md`
- Create: `design-qa.md`

**Interfaces:**
- README documents local setup, calculation assumptions, print behaviour, and Vercel Git deployment.
- `design-qa.md` records comparison against both supplied screenshots at a matching desktop viewport and a mobile layout check.

- [ ] Document `npm install`, `npm run dev`, and the calculation and print assumptions.
- [ ] Run `npm run build` and resolve build errors.
- [ ] Open the completed Vercel preview in the browser and verify the primary controls, Graph/Table views, goal calculation, withdrawal depletion, and print preview.
- [ ] Compare the rendered desktop layout with the supplied screenshot, verify responsive stacking, and record the result in `design-qa.md`.
- [ ] Provide the preview URL and branch/commit details for review before any production promotion.
