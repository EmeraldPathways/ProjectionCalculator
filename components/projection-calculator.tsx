"use client";

import { useCallback, useMemo, useState } from "react";
import { CalculatorInputs } from "@/components/calculator-inputs";
import { ResultsPanel } from "@/components/results-panel";
import {
  calculateProjection,
  calculateRequiredSaving,
  type ContributionFrequency,
  type ProjectionInput,
  type ProjectionResult,
} from "@/lib/calculator";

const defaultInput: ProjectionInput = {
  initialAmount: 10_000,
  contributionAmount: 300,
  contributionFrequency: "monthly",
  annualIncreasePercent: 0,
  annualReturnPercent: 5,
  annualFeePercent: 0,
  years: 25,
};

export function ProjectionCalculator() {
  const [input, setInput] = useState<ProjectionInput>(defaultInput);
  const [clientName, setClientName] = useState("");
  const [goalTarget, setGoalTarget] = useState(250_000);
  const [goalFrequency, setGoalFrequency] = useState<ContributionFrequency>("monthly");
  const [mode, setMode] = useState<"growth" | "goal">("growth");
  const [advanced, setAdvanced] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const onInputChange = useCallback((changes: Partial<ProjectionInput>) => {
    setInput((current) => {
      const next = { ...current, ...changes };
      if (changes.years !== undefined && next.withdrawal) {
        if (next.withdrawal.type === "one-time" && next.withdrawal.year > next.years) {
          next.withdrawal = { ...next.withdrawal, year: next.years };
        }
        if (next.withdrawal.type === "recurring" && next.withdrawal.startYear > next.years) {
          next.withdrawal = { ...next.withdrawal, startYear: next.years };
        }
      }
      return next;
    });
  }, []);

  const onFieldValidityChange = useCallback((field: string, message: string) => {
    setValidationErrors((current) => {
      if (!message && !current[field]) return current;
      if (message && current[field] === message) return current;
      const next = { ...current };
      if (message) next[field] = message;
      else delete next[field];
      return next;
    });
  }, []);

  const resetAssumptions = useCallback(() => {
    setInput(defaultInput);
    setGoalTarget(250_000);
    setGoalFrequency("monthly");
    setMode("growth");
    setAdvanced(false);
    setValidationErrors({});
  }, []);

  const requiredMonthly = useMemo(
    () =>
      calculateRequiredSaving({
        initialAmount: input.initialAmount,
        annualReturnPercent: input.annualReturnPercent,
        annualFeePercent: input.annualFeePercent,
        annualIncreasePercent: input.annualIncreasePercent,
        years: input.years,
        contributionFrequency: "monthly",
        withdrawal: input.withdrawal,
        targetAmount: goalTarget,
      }),
    [goalTarget, input],
  );

  const requiredAnnual = useMemo(
    () =>
      calculateRequiredSaving({
        initialAmount: input.initialAmount,
        annualReturnPercent: input.annualReturnPercent,
        annualFeePercent: input.annualFeePercent,
        annualIncreasePercent: input.annualIncreasePercent,
        years: input.years,
        contributionFrequency: "annual",
        withdrawal: input.withdrawal,
        targetAmount: goalTarget,
      }),
    [goalTarget, input],
  );

  const selectedGoalContribution =
    goalFrequency === "monthly" ? requiredMonthly : requiredAnnual;
  const goalSolverUnavailable = mode === "goal" && selectedGoalContribution === null;
  const projectionInput: ProjectionInput =
    mode === "goal"
      ? {
          ...input,
          contributionAmount: selectedGoalContribution ?? 0,
          contributionFrequency: goalFrequency,
        }
      : input;

  const result = useMemo<ProjectionResult | null>(() => {
    if (Object.keys(validationErrors).length > 0) return null;
    if (goalSolverUnavailable) return null;
    try {
      return calculateProjection(projectionInput);
    } catch {
      return null;
    }
  }, [goalSolverUnavailable, projectionInput, validationErrors]);

  return (
    <main className="site-shell">
      <header className="page-header">
        <div className="brand-lockup">
          <a className="brand-mark" href="/" aria-label="Omega Financial Management home">
            <img
              src="/omega-logo-white.png"
              alt="Omega Financial Management"
              width="184"
              height="48"
            />
          </a>
          <div className="header-copy">
            <p className="eyebrow">Client planning tool</p>
            <h1>Savings projection calculator</h1>
            <p className="header-subtitle">
              Explore how regular saving and investment growth may shape your future.
            </p>
            <div className="client-name-field">
              <label htmlFor="client-name">Client name</label>
              <input
                id="client-name"
                type="text"
                maxLength={100}
                placeholder="Enter client name"
                value={clientName}
                onChange={(event) => setClientName(event.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="header-note">
          <span className="note-dot" />
          <span>Illustrative planning estimate</span>
        </div>
      </header>

      <section className="workspace" aria-label="Savings projection calculator">
        <CalculatorInputs
          input={input}
          goalTarget={goalTarget}
          goalFrequency={goalFrequency}
          mode={mode}
          advanced={advanced}
          onInputChange={onInputChange}
          onGoalTargetChange={setGoalTarget}
          onGoalFrequencyChange={setGoalFrequency}
          onModeChange={setMode}
          onAdvancedChange={setAdvanced}
          onFieldValidityChange={onFieldValidityChange}
          onReset={resetAssumptions}
        />
        <ResultsPanel
          clientName={clientName}
          input={projectionInput}
          result={result}
          mode={mode}
          goalTarget={goalTarget}
          goalFrequency={goalFrequency}
          requiredMonthly={requiredMonthly}
          requiredAnnual={requiredAnnual}
          canCalculate={Object.keys(validationErrors).length === 0 && !goalSolverUnavailable}
          validationErrors={
            Object.keys(validationErrors).length > 0
              ? Object.values(validationErrors)
              : goalSolverUnavailable
                ? ["This goal could not be calculated with the selected assumptions. Try reducing the goal or extending the timeframe."]
                : []
          }
        />
      </section>

      <footer className="site-footer">
        <div className="footer-contact">
          <div>
            <p className="eyebrow">A conversation can help make the next step clearer</p>
            <h2>Let’s talk about your plans.</h2>
          </div>
          <a className="footer-cta" href="tel:+35312938554">
            Schedule a free consultation at +353 1 293 8554 (Sandyford office).
          </a>
        </div>
        <p className="regulatory">
          OFM Financial Ltd T/A Omega Financial Management, regulated by the Central Bank of Ireland.
        </p>
      </footer>
    </main>
  );
}
