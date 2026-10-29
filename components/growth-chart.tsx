"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AnnualProjection } from "@/lib/calculator";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";

type ChartPoint = {
  year: number;
  balance: number;
  invested: number;
};

function buildChartData(rows: AnnualProjection[], initialAmount: number): ChartPoint[] {
  return [
    { year: 0, balance: initialAmount, invested: initialAmount },
    ...rows.map((row) => ({
      year: row.year,
      balance: row.balance,
      invested: initialAmount + row.cumulativeContributions,
    })),
  ];
}

function PrintSvgChart({
  data,
  horizon,
}: {
  data: ChartPoint[];
  horizon: number;
}) {
  const width = 900;
  const height = 320;
  const left = 72;
  const right = 20;
  const top = 18;
  const bottom = 44;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const maxValue = Math.max(1, ...data.map((point) => Math.max(point.balance, point.invested)));
  const x = (index: number) => left + (data.length <= 1 ? 0 : (index / (data.length - 1)) * plotWidth);
  const y = (value: number) => top + plotHeight - (value / maxValue) * plotHeight;
  const balancePath = data
    .map((point, index) => (index === 0 ? "M" : "L") + x(index) + " " + y(point.balance))
    .join(" ");
  const investedPath = data
    .map((point, index) => (index === 0 ? "M" : "L") + x(index) + " " + y(point.invested))
    .join(" ");
  const first = data[0];
  const last = data[data.length - 1];
  const areaPath = balancePath + " L " + x(data.length - 1) + " " + y(0) + " L " + x(0) + " " + y(0) + " Z";
  const middleYear = Math.round(horizon / 2);
  const yearLabels = Array.from(new Set([0, middleYear, horizon]));

  return (
    <div className="print-chart-wrap">
      <svg
        className="print-chart-svg"
        viewBox={"0 0 " + width + " " + height}
        role="img"
        aria-label={"Projected balance and total amount invested over " + horizon + " years"}
      >
        <title>Projected balance compared with total amount invested</title>
        {[0, 0.5, 1].map((fraction) => {
          const value = maxValue * fraction;
          const gridY = y(value);
          return (
            <g key={fraction}>
              <line x1={left} y1={gridY} x2={width - right} y2={gridY} stroke="#e3e5df" strokeWidth="1" />
              <text x={left - 10} y={gridY + 4} textAnchor="end" className="chart-axis-label">
                {formatCompactCurrency(value)}
              </text>
            </g>
          );
        })}
        <path d={areaPath} fill="url(#omega-print-fill)" />
        <path d={balancePath} fill="none" stroke="#661e24" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d={investedPath} fill="none" stroke="#988b54" strokeWidth="3" strokeDasharray="9 7" strokeLinecap="round" strokeLinejoin="round" />
        {yearLabels.map((year) => {
          const index = Math.max(0, Math.min(data.length - 1, year));
          return (
            <text key={year} x={x(index)} y={height - 12} textAnchor="middle" className="chart-axis-label">
              {year === 0 ? "Today" : "Year " + year}
            </text>
          );
        })}
        <defs>
          <linearGradient id="omega-print-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#661e24" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#661e24" stopOpacity="0.015" />
          </linearGradient>
        </defs>
        {first && last ? (
          <text x={width - right} y={top - 4} textAnchor="end" className="chart-axis-label">
            Year-end balance: {formatCurrency(last.balance)}
          </text>
        ) : null}
      </svg>
      <div className="chart-legend print-chart-legend" aria-hidden="true">
        <span><i className="legend-line legend-balance" />Projected balance</span>
        <span><i className="legend-line legend-invested" />Total invested (starting amount + contributions)</span>
      </div>
    </div>
  );
}

export function GrowthChart({
  rows,
  initialAmount,
  print = false,
}: {
  rows: AnnualProjection[];
  initialAmount: number;
  print?: boolean;
}) {
  const data = buildChartData(rows, initialAmount);

  if (print) {
    return <PrintSvgChart data={data} horizon={rows.length} />;
  }

  return (
    <div className="chart-content">
      <div className="chart-legend" aria-hidden="true">
        <span><i className="legend-line legend-balance" />Projected balance</span>
        <span><i className="legend-line legend-invested" />Total invested</span>
      </div>
      <div className="chart-frame" role="img" aria-label="Line graph of projected balance and total invested over time">
        <ResponsiveContainer width="100%" height={310}>
          <AreaChart data={data} margin={{ top: 10, right: 12, left: 2, bottom: 4 }}>
            <defs>
              <linearGradient id="omega-balance-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#661e24" stopOpacity={0.16} />
                <stop offset="100%" stopColor="#661e24" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e8e9e3" strokeDasharray="3 5" vertical={false} />
            <XAxis
              dataKey="year"
              tickFormatter={(year: number) => (year === 0 ? "Today" : String(year))}
              tick={{ fill: "#6f716d", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickCount={6}
              label={{ value: "Years", position: "insideBottomRight", offset: -3, fill: "#777" }}
            />
            <YAxis
              tickFormatter={formatCompactCurrency}
              tick={{ fill: "#6f716d", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={64}
            />
            <Tooltip
              formatter={(value, name) => [
                formatCurrency(Number(value)),
                name === "balance" ? "Projected balance" : "Total invested",
              ]}
              labelFormatter={(year) => (Number(year) === 0 ? "Today" : "Year " + year)}
              contentStyle={{
                borderRadius: 12,
                borderColor: "#dedfd8",
                boxShadow: "0 10px 28px rgba(29, 36, 29, 0.12)",
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#661e24"
              strokeWidth={3}
              fill="url(#omega-balance-fill)"
              activeDot={{ r: 5, fill: "#661e24", stroke: "#fff", strokeWidth: 2 }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="invested"
              stroke="#988b54"
              strokeWidth={2}
              strokeDasharray="6 5"
              dot={false}
              activeDot={{ r: 4, fill: "#988b54", stroke: "#fff", strokeWidth: 2 }}
              isAnimationActive={false}
            />
            <Legend content={() => null} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="chart-caption">
        The graph compares your projected balance with the starting amount plus your contributions.
      </p>
    </div>
  );
}
