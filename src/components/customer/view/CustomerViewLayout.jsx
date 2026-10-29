"use client";

import { useState } from "react";
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
  activeTab,
  onEdit,
  onDownloadPDF,
  onKhataSuccess,
}) => {
  const [khataRefreshKey, setKhataRefreshKey] = useState(0);
  if (!customerData) return null;

  const handleKhataSuccess = () => {
    setKhataRefreshKey((key) => key + 1);
    onKhataSuccess?.();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
      <div className="lg:col-span-2 space-y-6 min-w-0">
        {activeTab === "details" ? (
          <>
            <CustomerBasicInfo customerData={customerData} />
            <AccountDetails account={customerData.account} />
            <CompanyDetails companyDetails={customerData.companyDetails} />
            <Addresses addresses={customerData.addresses} />
          </>
        ) : (
          <div className="bg-[rgb(var(--color-bg-primary))] rounded-2xl border border-[rgb(var(--color-border-primary))] p-4 sm:p-6 shadow-xs">
            <KhataPanel
              storeId={storeId}
              customerId={customerId}
              customerName={customerData.name}
              customerAccountId={
                customerData.account?.id ?? customerData.account?._id ?? null
              }
              account={customerData.account}
              refreshKey={khataRefreshKey}
              onSuccess={handleKhataSuccess}
            />
          </div>
        )}
      </div>

      <div className="lg:col-span-1 min-w-0">
        <CustomerActions
          customerData={customerData}
          customerId={customerId}
          storeId={storeId}
          onEdit={onEdit}
          onDownloadPDF={onDownloadPDF}
        />
      </div>
    </div>
  );
};

export default CustomerViewLayout;
