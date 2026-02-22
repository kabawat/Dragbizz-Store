import ViewPurchaseOrderPage from "@/page/view/purchase-order";
export const metadata = {
  title: "Purchase Order | DragBizz",
  description: "View shared purchase order details.",
};

export default async function PublicPurchaseOrderView({ params }) {
  const { publicId } = await params;

  return <ViewPurchaseOrderPage purchaseOrderId={publicId} />;
}
