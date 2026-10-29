"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type {
  ContributionFrequency,
  ProjectionInput,
  ProjectionResult,
} from "@/lib/calculator";
import { AnnualTable } from "@/components/annual-table";
import { GrowthChart } from "@/components/growth-chart";
import { formatCurrency, formatPercent } from "@/lib/format";

type PrintReportProps = {
  input: ProjectionInput;
  result: ProjectionResult;
  mode: "growth" | "goal";
  goalTarget: number;
  goalFrequency: ContributionFrequency;
  requiredMonthly: number | null;
  requiredAnnual: number | null;
};

function withdrawalDescription(input: ProjectionInput): string {
  if (!input.withdrawal) return "No withdrawals";
  if (input.withdrawal.type === "one-time") {
    return formatCurrency(input.withdrawal.amount) + " in year " + input.withdrawal.year;
  }
  const frequency = input.withdrawal.frequency === "monthly" ? "per month" : "per year";
  return (
    formatCurrency(input.withdrawal.amount) +
    " " +
    frequency +
    " from year " +
    input.withdrawal.startYear
  );
}

export function PrintReport({
  input,
  result,
  mode,
  goalTarget,
  goalFrequency,
  requiredMonthly,
  requiredAnnual,
}: PrintReportProps) {
  const [preparedDate, setPreparedDate] = useState("");
  const selectedGoalAmount = goalFrequency === "monthly" ? requiredMonthly : requiredAnnual;

  useEffect(() => {
    setPreparedDate(
      new Intl.DateTimeFormat("en-IE", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date()),
    );
  }, []);

  return (
    <article className="print-report">
      <header className="print-report-header">
        <div className="print-brand-panel">
          <Image
            src="/omega-logo-white.png"
            alt="Omega Financial Management"
            width={184}
            height={48}
            unoptimized
          />
          <span>Client projection</span>
        </div>
        <div className="print-title-row">
          <div>
            <p className="eyebrow">Savings and investment illustration</p>
            <h1>{mode === "goal" ? "Savings goal projection" : "Savings growth projection"}</h1>
          </div>
          <p className="print-date">Prepared {preparedDate}</p>
        </div>
      </header>

      <section className="print-summary" aria-label="Projection summary">
        <div className="print-summary-main">
          <span>{mode === "goal" ? "Goal balance" : "Projected balance after " + input.years + " years"}</span>
          <strong>{formatCurrency(mode === "goal" ? goalTarget : result.finalBalance)}</strong>
        </div>
        {mode === "goal" ? (
          <div className="print-summary-main print-summary-saving">
            <span>Required savings</span>
            <strong>
              {selectedGoalAmount === null
                ? "Not reached"
                : formatCurrency(selectedGoalAmount) +
                  (goalFrequency === "monthly" ? " / month" : " / year")}
            </strong>
            <small>
              {goalFrequency === "monthly" ? "Annual option: " : "Monthly option: "}
              {goalFrequency === "monthly"
                ? requiredAnnual === null
                  ? "not reached"
                  : formatCurrency(requiredAnnual) + " / year"
                : requiredMonthly === null
                  ? "not reached"
                  : formatCurrency(requiredMonthly) + " / month"}
            </small>
          </div>
        ) : null}
        <div className="print-stat-grid">
          <div><span>Starting amount</span><strong>{formatCurrency(input.initialAmount)}</strong></div>
          <div><span>Total contributions</span><strong>{formatCurrency(result.totalContributions)}</strong></div>
          <div><span>Growth</span><strong>{formatCurrency(result.totalGrowth)}</strong></div>
          <div><span>Withdrawals</span><strong>{formatCurrency(result.totalWithdrawals)}</strong></div>
        </div>
      </section>

      <section className="print-assumptions">
        <h2>Assumptions</h2>
        <dl>
          <div><dt>Starting amount</dt><dd>{formatCurrency(input.initialAmount)}</dd></div>
          <div>
            <dt>Regular savings</dt>
            <dd>
              {formatCurrency(input.contributionAmount)}{" "}
              {input.contributionFrequency === "monthly" ? "per month" : "per year"}
            </dd>
          </div>
          <div><dt>Timeframe</dt><dd>{input.years} years</dd></div>
          <div><dt>Assumed annual return</dt><dd>{formatPercent(input.annualReturnPercent)}</dd></div>
          <div><dt>Annual fee</dt><dd>{formatPercent(input.annualFeePercent, 2)}</dd></div>
          <div><dt>Annual savings increase</dt><dd>{formatPercent(input.annualIncreasePercent)}</dd></div>
          <div><dt>Withdrawal schedule</dt><dd>{withdrawalDescription(input)}</dd></div>
          {mode === "goal" ? (
            <div><dt>Savings goal</dt><dd>{formatCurrency(goalTarget)} by year {input.years}</dd></div>
          ) : null}
        </dl>
      </section>

      {result.depletionYear ? (
        <p className="print-depletion">
          The scheduled withdrawals use the available balance by year {result.depletionYear}.
          Later contributions may still be included in this illustration.
        </p>
      ) : null}

      <section className="print-chart-section">
        <div className="print-section-heading">
          <div>
            <p className="eyebrow">Visual overview</p>
            <h2>Projected balance and total invested</h2>
          </div>
          <span>Year-end values</span>
        </div>
        <GrowthChart rows={result.annualRows} initialAmount={input.initialAmount} print />
      </section>

      <section className="print-table-section">
        <div className="print-section-heading">
          <div>
            <p className="eyebrow">Year-by-year detail</p>
            <h2>Annual projection table</h2>
          </div>
          <span>All amounts in euro</span>
        </div>
        <AnnualTable rows={result.annualRows} compact />
      </section>

      <p className="print-disclaimer">
        This projection is illustrative and depends on the assumptions entered. It does not
        guarantee future returns and is not financial advice. Annual fees are deducted from the
        assumed return; tax and inflation are not included. Actual investment values can rise or fall.
      </p>

      <footer className="print-footer">
        <div className="print-contact">
          <span>Discuss your plans with our team</span>
          <strong>Schedule a free consultation at +353 1 293 8554 (Sandyford office).</strong>
        </div>
        <p>OFM Financial Ltd T/A Omega Financial Management, regulated by the Central Bank of Ireland.</p>
      </footer>
    </article>
  );
}
