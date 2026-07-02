"use client";
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
    if (!customerData) return null;

    const customerAccountId =
        customerData.account?.id ?? customerData.account?._id ?? null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden">
            <div className="lg:col-span-2">
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
