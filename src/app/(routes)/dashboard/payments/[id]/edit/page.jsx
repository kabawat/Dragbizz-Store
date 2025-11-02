import EditPayment from '@/page/dashboard/payments/edit';

export const metadata = {
  title: 'Edit Payment - DragBizz Store',
  description: 'Update payment information and manage payment details',
  keywords: 'edit payment, update payment, payment management, DragBizz Store',
};

export default function PaymentEditPage({ params }) {
  const paymentId = params.id;
  return <EditPayment paymentId={paymentId} />;
}
