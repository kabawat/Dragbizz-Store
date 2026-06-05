"use client";
import React, { useCallback, useRef, useState } from "react";
import { Calculator, Package, Plus, Trash2 } from "lucide-react";
import { Button, Card, EmptyState, Input, Select } from "@/components/ui";
import { useBarcodeScanner } from "@/hooks/barcode/useBarcodeScanner";
import { addProductToInvoiceItems } from "@/utils/invoice/addProductToInvoiceItems";
import { findProductByScanCode, getProductId } from "@/utils/product/findProductByScanCode";

const InvoiceItemsSection = ({
    t,
    products,
    formData,
    setFormData,
    showError,
    lookupProductByCode,
    onProductResolved,
}) => {
    const [selectedProduct, setSelectedProduct] = useState("");
    const [selectedQuantity, setSelectedQuantity] = useState(1);
    const [scanning, setScanning] = useState(false);
    const scanInFlightRef = useRef(false);

    const appendProduct = useCallback(
        (product, quantity = 1) => {
            if (!getProductId(product)) {
                showError(t("invoice.productNotFound"));
                return false;
            }

            setFormData((prev) => {
                const result = addProductToInvoiceItems(prev.items, product, quantity);
                return result.added ? { ...prev, items: result.items } : prev;
            });
            return true;
        },
        [setFormData, showError, t]
    );

    const resolveAndAddProduct = useCallback(
        async (code) => {
            const trimmed = String(code || "").trim();
            if (!trimmed || scanInFlightRef.current) return;

            scanInFlightRef.current = true;
            setScanning(true);
            try {
                let product = findProductByScanCode(products, trimmed);

                if (!product && lookupProductByCode) {
                    product = await lookupProductByCode(trimmed);
                }

                if (!product) {
                    showError(t("invoice.barcodeProductNotFound", { code: trimmed }));
                    return;
                }

                if (onProductResolved) {
                    onProductResolved(product);
                }

                const qty = parseInt(selectedQuantity, 10) || 1;
                if (appendProduct(product, qty)) {
                    setSelectedProduct("");
                }
            } finally {
                scanInFlightRef.current = false;
                setScanning(false);
            }
        },
        [
            products,
            lookupProductByCode,
            onProductResolved,
            selectedQuantity,
            appendProduct,
            showError,
            t,
        ]
    );

    useBarcodeScanner({
        onScan: resolveAndAddProduct,
        enabled: !scanning,
    });

    const handleAddItem = () => {
        if (!selectedProduct) {
            showError(t("invoice.pleaseSelectProduct"));
            return;
        }

        const product = products.find((p) => p.id === selectedProduct);
        if (!product) {
            showError(t("invoice.productNotFound"));
            return;
        }

        const quantityToAdd = parseInt(selectedQuantity, 10) || 1;
        if (appendProduct(product, quantityToAdd)) {
            setSelectedProduct("");
            setSelectedQuantity(1);
        }
    };

    const handleRemoveItem = (index) => {
        const updatedItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: updatedItems });
    };

    return (
        <Card padding="none" className="!border-[rgb(var(--color-border-primary))]/30 h-full flex flex-col overflow-hidden">
            <div className="p-4 flex flex-col h-full overflow-hidden">
                <div className="mb-4 flex-shrink-0">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-6">
                            <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                                {t("invoice.selectProduct")} *
                            </label>
                            <Select
                                size="sm"
                                searchable={true}
                                value={selectedProduct}
                                onChange={(value) => setSelectedProduct(value)}
                                options={[
                                    {
                                        value: "",
                                        label: t("invoice.selectProductPlaceholder"),
                                    },
                                    ...products
                                        .filter((product) => product.id)
                                        .map((product) => ({
                                            value: product.id,
                                            label: `${product.name} - ₹${product.pricing?.sellingPrice || 0
                                                }`,
                                        })),
                                ]}
                                leftIcon={Package}
                            />
                        </div>

                        <div className="md:col-span-3">
                            <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                                {t("invoice.quantity")} *
                            </label>
                            <Input
                                type="number"
                                value={selectedQuantity}
                                onChange={(value) => setSelectedQuantity(value)}
                                min="1"
                                placeholder="1"
                                leftIcon={Package}
                                size="sm"
                            />
                        </div>

                        <div className="md:col-span-3">
                            <Button
                                type="button"
                                variant="primary"
                                onClick={handleAddItem}
                                leftIcon={Plus}
                                // className="w-full"
                                disabled={!selectedProduct}
                            >
                                {t("invoice.addItem")}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Items List and Discount Container */}
                {formData.items.length > 0 ? (
                    <div className="mt-6 flex-1 flex flex-col min-h-0">
                        {/* Header */}
                        <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3 flex-shrink-0">
                            {t("invoice.addedItems")} ({formData.items.length})
                        </h4>

                        {/* Items List - Scrollable, flex-1 fills remaining space */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-3 pr-2 min-h-0">
                            {formData.items.map((item, index) => {
                                const product = products.find((p) => p.id === item.product);
                                return (
                                    <div
                                        key={index}
                                        className="group rounded-lg p-4 bg-[rgb(var(--color-bg-tertiary))]/30 hover:bg-[rgb(var(--color-bg-tertiary))]/50 transition-colors flex-shrink-0"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1">
                                                        {t("invoice.product")}
                                                    </label>
                                                    <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                                                        {item.productName || product?.name || "N/A"}
                                                    </p>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1">
                                                        {t("invoice.quantity")}
                                                    </label>
                                                    <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                                                        {item.quantity} {item.uom ? <span className="text-xs text-[rgb(var(--color-text-secondary))]">{item.uom}</span> : null}
                                                    </p>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1">
                                                        {t("invoice.price")}
                                                    </label>
                                                    <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                                                        ₹{item.price?.toFixed(2) || "0.00"}
                                                    </p>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1">
                                                        GST %
                                                    </label>
                                                    <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                                                        {item.gstRate > 0 ? (
                                                            <span>
                                                                {item.gstRate}%
                                                                {item.isInclusive && (
                                                                    <span className="text-xs text-[rgb(var(--color-text-secondary))] ml-1">(incl.)</span>
                                                                )}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-[rgb(var(--color-text-secondary))]">Nil</span>
                                                        )}
                                                    </p>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1">
                                                        {t("invoice.total")}
                                                    </label>
                                                    <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                                                        ₹{item.total?.toFixed(2) || "0.00"}
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(index)}
                                                className="ml-4 opacity-0 group-hover:opacity-100 flex items-center justify-center w-8 h-8 cursor-pointer text-[rgb(var(--color-danger))] hover:bg-[rgb(var(--color-danger))]/10 rounded-lg transition-all duration-200"
                                                title={t("invoice.removeItem")}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Discount — pinned at bottom, never scrolls */}
                        <div className="flex-shrink-0 mt-4 pt-4 border-t border-[rgb(var(--color-border-primary))]/30 flex justify-end">
                            <div className="md:w-72">
                                <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1 text-right">
                                    {t("invoice.totalDiscount")} (₹)
                                    <span className="text-[rgb(var(--color-text-tertiary))] ml-1">
                                        ({t("common.optional")})
                                    </span>
                                </label>
                                <Input
                                    type="number"
                                    value={formData.totalDiscount}
                                    onChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            totalDiscount: value,
                                        })
                                    }
                                    min="0"
                                    step="0.01"
                                    leftIcon={Calculator}
                                    size="sm"
                                    placeholder="Enter discount amount"
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <EmptyState
                        icon={Package}
                        title={t("invoice.noItemsTile")}
                        description={t("invoice.noItemsdisc")}
                        className="h-full"
                        size="md"
                    />
                )}
            </div>
        </Card>
    );
};

export default InvoiceItemsSection;
