"use client";

import { useEffect, useRef, useState } from "react";
import type {
  ContributionFrequency,
  ProjectionInput,
  Withdrawal,
} from "@/lib/calculator";
import { formatCurrency } from "@/lib/format";

type NumericFieldProps = {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  decimalPlaces?: number;
  suffix?: string;
  help?: string;
  onChange: (value: number) => void;
  onValidityChange: (field: string, message: string) => void;
};

function formatNumericValue(value: number, decimalPlaces?: number): string {
  return decimalPlaces === undefined ? String(value) : value.toFixed(decimalPlaces);
}

function NumericField({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  decimalPlaces,
  suffix,
  help,
  onChange,
  onValidityChange,
}: NumericFieldProps) {
  const [rawValue, setRawValue] = useState(formatNumericValue(value, decimalPlaces));
  const lastPropValue = useRef(value);

  useEffect(() => {
    if (value !== lastPropValue.current) {
      setRawValue(formatNumericValue(value, decimalPlaces));
      lastPropValue.current = value;
    }
  }, [value, decimalPlaces]);

  const parsedRawValue = Number(rawValue);
  const hasPrecisionError =
    decimalPlaces !== undefined &&
    Number.isFinite(parsedRawValue) &&
    parsedRawValue !== Number(parsedRawValue.toFixed(decimalPlaces));

  function update(raw: string) {
    setRawValue(raw);
    if (raw.trim() === "") {
      onValidityChange(id, "Enter a value to continue.");
      return;
    }

    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
      onValidityChange(id, "Enter a value from " + min + " to " + max + ".");
      return;
    }
    if (decimalPlaces !== undefined && parsed !== Number(parsed.toFixed(decimalPlaces))) {
      onValidityChange(id, "Enter no more than " + decimalPlaces + " decimal places.");
      return;
    }

    lastPropValue.current = parsed;
    onChange(parsed);
    onValidityChange(id, "");
  }

  return (
    <div className="field-group">
      <label className="field-label" htmlFor={id}>
        {label}
        {suffix ? <span className="field-suffix">{suffix}</span> : null}
      </label>
      <div className="field-input-wrap">
        <input
          id={id}
          className="number-input"
          type="number"
          min={min}
          max={max}
          step={step}
          inputMode="decimal"
          value={rawValue}
          onChange={(event) => update(event.target.value)}
          onBlur={() => {
            if (
              rawValue.trim() !== "" &&
              Number.isFinite(parsedRawValue) &&
              parsedRawValue >= min &&
              parsedRawValue <= max &&
              !hasPrecisionError
            ) {
              setRawValue(formatNumericValue(parsedRawValue, decimalPlaces));
            }
          }}
          aria-describedby={help ? id + "-help" : undefined}
          aria-invalid={
            rawValue.trim() === "" ||
            !Number.isFinite(parsedRawValue) ||
            parsedRawValue < min ||
            parsedRawValue > max ||
            hasPrecisionError
          }
        />
        {id.toLowerCase().includes("amount") || id === "goal-target" ? (
          <span className="input-currency" aria-hidden="true">€</span>
        ) : null}
      </div>
      {help ? <p className="field-help" id={id + "-help"}>{help}</p> : null}
      {rawValue.trim() !== "" && (parsedRawValue < min || parsedRawValue > max) ? (
        <p className="field-error" role="alert">Enter a value from {min} to {max}.</p>
      ) : null}
      {hasPrecisionError ? (
        <p className="field-error" role="alert">Enter no more than {decimalPlaces} decimal places.</p>
      ) : null}
      {rawValue.trim() === "" ? (
        <p className="field-error" role="alert">Enter a value to continue.</p>
      ) : null}
    </div>
  );
}

type CalculatorInputsProps = {
  input: ProjectionInput;
  goalTarget: number;
  goalFrequency: ContributionFrequency;
  mode: "growth" | "goal";
  advanced: boolean;
  onInputChange: (changes: Partial<ProjectionInput>) => void;
  onGoalTargetChange: (value: number) => void;
  onGoalFrequencyChange: (frequency: ContributionFrequency) => void;
  onModeChange: (mode: "growth" | "goal") => void;
  onAdvancedChange: (advanced: boolean) => void;
  onFieldValidityChange: (field: string, message: string) => void;
  onReset: () => void;
};

