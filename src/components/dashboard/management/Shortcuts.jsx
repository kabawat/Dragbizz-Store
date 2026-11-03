"use client";
import { ManagementShortcutsView } from "@dragorbit/features/management";

import { Activity, CreditCard, Store, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ManagementShortcuts = () => {
  const pathname = usePathname();

  const managementLinks = [
    {
      name: "Staff Roster",
      desc: "Manage roles & permissions",
      href: "/dashboard/management/staff",
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      key: "F",
    },
    {
      name: "Store Registry",
      desc: "Manage stores & branches",
      href: "/dashboard/management/stores",
      icon: Store,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      name: "Subscription",
      desc: "Plan & billing details",
      href: "/dashboard/management/subscription",
      icon: CreditCard,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      key: "M",
    },
    {
      name: "Plan Limits",
      desc: "Consumption & quotas",
      href: "/dashboard/management/limits",
      icon: Activity,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      key: "L",
    },
  ];

  const paymentBillingLinks = [
    {
      name: "Subscription",
      desc: "Current plan & renewal details",
      href: "/dashboard/management/subscription",
      icon: CreditCard,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      key: "M",
    },
    {
      name: "Billing History",
      desc: "Payments & invoice records",
      href: "/dashboard/management/subscription/billing-history",
      icon: Activity,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      key: "B",
    },
    {
      name: "Usage & Plan Limits",
      desc: "Consumption & quotas",
      href: "/dashboard/management/limits",
      icon: Activity,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      key: "L",
    },
  ];

  const isPaymentBillingPage =
    pathname === "/dashboard/management/subscription" ||
    pathname.startsWith("/dashboard/management/subscription/") ||
    pathname === "/dashboard/management/limits";
  const links = isPaymentBillingPage ? paymentBillingLinks : managementLinks;

  return (
    <ManagementShortcutsView
      model={{
        links,
        pathname,
        Link,
        getLinkProps: (link) => ({ href: link.href }),
      }}
    />
  );
};

export default ManagementShortcuts;
