export type ContributionFrequency = "monthly" | "annual";

export type Withdrawal =
  | { type: "one-time"; amount: number; year: number }
  | {
      type: "recurring";
      amount: number;
      frequency: ContributionFrequency;
      startYear: number;
    };

export interface ProjectionInput {
  initialAmount: number;
  contributionAmount: number;
  contributionFrequency: ContributionFrequency;
  annualIncreasePercent: number;
  annualReturnPercent: number;
  years: number;
  withdrawal?: Withdrawal;
}

export interface AnnualProjection {
  year: number;
  contributions: number;
  withdrawals: number;
  growth: number;
  balance: number;
  cumulativeContributions: number;
}

export interface ProjectionResult {
  annualRows: AnnualProjection[];
  finalBalance: number;
  totalContributions: number;
  totalWithdrawals: number;
  totalGrowth: number;
  depletionYear?: number;
}

function isValidWithdrawal(withdrawal: Withdrawal | undefined, years: number): boolean {
  if (!withdrawal) return true;
  if (!Number.isFinite(withdrawal.amount) || withdrawal.amount < 0) return false;

  if (withdrawal.type === "one-time") {
    return Number.isInteger(withdrawal.year) && withdrawal.year >= 1 && withdrawal.year <= years;
  }

  return (
    (withdrawal.frequency === "monthly" || withdrawal.frequency === "annual") &&
    Number.isInteger(withdrawal.startYear) &&
    withdrawal.startYear >= 1 &&
    withdrawal.startYear <= years
  );
}

function isValidInput(input: ProjectionInput): boolean {
  return (
    Number.isFinite(input.initialAmount) &&
    input.initialAmount >= 0 &&
    Number.isFinite(input.contributionAmount) &&
    input.contributionAmount >= 0 &&
    (input.contributionFrequency === "monthly" || input.contributionFrequency === "annual") &&
    Number.isFinite(input.annualIncreasePercent) &&
    input.annualIncreasePercent >= 0 &&
    input.annualIncreasePercent <= 10 &&
    Number.isFinite(input.annualReturnPercent) &&
    input.annualReturnPercent >= 0 &&
    input.annualReturnPercent <= 15 &&
    Number.isInteger(input.years) &&
    input.years >= 1 &&
    input.years <= 40 &&
    isValidWithdrawal(input.withdrawal, input.years)
  );
}

export function calculateProjection(input: ProjectionInput): ProjectionResult {
  if (!isValidInput(input)) {
    throw new RangeError("Enter valid, non-negative values within the displayed limits.");
  }

  const monthlyRate = input.annualReturnPercent / 100 / 12;
  const annualIncrease = input.annualIncreasePercent / 100;
  let balance = input.initialAmount;
  let cumulativeContributions = 0;
  let totalContributions = 0;
  let totalWithdrawals = 0;
  let totalGrowth = 0;
  let depletionYear: number | undefined;
  const annualRows: AnnualProjection[] = [];

  for (let year = 1; year <= input.years; year += 1) {
    let yearlyContributions = 0;
    let yearlyWithdrawals = 0;
    let yearlyGrowth = 0;
    const contributionForYear =
      input.contributionAmount * Math.pow(1 + annualIncrease, year - 1);

    for (let month = 1; month <= 12; month += 1) {
      const monthInYear = (balance * monthlyRate);
      balance += monthInYear;
      yearlyGrowth += monthInYear;
      totalGrowth += monthInYear;

      const contribution =
        input.contributionFrequency === "monthly"
          ? contributionForYear
          : month === 12
            ? contributionForYear
            : 0;

      balance += contribution;
      yearlyContributions += contribution;
      totalContributions += contribution;
      cumulativeContributions += contribution;

      const withdrawal = input.withdrawal;
      let plannedWithdrawal = 0;

      if (withdrawal?.type === "one-time" && withdrawal.year === year && month === 12) {
        plannedWithdrawal = withdrawal.amount;
      } else if (withdrawal?.type === "recurring" && year >= withdrawal.startYear) {
        if (withdrawal.frequency === "monthly") {
          plannedWithdrawal = withdrawal.amount;
        } else if (month === 12) {
          plannedWithdrawal = withdrawal.amount;
        }
      }

      const appliedWithdrawal = Math.min(balance, plannedWithdrawal);
      balance = Math.max(0, balance - appliedWithdrawal);
      yearlyWithdrawals += appliedWithdrawal;
      totalWithdrawals += appliedWithdrawal;

      if (plannedWithdrawal > 0 && balance <= 0 && depletionYear === undefined) {
        depletionYear = year;
      }
    }

    annualRows.push({
      year,
      contributions: yearlyContributions,
      withdrawals: yearlyWithdrawals,
      growth: yearlyGrowth,
      balance,
      cumulativeContributions,
    });
  }

  return {
    annualRows,
    finalBalance: balance,
    totalContributions,
    totalWithdrawals,
    totalGrowth,
    depletionYear,
  };
}

export function calculateRequiredSaving(
  input: Omit<ProjectionInput, "contributionAmount"> & { targetAmount: number },
): number | null {
  if (!Number.isFinite(input.targetAmount) || input.targetAmount < 0) return null;

  const projectionInput = (contributionAmount: number): ProjectionInput => ({
    initialAmount: input.initialAmount,
    contributionAmount,
    contributionFrequency: input.contributionFrequency,
    annualIncreasePercent: input.annualIncreasePercent,
    annualReturnPercent: input.annualReturnPercent,
    years: input.years,
    withdrawal: input.withdrawal,
  });

  try {
    if (calculateProjection(projectionInput(0)).finalBalance >= input.targetAmount) return 0;

    let low = 0;
    let high = 10_000_000;
    if (calculateProjection(projectionInput(high)).finalBalance < input.targetAmount) return null;

    for (let iteration = 0; iteration < 64; iteration += 1) {
      const middle = (low + high) / 2;
      const projected = calculateProjection(projectionInput(middle)).finalBalance;
      if (projected >= input.targetAmount) high = middle;
      else low = middle;
    }

    return high;
  } catch {
    return null;
  }
}
