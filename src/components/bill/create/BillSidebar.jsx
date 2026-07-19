"use client";
import React from "react";
import { Building2, FileText, Receipt } from "lucide-react";
import { Button, Card, Input, Select, Textarea } from "@/components/ui";
import { supplierService, purchaseOrderService } from "@/service/retailer";
import { useAppSelector } from "@/store/hooks";
import { useRouter, useSearchParams } from "next/navigation";

const BillSidebar = ({
    t,
    formData,
    handleInputChange,
    errors,
    isCreating,
    handleSubmit,
    setFormData,
}) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { selectedStore } = useAppSelector((state) => state.profile);
    const storeId = selectedStore?.storeId;

    // Local state
    const [suppliers, setSuppliers] = React.useState([]);
    const [suppliersLoading, setSuppliersLoading] = React.useState(false);
    const [purchaseOrders, setPurchaseOrders] = React.useState([]);
    const [purchaseOrdersLoading, setPurchaseOrdersLoading] = React.useState(false);

    // Refs to prevent duplicate calls
    const suppliersFetchedRef = React.useRef({ storeId: null, fetched: false });

    const fetchSuppliers = async () => {
        if (!storeId || suppliersFetchedRef.current.fetched) return;
        suppliersFetchedRef.current = { storeId, fetched: true };
        try {
            setSuppliersLoading(true);
            const result = await supplierService.getSuppliers({
                limit: 100, lightweight: true, store: storeId
            });
            if (result.success) setSuppliers(result.data || []);
        } catch (_error) {
            setSuppliers([]);
            suppliersFetchedRef.current.fetched = false;
        } finally {
            setSuppliersLoading(false);
        }
    };

    const fetchPurchaseOrders = async (supplierId) => {
        if (!storeId || !supplierId) return;
        try {
            setPurchaseOrdersLoading(true);
            const result = await purchaseOrderService.getPurchaseOrders({
                limit: 100, lightweight: true, store: storeId, supplier: supplierId
            });
            if (result.success) setPurchaseOrders(result.data || []);
            else setPurchaseOrders([]);
        } catch (_error) {
            setPurchaseOrders([]);
        } finally {
            setPurchaseOrdersLoading(false);
        }
    };

    React.useEffect(() => {
        if (storeId) fetchSuppliers();
    }, [storeId]);

    React.useEffect(() => {
        if (formData.supplier) fetchPurchaseOrders(formData.supplier);
        else setPurchaseOrders([]);
    }, [formData.supplier, storeId]);

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

    return (
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
                                    onChange={(value) => handleInputChange("supplier", value)}
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
                                        <p className="text-[0.625rem] text-[rgb(var(--color-text-secondary))] mt-1">
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
                                {t("bills.createBill")}
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default BillSidebar;
