"use client";
import { ManagementShortcutsView } from "@dragorbit/features/management";

import { Users, CreditCard, Activity } from "lucide-react";

import { usePathname } from "next/navigation";
import Link from "next/link";

const ManagementShortcuts = () => {
  const pathname = usePathname();

  const links = [
    {
      name: "Staff Management",
      desc: "Manage roles & permissions",
      href: "/dashboard/management/staff",
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      key: "F",
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
