import type { AnnualProjection } from "@/lib/calculator";
import { formatCurrency } from "@/lib/format";

export function AnnualTable({
  rows,
  compact = false,
}: {
  rows: AnnualProjection[];
  compact?: boolean;
}) {
  return (
    <div className={compact ? "annual-table-wrapper print-table" : "annual-table-wrapper screen-table"}>
      <table className="annual-table">
        <caption className="sr-only">Annual savings projection breakdown</caption>
        <thead>
          <tr>
            <th scope="col">Year</th>
            <th scope="col">Contributions</th>
            <th scope="col">Withdrawals</th>
            <th scope="col">Growth</th>
            <th scope="col">Closing balance</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.year}>
              <th scope="row">{row.year}</th>
              <td>{formatCurrency(row.contributions)}</td>
              <td>{row.withdrawals > 0 ? "−" + formatCurrency(row.withdrawals) : "—"}</td>
              <td className={row.growth >= 0 ? "growth-value" : "negative-value"}>
                {formatCurrency(row.growth)}
              </td>
              <td className="balance-value">{formatCurrency(row.balance)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
