"use client";
import React from 'react';
import { Activity, BarChart3, Users, FileText, ShoppingCart, ShoppingBag, Store, Package, Zap, ChevronRight, AlertCircle } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { useSubscription } from "@/contexts/SubscriptionContext";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import ManagementShortcuts from "@/components/dashboard/management/Shortcuts";

const UsageLimitsPage = () => {
    const { isLoading } = useSubscription();

    const stats = [
        { name: "Staff Members", icon: Users, limit: 10, used: 8, color: "#3b82f6", usageType: 'TOTAL', hasAnalytics: true },
        { name: "Inventory Items", icon: Package, limit: 5000, used: 3420, color: "#10b981", usageType: 'TOTAL', hasAnalytics: true },
        { name: "Monthly Invoices", icon: FileText, limit: 500, used: 412, color: "#f59e0b", usageType: 'MONTHLY_TOTAL', hasAnalytics: true },
        { name: "Sales Orders", icon: ShoppingBag, limit: 200, used: 165, color: "#f43f5e", usageType: 'MONTHLY_TOTAL', hasAnalytics: false },
        { name: "Customer Profiles", icon: Users, limit: Infinity, used: 1240, color: "#6366f1", usageType: 'TOTAL', hasAnalytics: true },
    ];

    return (
        <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
            <Sidebar />

            <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
                <Header title="Plan Usage & Limits" description="Monitor your feature consumption and quotas" />

                <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
                    <div className="max-w-8xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

                            {/* Main Resource Monitor (3/4) */}
                            <div className="lg:col-span-3 space-y-6">

                                <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg border border-[rgb(var(--color-border-primary)/0.4)] overflow-hidden p-1 shadow-none">
                                    <div className="p-6 pb-2">
                                        <div className="flex items-center justify-between gap-4 flex-wrap">
                                            <div>
                                                <h2 className="text-xl font-black text-[rgb(var(--color-text-primary))] tracking-tighter uppercase italic">Resource Monitor</h2>
                                                <p className="text-xs font-bold text-[rgb(var(--color-text-secondary))] opacity-60">System-wide feature quota status</p>
                                            </div>
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-sm">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                <span className="text-[10px] font-black uppercase tracking-wider text-green-600">Active Monitoring</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 space-y-1">
                                        {stats.map((stat, idx) => {
                                            const Icon = stat.icon;
                                            const isUnlimited = stat.limit === Infinity || stat.limit === null;
                                            const percentage = isUnlimited ? 0 : (stat.used / stat.limit) * 100;
                                            const isAtRisk = percentage > 80;

                                            return (
                                                <div key={idx} className="group relative overflow-hidden transition-all duration-300 hover:bg-[rgb(var(--color-bg-secondary))] rounded-sm p-4 flex flex-col md:flex-row md:items-center gap-6 border-b border-[rgb(var(--color-border-primary))]/30 last:border-0 shadow-none">

                                                    <div className="flex items-center gap-4 w-full md:w-[220px] flex-shrink-0">
                                                        <span className="text-[10px] font-black text-[rgb(var(--color-text-tertiary))] opacity-40 w-4">
                                                            {String(idx + 1).padStart(2, '0')}
                                                        </span>
                                                        <div className="w-10 h-10 rounded-sm flex items-center justify-center shadow-none" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                                                            <Icon size={20} className="stroke-[2]" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <h3 className="text-sm font-black text-[rgb(var(--color-text-primary))] truncate tracking-tight">{stat.name}</h3>
                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-[rgb(var(--color-text-tertiary))] opacity-80">
                                                                {stat.usageType?.replace('_', ' ')}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex-1 flex flex-col gap-2">
                                                        <div className="flex justify-between items-end">
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-lg font-black text-[rgb(var(--color-text-primary))]">
                                                                        {stat.used.toLocaleString()}
                                                                    </span>
                                                                    {!isUnlimited && (
                                                                        <span className="text-xs font-bold text-[rgb(var(--color-text-tertiary))] opacity-60">
                                                                            / {stat.limit.toLocaleString()}
                                                                        </span>
                                                                    )}
                                                                    <span className="text-[9px] font-black text-[rgb(var(--color-primary))] uppercase tracking-widest mb-0.5">Consumed</span>
                                                                </div>
                                                            </div>
                                                            <span className={`text-[10px] font-black uppercase tracking-widest ${isAtRisk ? 'text-red-500' : 'text-[rgb(var(--color-text-tertiary))]'}`}>
                                                                {isUnlimited ? '∞ Lifetime Access' : `${percentage.toFixed(0)}% Utilized`}
                                                            </span>
                                                        </div>
                                                        {!isUnlimited ? (
                                                            <div className="h-2 w-full bg-[rgb(var(--color-bg-secondary))] rounded-sm overflow-hidden p-0 border border-[rgb(var(--color-border-primary))]/30 shadow-none">
                                                                <div
                                                                    className="h-full transition-all duration-1000 ease-out relative"
                                                                    style={{
                                                                        width: `${Math.min(percentage, 100)}%`,
                                                                        backgroundColor: stat.color,
                                                                    }}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-[1px] flex-1 bg-gradient-to-r from-[rgb(var(--color-border-primary))]/30 to-transparent" />
                                                                <span className="text-[9px] font-black text-green-500 uppercase tracking-tighter">Unlimited Plan</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="w-full md:w-[100px] flex items-center justify-end gap-3">
                                                        {isAtRisk && (
                                                            <AlertCircle size={16} className="text-red-500" />
                                                        )}
                                                        <Button variant="ghost" size="xs" className="rounded-sm bg-[rgb(var(--color-bg-secondary))] hover:bg-[rgb(var(--color-primary))] hover:text-white transition-all px-3 py-1.5 border border-[rgb(var(--color-border-primary))]/50 shadow-none">
                                                            Details
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="bg-[rgb(var(--color-bg-secondary))]/30 border-t border-[rgb(var(--color-border-primary))] p-4 px-6 md:px-10 shadow-none">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-sm bg-amber-500/10 flex items-center justify-center text-amber-500">
                                                    <Zap size={16} className="fill-current" />
                                                </div>
                                                <div>
                                                    <h4 className="text-[11px] font-black text-[rgb(var(--color-text-primary))] uppercase tracking-tight">Auto-Reset Quotas</h4>
                                                    <p className="text-[10px] font-bold text-[rgb(var(--color-text-secondary))]">All monthly limits reset every 30 days automatically.</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black uppercase text-[rgb(var(--color-text-tertiary))]">Next Reset</span>
                                                <Badge variant="secondary" className="font-black px-3 rounded-sm shadow-none">April 01, 2026</Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-6 rounded-lg bg-gradient-to-br from-[rgb(var(--color-primary))] to-blue-600 text-white relative shadow-none min-h-[160px] flex flex-col justify-center">
                                        <h3 className="text-lg font-black mb-2 italic uppercase tracking-tighter">Upgrade Intelligence</h3>
                                        <p className="text-xs opacity-90 mb-6 font-bold leading-relaxed max-w-[80%]">Need custom quotas for your enterprise scale? Talk to our sales team for bespoke limits.</p>
                                        <Button size="sm" className="rounded-sm font-black text-[10px] uppercase px-4 bg-white text-[rgb(var(--color-primary))] border-none hover:bg-white/90 w-fit shadow-none">Custom Inquiry</Button>
                                    </div>

                                    <div className="p-6 rounded-lg bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))] relative flex flex-col justify-center shadow-none">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-8 h-8 rounded-sm bg-purple-500/10 flex items-center justify-center text-purple-600 shadow-none">
                                                <BarChart3 size={18} />
                                            </div>
                                            <h3 className="font-black text-[rgb(var(--color-text-primary))] uppercase tracking-tight text-sm">Usage Insights</h3>
                                        </div>
                                        <p className="text-xs text-[rgb(var(--color-text-secondary))] font-bold leading-relaxed">
                                            Historical usage tracking is currently under development. You'll soon see trends for each service.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side (1/4) */}
                            <div className="lg:col-span-1">
                                <ManagementShortcuts />
                                <div className="mt-4 p-5 rounded-lg border border-[rgb(var(--color-border-primary))] border-dashed bg-[rgb(var(--color-bg-primary))]/50 shadow-none">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[rgb(var(--color-text-tertiary))] mb-3">Service Updates</h4>
                                    <div className="space-y-3">
                                        {[1, 2].map(i => (
                                            <div key={i} className="flex gap-2.5">
                                                <div className="w-1 h-1 rounded-full bg-[rgb(var(--color-primary))] mt-1.5 flex-shrink-0" />
                                                <p className="text-[10px] font-bold text-[rgb(var(--color-text-secondary))] leading-tight">
                                                    Infrastructure optimized for faster invoice generation.
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UsageLimitsPage;
