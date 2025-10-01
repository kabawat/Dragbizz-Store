import PendingPayments from '@/page/dashboard/payments/pending';

export const metadata = {
  title: 'Pending Payments - DragBizz Store',
  description: 'View and manage pending supplier payments',
  keywords: 'pending payments, unpaid payments, payment management, DragBizz Store',
};

export default function PendingPaymentsPage() {
  return <PendingPayments />;
}
