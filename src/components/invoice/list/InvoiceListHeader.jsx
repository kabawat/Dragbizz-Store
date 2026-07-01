"use client";
import { Download, Grid3X3, List, Plus, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { InvoiceDownloadDrawer } from "@/components/invoice";
import OpenCustomerPaymentButton from "@/components/payment/OpenCustomerPaymentButton";
import { Button, Input, Select } from "@/components/ui";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setViewMode, setFilters, clearFilters, getInvoices } from "@/store/slices/invoicesSlice";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";

const InvoiceListHeader = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const dispatch = useAppDispatch();

    // Permission Management
    const { can, loading } = useModulePermissions("invoice");
    const canCreate = can("create");
    const canDownload = can("report");

    const { viewMode, invoices, filters } = useAppSelector((state) => state.invoices);
    const { selectedStore } = useAppSelector((state) => state.profile);
    const storeId = selectedStore?.storeId;
    const hasInvoices = invoices.length > 0;

    const { paymentStatus, invoiceStatus, startDate, endDate } = filters || {};
    const [showDownloadDrawer, setShowDownloadDrawer] = useState(false);

    const hasActiveFilters = paymentStatus || invoiceStatus || startDate || endDate;

    const handleFilterChange = (key, value) => {
        const actualValue = value?.target?.value !== undefined ? value.target.value : value;
        dispatch(setFilters({ [key]: actualValue }));
        dispatch(getInvoices({
            store: storeId,
            isFreshLoad: true,
            ...filters,
            [key]: actualValue
        }));
    };

    const handleClearFilters = () => {
        dispatch(clearFilters());
        dispatch(getInvoices({
            store: storeId,
            isFreshLoad: true,
        }));
    };

    const handleAddInvoice = () => {
        router.push("/dashboard/invoices/create");
    };

    const handleViewModeChange = (mode) => {
        dispatch(setViewMode(mode));
        localStorage.setItem("invoices-view-mode", mode);
    };

    useCommonHotkeys({
        onNew: canCreate ? handleAddInvoice : undefined,
        onDownload: canDownload ? () => setShowDownloadDrawer(true) : undefined,
        onViewTable: () => handleViewModeChange("table"),
        onViewGrid: () => handleViewModeChange("card"),
    });

    if (loading) return <div className="h-10 mb-3 animate-pulse bg-[rgb(var(--color-bg-secondary))] rounded-lg" />;

    return (
        <div className="p-5">
            <div className="flex justify-between items-center gap-3 flex-wrap">
                {/* Left side - Filters */}
                <div className="flex gap-3 flex-wrap">
                    {/* Payment Status */}
                    <div className="w-[160px]">
                        <Select
                            value={paymentStatus}
                            onChange={(val) => handleFilterChange("paymentStatus", val)}
                            options={[
                                { value: "", label: t("invoice.paymentStatus") },
                                { value: "UNPAID", label: t("invoice.unpaid") },
                                { value: "PAID", label: t("invoice.paid") },
                                { value: "PARTIAL", label: t("invoice.partialPayment") },
                                { value: "CANCELLED", label: t("invoice.cancelled") },
                            ]}
                            placeholder={t("invoice.paymentStatus")}
                        />
                    </div>

                    {/* Invoice Status */}
                    <div className="w-[160px]">
                        <Select
                            value={invoiceStatus}
                            onChange={(val) => handleFilterChange("invoiceStatus", val)}
                            options={[
                                { value: "", label: t("invoice.invoiceStatus") },
                                { value: "DRAFT", label: t("invoice.draft") },
                                { value: "RELEASED", label: t("invoice.released") },
                                { value: "CANCELLED", label: t("invoice.cancelled") },
                                { value: "DELETED", label: t("invoice.deleted") },
                            ]}
                            placeholder={t("invoice.invoiceStatus")}
                        />
                    </div>

                    {/* Start Date */}
                    <div className="w-[140px]">
                        <Input
                            type={startDate ? "date" : "text"}
                            onFocus={(e) => (e.target.type = "date")}
                            onBlur={(e) => {
                                if (!e.target.value) e.target.type = "text";
                            }}
                            value={startDate}
                            onChange={(val) => handleFilterChange("startDate", val)}
                            max={endDate || undefined}
                            placeholder={t("common.startDate")}
                        />
                    </div>

                    {/* End Date */}
                    <div className="w-[140px]">
                        <Input
                            type={endDate ? "date" : "text"}
                            onFocus={(e) => (e.target.type = "date")}
                            onBlur={(e) => {
                                if (!e.target.value) e.target.type = "text";
                            }}
                            value={endDate}
                            onChange={(val) => handleFilterChange("endDate", val)}
                            min={startDate || undefined}
                            placeholder={t("common.endDate")}
                        />
                    </div>

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            onClick={handleClearFilters}
                            className="h-10 px-4 text-sm font-medium text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors flex items-center gap-2"
                        >
                            <RotateCcw className="w-4 h-4" />
                            {t("common.clearFilters")}
                        </Button>
                    )}
                </div>

                {/* Right side - Action Buttons */}
                <div className="flex gap-3">
                    <OpenCustomerPaymentButton className="h-9" />

                    {hasInvoices && (
                        <div className="flex bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                            <button
                                onClick={() => handleViewModeChange("table")}
                                className={`px-3 cursor-pointer py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === "table"
                                    ? "bg-[rgb(var(--color-primary))] text-white"
                                    : "text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                                    }`}
                            >
                                <List className="w-4 h-4" />
                                {t("common.tableView")}
                            </button>
                            <button
                                onClick={() => handleViewModeChange("card")}
                                className={`px-3 cursor-pointer py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === "card"
                                    ? "bg-[rgb(var(--color-primary))] text-white"
                                    : "text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                                    }`}
                            >
                                <Grid3X3 className="w-4 h-4" />
                                {t("common.cardView")}
                            </button>
                        </div>
                    )}

                    {canDownload && (
                        <Button
                            variant="secondary"
                            onClick={() => setShowDownloadDrawer(true)}
                            className="flex items-center gap-2 h-9"
                        >
                            <Download className="w-4 h-4" />
                            {t("common.download")}
                        </Button>
                    )}

                    {canCreate && (
                        <Button variant="primary" onClick={handleAddInvoice} leftIcon={Plus}>
                            {t("invoice.createInvoice")}
                        </Button>
                    )}
                </div>
            </div>

            {/* Download Drawer */}
            <InvoiceDownloadDrawer
                isOpen={showDownloadDrawer}
                onClose={() => setShowDownloadDrawer(false)}
            />
        </div>
    );
};

export default InvoiceListHeader;
