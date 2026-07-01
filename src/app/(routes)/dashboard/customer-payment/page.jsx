"use client";

import dynamic from "next/dynamic";

const CustomerPaymentPage = dynamic(() => import("@/page/dashboard/customer-payment"), {
  ssr: false,
});

export default function Page() {
  return <CustomerPaymentPage />;
}
