"use client";

import { getSummaryTotals } from "@dragorbit/features/dashboard";
import {
	Activity,
	IndianRupee,
	Package,
	Users,
	WalletCards,
} from "lucide-react";
import {
	Cell,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
} from "recharts";

const featuredMetrics = [
	{ id: "revenue", icon: IndianRupee, tone: "blue" },
	{ id: "profit", icon: WalletCards, tone: "violet" },
	{ id: "customers", icon: Users, tone: "green" },
	{ id: "products", icon: Package, tone: "amber" },
];

const stockColors = ["#2f9b72", "#e68a78"];

export function StoreDashboardOverview({ summary, metrics, loading, t }) {
	const totals = getSummaryTotals(summary);
	const totalProducts = Math.max(0, totals.products);
	const outOfStock = Math.min(totalProducts, Math.max(0, totals.outOfStock));
	const inStock = Math.max(0, totalProducts - outOfStock);
	const healthyPercent = totalProducts
		? Math.round((inStock / totalProducts) * 100)
		: 0;
	const chartData = [
		{ name: "In stock", value: inStock },
		{ name: "Out of stock", value: outOfStock },
	];
	const metricsById = Object.fromEntries(metrics.map((metric) => [metric.id, metric]));

	return (
		<section className="store-overview" aria-labelledby="store-overview-title">
			<header className="store-overview__header">
				<div>
					<p className="store-overview__eyebrow">STORE PERFORMANCE</p>
					<h2 id="store-overview-title">{t("dashboard.businessOverview")}</h2>
				</div>
				<span className="store-overview__period">
					<Activity className="h-3.5 w-3.5" aria-hidden="true" />
					Current snapshot
				</span>
			</header>

			<div className="store-overview__metrics" aria-busy={loading}>
				{featuredMetrics.map(({ id, icon: Icon, tone }) => {
					const metric = metricsById[id];
					return (
						<article className="store-metric-card" key={id}>
							<div className={`store-metric-card__icon store-metric-card__icon--${tone}`}>
								<Icon className="h-4 w-4" aria-hidden="true" />
							</div>
							<div className="store-metric-card__label">{metric?.title}</div>
							<div className="store-metric-card__value">
								{loading ? <span className="store-metric-card__skeleton" /> : metric?.value}
							</div>
						</article>
					);
				})}
			</div>

			<section className="store-inventory-card" aria-labelledby="inventory-health-title">
				<div className="store-inventory-card__copy">
					<div>
						<h3 id="inventory-health-title">Inventory health</h3>
						<p>{totalProducts.toLocaleString("en-IN")} products in your catalog</p>
					</div>
					<div className="store-inventory-card__legend" aria-live="polite">
						<span><i className="store-inventory-card__dot store-inventory-card__dot--good" />In stock <strong>{inStock.toLocaleString("en-IN")}</strong></span>
						<span><i className="store-inventory-card__dot store-inventory-card__dot--risk" />Out of stock <strong>{outOfStock.toLocaleString("en-IN")}</strong></span>
					</div>
				</div>
				<div className="store-inventory-card__chart" aria-label={`${healthyPercent}% of catalog products are in stock`}>
					{loading ? (
						<div className="store-inventory-card__chart-skeleton" />
					) : totalProducts > 0 ? (
						<>
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={chartData}
										dataKey="value"
										nameKey="name"
										innerRadius="72%"
										outerRadius="94%"
										paddingAngle={outOfStock > 0 ? 4 : 0}
										stroke="none"
										isAnimationActive={false}
									>
										{chartData.map((entry, index) => (
											<Cell key={entry.name} fill={stockColors[index]} />
										))}
									</Pie>
									<Tooltip formatter={(value, name) => [`${value} products`, name]} />
								</PieChart>
							</ResponsiveContainer>
							<div className="store-inventory-card__chart-label">
								<strong>{healthyPercent}%</strong>
								<span>healthy</span>
							</div>
						</>
					) : (
						<div className="store-inventory-card__empty">No stock data yet</div>
					)}
				</div>
			</section>
		</section>
	);
}
