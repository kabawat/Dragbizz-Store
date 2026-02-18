import SalesAnalytics from "@/page/dashboard/analytics/sales";

export const metadata = {
    title: "Sales Overview - DragBizz Store",
    description: "View sales overview and analytics",
    keywords: "sales overview, sales analytics, dashboard, DragBizz Store",
};

export default function SalesOverviewPage() {
    return <SalesAnalytics titleOverride="Sales Overview" descriptionOverride="Your sales performance at a glance" />;
}
