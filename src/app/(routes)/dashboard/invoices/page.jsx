import InvoicesPage from '@/page/dashboard/invoices';

export const metadata = {
  title: 'Invoices - DragBizz Store',
  description: 'Manage your customer invoices',
  keywords: 'invoices, customer invoices, invoice management, DragBizz Store',
};

export default function InvoicesPageRoute() {
  return <InvoicesPage />;
}
