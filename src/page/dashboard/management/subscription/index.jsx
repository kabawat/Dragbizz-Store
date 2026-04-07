"use client";
import { CreditCard, Calendar, CheckCircle2, Package, ShieldCheck, Zap, Info } from "lucide-react";
import { Card, CardBody, Badge, Button } from "@/components/ui";
import { useSubscription } from "@/contexts/SubscriptionContext";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import ManagementShortcuts from "@/components/dashboard/management/Shortcuts";
import { useTranslation } from "@/hooks/ui/useTranslation";

const SubscriptionManagementPage = () => {
    const { t } = useTranslation();
    const { subscription, isLoading } = useSubscription();

    return (
        <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
            <Sidebar />

            <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
                <Header title={t("subscription.title")} description={t("subscription.description")} />

                <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
                    <div className="max-w-8xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

                            {/* Left Side (3/4) */}
                            <div className="lg:col-span-3 space-y-6">
                                {/* Plan Overview Card */}
                                <Card className="bg-[rgb(var(--color-bg-primary))] border-[rgb(var(--color-border-primary))] overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4">
                                        <Badge variant="success" className="px-3 py-1 text-sm font-medium">
                                            {subscription?.plan?.name || t("subscription.trialPlan")}
                                        </Badge>
                                    </div>
                                    <CardBody className="p-8">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                                            <div className="flex items-center gap-5">
                                                <div className="w-16 h-16 rounded-2xl bg-[rgb(var(--color-primary))]/10 flex items-center justify-center border border-[rgb(var(--color-primary))]/20 flex-shrink-0">
                                                    <ShieldCheck className="w-8 h-8 text-[rgb(var(--color-primary))]" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">{t("subscription.activePlanTitle")}</h3>
                                                    <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
                                                        {t("subscription.nextBillingLabel")} <span className="text-[rgb(var(--color-text-primary))] font-medium">{subscription?.nextBillingDate || "March 20, 2026"}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:flex md:items-center gap-8 md:gap-12">
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-[rgb(var(--color-text-secondary))] mb-1.5 flex items-center gap-1.5">
                                                        <CreditCard className="w-4 h-4" />
                                                        {t("subscription.planRateLabel")}
                                                    </span>
                                                    <span className="text-lg font-medium text-[rgb(var(--color-text-primary))]">₹{subscription?.plan?.price || "0"}/{t("subscription.monthly").toLowerCase()}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-[rgb(var(--color-text-secondary))] mb-1.5 flex items-center gap-1.5">
                                                        <Calendar className="w-4 h-4" />
                                                        {t("subscription.cycleLabel")}
                                                    </span>
                                                    <span className="text-lg font-medium text-[rgb(var(--color-text-primary))] capitalize">{subscription?.billingCycle || t("subscription.monthly")}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="h-px bg-gradient-to-r from-transparent via-[rgb(var(--color-border-primary))] to-transparent mb-10" />

                                        {/* Included Services Section */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-2.5">
                                                <Zap className="w-5 h-5 text-[rgb(var(--color-warning))] fill-[rgb(var(--color-warning))]/20" />
                                                <h3 className="text-base font-medium text-[rgb(var(--color-text-primary))]">{t("subscription.includedServicesTitle")}</h3>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                                                {(subscription?.features || [
                                                    { module: 'billing' }, { module: 'invoice' }, { module: 'inventory' }, { module: 'customer' }, { module: 'expense' },
                                                    { module: 'staff' }, { module: 'product' }, { module: 'reports' }, { module: 'ai' }
                                                ]).map((feature) => (
                                                    <div key={feature.module} className="flex flex-col gap-1 border-l-2 border-[rgb(var(--color-primary))]/20 pl-4 hover:border-[rgb(var(--color-primary))] transition-all group">
                                                        <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] capitalize flex items-center gap-2">
                                                            <CheckCircle2 className="w-4 h-4 text-[rgb(var(--color-success))]" />
                                                            {feature.module.replace('_', ' ')}
                                                        </h4>
                                                        <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
                                                            {t(`subscription.featureDetails.${feature.module}`).startsWith('subscription.') ? t("subscription.featureDetailsFallback") : t(`subscription.featureDetails.${feature.module}`)}
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
                                        <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                                            <span className="font-medium text-[rgb(var(--color-text-primary))] text-base block mb-1">{t("subscription.support.title")}</span>
                                            {t("subscription.support.description")}<span className="text-[rgb(var(--color-primary))] font-medium cursor-pointer hover:underline">support@dragbizz.com</span>
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
