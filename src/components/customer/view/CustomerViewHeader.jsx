"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import CustomerViewTabs from "./CustomerViewTabs";

const CustomerViewHeader = ({ t, activeTab, onTabChange, showTabs = true }) => {
  return (
    <div className="py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[rgb(var(--color-border-primary))]/40 mb-6">
      <Link
        href="/dashboard/customers"
        className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] bg-[rgb(var(--color-bg-secondary))]/40 hover:bg-[rgb(var(--color-bg-secondary))] rounded-xl border border-transparent hover:border-[rgb(var(--color-border-primary))]/60 transition-all w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>
          {t("common.backTo", { item: t("common.customers") }) || "Back to Customers"}
        </span>
      </Link>
      {showTabs && (
        <CustomerViewTabs
          activeTab={activeTab}
          onTabChange={onTabChange}
          t={t}
        />
      )}
    </div>
  );
};

export default CustomerViewHeader;
