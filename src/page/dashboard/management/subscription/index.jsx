"use client";
import { CreditCard, Calendar, CheckCircle2, Package, ShieldCheck, Zap, Info } from "lucide-react";
import { Card, CardBody, Badge, Button } from "@/components/ui";
import { useSubscription } from "@/contexts/SubscriptionContext";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import ManagementShortcuts from "@/components/dashboard/management/Shortcuts";

const SubscriptionManagementPage = () => {
    const { subscription, isLoading } = useSubscription();

    const featureDetails = {
        billing: "Generate GST-ready bills and manage professional invoices easily.",
        invoice: "Advanced invoice tracking with recurring billing and auto-reminders.",
        inventory: "Track stock levels, set low-stock alerts, and manage product variants.",
        customer: "Centralized database to manage customer groups and credit history.",
        expense: "Monitor business costs and generate detailed spending reports.",
        staff: "Role-based access control for your team and staff activity logs.",
        product: "Detailed product catalogs with category and attribute management.",
        reports: "Professional business analytics and sales productivity insights.",
        ai: "AI-powered sales predictions and voice-based data management."
    };

    return (
        <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
            <Sidebar />

            <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
                <Header title="Subscription Management" description="Configure and manage your active business plan" />

                <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
                    <div className="max-w-8xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

                            {/* Left Side (3/4) */}
                            <div className="lg:col-span-3 space-y-6">
                                {/* Plan Overview Card */}
                                <Card className="bg-[rgb(var(--color-bg-primary))] border-[rgb(var(--color-border-primary))] overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4">
                                        <Badge variant="success" className="px-4 py-1 text-xs font-bold uppercase tracking-wider">
                                            {subscription?.plan?.name || "Trial Plan"}
                                        </Badge>
                                    </div>
                                    <CardBody className="p-8">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                                            <div className="flex items-center gap-5">
                                                <div className="w-16 h-16 rounded-2xl bg-[rgb(var(--color-primary))]/10 flex items-center justify-center border border-[rgb(var(--color-primary))]/20 flex-shrink-0">
                                                    <ShieldCheck className="w-8 h-8 text-[rgb(var(--color-primary))]" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-[rgb(var(--color-text-primary))] tracking-tight">Active Plan</h3>
                                                    <p className="text-xs font-semibold text-[rgb(var(--color-text-secondary))] mt-1">
                                                        Next billing: <span className="text-[rgb(var(--color-text-primary))] font-bold">{subscription?.nextBillingDate || "March 20, 2026"}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:flex md:items-center gap-8 md:gap-12">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--color-text-tertiary))] mb-1.5 flex items-center gap-1.5">
                                                        <CreditCard className="w-3 h-3" />
                                                        Plan Rate
                                                    </span>
                                                    <span className="text-lg font-bold text-[rgb(var(--color-text-primary))]">₹{subscription?.plan?.price || "0"}/month</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--color-text-tertiary))] mb-1.5 flex items-center gap-1.5">
                                                        <Calendar className="w-3 h-3" />
                                                        Cycle
                                                    </span>
                                                    <span className="text-lg font-bold text-[rgb(var(--color-text-primary))] uppercase">{subscription?.billingCycle || "Monthly"}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="h-px bg-gradient-to-r from-transparent via-[rgb(var(--color-border-primary))] to-transparent mb-10" />

                                        {/* Included Services Section */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-2.5">
                                                <Zap className="w-5 h-5 text-[rgb(var(--color-warning))] fill-[rgb(var(--color-warning))]/20" />
                                                <h3 className="text-base font-bold text-[rgb(var(--color-text-primary))] tracking-tight uppercase">Included Services</h3>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                                                {(subscription?.features || [
                                                    { module: 'billing' }, { module: 'invoice' }, { module: 'inventory' }, { module: 'customer' }, { module: 'expense' },
                                                    { module: 'staff' }, { module: 'product' }, { module: 'reports' }, { module: 'ai' }
                                                ]).map((feature) => (
                                                    <div key={feature.module} className="flex flex-col gap-1 border-l-2 border-[rgb(var(--color-primary))]/20 pl-4 hover:border-[rgb(var(--color-primary))] transition-all group">
                                                        <h4 className="text-sm font-bold text-[rgb(var(--color-text-primary))] capitalize flex items-center gap-2 tracking-tight">
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-[rgb(var(--color-success))]" />
                                                            {feature.module.replace('_', ' ')}
                                                        </h4>
                                                        <p className="text-xs text-[rgb(var(--color-text-secondary))] leading-relaxed font-medium">
                                                            {featureDetails[feature.module] || "Full enterprise-level module access enabled."}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>

                                {/* Support Footer */}
                                <div className="flex items-center gap-6 p-6 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary)/0.4)] rounded-xl">
                                    <div className="w-12 h-12 rounded-2xl bg-[rgb(var(--color-primary))]/10 flex items-center justify-center flex-shrink-0 animate-pulse-slow">
                                        <Info className="w-6 h-6 text-[rgb(var(--color-primary))]" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-[rgb(var(--color-text-secondary))] leading-snug">
                                            <span className="font-bold text-[rgb(var(--color-text-primary))] text-base block mb-1 uppercase tracking-tight">Need Billing Help?</span>
                                            Our support team is ready for any payment queries at <span className="text-[rgb(var(--color-primary))] font-bold cursor-pointer hover:underline">support@dragbizz.com</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side Column (1/4 Width) */}
                            <div className="lg:col-span-1 space-y-4">
                                <ManagementShortcuts />
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionManagementPage;
