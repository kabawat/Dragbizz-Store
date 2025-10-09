import ViewInvoicePage from '@/page/dashboard/invoices/view';

export const metadata = {
  title: 'View Invoice - DragBizz Store',
  description: 'View invoice information and details',
  keywords: 'view invoice, invoice details, invoice management, DragBizz Store',
};

export default async function ViewInvoicePageRoute({ params }) {
  const { id } = await params;
  return <ViewInvoicePage invoiceId={id} />;
}