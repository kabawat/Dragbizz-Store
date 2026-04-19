"use client";
import React, { useState } from "react";
import { Package, Trash2 } from "lucide-react";
import { AddActionButton, Card, Input, Select } from "@/components/ui";

const ItemsSection = ({
  t,
  formData,
  setFormData,
  products,
  productsLoading,
  errors,
  setErrors,
}) => {
  const [tempProduct, setTempProduct] = useState("");
  const [tempQuantity, setTempQuantity] = useState(1);

  const addItem = () => {
    if (!tempProduct) {
      setErrors((prev) => ({ ...prev, add_product: "Select a product" }));
      return;
    }
    if (
      !tempQuantity ||
      Number(tempQuantity) <= 0 ||
      !Number.isInteger(Number(tempQuantity))
    ) {
      setErrors((prev) => ({
        ...prev,
        add_quantity: "Enter a valid integer > 0",
      }));
      return;
    }
    const selected = products.find((p) => (p.id || p._id) === tempProduct);
    const productName = selected
      ? selected.name || selected.productName || ""
      : "";
    setFormData((prev) => {
      const existingIndex = prev.products.findIndex(
        (item) => item.product === tempProduct
      );
      if (existingIndex !== -1) {
        const updated = [...prev.products];
        const existing = updated[existingIndex];
        const newQty =
          (parseInt(existing.quantity, 10) || 0) + parseInt(tempQuantity, 10);
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
            <Package
              className="w-5 h-5"
              style={{ color: "rgb(var(--color-success))" }}
            />
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

        <div className="bg-[rgb(var(--color-bg-tertiary))]/50 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-4">
            Add New Item
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-7">
              <label className="block text-xs font-medium text-[rgb(var(--color-text-primary))] mb-1">
                {t("purchaseOrders.product")} *
              </label>
              <Select
                value={tempProduct}
                onChange={(value) => setTempProduct(value)}
                options={[
                  {
                    value: "",
                    label: productsLoading
                      ? t("common.loading")
                      : t("purchaseOrders.selectProduct"),
                  },
                  ...products
                    .filter((p) => p.name || p.productName)
                    .map((p) => ({
                      value: p.id || p._id,
                      label: p.name || p.productName,
                    })),
                ]}
                error={errors.add_product}
                disabled={productsLoading}
                leftIcon={Package}
                size="sm"
                searchable={true}
                placeholder="Search and select product..."
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

        {formData.products.length > 0 ? (
          <div className="bg-[rgb(var(--color-bg-tertiary))]/30 rounded-lg border border-[rgb(var(--color-border-primary))]">
            <div className="px-4 py-3 border-b border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-secondary))]/50">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                  {t("purchaseOrders.addedPayments")} ({formData.products.length})
                </h4>
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
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "rgba(var(--color-primary), 0.1)" }}
                      >
                        <Package
                          className="w-4 h-4"
                          style={{ color: "rgb(var(--color-primary))" }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-[rgb(var(--color-text-primary))] truncate block">
                          {item.productName || t("purchaseOrders.selectedProduct")}
                        </span>
                      </div>
                      <div className="flex-shrink-0">
                        <span
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: "rgba(var(--color-primary), 0.1)",
                            color: "rgb(var(--color-primary))",
                          }}
                        >
                          {t("purchaseOrders.qty")}: {item.quantity}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="flex-shrink-0 p-2 cursor-pointer text-[rgb(var(--color-danger))] hover:text-[rgb(var(--color-danger))] hover:bg-[rgba(var(--color-danger),0.1)] rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                      title="Remove item"
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
            <p className="text-xs">
              {t("purchaseOrders.addProductsToCreatePO")}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ItemsSection;
