"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CustomerBasicInfo from "@/components/customer/view/components/CustomerBasicInfo";
import CompanyDetails from "@/components/customer/view/components/CompanyDetails";
import AccountDetails from "@/components/customer/view/components/AccountDetails";
import Addresses from "@/components/customer/view/components/Addresses";
import CustomerActions from "@/components/customer/view/components/CustomerActions";
import KhataPanel from "@/components/customer/khata/KhataPanel";

const CustomerViewLayout = ({
    customerData,
    customerId,
    storeId,
    onEdit,
    onDownloadPDF,
    onKhataSuccess,
    t,
}) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState("details");

    useEffect(() => {
        setActiveTab(searchParams.get("tab") === "khata" ? "khata" : "details");
    }, [searchParams]);

    if (!customerData) return null;

    const customerAccountId =
        customerData.account?.id ?? customerData.account?._id ?? null;

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        const href =
            tab === "khata"
                ? `/dashboard/customers/${customerId}?tab=khata`
                : `/dashboard/customers/${customerId}`;
        router.replace(href);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden">
            <div className="lg:col-span-2">
                <div className="flex gap-2 mb-4">
                    <button
                        type="button"
                        onClick={() => handleTabChange("details")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            activeTab === "details"
                                ? "bg-[rgb(var(--color-primary))] text-white"
                                : "text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                        }`}
                    >
                        {t("khata.tabDetails")}
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTabChange("khata")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            activeTab === "khata"
                                ? "bg-[rgb(var(--color-primary))] text-white"
                                : "text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                        }`}
                    >
                        {t("khata.tabKhata")}
                    </button>
                </div>

                <div className="overflow-y-auto pe-3 space-y-6 h-[calc(100vh-190px)] custom-scrollbar">
                    {activeTab === "details" ? (
                        <>
                            <CustomerBasicInfo customerData={customerData} />
                            <CompanyDetails companyDetails={customerData.companyDetails} />
                            <AccountDetails account={customerData.account} />
                            <Addresses addresses={customerData.addresses} />
                        </>
                    ) : (
                        <KhataPanel
                            storeId={storeId}
                            customerId={customerId}
                            customerName={customerData.name}
                            customerEmail={customerData.email}
                            customerAccountId={customerAccountId}
                            account={customerData.account}
                            onSuccess={onKhataSuccess}
                        />
                    )}
                </div>
            </div>

            <CustomerActions
                customerData={customerData}
                customerId={customerId}
                storeId={storeId}
                onEdit={onEdit}
                onDownloadPDF={onDownloadPDF}
            />
        </div>
    );
};

export default CustomerViewLayout;
