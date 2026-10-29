const euroFormatter = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const compactEuroFormatter = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  notation: "compact",
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number): string {
  return euroFormatter.format(Number.isFinite(value) ? value : 0);
}

export function formatCompactCurrency(value: number): string {
  return compactEuroFormatter.format(Number.isFinite(value) ? value : 0);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat("en-IE", {
    maximumFractionDigits: 2,
  }).format(value) + "%";
}
