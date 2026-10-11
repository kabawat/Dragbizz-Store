"use client";
import { AnalyticsChartCard as SharedAnalyticsChartCard } from "@dragorbit/features/analytics";
import ComingSoonChart from "@/components/analytics/ComingSoonChart";
export default function AnalyticsChartCard(props) {
  return (
    <SharedAnalyticsChartCard {...props} ComingSoonChart={ComingSoonChart} />
  );
}