export function CalculatorInputs({
  input,
  goalTarget,
  goalFrequency,
  mode,
  advanced,
  onInputChange,
  onGoalTargetChange,
  onGoalFrequencyChange,
  onModeChange,
  onAdvancedChange,
  onFieldValidityChange,
  onReset,
}: CalculatorInputsProps) {
  const [withdrawalKind, setWithdrawalKind] = useState<"none" | "one-time" | "recurring">(
    input.withdrawal?.type ?? "none",
  );

  useEffect(() => {
    setWithdrawalKind(input.withdrawal?.type ?? "none");
  }, [input.withdrawal?.type]);

  function updateWithdrawalKind(kind: "none" | "one-time" | "recurring") {
    setWithdrawalKind(kind);
    if (kind === "none") {
      onInputChange({ withdrawal: undefined });
      return;
    }

    if (kind === "one-time") {
      const year = input.withdrawal?.type === "one-time" ? input.withdrawal.year : 1;
      const amount = input.withdrawal?.amount ?? 5_000;
      onInputChange({ withdrawal: { type: "one-time", amount, year } });
      return;
    }

    const startYear = input.withdrawal?.type === "recurring" ? input.withdrawal.startYear : 1;
    const amount = input.withdrawal?.amount ?? 1_000;
    const frequency =
      input.withdrawal?.type === "recurring" ? input.withdrawal.frequency : "annual";
    onInputChange({ withdrawal: { type: "recurring", amount, startYear, frequency } });
  }

  function updateWithdrawal(changes: Partial<Withdrawal>) {
    if (input.withdrawal?.type === "one-time") {
      onInputChange({
        withdrawal: { ...input.withdrawal, ...changes, type: "one-time" } as Withdrawal,
      });
    } else if (input.withdrawal?.type === "recurring") {
      onInputChange({
        withdrawal: { ...input.withdrawal, ...changes, type: "recurring" } as Withdrawal,
      });
    }
  }

  const withdrawalAmount = input.withdrawal?.amount ?? 0;
  const withdrawalYear =
    input.withdrawal?.type === "one-time" ? input.withdrawal.year : input.withdrawal?.startYear ?? 1;
  const isRecurring = input.withdrawal?.type === "recurring";

  return (
    <aside className="calculator-card" aria-label="Projection assumptions">
      <div className="card-topline">
        <div className="segmented-control" role="group" aria-label="Calculator detail level">
          <button
            className={!advanced ? "segment active" : "segment"}
            type="button"
            aria-pressed={!advanced}
            onClick={() => {
              onAdvancedChange(false);
              onInputChange({ contributionFrequency: "monthly" });
            }}
          >
            Basic
          </button>
          <button
            className={advanced ? "segment active" : "segment"}
            type="button"
            aria-pressed={advanced}
            onClick={() => onAdvancedChange(true)}
          >
            Advanced
          </button>
        </div>
        <span className="step-indicator"><span /> Live estimate</span>
      </div>

      <div className="form-heading">
        <p className="eyebrow">Start with your assumptions</p>
        <h2>Build your projection</h2>
      </div>

      <div className="field-group mode-field">
        <span className="field-label">Planning mode</span>
        <div className="mode-switch" role="group" aria-label="Planning mode">
          <button
            type="button"
            className={mode === "growth" ? "mode-option selected" : "mode-option"}
            aria-pressed={mode === "growth"}
            onClick={() => onModeChange("growth")}
          >
            <span className="mode-icon" aria-hidden="true">↗</span>
            Project my growth
          </button>
          <button
            type="button"
            className={mode === "goal" ? "mode-option selected" : "mode-option"}
            aria-pressed={mode === "goal"}
            onClick={() => onModeChange("goal")}
          >
            <span className="mode-icon" aria-hidden="true">◎</span>
            Reach a savings goal
          </button>
        </div>
      </div>

      <div className="form-fields">
        <NumericField
          id="initial-amount"
          label="Starting amount"
          value={input.initialAmount}
          min={0}
          max={100_000_000}
          step={500}
          help="Your starting lump sum, if you have one."
          onChange={(value) => onInputChange({ initialAmount: value })}
          onValidityChange={onFieldValidityChange}
        />

        {mode === "growth" ? (
          <NumericField
            id="contribution-amount"
            label={input.contributionFrequency === "monthly" ? "Monthly savings" : "Annual savings"}
            value={input.contributionAmount}
            min={0}
            max={1_000_000}
            step={50}
            onChange={(value) => onInputChange({ contributionAmount: value })}
            onValidityChange={onFieldValidityChange}
          />
        ) : (
          <NumericField
            id="goal-target"
            label="Savings goal"
            value={goalTarget}
            min={0}
            max={100_000_000}
            step={1_000}
            help="The amount you would like to have at the end of your timeframe."
            onChange={onGoalTargetChange}
            onValidityChange={onFieldValidityChange}
          />
        )}

        <div className="range-field">
          <div className="range-title">
            <label htmlFor="years-range">Timeframe</label>
            <span><strong>{input.years}</strong> years</span>
          </div>
          <input
            id="years-range"
            className="range-input"
            type="range"
            min={1}
            max={40}
            step={1}
            value={input.years}
            aria-label="Timeframe in years"
            onChange={(event) => onInputChange({ years: Number(event.target.value) })}
          />
          <div className="range-endpoints"><span>1 year</span><span>40 years</span></div>
        </div>

        <NumericField
          id="annual-return"
          label="Assumed annual return"
          value={input.annualReturnPercent}
          min={0}
          max={15}
          step={0.1}
          suffix="%"
          help="An assumption for illustration. Actual returns vary."
          onChange={(value) => onInputChange({ annualReturnPercent: value })}
          onValidityChange={onFieldValidityChange}
        />

        <NumericField
          id="annual-fee"
          label="Annual fee"
          value={input.annualFeePercent}
          min={0}
          max={5}
          step={0.01}
          decimalPlaces={2}
          suffix="%"
          help="Deducted from the assumed annual return in this projection."
          onChange={(value) => onInputChange({ annualFeePercent: value })}
          onValidityChange={onFieldValidityChange}
        />

        {mode === "goal" ? (
          <div className="choice-field">
            <span className="field-label">How often would you save?</span>
            <div className="choice-row" role="group" aria-label="Savings frequency">
              <button
                type="button"
                className={goalFrequency === "monthly" ? "choice-button selected" : "choice-button"}
                aria-pressed={goalFrequency === "monthly"}
                onClick={() => onGoalFrequencyChange("monthly")}
              >
                Monthly
              </button>
              <button
                type="button"
                className={goalFrequency === "annual" ? "choice-button selected" : "choice-button"}
                aria-pressed={goalFrequency === "annual"}
                onClick={() => onGoalFrequencyChange("annual")}
              >
                Annually
              </button>
            </div>
          </div>
        ) : null}

        {advanced ? (
          <>
            {mode === "growth" ? (
              <div className="choice-field">
                <span className="field-label">Savings frequency</span>
                <div className="choice-row" role="group" aria-label="Contribution frequency">
                  <button
                    type="button"
                    className={input.contributionFrequency === "monthly" ? "choice-button selected" : "choice-button"}
                    aria-pressed={input.contributionFrequency === "monthly"}
                    onClick={() => onInputChange({ contributionFrequency: "monthly" })}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    className={input.contributionFrequency === "annual" ? "choice-button selected" : "choice-button"}
                    aria-pressed={input.contributionFrequency === "annual"}
                    onClick={() => onInputChange({ contributionFrequency: "annual" })}
                  >
                    Annually
                  </button>
                </div>
              </div>
            ) : null}

            <NumericField
              id="annual-increase"
              label="Annual savings increase"
              value={input.annualIncreasePercent}
              min={0}
              max={10}
              step={0.25}
              suffix="%"
              help="Optional yearly increase to your contribution."
              onChange={(value) => onInputChange({ annualIncreasePercent: value })}
              onValidityChange={onFieldValidityChange}
            />

            <section className="withdrawal-section" aria-labelledby="withdrawals-heading">
              <div className="section-divider" />
              <div className="withdrawal-heading">
                <div>
                  <p className="eyebrow">Optional adjustment</p>
                  <h3 id="withdrawals-heading">Withdrawals</h3>
                </div>
                <span className="optional-pill">Optional</span>
              </div>
              <label className="select-label" htmlFor="withdrawal-kind">Withdrawal schedule</label>
              <select
                id="withdrawal-kind"
                className="select-input"
                value={withdrawalKind}
                onChange={(event) => updateWithdrawalKind(event.target.value as "none" | "one-time" | "recurring")}
              >
                <option value="none">No withdrawals</option>
                <option value="one-time">One-time withdrawal</option>
                <option value="recurring">Recurring withdrawals</option>
              </select>

              {withdrawalKind !== "none" ? (
                <div className="withdrawal-fields">
                  <NumericField
                    id="withdrawal-amount"
                    label={isRecurring ? "Withdrawal amount" : "Withdrawal amount"}
                    value={withdrawalAmount}
                    min={0}
                    max={100_000_000}
                    step={500}
                    suffix={isRecurring ? (input.withdrawal?.type === "recurring" && input.withdrawal.frequency === "monthly" ? "/ month" : "/ year") : undefined}
                    onChange={(amount) => updateWithdrawal({ amount })}
                    onValidityChange={onFieldValidityChange}
                  />
                  {isRecurring ? (
                    <div className="choice-field compact-choice">
                      <span className="field-label">Recurring frequency</span>
                      <div className="choice-row" role="group" aria-label="Withdrawal frequency">
                        <button
                          type="button"
                          className={input.withdrawal?.type === "recurring" && input.withdrawal.frequency === "monthly" ? "choice-button selected" : "choice-button"}
                          aria-pressed={input.withdrawal?.type === "recurring" && input.withdrawal.frequency === "monthly"}
                          onClick={() => updateWithdrawal({ frequency: "monthly" })}
                        >
                          Monthly
                        </button>
                        <button
                          type="button"
                          className={input.withdrawal?.type === "recurring" && input.withdrawal.frequency === "annual" ? "choice-button selected" : "choice-button"}
                          aria-pressed={input.withdrawal?.type === "recurring" && input.withdrawal.frequency === "annual"}
                          onClick={() => updateWithdrawal({ frequency: "annual" })}
                        >
                          Annually
                        </button>
                      </div>
                    </div>
                  ) : null}
                  <NumericField
                    id="withdrawal-year"
                    label={isRecurring ? "Start from year" : "Withdrawal in year"}
                    value={withdrawalYear}
                    min={1}
                    max={input.years}
                    step={1}
                    onChange={(year) =>
                      updateWithdrawal(isRecurring ? { startYear: year } : { year } as Partial<Withdrawal>)
                    }
                    onValidityChange={onFieldValidityChange}
                  />
                </div>
              ) : null}
              <p className="withdrawal-note">
                Withdrawals are applied at period end and will not reduce the balance below €0.
              </p>
            </section>
          </>
        ) : (
          <button
            className="advanced-hint"
            type="button"
            onClick={() => onAdvancedChange(true)}
          >
            <span>＋</span> Add withdrawals or annual increases
          </button>
        )}
      </div>

      <div className="assumption-note">
        <span className="info-icon" aria-hidden="true">i</span>
        <p>Figures are illustrative and do not include fees, tax or inflation.</p>
      </div>
      <button
        className="reset-button"
        type="button"
        onClick={onReset}
      >
        Reset assumptions <span aria-hidden="true">↺</span>
      </button>
      <p className="sr-only" aria-live="polite">
        Current starting amount {formatCurrency(input.initialAmount)} over {input.years} years.
      </p>
    </aside>
  );
}
