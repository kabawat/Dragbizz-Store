"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui";

import { useGlobalToast } from "@/contexts/ToastContext";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { billService } from "@/service/retailer";
import { useAppSelector } from "@/store/hooks";
import { useApiResponse } from "@/hooks/useApiResponse";

import BillItemsSection from "@/components/bills/create/BillItemsSection";
import BillSidebar from "@/components/bills/create/BillSidebar";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const EditBill = ({ billId }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);

  const [fetchError, setFetchError] = useState(null);

  const [formData, setFormData] = useState({
    supplier: "",
    purchaseOrder: "",
    dueDate: "",
    notes: "",
    goodsReceived: true,
    items: [],
  });

  const [errors, setErrors] = useState({});
  const hasFetched = useRef(false);

  const { showError } = useGlobalToast();
  const { execute: executeFetch, loading: fetching } = useApiResponse();
  const { execute: executeUpdate, loading: isUpdating } = useApiResponse();

  // Fetch existing bill data
  useEffect(() => {
    const fetchBillData = async () => {
      if (!billId || !selectedStore?.storeId || hasFetched.current) return;
      hasFetched.current = true;

      const result = await executeFetch(
        billService.getBills({ store: selectedStore.storeId, id: billId }),
        { showToast: false }
      );

      if (result?.success && result.data) {
        const billData = result.data;
        setFormData({
          supplier: billData.supplier?._id || billData.supplier?.id || "",
          purchaseOrder: billData.purchaseOrder?._id || billData.purchaseOrder?.id || "",
          dueDate: billData.dueDate ? new Date(billData.dueDate).toISOString().split("T")[0] : "",
          notes: billData.notes || "",
          goodsReceived: billData.goodsReceived ?? true,
          items: (billData.items || []).map(item => ({
            product: item.product?._id || item.product || "",
            quantity: item.quantity || 1,
            purchasePrice: item.unitPrice || item.purchasePrice || 0,
          })),
        });
      } else {
        setFetchError(result?.message || t("errors.failedToFetchData", { item: t("common.bill") }));
      }
    };

    fetchBillData();
  }, [billId, selectedStore?.storeId, t, executeFetch]);

  // Handle input changes
  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      if (field === "supplier") newData.purchaseOrder = "";
      return newData;
    });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  }, [errors]);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.supplier) newErrors.supplier = "Supplier is required";

    if (formData.dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(formData.dueDate) < today) {
        newErrors.dueDate = "Due date cannot be in the past";
      }
    }

    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = t("errors.notesCannotExceed500Chars");
    }

    if (!formData.items || formData.items.length === 0) {
      newErrors.items = "At least one item is required";
    }

    formData.items.forEach((item, index) => {
      if (!item.product) newErrors[`item_${index}_product`] = "Product is required";
      if (!item.quantity || item.quantity <= 0) newErrors[`item_${index}_quantity`] = "Valid quantity is required";
      if (item.purchasePrice === undefined || item.purchasePrice < 0) {
        newErrors[`item_${index}_purchasePrice`] = "Valid price is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  // Handle update submission
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    const billData = {
      store: selectedStore.storeId,
      supplier: formData.supplier,
      purchaseOrder: formData.purchaseOrder || undefined,
      goodsReceived: !!formData.goodsReceived,
      items: formData.items.map((item) => ({
        product: item.product,
        quantity: parseInt(item.quantity, 10),
        purchasePrice: parseFloat(item.purchasePrice),
      })),
      dueDate: formData.dueDate || undefined,
      notes: formData.notes || undefined,
    };

    const result = await executeUpdate(
      billService.updateBill(billId, billData, selectedStore.storeId),
      { message: t("success.updatedSuccessfully", { item: t("common.bill") }) }
    );

    if (result?.success) {
      setTimeout(() => {
        router.push(`/dashboard/bills/${billId}`);
      }, 1500);
    } else if (result?.fieldErrors) {
      setErrors(result.fieldErrors);
    }
  }, [billId, formData, selectedStore?.storeId, validateForm, t, executeUpdate, router]);

  const memoizedBillItemsSection = useMemo(() => (
    <BillItemsSection
      t={t}
      formData={formData}
      setFormData={setFormData}
      showError={showError}
      errors={errors}
      setErrors={setErrors}
    />
  ), [errors, formData, setErrors, setFormData, showError, t]);

  const memoizedBillSidebar = useMemo(() => (
    <BillSidebar
      t={t}
      formData={formData}
      handleInputChange={handleInputChange}
      setFormData={setFormData}
      errors={errors}
      isCreating={isUpdating}
      handleSubmit={handleSubmit}
    />
  ), [errors, formData, handleInputChange, handleSubmit, isUpdating, setFormData, t]);

  if (fetching) {
    return (
      <div className="flex w-full h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
        <Sidebar />
        <div className="min-h-screen w-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
              {t("modals.loadingData", { item: t("common.bill") })}
            </h2>
          </div>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex w-full h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
        <Sidebar />
        <div className="min-h-screen w-full flex items-center justify-center">
          <div className="text-center max-w-md p-8 bg-[rgb(var(--color-bg-primary))] rounded-xl shadow-sm">
            <Receipt className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-[rgb(var(--color-text-primary))] mb-2">{fetchError}</h2>
            <Button variant="outline" onClick={() => router.push("/dashboard/bills")} className="mt-4">
              {t("common.backTo", { item: t("common.bills") })}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen relative w-full overflow-hidden">
      <Sidebar />
      <div className="min-h-screen w-full flex flex-col">
        <Header title={t("bills.editBill")} description={t("bills.updateBillInformationAndDetails")} />

        <div className="flex-1 p-6">
          <div className="max-w-8xl mx-auto w-full">
            <div className="mb-4">
              <Link href="/dashboard/bills" className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">{t("common.backTo", { item: t("common.bills") })}</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: "calc(100vh - 150px)" }}>
              <div className="lg:col-span-2 flex flex-col h-full">
                <div className="flex-1 pe-3 h-full">
                  <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="h-full">
                    {memoizedBillItemsSection}
                  </form>
                </div>
              </div>

              {memoizedBillSidebar}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditBill;
