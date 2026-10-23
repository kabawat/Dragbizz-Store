"use client";

import { ArrowUpRight, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const formatCurrency = (value) =>
  `₹${(Number(value) || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

const compactCurrency = (value) =>
  `₹${(Number(value) || 0).toLocaleString("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  })}`;

const PERIODS = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
];

export function StoreSalesTrend({
  data = [],
  loading = false,
  error,
  selectedDays = 7,
  onRangeChange,
  onNavigate,
}) {
  const totalRevenue = data.reduce((total, day) => total + day.revenue, 0);
  const totalSales = data.reduce((total, day) => total + day.sales, 0);

  return (
    <section
      className="store-sales-trend"
      aria-labelledby="store-sales-trend-title"
    >
      <header className="store-sales-trend__header">
        <div className="store-sales-trend__title-wrap">
          <span className="store-sales-trend__icon" aria-hidden="true">
            <TrendingUp className="h-4 w-4" />
          </span>
          <div>
            <p className="store-sales-trend__eyebrow">SALES PERFORMANCE</p>
            <h2 id="store-sales-trend-title">Last {selectedDays} days</h2>
          </div>
        </div>
        <div
          className="store-sales-trend__periods"
          role="group"
          aria-label="Sales date range"
        >
          {PERIODS.map(({ days, label }) => (
            <button
              key={days}
              type="button"
              className={`store-sales-trend__period${selectedDays === days ? " is-active" : ""}`}
              aria-pressed={selectedDays === days}
              disabled={loading}
              onClick={() => onRangeChange?.(days)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="store-sales-trend__summary">
          {loading ? (
            <>
              <span className="store-sales-trend__summary-skeleton" />
              <span className="store-sales-trend__summary-skeleton is-short" />
            </>
          ) : (
            <>
              <strong>{formatCurrency(totalRevenue)}</strong>
              <span>
                {totalSales.toLocaleString("en-IN")} released invoices
              </span>
            </>
          )}
        </div>
      </header>

      <div className="store-sales-trend__chart" aria-busy={loading}>
        {loading ? (
          <div className="store-sales-trend__skeleton" role="status">
            <span className="sr-only">
              Loading sales for the last {selectedDays} days
            </span>
          </div>
        ) : error ? (
          <div className="store-sales-trend__message" role="status">
            Sales trend is unavailable right now.
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 12, right: 14, left: 4, bottom: 0 }}
                aria-label={`Daily sales revenue for the last ${selectedDays} days`}
              >
                <defs>
                  <linearGradient
                    id="store-sales-fill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#4384dc" stopOpacity={0.2} />
                    <stop
                      offset="100%"
                      stopColor="#4384dc"
                      stopOpacity={0.015}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke="var(--store-chart-grid)"
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--store-chart-label)", fontSize: 12 }}
                  tickMargin={10}
                  interval={selectedDays === 7 ? 0 : "preserveStartEnd"}
                  minTickGap={24}
                />
                <YAxis
                  width={64}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--store-chart-label)", fontSize: 11 }}
                  tickFormatter={compactCurrency}
                />
                <Tooltip
                  labelFormatter={(_label, points) =>
                    points?.[0]?.payload?.dateLabel ?? _label
                  }
                  formatter={(value) => [formatCurrency(value), "Sales"]}
                  contentStyle={{
                    borderRadius: 12,
                    borderColor: "rgb(var(--color-border-primary))",
                    backgroundColor: "rgb(var(--color-bg-primary))",
                    color: "rgb(var(--color-text-primary))",
                    boxShadow: "0 10px 28px rgba(18, 34, 58, .14)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4384dc"
                  strokeWidth={2.5}
                  fill="url(#store-sales-fill)"
                  activeDot={{ r: 4, strokeWidth: 0 }}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
            {totalSales === 0 && (
              <p className="store-sales-trend__empty-note">
                No released sales in this period yet.
              </p>
            )}
          </>
        )}
      </div>

      <footer className="store-sales-trend__footer">
        <span>Based on released invoices · IST</span>
        <button
          type="button"
          onClick={() => onNavigate?.("/dashboard/analytics/daily-sales")}
          className="store-sales-trend__link"
        >
          View sales <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </footer>
    </section>
  );
}
