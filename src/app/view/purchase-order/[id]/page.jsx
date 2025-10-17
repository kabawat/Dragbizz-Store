import ViewPurchaseOrder from '@/page/view/purchase-order';

export const metadata = {
  title: 'Purchase Order - DragBizz Store',
  description: 'View purchase order details',
  keywords: 'purchase order, view, DragBizz Store',
};

export default async function ViewPurchaseOrderPage({ params }) {
  const { id } = await params;
  return <ViewPurchaseOrder purchaseOrderId={id} />;
}
