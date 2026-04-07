"use client";
import { FileQuestion, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import { Button } from "@/components/ui";

const InvoiceNotFound = ({ t }) => {
    const router = useRouter();

    return (
        <div className="flex h-screen relative w-full overflow-hidden">
            <Sidebar />
            <div className="min-h-screen w-full flex flex-col">
                <Header title={t("invoice.viewInvoice")} description={t("invoice.viewInvoiceDescription")} />
                <div className="flex-1 p-6 flex items-center justify-center">
                    <div className="text-center max-w-md">
                        <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FileQuestion className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {t("invoice.notFoundTitle") || "Invoice Not Found"}
                        </h2>
                        <p className="text-gray-600 mb-8">
                            {t("invoice.notFoundDescription") || "The invoice you are looking for might have been deleted or does not exist."}
                        </p>
                        <Button
                            variant="primary"
                            onClick={() => router.push("/dashboard/invoices")}
                            className="flex items-center gap-2 mx-auto"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            {t("invoice.backToInvoices") || "Go Back to Invoices"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceNotFound;
