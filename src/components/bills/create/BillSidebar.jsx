"use client";
import React from "react";
import { Building2, FileText, Receipt } from "lucide-react";
import { Button, Card, Input, Select, Textarea } from "@/components/ui";
import { supplierService, purchaseOrderService } from "@/service/retailer";
import { useAppSelector } from "@/store/hooks";
import { useSearchParams } from "next/navigation";
import { useApiResponse } from "@/hooks/useApiResponse";
import AddSupplierDrawer from "@/components/supplier/AddSupplierDrawer";

const BillSidebar = ({
    t,
    formData,
    handleInputChange,
    errors,
    isCreating,
    handleSubmit,
    setFormData,
    isEditing = false,
}) => {
    const searchParams = useSearchParams();
    const { selectedStore } = useAppSelector((state) => state.profile);
    const storeId = selectedStore?.storeId;

    // Local state
    const [suppliers, setSuppliers] = React.useState([]);
    const [purchaseOrders, setPurchaseOrders] = React.useState([]);
    const [showAddSupplierDrawer, setShowAddSupplierDrawer] = React.useState(false);

    // Refs to prevent duplicate calls
    const suppliersFetchedRef = React.useRef({ storeId: null, fetched: false });

    const { execute: executeFetchSuppliers, loading: suppliersLoading } = useApiResponse();
    const { execute: executeFetchPOs, loading: purchaseOrdersLoading } = useApiResponse();

    React.useEffect(() => {
        if (!storeId || suppliersFetchedRef.current.fetched) return;
        suppliersFetchedRef.current = { storeId, fetched: true };

        executeFetchSuppliers(
            supplierService.getSuppliers({ limit: 100, lightweight: true, store: storeId }),
            { showToast: false }
        ).then((result) => {
            if (result?.success) {
                setSuppliers(result.data?.data || result.data || []);
            } else {
                suppliersFetchedRef.current = { storeId: null, fetched: false };
            }
        });
    }, [storeId, executeFetchSuppliers]);

    React.useEffect(() => {
        if (!formData.supplier) { setPurchaseOrders([]); return; }
        if (!storeId) return;

        executeFetchPOs(
            purchaseOrderService.getPurchaseOrders({
                limit: 100, lightweight: true, store: storeId, supplier: formData.supplier
            }),
            { showToast: false }
        ).then((result) => {
            setPurchaseOrders(result?.success ? (result.data?.data || result.data || []) : []);
        });
    }, [formData.supplier, storeId, executeFetchPOs]);

    // Handle PO from URL
    React.useEffect(() => {
        const poNumber = searchParams.get("poNumber");
        if (poNumber && purchaseOrders.length > 0) {
            const foundPO = purchaseOrders.find(
                (po) => (po.poNumber || po.purchaseOrderNumber || po.billNumber) === poNumber
            );
            if (foundPO) {
                setFormData(prev => ({ ...prev, purchaseOrder: foundPO.id || foundPO._id }));
            }
        }
    }, [searchParams, purchaseOrders]);

    // Handle new supplier added from drawer
    const handleAddSupplierSuccess = React.useCallback((newSupplier) => {
        setShowAddSupplierDrawer(false);
        if (!newSupplier) return;

        const supplierId = newSupplier.id || newSupplier._id;
        setSuppliers((prev) => [...prev, newSupplier]);
        handleInputChange("supplier", supplierId);
        // Reset ref so a fresh fetch runs on next mount
        suppliersFetchedRef.current = { storeId: null, fetched: false };
    }, [handleInputChange]);

    return (
        <>
            <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto ps-3 min-h-0">
                    <div className="space-y-4">
                        {/* Bill Details Card */}
                        <Card>
                            <div className="p-4 space-y-4">
                                <h3 className="text-md font-semibold text-[rgb(var(--color-text-primary))] mb-3 flex items-center">
                                    <Building2 className="w-4 h-4 mr-2" />
                                    {t("bills.billDetails")}
                                </h3>
                                <div>
                                    <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                                        {t("bills.selectSupplierLabel")}
                                    </label>
                                    <Select
                                        value={formData.supplier}
                                        onChange={(value) => {
                                            if (value === "add-new-supplier") {
                                                setShowAddSupplierDrawer(true);
                                                return;
                                            }
                                            handleInputChange("supplier", value);
                                        }}
                                        options={[
                                            {
                                                value: "",
                                                label: suppliersLoading
                                                    ? t("errors.loading")
                                                    : t("errors.selectSupplier"),
                                            },
                                            ...suppliers
                                                .filter((supplier) => supplier.name || supplier.supplierName)
                                                .map((supplier) => ({
                                                    value: supplier.id || supplier._id,
                                                    label: supplier.name || supplier.supplierName,
                                                })),
                                            {
                                                value: "add-new-supplier",
                                                label: t("errors.addNewSupplier"),
                                                isAddOption: true,
                                            },
                                        ]}
                                        error={errors.supplier}
                                        disabled={suppliersLoading}
                                        leftIcon={Building2}
                                        searchable={true}
                                        size="md"
                                        multiple={false}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                                        {t("bills.purchaseOrderOptional")}
                                    </label>
                                    <Select
                                        value={formData.purchaseOrder}
                                        onChange={(value) => handleInputChange("purchaseOrder", value)}
                                        options={[
                                            {
                                                value: "",
                                                label: purchaseOrdersLoading
                                                    ? t("errors.loading")
                                                    : t("errors.selectPurchaseOrder"),
                                            },
                                            ...purchaseOrders
                                                .filter((po) => po.poNumber || po.purchaseOrderNumber)
                                                .map((po) => ({
                                                    value: String(po.id || po._id),
                                                    label:
                                                        po.poNumber ||
                                                        po.purchaseOrderNumber ||
                                                        `PO-${po.id || po._id}`,
                                                })),
                                            {
                                                value: "add-new-purchase-order",
                                                label: t("errors.addNewPurchaseOrder"),
                                                isAddOption: true,
                                            },
                                        ]}
                                        error={errors.purchaseOrder}
                                        disabled={purchaseOrdersLoading}
                                        searchable={true}
                                        leftIcon={FileText}
                                        size="md"
                                        multiple={false}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                                        {t("bills.paymentDueDate")}
                                    </label>
                                    <Input
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={(value) => handleInputChange("dueDate", value)}
                                        error={errors.dueDate}
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Settings & Notes Card */}
                        <Card>
                            <div className="p-4 space-y-4">
                                <h3 className="text-md font-semibold text-[rgb(var(--color-text-primary))] flex items-center">
                                    <Receipt className="w-4 h-4 mr-2" />
                                    {t("bills.additionalInfo")}
                                </h3>

                                <div>
                                    <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                                        {t("bills.notes")}
                                    </label>
                                    <Textarea
                                        value={formData.notes}
                                        onChange={(value) => handleInputChange("notes", value)}
                                        placeholder={t("bills.addAdditionalNotes")}
                                        rows={3}
                                        maxLength={500}
                                    />
                                </div>

                                <div className="border-t border-[rgb(var(--color-border-primary))] pt-3">
                                    <label className="flex items-center gap-3 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 accent-[rgb(var(--color-primary))] rounded"
                                            checked={formData.goodsReceived}
                                            onChange={(e) =>
                                                handleInputChange("goodsReceived", e.target.checked)
                                            }
                                        />
                                        <div>
                                            <span className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                                                {t("bills.stockInGoods")}
                                            </span>
                                            <p className="text-[10px] text-[rgb(var(--color-text-secondary))] mt-1">
                                                {t("bills.stockInGoodsDescription")}
                                            </p>
                                        </div>
                                    </label>

                                </div>
                            </div>
                        </Card>

                        {/* Actions Card */}
                        <Card>
                            <div className="p-4 space-y-3">
                                <Button
                                    onClick={() => handleSubmit()}
                                    disabled={isCreating}
                                    loading={isCreating}
                                    className="w-full"
                                    leftIcon={FileText}
                                >
                                    {isEditing ? t("bills.updateBill") : t("bills.createBill")}
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Add Supplier Drawer */}
            <AddSupplierDrawer
                isOpen={showAddSupplierDrawer}
                onClose={() => setShowAddSupplierDrawer(false)}
                onSuccess={handleAddSupplierSuccess}
            />
        </>
    );
};

export default BillSidebar;
