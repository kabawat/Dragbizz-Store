import EditPayment from "@/page/dashboard/payments/edit";

export const metadata = {
  title: "Edit Payment - DragBizz Store",
  description: "Update payment information and manage payment details",
  keywords: "edit payment, update payment, payment management, DragBizz Store",
};

export default async function PaymentEditPage({ params }) {
  const { id } = await params;
  return <EditPayment paymentId={id} />;
}
