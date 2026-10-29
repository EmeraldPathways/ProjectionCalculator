"use client";

import { useState } from "react";
import type {
  ContributionFrequency,
  ProjectionInput,
  ProjectionResult,
} from "@/lib/calculator";
import { AnnualTable } from "@/components/annual-table";
import { GrowthChart } from "@/components/growth-chart";
import { PrintReport } from "@/components/print-report";
import { SummaryMetrics } from "@/components/summary-metrics";
import { formatCurrency } from "@/lib/format";

type ResultsPanelProps = {
  clientName: string;
  input: ProjectionInput;
  result: ProjectionResult | null;
  mode: "growth" | "goal";
  goalTarget: number;
  goalFrequency: ContributionFrequency;
  requiredMonthly: number | null;
  requiredAnnual: number | null;
  canCalculate: boolean;
  validationErrors: string[];
};

export function ResultsPanel({
  clientName,
  input,
  result,
  mode,
  goalTarget,
  goalFrequency,
  requiredMonthly,
  requiredAnnual,
  canCalculate,
  validationErrors,
}: ResultsPanelProps) {
  const [activeView, setActiveView] = useState<"graph" | "table">("graph");
  const selectedGoalAmount = goalFrequency === "monthly" ? requiredMonthly : requiredAnnual;

  function printReport() {
    if (canCalculate && result) window.print();
  }

  return (
    <section className="results-card" aria-labelledby="results-heading">
      <div className="results-topline">
        <div>
          <p className="eyebrow">Your illustration</p>
          <h2 id="results-heading">Projection results</h2>
        </div>
        <button
          type="button"
          className="print-button"
          onClick={printReport}
          disabled={!canCalculate || !result}
        >
          <span aria-hidden="true">▧</span>
          Print / Save as PDF
        </button>
      </div>

      {!canCalculate || !result ? (
        <div className="validation-notice" role="status">
          <span className="validation-icon" aria-hidden="true">!</span>
          <div>
            <strong>Check your assumptions</strong>
            <p>
              {validationErrors[0] ?? "Enter valid values to calculate your projection."}
            </p>
          </div>
        </div>
      ) : (
        <>
          {mode === "growth" ? (
            <div className="hero-result">
              <div>
                <p className="result-label">Projected balance after {input.years} years</p>
                <p className="hero-amount">{formatCurrency(result.finalBalance)}</p>
              </div>
              <span className="estimate-badge"><span /> Estimate</span>
            </div>
          ) : (
            <div className="goal-result">
              <div className="goal-result-copy">
                <p className="result-label">Savings goal in {input.years} years</p>
                <h3>{formatCurrency(goalTarget)}</h3>
                <p className="goal-support">Required {goalFrequency === "monthly" ? "monthly" : "annual"} savings</p>
              </div>
              {selectedGoalAmount === null ? (
                <div className="goal-amount-unavailable">
                  <strong>Not reachable with the supported savings limit</strong>
                  <span>Try a longer timeframe or a lower target.</span>
                </div>
              ) : (
                <div className="goal-savings-amount">
                  <strong>{formatCurrency(selectedGoalAmount)}</strong>
                  <span>per {goalFrequency === "monthly" ? "month" : "year"}</span>
                </div>
              )}
              <div className="goal-alternatives">
                <div>
                  <span>Monthly option</span>
                  <strong>{requiredMonthly === null ? "Not reached" : formatCurrency(requiredMonthly)}</strong>
                </div>
                <div>
                  <span>Annual option</span>
                  <strong>{requiredAnnual === null ? "Not reached" : formatCurrency(requiredAnnual)}</strong>
                </div>
              </div>
            </div>
          )}

          <SummaryMetrics input={input} result={result} />

          {result.depletionYear ? (
            <div className="depletion-notice" role="status">
              <span aria-hidden="true">!</span>
              <p>
                Scheduled withdrawals use the available balance by year {result.depletionYear}.
                Later savings are still included in the projection.
              </p>
            </div>
          ) : null}

          <div className="visual-heading">
            <div>
              <p className="eyebrow">Projection detail</p>
              <h3>Explore your results</h3>
            </div>
            <div className="view-tabs" role="tablist" aria-label="Projection result format">
              <button
                type="button"
                role="tab"
                id="graph-tab"
                aria-selected={activeView === "graph"}
                aria-controls="graph-panel"
                className={activeView === "graph" ? "view-tab selected" : "view-tab"}
                onClick={() => setActiveView("graph")}
              >
                <span aria-hidden="true">⌁</span> Graph
              </button>
              <button
                type="button"
                role="tab"
                id="table-tab"
                aria-selected={activeView === "table"}
                aria-controls="table-panel"
                className={activeView === "table" ? "view-tab selected" : "view-tab"}
                onClick={() => setActiveView("table")}
              >
                <span aria-hidden="true">▤</span> Table
              </button>
            </div>
          </div>

          <div
            id="graph-panel"
            className={activeView === "graph" ? "visual-panel" : "visual-panel panel-hidden"}
            role="tabpanel"
            aria-labelledby="graph-tab"
            hidden={activeView !== "graph"}
          >
            <GrowthChart rows={result.annualRows} initialAmount={input.initialAmount} />
          </div>
          <div
            id="table-panel"
            className={activeView === "table" ? "visual-panel" : "visual-panel panel-hidden"}
            role="tabpanel"
            aria-labelledby="table-tab"
            hidden={activeView !== "table"}
          >
            <div className="table-title-row">
              <div>
                <h3>Year-by-year breakdown</h3>
                <p>Contributions, withdrawals, growth and closing balance.</p>
              </div>
              <span className="table-units">Amounts in euro</span>
            </div>
            <AnnualTable rows={result.annualRows} />
          </div>

          <p className="results-disclaimer">
            Cumulative growth is estimated growth as a percentage of total contributions, including the starting amount.
            Annual fees are deducted from the assumed return; tax and inflation are not included.
          </p>

          <PrintReport
            clientName={clientName}
            input={input}
            result={result}
            mode={mode}
            goalTarget={goalTarget}
            goalFrequency={goalFrequency}
            requiredMonthly={requiredMonthly}
            requiredAnnual={requiredAnnual}
          />
        </>
      )}
    </section>
  );
}
