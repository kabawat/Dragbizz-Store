"use client";

import {
	BellRing,
	CheckCheck,
	Clock3,
	PackageSearch,
	TrendingDown,
} from "lucide-react";
import DragAiIcon from "@/components/common/DragAiIcon";

const demoAlerts = [
	{
		icon: TrendingDown,
		tone: "risk",
		title: "Amul Gold Milk",
		detail: "About 1.2 days of stock left",
		meta: "LOW STOCK",
	},
	{
		icon: TrendingDown,
		tone: "warning",
		title: "Fortune Sunlite Oil",
		detail: "About 2.4 days of stock left",
		meta: "REORDER SOON",
	},
	{
		icon: PackageSearch,
		tone: "warning",
		title: "3 products need a restock",
		detail: "Below their reorder level",
		meta: "STOCK",
	},
	{
		icon: CheckCheck,
		tone: "success",
		title: "Repeat alerts grouped",
		detail: "One update per product",
		meta: "DEDUPED",
	},
	{
		icon: Clock3,
		tone: "blue",
		title: "Morning store briefing",
		detail: "Daily summary at 08:00 AM IST",
		meta: "SCHEDULED",
	},
];

export function ProactiveRetailIntelligence() {
	return (
		<section className="intelligence-panel" aria-labelledby="intelligence-title">
			<header className="intelligence-panel__header">
				<div className="intelligence-panel__title-wrap">
					<span className="intelligence-panel__brand-icon">
						<DragAiIcon className="h-4 w-4" aria-hidden="true" />
					</span>
					<div>
						<p className="intelligence-panel__eyebrow">PROACTIVE RETAIL</p>
						<h2 id="intelligence-title">Smart alerts</h2>
					</div>
				</div>
				<span className="intelligence-panel__preview">SAMPLE</span>
			</header>

			<p className="intelligence-panel__description">
				Stock signals, neatly grouped so the important ones stand out.
			</p>

			<ul className="intelligence-panel__list">
				{demoAlerts.map(({ icon: Icon, tone, title, detail, meta }) => (
					<li className="intelligence-notification" key={title}>
						<span className={`intelligence-notification__icon intelligence-notification__icon--${tone}`}>
							<Icon className="h-4 w-4" aria-hidden="true" />
						</span>
						<span className="intelligence-notification__copy">
							<strong>{title}</strong>
							<span>{detail}</span>
						</span>
						<span className={`intelligence-notification__meta intelligence-notification__meta--${tone}`}>
							{meta}
						</span>
					</li>
				))}
			</ul>

			<footer className="intelligence-panel__footer">
				<BellRing className="h-3.5 w-3.5" aria-hidden="true" />
				Preview only · sample alerts, not live inventory
			</footer>
		</section>
	);
}
