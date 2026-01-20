import ViewInvoicePublic from '@/page/view/invoice';

export const metadata = {
  title: 'Invoice | DragBizz',
  description: 'View shared invoice details.',
};

export default async function PublicInvoiceView({ params }) {
  const { publicId } = await params;
  return <ViewInvoicePublic invoiceId={publicId} />;
}
