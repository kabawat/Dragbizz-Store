"use client";
import React, { useState } from "react";
import { Calculator, Package, Plus, Trash2 } from "lucide-react";
import { Button, Card, Input, Select } from "@/components/ui";

const InvoiceItemsSection = ({
    t,
    products,
    formData,
    setFormData,
    showError,
}) => {
    // Local state for item addition
    const [selectedProduct, setSelectedProduct] = useState("");
    const [selectedQuantity, setSelectedQuantity] = useState(1);

    const handleAddItem = () => {
        if (!selectedProduct) {
            showError(t("invoice.pleaseSelectProduct"));
            return;
        }

        const product = products.find((p) => p._id === selectedProduct);
        if (!product) {
            showError(t("invoice.productNotFound"));
            return;
        }

        const productPrice = product.price || product.sellingPrice || 0;
        const quantityToAdd = parseInt(selectedQuantity, 10) || 1;

        // Check if product already exists in items
        const existingItemIndex = formData.items.findIndex(
            (item) => item.product === selectedProduct
        );

        let updatedItems;
        if (existingItemIndex !== -1) {
            // Product already exists, increment quantity
            updatedItems = [...formData.items];
            const existingItem = updatedItems[existingItemIndex];
            const newQuantity = existingItem.quantity + quantityToAdd;
            const newTotal = productPrice * newQuantity;

            updatedItems[existingItemIndex] = {
                ...existingItem,
                quantity: newQuantity,
                total: newTotal,
            };
        } else {
            // Product doesn't exist, add as new item
            const total = productPrice * quantityToAdd;

            const newItem = {
                product: selectedProduct,
                productName: product.name || "",
                quantity: quantityToAdd,
                price: productPrice,
                total: total,
            };

            updatedItems = [...formData.items, newItem];
        }

        setFormData({
            ...formData,
            items: updatedItems,
        });

        // Reset selection
        setSelectedProduct("");
        setSelectedQuantity(1);
    };

    const handleRemoveItem = (index) => {
        const updatedItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: updatedItems });
    };

    return (
        <Card className="!border-[rgb(var(--color-border-primary))]/30 h-full flex flex-col overflow-hidden">
            <div className="p-4 flex flex-col h-full overflow-hidden">
                <div className="mb-4 flex-shrink-0">
                    {/* Add Item Section */}
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
                                        .filter((product) => product._id)
                                        .map((product) => ({
                                            value: product._id,
                                            label: `${product.name} - ₹${product.price || product.sellingPrice || 0
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
                        {/* Items List - Scrollable */}
                        <div className="flex-1 flex flex-col min-h-0">
                            <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3 flex-shrink-0">
                                {t("invoice.addedItems")} ({formData.items.length})
                            </h4>
                            <div
                                className="overflow-y-auto overflow-x-hidden space-y-3 pr-2"
                                style={{ maxHeight: "calc(100vh - 450px)" }}
                            >
                                {formData.items.map((item, index) => {
                                    const product = products.find((p) => p._id === item.product);
                                    return (
                                        <div
                                            key={index}
                                            className="group rounded-lg p-4 bg-[rgb(var(--color-bg-tertiary))]/30 hover:bg-[rgb(var(--color-bg-tertiary))]/50 transition-colors flex-shrink-0"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
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
                                                            {item.quantity}
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
                                                    className="ml-4 opacity-0 group-hover:opacity-100 flex items-center justify-center w-8 h-8 cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-50 rounded transition-all duration-200"
                                                    title={t("invoice.removeItem")}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Total Discount Section - Fixed at Bottom */}
                        <div className="mt-4 flex justify-end flex-shrink-0 pt-4 border-t border-[rgb(var(--color-border-primary))]/30">
                            <div className="w-full md:w-80">
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
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center text-[rgb(var(--color-text-secondary))]">
                            <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">{t("invoice.noItemsAdded")}</p>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default InvoiceItemsSection;
