"use client";
import React, { useState } from "react";
import { Package, Plus, Trash2 } from "lucide-react";
import { Button, Card, Input, Select } from "@/components/ui";
import { productService } from "@/service/retailer";
import { useAppSelector } from "@/store/hooks";
import { useApiResponse } from "@/hooks/useApiResponse";

const BillItemsSection = ({
    t,
    formData,
    setFormData,
    showError,
    errors,
    setErrors,
}) => {
    const { selectedStore } = useAppSelector((state) => state.profile);
    const storeId = selectedStore?.storeId;

    // Local state for products
    const [products, setProducts] = React.useState([]);
    const productsFetchedRef = React.useRef({ storeId: null, fetched: false });

    const { execute: fetchProducts, loading: productsLoading } = useApiResponse();

    React.useEffect(() => {
        if (!storeId || productsFetchedRef.current.fetched) return;
        productsFetchedRef.current = { storeId, fetched: true };

        fetchProducts(
            productService.getProducts({ limit: 100, lightweight: true, store: storeId }),
            { showToast: false }
        ).then((result) => {
            if (result?.success) {
                setProducts(result.data || []);
            } else {
                productsFetchedRef.current = { storeId: null, fetched: false };
            }
        });
    }, [storeId, fetchProducts]);

    // Local state for item addition
    const [selectedProduct, setSelectedProduct] = useState("");
    const [selectedQuantity, setSelectedQuantity] = useState(1);
    const [selectedPrice, setSelectedPrice] = useState(0);

    const handleAddItem = () => {
        if (!selectedProduct) {
            showError(t("errors.selectProduct"));
            return;
        }

        const product = products.find(
            (p) => (p.id || p._id) === selectedProduct
        );
        if (!product) {
            showError(t("errors.productNotFound"));
            return;
        }

        const quantityToAdd = parseInt(selectedQuantity, 10) || 1;
        const priceToAdd = parseFloat(selectedPrice) || 0;

        const newItem = {
            product: selectedProduct,
            productName: product.name || product.productName || "",
            quantity: quantityToAdd,
            purchasePrice: priceToAdd,
        };

        setFormData({
            ...formData,
            items: [...formData.items, newItem],
        });

        // Reset selection
        setSelectedProduct("");
        setSelectedQuantity(1);
        setSelectedPrice(0);
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
                        <div className="md:col-span-5">
                            <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                                {t("errors.selectProduct")} *
                            </label>
                            <Select
                                size="sm"
                                searchable={true}
                                value={selectedProduct}
                                onChange={(value) => {
                                    setSelectedProduct(value);
                                    // Auto-fill price if product is selected
                                    const product = products.find(
                                        (p) => (p.id || p._id) === value
                                    );
                                    if (product) {
                                        setSelectedPrice(product.purchasePrice || 0);
                                    }
                                }}
                                options={[
                                    {
                                        value: "",
                                        label: productsLoading
                                            ? t("errors.loading")
                                            : t("errors.selectProduct"),
                                    },
                                    ...products
                                        .filter((product) => product.name || product.productName)
                                        .map((product) => ({
                                            value: product.id || product._id,
                                            label: `${product.name || product.productName}`,
                                        })),
                                ]}
                                leftIcon={Package}
                                disabled={productsLoading}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                                {t("common.quantity")} *
                            </label>
                            <Input
                                type="number"
                                value={selectedQuantity}
                                onChange={(value) => setSelectedQuantity(value)}
                                min="1"
                                step="1"
                                placeholder="1"
                                size="sm"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                                {t("common.price")} *
                            </label>
                            <Input
                                type="number"
                                value={selectedPrice}
                                onChange={(value) => setSelectedPrice(value)}
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                size="sm"
                            />
                        </div>

                        <div className="md:col-span-3">
                            <Button
                                type="button"
                                variant="primary"
                                onClick={handleAddItem}
                                leftIcon={Plus}
                                disabled={!selectedProduct}
                            >
                                {t("common.add")}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Items List */}
                {formData.items.length > 0 ? (
                    <div className="mt-6 flex-1 flex flex-col min-h-0">
                        <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3 flex-shrink-0">
                            {t("common.items")} ({formData.items.length})
                        </h4>
                        <div
                            className="flex-1 overflow-y-auto overflow-x-hidden space-y-3 pr-2 min-h-0"
                        >
                            {formData.items.map((item, index) => {
                                const product = products.find(
                                    (p) => (p.id || p._id) === item.product
                                );
                                const itemTotal = (item.quantity || 0) * (item.purchasePrice || 0);

                                return (
                                    <div
                                        key={index}
                                        className="group rounded-lg p-4 bg-[rgb(var(--color-bg-tertiary))]/30 hover:bg-[rgb(var(--color-bg-tertiary))]/50 transition-colors flex-shrink-0"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1">
                                                        {t("common.product")}
                                                    </label>
                                                    <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                                                        {item.productName ||
                                                            product?.name ||
                                                            product?.productName ||
                                                            "N/A"}
                                                    </p>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1">
                                                        {t("common.quantity")}
                                                    </label>
                                                    <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                                                        {item.quantity}
                                                    </p>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1">
                                                        {t("common.price")}
                                                    </label>
                                                    <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                                                        ₹{item.purchasePrice?.toFixed(2) || "0.00"}
                                                    </p>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1">
                                                        {t("common.total")}
                                                    </label>
                                                    <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                                                        ₹{itemTotal.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>

                                             <button
                                                type="button"
                                                onClick={() => handleRemoveItem(index)}
                                                className="ml-4 opacity-0 group-hover:opacity-100 flex items-center justify-center w-8 h-8 cursor-pointer text-[rgb(var(--color-danger))] hover:bg-[rgb(var(--color-danger))]/10 rounded-lg transition-all duration-200"
                                                title={t("common.remove")}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center text-[rgb(var(--color-text-secondary))]">
                            <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">{t("common.noItems")}</p>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default BillItemsSection;
