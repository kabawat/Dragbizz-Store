"use client";
import { PageSkeleton } from "@dragorbit/ui/app";
import dynamic from "next/dynamic";

const CreatePurchaseOrderPage = dynamic(
  () => import("@/page/dashboard/purchase-orders/create"),
  {
    ssr: false,
    loading: () => (
      <PageSkeleton />
    ),
  }
);

export default CreatePurchaseOrderPage;
