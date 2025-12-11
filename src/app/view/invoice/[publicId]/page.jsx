import ViewInvoicePublic from '@/page/view/invoice';

export const metadata = {
  title: 'Invoice | DragBizz',
  description: 'View shared invoice details.',
};

export default function PublicInvoiceView({ params }) {
  const publicId = params?.publicId;
  return <ViewInvoicePublic invoiceId={publicId} />;
}
