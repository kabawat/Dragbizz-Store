"use client";
import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";

const InvoiceLoadingState = ({ t }) => {
    return (
        <div className="flex h-screen relative w-full overflow-hidden">
            <Sidebar />
            <div className="min-h-screen w-full flex flex-col">
                <Header
                    title={t("invoice.viewInvoice")}
                    description={t("invoice.viewInvoiceDescription")}
                />
                <div className="flex-1 p-6 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceLoadingState;
