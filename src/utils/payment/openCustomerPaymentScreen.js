export const CUSTOMER_PAYMENT_PATH = "/dashboard/customer-payment";

export function openCustomerPaymentScreen() {
  if (typeof window === "undefined") return;
  window.open(CUSTOMER_PAYMENT_PATH, "_blank", "noopener,noreferrer");
}

export default openCustomerPaymentScreen;
