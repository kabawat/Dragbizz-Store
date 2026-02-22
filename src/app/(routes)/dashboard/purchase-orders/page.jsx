import PurchaseOrders from "@/page/dashboard/purchase-orders";

export const metadata = {
  title: "Purchase Orders - DragBizz Store",
  description: "Manage supplier purchase orders and track status",
  keywords: "purchase orders, PO, supplier orders, DragBizz Store",
};

export default function PurchaseOrdersPage() {
  return <PurchaseOrders />;
}
