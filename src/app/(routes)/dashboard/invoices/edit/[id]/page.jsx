import EditInvoicePage from "@/page/dashboard/invoices/edit";

export const metadata = {
  title: "Edit Invoice - DragBizz Store",
  description: "Edit draft invoice",
  keywords: "edit invoice, update invoice, draft invoice, DragBizz Store",
};

export default async function EditInvoicePageRoute({ params }) {
  const { id } = await params;
  return <EditInvoicePage invoiceId={id} />;
}
