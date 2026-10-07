"use client";
import {
  UserPlus,
  PackagePlus,
  FileText,
  Building,
  ArrowUpRight,
  Zap,
} from "lucide-react";

export const getQuickActions = (t) => [
  {
    title: t("dashboard.addCustomer"),
    icon: UserPlus,
    path: "/dashboard/customers",
  },
  {
    title: t("dashboard.addProduct"),
    icon: PackagePlus,
    path: "/dashboard/products/create",
  },
  {
    title: t("dashboard.newInvoice"),
    icon: FileText,
    path: "/dashboard/invoices/create",
  },
  {
    title: t("dashboard.addSupplier"),
    icon: Building,
    path: "/dashboard/suppliers",
  },
];

const QuickActionButton = ({ title, icon: Icon, onClick, primary }) => (
  <button
    type="button"
    onClick={onClick}
    className={`group flex w-full cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--color-primary))] ${
      primary
        ? "border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))] text-white hover:brightness-110"
        : "border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] hover:border-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-bg-tertiary))]"
    }`}
  >
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${primary ? "bg-white/15" : "bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))]"}`}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </span>
    <span className="flex-1 text-sm font-medium">{title}</span>
    <ArrowUpRight className="h-4 w-4 shrink-0 opacity-60" aria-hidden="true" />
  </button>
);

export const QuickActions = ({ t, onActionClick }) => (
  <section className="rounded-2xl border border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))] p-4 sm:p-5">
    <div className="mb-4 flex items-center gap-2">
      <Zap
        className="h-4 w-4 text-[rgb(var(--color-primary))]"
        aria-hidden="true"
      />
      <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
        {t("dashboard.quickActions")}
      </h2>
    </div>
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
      {getQuickActions(t).map((action) => (
        <QuickActionButton
          key={action.path}
          {...action}
          primary={action.path === "/dashboard/invoices/create"}
          onClick={() => onActionClick(action.path)}
        />
      ))}
    </div>
  </section>
);
