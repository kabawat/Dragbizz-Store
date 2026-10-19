"use client";
import { PageSkeleton } from "@dragorbit/ui/app";
import dynamic from "next/dynamic";

const AddInvoicePage = dynamic(() => import("@/page/dashboard/invoices/add"), {
  ssr: false,
  loading: () => (
    <PageSkeleton />
  ),
});

export default AddInvoicePage;
