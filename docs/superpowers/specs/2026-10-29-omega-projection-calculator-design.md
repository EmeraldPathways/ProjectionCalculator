# Omega Projection Calculator — Design

Date: 2026-10-29

## Intent

Create a client-facing Omega savings and investment projection calculator in the `EmeraldPathways/ProjectionCalculator` repository. It should borrow the supplied calculator screenshot's layout, use Omega branding, model savings growth and withdrawals, and produce an A4-ready report containing both a graph and a year-by-year table.

## Goals

- Reproduce the screenshot's desktop composition: calculator controls on the left and results on the right, with a Basic/Advanced control.
- Provide separate Graph and Table views in the results area. The PDF/print view must contain both, regardless of the selected on-screen view.
- Support a starting lump sum, recurring savings, time horizon, assumed annual return, optional annual contribution increases, withdrawals, and goal mode that calculates required monthly or annual savings.
- Show yearly contributions, withdrawals, growth, and end-of-year balance.
- Use Omega's supplied logo and palette: burgundy `#661E24`, muted gold `#988B54`, cream `#E1DECE`, olive `#6D5A0C`, and white. The white logo sits on a dark brand panel.
- Make the page responsive and accessible for keyboard and screen-reader users.
- Keep all calculations and print preparation in the browser; do not add user accounts, a database, or server-side storage.

## Non-goals

- Do not add the screenshot's fee, inflation, life-event, or delayed-start comparison models in this version. The screenshot is the visual reference; the explicit feature list defines calculation scope.
- Do not provide individual financial advice or guarantee projected returns.
- Do not persist client figures or scenarios between visits.

## Constraints

- The target GitHub repository is `EmeraldPathways/ProjectionCalculator`; it was empty when inspected.
- Use Next.js, React, and TypeScript as the implementation framework, with Vercel as the hosting target.
- Currency is euro for the first version.
- The white Omega logo and colour reference were supplied in this conversation.

## Approaches considered

1. **Next.js and React, client-side calculator (selected):** supports the richer state in Basic/Advanced and goal modes, keeps calculations local, and allows the app to be connected to GitHub and Vercel for branch previews and production deployment.
2. **Astro with vanilla JavaScript:** closest to the likely framework and simple public calculator implementation. It is lighter, but the multiple modes and separate print report would need more hand-built state management.
3. **Plain static HTML and JavaScript:** fewest dependencies, but less maintainable as withdrawal and goal calculations grow.

Next.js and React are selected because the requested application has several connected input modes and an A4 report. The app can still be statically delivered; no backend is required.

## Interaction and layout

- Desktop: a two-column workspace. The left card contains inputs and Basic/Advanced controls. The right card presents the projected result and a Graph/Table selector, with Graph selected initially.
- Mobile: stack controls first and results second. Keep the Graph/Table selector reachable without horizontal page scrolling. The yearly table can scroll within its own bounded container on screen.
- Basic mode exposes starting amount, monthly contribution, time horizon, and assumed annual return.
- Advanced mode exposes annual contribution increase, a one-off or recurring withdrawal schedule, and the savings-goal calculation.
- Goal mode asks for a target balance and target date, then returns the required monthly or annual savings amount using the same calculation engine as growth mode.
- Match the reference's open spacing, rounded white cards, clear input labels, strong projected-value figure, compact legend, and clean table. Apply Omega colour tokens and logo instead of the reference brand.

## Calculation rules

- Project month by month using a monthly rate equal to the annual assumed rate divided by 12.
- Interest accrues on the opening balance; scheduled contributions and withdrawals are applied at the end of the month. An annual contribution is applied at year end. Annual contribution increases take effect at the start of each year.
- A withdrawal can be one-off or recurring (monthly or annual) and has a start year. A single withdrawal schedule is in scope for version one.
- The annual table is derived from the same monthly series used by the chart, so totals reconcile. It contains year, contributions, withdrawals, growth, and closing balance.
- Goal mode solves for a contribution amount that reaches the requested ending balance, given the starting amount, duration, assumed return, and withdrawal schedule. Show both monthly and annual equivalents; clearly label the selected contribution frequency.
- Do not report a negative portfolio balance. If the scheduled withdrawals exhaust the balance, show the depletion year and make the impact visible in the table and chart.
- Round currency for display only; retain full precision during calculations.

## Print and PDF

- Provide a **Print / Save as PDF** action using the browser print dialog.
- Use a dedicated print layout with `@page` A4 portrait sizing and controlled margins. Hide interactive controls and navigation in print.
- Print the report title, generation date, inputs and assumptions, key results, graph, complete annual table with repeated table headings, explanatory projection note, and Omega contact/regulatory footer.
- Keep the graph and table in the report even when the Table or Graph view is selected on screen. Avoid splitting table rows across pages.
- Include the client-facing CTA: “Schedule a free consultation at +353 1 293 8554 (Sandyford office).”
- Include the mandatory footer: “OFM Financial Ltd T/A Omega Financial Management, regulated by the Central Bank of Ireland.”
- State that figures are illustrative, depend on the entered assumptions, and do not guarantee future returns. Because fees, tax, and inflation are not modelled in this version, say so in the report.

## Remaining builder choices

- Choose accessible range and amount-control bounds that suit the screenshot's horizons and returns; keep bounds visible and validate typed values.
- Use a chart package or a maintainable chart component that can also render cleanly in the print layout.
- Keep branch and Vercel configuration aligned with the empty repository's first production deployment.
