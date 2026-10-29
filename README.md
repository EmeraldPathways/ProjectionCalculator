# Omega Savings Projection Calculator

A browser-based Next.js calculator for illustrative savings projections. It supports a starting lump sum, recurring savings, an adjustable timeframe and assumed return, optional annual savings increases, withdrawals, savings-goal mode, annual graph/table views, and an A4-ready print report.

## Run locally

Run npm install followed by npm run dev, then open http://localhost:3000.

Build for production with npm run build, then run with npm start.

## Projection assumptions

- Returns are applied monthly at the assumed annual rate divided by 12.
- Interest is calculated on the opening monthly balance; savings are added at the end of the month.
- Annual contributions are added at year end. Annual contribution increases apply from the beginning of each projection year.
- Withdrawals are applied after contributions at the end of the relevant month or year and are capped at the available balance.
- Goal mode uses the same projection rules and a bounded binary search to estimate the monthly and annual savings required to reach a target.
- Figures are rounded to whole euros for display. The calculations retain decimal precision.

Fees, tax and inflation are not modelled. Projections are illustrative and do not guarantee future returns or provide financial advice.

## Print / Save as PDF

Select **Print / Save as PDF** to open the browser print dialog. The print stylesheet specifies A4 portrait paper and a 14 mm margin. The report includes the assumptions, summary, graph, complete annual table, projection note, consultation CTA and regulatory footer, regardless of the active Graph/Table view. Select **Save as PDF** in the browser's print destination to create a PDF.

## Deploy through GitHub and Vercel

Connect the GitHub repository to a Vercel project. Vercel will install the dependencies and run npm run build for each branch. Feature branches produce preview deployments; production deployment should happen from the configured production branch after review.
