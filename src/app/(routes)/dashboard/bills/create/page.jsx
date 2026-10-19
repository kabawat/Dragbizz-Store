"use client";
import { PageSkeleton } from "@dragorbit/ui/app";
import dynamic from "next/dynamic";

const CreateBillPage = dynamic(() => import("@/page/dashboard/bills/create"), {
  ssr: false,
  loading: () => (
    <PageSkeleton />
  ),
});

export default CreateBillPage;
