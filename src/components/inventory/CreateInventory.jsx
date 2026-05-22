"use client";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import InventoryForm from "@/components/inventory/InventoryForm";
import { Button } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useApiResponse } from "@/hooks/useApiResponse";
import inventoryService from "@/service/retailer/inventory.service";
import { getInventories } from "@/store/slices/inventory/inventorySlice"; // To refresh list after add

const CreateInventory = ({
  onSuccess,
  onCancel,
  showCancelButton = true,
  mode = "page", // 'page' | 'drawer'
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId || "";

  const { execute, loading, clearAll, fieldErrors, setFieldErrors } = useApiResponse();

  // Initial form data - Only required fields
  const getInitialFormData = () => ({
    productId: "",
    store: storeId || "",
    batchData: {
      quantity: "",
      purchasePrice: "",
      supplier: "",
      expiryDate: "",
      paymentStatus: "UNPAID",
      paymentMethod: "CASH",
      paidAmount: 0,
      discount: 0,
    },
  });

  const [formData, setFormData] = useState(getInitialFormData());

  // Update store ID when selectedStore changes
  useEffect(() => {
    if (storeId) {
      setFormData((prevData) => ({
        ...prevData,
        store: storeId,
      }));
    }
  }, [storeId]);

  // Handle form data changes
  const handleFormDataChange = (fieldName, value) => {
    if (typeof fieldName !== "string") return;

    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }

    setFormData((prevData) => {
      const newData = { ...prevData };
      if (fieldName.includes(".")) {
        const [parent, child] = fieldName.split(".");
        if (!newData[parent]) newData[parent] = {};
        newData[parent] = { ...newData[parent], [child]: value };
      } else {
        newData[fieldName] = value;
      }
      return newData;
    });
  };

  // Validate form data
  const validateFormData = () => {
    const errors = {};
    if (!formData.productId) {
      errors.productId = t("inventory.productSelectionRequired");
    }
    if (!formData.batchData?.quantity || formData.batchData?.quantity <= 0) {
      errors["batchData.quantity"] = t("inventory.validQuantityRequired");
    }
    if (!formData.batchData?.purchasePrice || formData.batchData?.purchasePrice <= 0) {
      errors["batchData.purchasePrice"] = t("inventory.validPurchasePriceRequired");
    }
    return errors;
  };

  const handleSaveAndPublish = async () => {
    setFieldErrors({});

    // Validate form data
    const validationErrors = validateFormData();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    clearAll(); // clears previous errors/messages

    // Prepare data for API
    const apiData = {
      productId: formData.productId,
      store: storeId,
      batchData: {
        quantity: Number(formData.batchData.quantity),
        purchasePrice: Number(formData.batchData.purchasePrice),
        supplier: formData.batchData.supplier,
        expiryDate: formData.batchData.expiryDate || null,
        paymentStatus: formData.batchData.paymentStatus,
        paymentMethod: formData.batchData.paymentMethod,
        paidAmount: Number(formData.batchData.paidAmount || 0),
        discount: Number(formData.batchData.discount || 0),
      },
    };

    const response = await execute(inventoryService.addInventory(apiData), {
        message: t("inventory.inventoryAddedSuccessfully")
    });

    if (response?.success) {
      const savedItem = response.data?.inventory || response.data;
      setFormData(getInitialFormData());
      
      // Refresh inventory list globally after creating a new item
      if (storeId) {
        dispatch(getInventories({ store: storeId, limit: 20, isFreshLoad: true }));
      }
      onSuccess?.(savedItem);
    } else if (response?.data?.fields) {
      setFieldErrors(response.data.fields);
    }
  };

  return (
    <div className={`flex flex-col ${mode === "drawer" ? "h-full" : "min-h-full"}`}>
      <div className={`${mode === "drawer" ? "flex-1 overflow-y-auto space-y-4 sm:space-y-6 min-h-0" : ""}`}>
        <InventoryForm
          formData={formData}
          onChange={handleFormDataChange}
          fieldErrors={fieldErrors}
        />
      </div>

      {/* Action Buttons */}
      {(mode === "drawer" || showCancelButton) && (
        <div
          className={`flex-shrink-0 ${mode === "drawer"
            ? "bg-[rgb(var(--color-bg-primary))] border-t border-[rgb(var(--color-border-primary))] p-3 sm:p-4 -mx-3 sm:-mx-4 md:-mx-6 -mb-3 sm:-mb-4 md:-mb-6"
            : "mt-auto bg-[rgb(var(--color-bg-primary))] border-t border-[rgb(var(--color-border-primary))] pt-4 pb-4"
            } flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-2 sm:gap-3`}
        >
          <Button
            variant="success"
            onClick={handleSaveAndPublish}
            disabled={loading}
            loading={loading}
            leftIcon={Save}
            className="w-full sm:w-auto"
            size="sm"
          >
            {t("inventory.saveAndPublish")}
          </Button>
          {showCancelButton && onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="w-full sm:w-auto"
              size="sm"
            >
              {t("common.cancel")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default CreateInventory;
