"use client";
import { PageSkeleton } from "@dragorbit/ui/app";
import dynamic from "next/dynamic";

const CreatePaymentPage = dynamic(
  () => import("@/page/dashboard/payments/create"),
  {
    ssr: false,
    loading: () => (
      <PageSkeleton />
    ),
  }
);

export default CreatePaymentPage;
