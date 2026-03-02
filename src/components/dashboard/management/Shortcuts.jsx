"use client";
import React from 'react';
import { Users, CreditCard, Activity, ChevronRight } from "lucide-react";
import { Card, CardBody } from "@/components/ui";
import { usePathname } from "next/navigation";

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
            key: "F"
        },
        {
            name: "Subscription",
            desc: "Plan & billing details",
            href: "/dashboard/management/subscription",
            icon: CreditCard,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            key: "M"
        },
        {
            name: "Plan Limits",
            desc: "Consumption & quotas",
            href: "/dashboard/management/limits",
            icon: Activity,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            key: "L"
        },
    ];

    return (
        <Card className="bg-[rgb(var(--color-bg-primary))] border-[rgb(var(--color-border-primary))] rounded-lg overflow-hidden shadow-none">
            <CardBody className="p-4 shadow-none">
                <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.14em] text-[rgb(var(--color-text-tertiary))]">
                        Quick Management
                    </h3>
                    <div className="flex gap-1.5 opacity-30">
                        <div className="w-1 h-1 rounded-full bg-[rgb(var(--color-primary))]" />
                        <div className="w-1 h-1 rounded-full bg-[rgb(var(--color-primary))]" />
                    </div>
                </div>

                <div className="space-y-1.5">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;

                        return (
                            <a
                                key={link.href}
                                href={link.href}
                                className={`group flex items-center justify-between p-2.5 rounded-sm transition-all border shadow-none ${isActive
                                    ? "bg-[rgb(var(--color-primary))]/5 border-[rgb(var(--color-primary))]/30"
                                    : "hover:bg-[rgb(var(--color-bg-secondary))] border-transparent"
                                    }`}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className={`p-2 rounded-sm ${link.bg} ${link.color} flex-shrink-0 shadow-none transition-colors`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className={`text-[13px] font-bold transition-colors line-clamp-1 ${isActive ? "text-[rgb(var(--color-primary))]" : "text-[rgb(var(--color-text-primary))]"}`}>
                                            {link.name}
                                        </span>
                                        <span className="text-[10px] text-[rgb(var(--color-text-tertiary))] font-bold line-clamp-1 uppercase tracking-tight">
                                            {link.desc}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                    <kbd className={`flex items-center justify-center min-w-[22px] h-5 rounded-sm border border-[rgb(var(--color-border-primary))] text-[10px] font-black px-1.5 shadow-none ${isActive ? "bg-[rgb(var(--color-primary))] text-white border-transparent" : "bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-tertiary))]"}`}>
                                        ⌥{link.key}
                                    </kbd>
                                    {!isActive && (
                                        <ChevronRight className="w-3.5 h-3.5 text-[rgb(var(--color-text-tertiary))] transition-transform" />
                                    )}
                                </div>
                            </a>
                        );
                    })}
                </div>
            </CardBody>
        </Card>
    );
};

export default ManagementShortcuts;
