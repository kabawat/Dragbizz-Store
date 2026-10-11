"use client";
import { OpeningQuantitySectionPresentation } from "@dragorbit/features/products";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "@/hooks/ui/useTranslation";
import useApiResponse from "@/hooks/useApiResponse";
import { supplierService } from "@/service/retailer";
import { Input, Select } from "../ui";

const OpeningQuantitySection = ({
  formData,
  onChange,
  errors = {},
  storeId = null,
  showExpiryDate = false,
  ...props
}) => {
  const { t } = useTranslation();
  const [suppliers, setSuppliers] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const { execute } = useApiResponse();

  const hasFetchedSuppliers = useRef(false);

  const handleFieldChange = (field, value) => {
    onChange(field, value);
  };

  // Fetch suppliers from API
  const fetchSuppliers = useCallback(async () => {
    if (!storeId || hasFetchedSuppliers.current) return;
    hasFetchedSuppliers.current = true;

    setSuppliersLoading(true);
    const result = await execute(
      supplierService.getSuppliers({
        limit: 100,
        lightweight: true,
        store: storeId,
      }),
      { showToast: false },
    );
    setSuppliersLoading(false);

    if (result?.success) {
      setSuppliers(result.data || []);
    } else {
      hasFetchedSuppliers.current = false;
    }
  }, [storeId, execute]);

  useEffect(() => {
    if (storeId) {
      fetchSuppliers();
    }
  }, [storeId, fetchSuppliers]);

  // Format supplier options for dropdown
  const supplierOptions = [
    { value: "", label: t("products.noSupplierSelected") },
    ...(suppliers || []).map((s) => ({
      value: s.id || s._id,
      label: s.name || s.companyName || "Unknown",
    })),
  ];

  // Calculate total opening value
  const calculateOpeningValue = () => {
    const quantity = parseFloat(formData.openingStock?.quantity) || 0;
    const purchasePrice = parseFloat(formData.openingStock?.purchasePrice) || 0;
    return quantity * purchasePrice;
  };

  const openingValue = calculateOpeningValue();

  return (
    <OpeningQuantitySectionPresentation
      model={{
        Input,
        t,
        formData,
        handleFieldChange,
        errors,
        Select,
        suppliersLoading,
        supplierOptions,
        showExpiryDate,
        openingValue,
      }}
    />
  );
};

export default OpeningQuantitySection;
