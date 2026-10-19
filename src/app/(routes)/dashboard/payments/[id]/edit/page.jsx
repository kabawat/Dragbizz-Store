"use client";
import { PageSkeleton } from "@dragorbit/ui/app";
import dynamic from "next/dynamic";

const EditPaymentPage = dynamic(
  () => import("@/page/dashboard/payments/edit"),
  {
    ssr: false,
    loading: () => (
      <PageSkeleton />
    ),
  }
);

export default EditPaymentPage;
