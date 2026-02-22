"use client";
import React, { useState } from "react";
import { Package, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { AddActionButton, Card, Input, Select } from "@/components/ui";

const ItemsSection = ({ t, formData, setFormData, products, productsLoading, errors, setErrors }) => {
    const router = useRouter();
    const [tempProduct, setTempProduct] = useState("");
    const [tempQuantity, setTempQuantity] = useState(1);

    const addItem = () => {
        if (!tempProduct) {
            setErrors((prev) => ({
                ...prev,
                add_product: t("purchaseOrders.selectAProduct"),
            }));
            return;
        }
        if (
            !tempQuantity ||
            Number(tempQuantity) <= 0 ||
            !Number.isInteger(Number(tempQuantity))
        ) {
            setErrors((prev) => ({
                ...prev,
                add_quantity: t("purchaseOrders.enterValidInteger"),
            }));
            return;
        }
        const selected = products.find((p) => (p.id || p._id) === tempProduct);
        const productName = selected ? selected.name || selected.productName || "" : "";

        setFormData((prev) => {
            const existingIndex = prev.products.findIndex((item) => item.product === tempProduct);
            if (existingIndex !== -1) {
                const updated = [...prev.products];
                const existing = updated[existingIndex];
                const newQty = (parseInt(existing.quantity, 10) || 0) + parseInt(tempQuantity, 10);
                updated[existingIndex] = {
                    ...existing,
                    productName: existing.productName || productName,
                    quantity: newQty,
                };
                return { ...prev, products: updated };
            }
            return {
                ...prev,
                products: [
                    ...prev.products,
                    {
                        product: tempProduct,
                        productName,
                        quantity: parseInt(tempQuantity, 10),
                    },
                ],
            };
        });
        setTempProduct("");
        setTempQuantity(1);
        setErrors((prev) => ({ ...prev, add_product: "", add_quantity: "" }));
    };

    const removeItem = (index) => {
        const updated = formData.products.filter((_, i) => i !== index);
        setFormData((prev) => ({ ...prev, products: updated }));
    };

    return (
        <Card className="sticky top-0">
            <div className="p-4">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 border border-[rgb(var(--color-border-primary))] rounded-lg flex items-center justify-center mr-3">
                        <Package className="w-5 h-5 text-[rgb(var(--color-success))]" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
                            {t("purchaseOrders.productsItems")}
                        </h3>
                        <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                            {t("purchaseOrders.addProductsToPO")}
                        </p>
                    </div>
                </div>

                {/* Add Item Form */}
                <div className="bg-[rgb(var(--color-bg-tertiary))]/50 rounded-lg p-4 mb-6">
                    <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-4">
                        {t("purchaseOrders.addNewItem")}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-7">
                            <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                                {t("purchaseOrders.product")} *
                            </label>
                            <Select
                                value={tempProduct}
                                onChange={(value) => {
                                    if (value === "__add_new_product__") {
                                        router.push("/dashboard/products/add");
                                        return;
                                    }
                                    setTempProduct(value);
                                }}
                                options={[
                                    {
                                        value: "",
                                        label: productsLoading ? t("common.loading") : t("purchaseOrders.selectProduct"),
                                    },
                                    ...products
                                        .filter((p) => p.name || p.productName)
                                        .map((p) => ({
                                            value: p.id || p._id,
                                            label: p.name || p.productName,
                                        })),
                                    {
                                        value: "__add_new_product__",
                                        label: `+ ${t("purchaseOrders.addNewProduct")}`,
                                        isAddOption: true,
                                    },
                                ]}
                                error={errors.add_product}
                                disabled={productsLoading}
                                leftIcon={Package}
                                size="sm"
                                searchable={true}
                                placeholder={t("purchaseOrders.searchSelectProduct")}
                            />
                        </div>

                        <div className="md:col-span-3">
                            <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                                {t("purchaseOrders.quantity")} *
                            </label>
                            <Input
                                type="number"
                                value={tempQuantity}
                                onChange={(value) => setTempQuantity(value)}
                                placeholder="1"
                                min="1"
                                step="1"
                                error={errors.add_quantity}
                                leftIcon={Package}
                                size="sm"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <AddActionButton
                                onClick={addItem}
                                fullWidth
                                label={t("purchaseOrders.add")}
                                title={t("purchaseOrders.addNewItem")}
                            />
                        </div>
                    </div>
                </div>

                {/* Items List */}
                {formData.products.length > 0 ? (
                    <div className="bg-[rgb(var(--color-bg-tertiary))]/30 rounded-lg border border-[rgb(var(--color-border-primary))]">
                        <div className="px-4 py-3 border-b border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))]/50">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                                    {t("purchaseOrders.addedItems")} ({formData.products.length})
                                </h4>
                                <div className="text-xs text-[rgb(var(--color-text-secondary))]">
                                    {t("purchaseOrders.totalItems")}:{" "}
                                    {formData.products.reduce((sum, item) => sum + (item.quantity || 0), 0)}{" "}
                                    {t("purchaseOrders.items")}
                                </div>
                            </div>
                        </div>

                        <div className="divide-y divide-[rgb(var(--color-border-primary))]">
                            {formData.products.map((item, index) => (
                                <div
                                    key={index}
                                    className="px-4 py-4 hover:bg-[rgb(var(--color-bg-secondary))]/30 transition-colors duration-200 group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-[rgb(var(--color-primary))]/10">
                                                <Package className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-sm font-medium text-[rgb(var(--color-text-primary))] truncate block">
                                                    {item.productName || t("purchaseOrders.selectedProduct")}
                                                </span>
                                            </div>
                                            <div className="flex-shrink-0">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))]">
                                                    {t("purchaseOrders.qty")}: {item.quantity}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="flex-shrink-0 p-2 cursor-pointer text-[rgb(var(--color-danger))] hover:text-[rgb(var(--color-danger))] hover:bg-[rgba(var(--color-danger),0.1)] rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                                            title={t("purchaseOrders.removeItem")}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-[rgb(var(--color-text-secondary))]">
                        <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">{t("purchaseOrders.noItemsAddedYet")}</p>
                        <p className="text-xs">{t("purchaseOrders.addProductsToCreatePO")}</p>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default ItemsSection;
