"use client";
import { PricingGSTSectionPresentation } from "@dragorbit/features/products";

import { CURRENCY_OPTIONS, UOM_OPTIONS } from "@/data";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { Input, Select } from "../ui";
import { useAppSelector } from "@/store/hooks";
import { useMemo } from "react";

const PricingGSTSection = ({ formData, onChange, errors = {} }) => {
  const { t } = useTranslation();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const hasStoreGst = !!selectedStore?.gst;

  const handleFieldChange = (field, value) => {
    onChange(field, value);
  };

  const gstAmount = useMemo(() => {
    const sellingPrice = parseFloat(formData.sellingPrice) || 0;
    const gstRate = parseFloat(formData.gstInfo?.gstRate) || 0;
    const isGstIncluded = formData.gstInfo?.isGstIncluded || false;

    if (isGstIncluded) {
      return (sellingPrice * gstRate) / (100 + gstRate);
    }
    return (sellingPrice * gstRate) / 100;
  }, [
    formData.sellingPrice,
    formData.gstInfo?.gstRate,
    formData.gstInfo?.isGstIncluded,
  ]);

  const totalPrice = useMemo(() => {
    const sellingPrice = parseFloat(formData.sellingPrice) || 0;
    const isGstIncluded = formData.gstInfo?.isGstIncluded || false;
    return isGstIncluded ? sellingPrice : sellingPrice + gstAmount;
  }, [formData.sellingPrice, formData.gstInfo?.isGstIncluded, gstAmount]);

  const savings = useMemo(() => {
    const mrp = parseFloat(formData.mrp) || 0;
    const sellingPrice = parseFloat(formData.sellingPrice) || 0;
    if (mrp > sellingPrice) {
      return {
        amount: mrp - sellingPrice,
        percentage: Math.round(((mrp - sellingPrice) / mrp) * 100),
      };
    }
    return { amount: 0, percentage: 0 };
  }, [formData.mrp, formData.sellingPrice]);

  const gstRateLabel =
    formData.gstInfo?.gstRate !== "" && formData.gstInfo?.gstRate != null
      ? `${(parseFloat(formData.gstInfo.gstRate) || 0).toFixed(0)}%`
      : t("products.gstRateAuto");

  return (
    <PricingGSTSectionPresentation
      model={{
        Input,
        t,
        formData,
        handleFieldChange,
        errors,
        Select,
        CURRENCY_OPTIONS,
        UOM_OPTIONS,
        hasStoreGst,
        savings,
        gstRateLabel,
        gstAmount,
        totalPrice,
      }}
    />
  );
};

export default PricingGSTSection;
