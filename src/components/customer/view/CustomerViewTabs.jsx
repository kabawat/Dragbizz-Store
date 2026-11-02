"use client";

import { BookOpen, User } from "lucide-react";

const tabButtonClass = (isActive) =>
  `inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer flex-1 sm:flex-initial ${
    isActive
      ? "bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] shadow-xs"
      : "text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
  }`;

const CustomerViewTabs = ({ activeTab, onTabChange, t }) => (
  <div className="inline-flex p-1 rounded-xl border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))]/50 shrink-0 w-full sm:w-auto">
    <button
      type="button"
      onClick={() => onTabChange("details")}
      className={tabButtonClass(activeTab === "details")}
    >
      <User className="w-4 h-4 shrink-0" />
      <span>{t("khata.tabDetails") || "Details"}</span>
    </button>
    <button
      type="button"
      onClick={() => onTabChange("khata")}
      className={tabButtonClass(activeTab === "khata")}
    >
      <BookOpen className="w-4 h-4 shrink-0" />
      <span>{t("khata.tabKhata") || "Khata"}</span>
    </button>
  </div>
);

export default CustomerViewTabs;
