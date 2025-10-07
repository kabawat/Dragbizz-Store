import EditBill from '@/page/dashboard/bills/edit';

export const metadata = {
  title: 'Edit Bill - DragBizz Store',
  description: 'Update bill information and manage bill details',
  keywords: 'edit bill, update bill, bill management, DragBizz Store',
};

export default function BillEditPage({ params }) {
  const billId = params.id;
  return <EditBill billId={billId} />;
}
