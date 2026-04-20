"use client";
import React from "react";
import CustomerBasicInfo from "@/components/customer/view/components/CustomerBasicInfo";
import CompanyDetails from "@/components/customer/view/components/CompanyDetails";
import AccountDetails from "@/components/customer/view/components/AccountDetails";
import Addresses from "@/components/customer/view/components/Addresses";
import CustomerActions from "@/components/customer/view/components/CustomerActions";

const CustomerViewLayout = ({
    customerData,
    customerId,
    storeId,
    onEdit,
    onDownloadPDF,
    t,
}) => {
    if (!customerData) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden">
            <div className="lg:col-span-2">
                <div className="overflow-y-auto pe-3 space-y-6 h-[calc(100vh-150px)] custom-scrollbar">
                    <CustomerBasicInfo customerData={customerData} />
                    <CompanyDetails companyDetails={customerData.companyDetails} />
                    <AccountDetails account={customerData.account} />
                    <Addresses addresses={customerData.addresses} />
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
