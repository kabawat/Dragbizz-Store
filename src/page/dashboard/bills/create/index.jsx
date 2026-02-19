"use client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";

import useErrorHandling from "@/hooks/useErrorHandling";
import { useTranslation } from "@/hooks/useTranslation";
import { billService } from "@/service/retailer";
import { useAppSelector } from "@/store/hooks";

import BillItemsSection from "@/components/bill/create/BillItemsSection";
import BillSidebar from "@/components/bill/create/BillSidebar";

const formInit = {
  supplier: "",
  purchaseOrder: "",
  dueDate: "",
  notes: "",
  goodsReceived: true,
  items: [],
};

const CreateBill = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedStore } = useAppSelector((state) => state.profile);

  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState(formInit);
  const [errors, setErrors] = useState({});

  const {
    handleApiError,
    handleApiResult,
    QuotaModal,
    showError,
  } = useErrorHandling();

  // Handle input changes
  const handleInputChange = (field, value) => {
    if (value === "add-new-supplier") {
      router.push("/dashboard/suppliers/add");
      return;
    }

    if (value === "add-new-purchase-order") {
      router.push("/dashboard/purchase-orders/create");
      return;
    }

    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      if (field === "supplier") newData.purchaseOrder = "";
      return newData;
    });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Validate form
  const validateForm = () => {
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
      if (!item.quantity || item.quantity <= 0 || !Number.isInteger(Number(item.quantity))) {
        newErrors[`item_${index}_quantity`] = "Valid quantity (integer > 0) is required";
      }
      if (item.purchasePrice === undefined || item.purchasePrice === null || item.purchasePrice < 0) {
        newErrors[`item_${index}_purchasePrice`] = "Valid purchase price (number >= 0) is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (isDraft = false) => {
    if (!validateForm() && !isDraft) return;

    try {
      setIsCreating(true);
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

      const result = await billService.createBill(billData);
      const handled = handleApiResult(
        result,
        t("success.createdSuccessfully", { item: t("common.bill") }),
        "bill-creation"
      );

      if (handled.type === "success") {
        setTimeout(() => {
          const billId = result.data?.id || result.data?._id;
          if (billId) router.push(`/dashboard/bills/${billId}`);
          else router.push("/dashboard/bills");
        }, 1500);
      } else if (handled.type === "field") {
        setErrors(handled.fieldErrors);
      }
    } catch (error) {
      const handled = handleApiError(error, "bill-creation");
      if (handled.type === "field") setErrors(handled.fieldErrors);
    } finally {
      setIsCreating(false);
    }
  };

  if (!selectedStore?.storeId) {
    return (
      <div className="flex w-full h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
        <Sidebar />
        <div className="min-h-screen w-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
              {t("bills.loadingStoreData")}
            </h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen relative w-full overflow-hidden">
      <Sidebar />
      <div className="min-h-screen w-full flex flex-col">
        <Header
          title={t("bills.createBill")}
          description={
            searchParams.get("poNumber")
              ? t("bills.billForPO", { poNumber: searchParams.get("poNumber") })
              : t("bills.createBillDescription")
          }
        />
        <div className="flex-1 p-6">
          <div className="max-w-8xl mx-auto w-full">
            <div className="mb-4">
              <Link
                href="/dashboard/bills"
                className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">{t("common.backTo", { item: t("common.bills") })}</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: "calc(100vh - 150px)" }}>
              <div className="lg:col-span-2 flex flex-col h-full">
                <div className="flex-1 h-full">
                  <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="h-full">
                    <BillItemsSection
                      t={t}
                      formData={formData}
                      setFormData={setFormData}
                      showError={showError}
                      errors={errors}
                      setErrors={setErrors}
                    />
                  </form>
                </div>
              </div>

              <BillSidebar
                t={t}
                formData={formData}
                handleInputChange={handleInputChange}
                setFormData={setFormData}
                errors={errors}
                isCreating={isCreating}
                handleSubmit={handleSubmit}
              />
            </div>
          </div>
        </div>
      </div>
      {QuotaModal}
    </div>
  );
};

export default CreateBill;
