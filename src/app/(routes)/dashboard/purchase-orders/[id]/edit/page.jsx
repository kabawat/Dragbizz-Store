import EditPurchaseOrder from "@/page/dashboard/purchase-orders/edit";

export const metadata = {
  title: "Edit Purchase Order - DragBizz Store",
  description: "Update purchase order details",
};

export default async function EditPurchaseOrderPage({ params }) {
  const { id } = await params;
  return <EditPurchaseOrder poId={id} />;
}
