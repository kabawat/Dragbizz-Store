import ViewBillPage from '@/page/dashboard/bills/view';

export const metadata = {
  title: 'View Bill - DragBizz Store',
  description: 'View detailed bill information and manage bill status',
  keywords: 'bill details, view bill, bill information, DragBizz Store',
};

export default function BillViewPage({ params }) {
  const billId = params.id;
  return <ViewBillPage billId={billId} />;
}
