
import ViewSellOrderPage from "@/page/dashboard/sell-order/view";

export const metadata = {
    title: "View Order - DragBizz Store",
    description: "View sell order details",
};

export default async function ViewSellOrderRoute({ params }) {
    const { id } = await params;
    return <ViewSellOrderPage orderId={id} />;
}
