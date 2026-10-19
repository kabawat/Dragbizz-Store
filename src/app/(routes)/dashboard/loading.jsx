"use client";
import { DashboardSkeleton, PageSkeleton } from "@dragorbit/ui/app";
import { usePathname } from "next/navigation";
export default function DashboardLoading() {
  return usePathname() === "/dashboard" ? (
    <DashboardSkeleton />
  ) : (
    <PageSkeleton />
  );
}
