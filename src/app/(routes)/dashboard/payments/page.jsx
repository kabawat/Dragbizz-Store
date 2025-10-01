import Payments from '@/page/dashboard/payments';

export const metadata = {
  title: 'Payments - DragBizz Store',
  description: 'Manage supplier payments and track payment status',
  keywords: 'payments, supplier payments, payment tracking, DragBizz Store',
};

export default function PaymentsPage() {
  return <Payments />;
}
