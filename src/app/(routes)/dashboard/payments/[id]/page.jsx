import ViewPaymentPage from "@/page/dashboard/payments/view/index";

export const metadata = {
  title: "View Payment - DragBizz Store",
  description: "View payment information and details",
  keywords:
    "view payment, payment details, payment information, DragBizz Store",
};

export default async function ViewPaymentPageRoute({ params }) {
  const { id } = await params;
  return <ViewPaymentPage paymentId={id} />;
}
