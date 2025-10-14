import ViewPurchaseOrder from '@/page/dashboard/purchase-orders/[id]';

export const metadata = {
  title: 'View Purchase Order - DragBizz Store',
  description: 'View purchase order details',
};

export default function Page() {
  return <ViewPurchaseOrder />;
}