import SubscriptionManagementPage from "@/page/dashboard/management/subscription";

export const metadata = {
    title: "Subscription Management - DragBizz Store",
    description: "Manage your store's plan, billing message and renewals",
};

export default function SubscriptionPageRoute() {
    return <SubscriptionManagementPage />;
}
