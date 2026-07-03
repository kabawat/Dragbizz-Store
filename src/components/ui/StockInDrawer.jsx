"use client";
import { Package } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Button from "./Button";
import Input from "./Input";
import Select from "./Select";
import SideDrawer from "./SideDrawer";
import { stockService, supplierService } from "@/service/retailer";
import { useAppSelector } from "@/store/hooks";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useApiResponse } from "@/hooks/useApiResponse";

const resolveProductContext = (item, type) => {
  if (type === "inventory") {
    const product = item?.product;
    return {
      productId: product?.id || product?._id || item?.productId,
      name: product?.name || "Unknown Product",
      sku: product?.sku || "-",
      stock:
        item?.stockSummary?.totalQuantity ??
        item?.stock ??
        product?.stock ??
        0,
    };
  }

  return {
    productId: item?.id || item?._id,
    name: item?.name || "Unknown Product",
    sku: item?.sku || "-",
    stock: item?.stock ?? 0,
  };
};

const StockInDrawer = ({
  isOpen,
  onClose,
  item,
  onSuccess,
  type = "product",
}) => {
  const { t } = useTranslation();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { showError } = useGlobalToast();
  const [formData, setFormData] = useState({
    quantity: "",
    purchasePrice: "",
    supplier: "",
  });
  const [errors, setErrors] = useState({});

  const { execute: executeFetchSuppliers, data: suppliers, loading: suppliersLoading } =
    useApiResponse();
  const { execute: executeSubmit, loading: isLoading } = useApiResponse();

  const productContext = useMemo(
    () => resolveProductContext(item, type),
    [item, type]
  );

  useEffect(() => {
    if (!isOpen) return;

    setFormData({
      quantity: "",
      purchasePrice: "",
      supplier: "",
    });
    setErrors({});

    const storeId = selectedStore?.storeId;
    if (storeId) {
      executeFetchSuppliers(
        supplierService.getSuppliers({
          limit: 100,
          lightweight: true,
          store: storeId,
        }),
        { showToast: false }
      );
    }
  }, [isOpen, selectedStore?.storeId, executeFetchSuppliers]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = t("inventory.quantityMustBeGreaterThanZero", {
        defaultValue: "Quantity must be greater than 0",
      });
    }

    if (!formData.purchasePrice || formData.purchasePrice <= 0) {
      newErrors.purchasePrice = t("inventory.purchasePriceMustBeGreaterThanZero", {
        defaultValue: "Purchase price must be greater than 0",
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const storeId = selectedStore?.storeId;
    if (!storeId) {
      showError(t("common.storeNotSelected", { defaultValue: "Store not selected" }));
      return;
    }

    if (!productContext.productId) {
      showError(t("products.productNotFound", { defaultValue: "Product not found" }));
      return;
    }

    const apiPayload = {
      productId: productContext.productId,
      store: storeId,
      batchData: {
        quantity: parseInt(formData.quantity, 10),
        purchasePrice: parseFloat(formData.purchasePrice),
        supplier: formData.supplier || undefined,
      },
    };

    const result = await executeSubmit(stockService.addStock(apiPayload), {
      message: t("products.stockAddedSuccessfully"),
    });

    if (result?.success) {
      onClose();
      onSuccess?.(t("products.stockAddedSuccessfully"));
    }
  };

  const handleSupplierChange = (value) => {
    handleInputChange("supplier", value);
  };

  const formattedSuppliers = (Array.isArray(suppliers) ? suppliers : []).map(
    (supplier) => ({
      value: supplier.id || supplier._id,
      label: supplier.name || supplier.companyName || "Unknown Supplier",
    })
  );

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={t("inventory.stockIn")}
      description={t("inventory.addStockForProduct", {
        defaultValue: "Add inventory for {{name}}",
        name: productContext.name,
      })}
      icon={Package}
      width="w-full max-w-[42rem]"
      closeOnOutsideClick={true}
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg p-4 border border-[rgb(var(--color-border-primary))]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[rgb(var(--color-primary))]/10 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-[rgb(var(--color-primary))]" />
              </div>
              <div>
                <h3 className="font-medium text-[rgb(var(--color-text-primary))]">
                  {productContext.name}
                </h3>
                <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                  SKU: {productContext.sku} | {t("inventory.currentStock")}:{" "}
                  {productContext.stock}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                {t("inventory.quantity")} *
              </label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(value) => handleInputChange("quantity", value)}
                placeholder={t("inventory.enterQuantity")}
                error={errors.quantity}
              />
              {errors.quantity && (
                <p className="text-sm text-red-500 mt-1">{errors.quantity}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                {t("inventory.purchasePricePerUnit")} *
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.purchasePrice}
                onChange={(value) => handleInputChange("purchasePrice", value)}
                placeholder={t("inventory.enterPurchasePricePerUnit")}
                error={errors.purchasePrice}
              />
              {errors.purchasePrice && (
                <p className="text-sm text-red-500 mt-1">{errors.purchasePrice}</p>
              )}
            </div>
          </div>

          <div className="relative">
            <Select
              label={t("inventory.supplierOptional")}
              placeholder={t("inventory.searchAndSelectSupplierOptional")}
              value={formData.supplier || ""}
              onChange={handleSupplierChange}
              error={errors.supplier}
              errorMessage={errors.supplier}
              searchable={true}
              options={formattedSuppliers}
              loading={suppliersLoading}
              disabled={suppliersLoading}
              helperText={t("inventory.optionalTypeToSearchSuppliers")}
            />
          </div>

          <div className="bg-[rgb(var(--color-bg-secondary))] rounded-lg p-4 border border-[rgb(var(--color-border-primary))]">
            <h4 className="font-medium text-[rgb(var(--color-text-primary))] mb-3">
              {t("inventory.stockAdditionSummary")}
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">
                  {t("inventory.quantity")}:
                </span>
                <span className="text-[rgb(var(--color-text-primary))] font-medium">
                  {formData.quantity || 0} units
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">
                  {t("inventory.purchasePrice")}:
                </span>
                <span className="text-[rgb(var(--color-text-primary))] font-medium">
                  ₹{formData.purchasePrice || "0.00"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">
                  {t("inventory.totalValue")}:
                </span>
                <span className="text-[rgb(var(--color-text-primary))] font-medium">
                  ₹{" "}
                  {(
                    (parseFloat(formData.quantity) || 0) *
                    (parseFloat(formData.purchasePrice) || 0)
                  ).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">
                  {t("inventory.newStock")}:
                </span>
                <span className="text-green-500 font-medium">
                  {productContext.stock + (parseInt(formData.quantity, 10) || 0)} units
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 p-4 border-t border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-primary))]">
          <div className="flex gap-3">
            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
              leftIcon={Package}
            >
              {t("inventory.addStock")}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              {t("common.cancel")}
            </Button>
          </div>
        </div>
      </form>
    </SideDrawer>
  );
};

export default StockInDrawer;
