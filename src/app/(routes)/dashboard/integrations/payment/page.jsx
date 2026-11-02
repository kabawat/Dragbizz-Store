import PaymentIntegrationsPage from "@/page/dashboard/integrations/payment";

export const metadata = {
  title: "Payment Gateway - DragBizz Store",
  description: "Manage UPI IDs and payment gateway integrations",
};

export default function PaymentIntegrationsRoute() {
  return <PaymentIntegrationsPage />;
}
