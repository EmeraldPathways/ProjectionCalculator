import type { ProjectionInput, ProjectionResult } from "@/lib/calculator";
import { formatCurrency, formatPercent } from "@/lib/format";

type SummaryMetricsProps = {
  input: ProjectionInput;
  result: ProjectionResult;
  print?: boolean;
};

export function SummaryMetrics({ input, result, print = false }: SummaryMetricsProps) {
  const cumulativeGrowthPercent =
    result.totalContributions === 0
      ? 0
      : (result.totalGrowth / result.totalContributions) * 100;
  const metrics = [
    {
      label: "Starting amount",
      value: formatCurrency(input.initialAmount),
      icon: "◉",
      iconClass: "starting-icon",
    },
    {
      label: "Total contributions",
      value: formatCurrency(result.totalContributions),
      icon: "↗",
      iconClass: "contributions-icon",
    },
    {
      label: "Estimated growth",
      value: formatCurrency(result.totalGrowth),
      icon: "✳",
      iconClass: "growth-icon",
    },
    {
      label: "Cumulative growth",
      value: formatPercent(cumulativeGrowthPercent, 2),
      icon: "%",
      iconClass: "cumulative-growth-icon",
    },
    {
      label: "Total withdrawals",
      value: formatCurrency(result.totalWithdrawals),
      icon: "↘",
      iconClass: "withdrawals-icon",
    },
  ];

  if (print) {
    return (
      <div className="print-stat-grid" aria-label="Projection summary metrics">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="metrics-row" aria-label="Projection summary metrics">
      {metrics.map((metric) => (
        <div className="metric" key={metric.label}>
          <span className={"metric-icon " + metric.iconClass} aria-hidden="true">
            {metric.icon}
          </span>
          <div>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </div>
        </div>
      ))}
    </div>
  );
}
