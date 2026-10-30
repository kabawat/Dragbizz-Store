"use client";
import { PageSkeleton } from "@dragorbit/ui/app";
import { ArrowLeft, Plus, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CreateCustomer } from "@/components/customer";
import DiscardInvoiceModal from "@/components/invoice/create/DiscardInvoiceModal";
import InvoiceItemsSection from "@/components/invoice/create/InvoiceItemsSection";
import InvoiceSidebar from "@/components/invoice/create/InvoiceSidebar";
import PaymentConfirmModal from "@/components/payment/PaymentConfirmModal";
import { Button, SideDrawer } from "@/components/ui";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useTranslation } from "@/hooks/ui/useTranslation";
import useApiResponse from "@/hooks/useApiResponse";
import { customerService, invoiceService, productService } from "@/service";
import { variantService } from "@/service/retailer/variant.service";
import { useAppSelector } from "@/store/hooks";
import { calculateInvoiceGST } from "@/utils/gstCalculator";
import {
  findProductByScanCode,
  getProductId,
} from "@/utils/product/findProductByScanCode";

const barcodeCache = new Map();

const INITIAL_FORM_DATA = {
  customer: "",
  totalDiscount: 0,
  discountMode: "POST_TOTAL",
  items: [],
  orderSource: "POS",
};

const CreateInvoicePage = () => {
  // 1. Core Hooks & Selectors
  const router = useRouter();
  const { t } = useTranslation();
  const { selectedStore } = useAppSelector((state) => state.profile);

  // 2. Local State
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [showCustomerDrawer, setShowCustomerDrawer] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [paymentInvoiceId, setPaymentInvoiceId] = useState(null);
  const [createdInvoiceId, setCreatedInvoiceId] = useState(null);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  // Permission Guard
  const { can, loading: permissionLoading } = useModulePermissions("invoice");
  const canCreate = can("create");

  useEffect(() => {
    if (!permissionLoading && !canCreate) {
      router.replace("/dashboard/invoices");
    }
  }, [canCreate, permissionLoading, router]);

  // 3. Refs
  const customersFetchedRef = useRef({ storeId: null, fetched: false });

  // 4. Custom Hooks
  const { showError, showSuccess } = useGlobalToast();
  const { execute } = useApiResponse();

  // 5. Derived Values
  const storeId = selectedStore?.storeId;

  // Calculate grand total for live bottom bar display
  const grandTotal = useMemo(() => {
    if (!formData.items || formData.items.length === 0) return 0;
    const mappedItems = formData.items.map((item) => ({
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
      gstRate: Number(item.gstRate || item.gst?.rate) || 0,
      isInclusive:
        item.isInclusive !== undefined
          ? item.isInclusive
          : item.gst && item.gst.isInclusive !== undefined
            ? item.gst.isInclusive
            : false,
    }));
    const gstSummary = calculateInvoiceGST({
      items: mappedItems,
      totalDiscount: Number(formData.totalDiscount) || 0,
      discountMode: formData.discountMode || "POST_TOTAL",
      supplierHasGst: true,
    });
    return gstSummary.totalAmount || 0;
  }, [formData.items, formData.totalDiscount, formData.discountMode]);

  // 6. Data Fetching Callbacks
  const fetchCustomers = useCallback(async () => {
    if (!storeId) return;
    if (
      customersFetchedRef.current.storeId === storeId &&
      customersFetchedRef.current.fetched
    ) {
      return;
    }

    customersFetchedRef.current = { storeId, fetched: true };
    setCustomersLoading(true);

    const params = { limit: 100, lightweight: true, store: storeId };
    const result = await execute(customerService.getCustomers(params), {
      showToast: false,
    });

    if (result?.success) {
      const serializedOptions = [
        { value: "", label: t("invoice.walkInCustomer") || "Walk-in Customer" },
        ...(result.data || []).map((customer) => ({
          value: customer._id || customer.id,
          label: `${customer.name || t("errors.unknown")} - ${customer.phone || t("errors.noPhone")}${customer.email ? ` - ${customer.email}` : ""}`,
        })),
        {
          value: "add-new-customer",
          label: t("invoice.addNewCustomer") || "Add New Customer",
          isAddOption: true,
        },
      ];
      setCustomers(serializedOptions);
    } else {
      customersFetchedRef.current = { storeId: null, fetched: false };
    }
    setCustomersLoading(false);
  }, [storeId, t, execute]);

  // 7. Effects
  useEffect(() => {
    if (storeId && customersFetchedRef.current.storeId !== storeId) {
      customersFetchedRef.current = { storeId: null, fetched: false };
      barcodeCache.clear();
    }
  }, [storeId]);

  useEffect(() => {
    if (!storeId) return;
    fetchCustomers();
  }, [storeId, fetchCustomers]);

  // 8. Event Handlers
  const handleCustomerChange = useCallback((value) => {
    if (value === "add-new-customer") {
      setShowCustomerDrawer(true);
    } else {
      setFormData((prev) => ({ ...prev, customer: value }));
    }
  }, []);

  const handleDiscountChange = useCallback((value) => {
    setFormData((prev) => ({ ...prev, totalDiscount: value }));
  }, []);

  const lookupProductByCode = useCallback(
    async (code) => {
      if (!storeId) return null;
      const normalizedCode = String(code || "")
        .trim()
        .toLowerCase();
      if (!normalizedCode) return null;

      const cacheKey = `${storeId}:${normalizedCode}`;
      if (barcodeCache.has(cacheKey)) {
        return barcodeCache.get(cacheKey);
      }

      const variantResult = await execute(
        variantService.getVariants({
          store: storeId,
          search: normalizedCode,
          limit: 30,
        }),
        { showToast: false }
      );
      const matchingVariant = (variantResult?.data || []).find((variant) =>
        [variant?.barcode, variant?.sku].some(
          (value) =>
            String(value || "")
              .trim()
              .toLowerCase() === normalizedCode
        )
      );
      if (matchingVariant) {
        const relatedProduct = matchingVariant.product;
        const productId =
          typeof relatedProduct === "object"
            ? relatedProduct?.id || relatedProduct?._id
            : relatedProduct || matchingVariant.productId;
        if (productId) {
          const resolved = {
            id: String(productId),
            _id: String(productId),
            name:
              typeof relatedProduct === "object"
                ? relatedProduct?.name || "Item"
                : "Item",
            sellingPrice: matchingVariant.sellingPrice,
            mrp: matchingVariant.mrp,
            sku: matchingVariant.sku,
            barcode: matchingVariant.barcode,
            gstInfo: matchingVariant.gstInfo || {},
            uom: matchingVariant.uom,
            variants: [matchingVariant],
            matchedVariantId: matchingVariant.id || matchingVariant._id,
          };
          barcodeCache.set(cacheKey, resolved);
          return resolved;
        }
      }

      const result = await execute(
        productService.getProducts({
          search: normalizedCode,
          store: storeId,
          lightweight: true,
          limit: 20,
        }),
        { showToast: false }
      );
      if (!result?.success) return null;
      const resolved = findProductByScanCode(
        result?.data || [],
        normalizedCode
      );
      if (resolved) {
        barcodeCache.set(cacheKey, resolved);
      }
      return resolved;
    },
    [storeId, execute]
  );

  const handleProductResolved = useCallback((product) => {
    const id = getProductId(product);
    if (!id) return;
    setProducts((prev) => {
      if (prev.some((p) => getProductId(p) === id)) return prev;
      return [...prev, product];
    });
  }, []);

  const handleCustomerSuccess = useCallback(
    async (customerData) => {
      customersFetchedRef.current = { storeId: null, fetched: false };
      await fetchCustomers();

      const newCustomerId = customerData?.id || customerData?._id;
      if (newCustomerId) {
        setFormData((prev) => ({ ...prev, customer: newCustomerId }));
      }
      setShowCustomerDrawer(false);
    },
    [fetchCustomers]
  );

  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault?.();

      const validItems = formData.items.filter(
        (item) => item.product && Number(item.quantity) > 0
      );

      if (validItems.length === 0) {
        showError(t("invoice.addAtLeastOneItem") || "Please add at least one item");
        return;
      }

      const invoiceData = {
        customer: formData.customer || null,
        isWalkin: true,
        items: validItems.map((item) => ({
          product: item.product,
          ...(item.variant ? { variant: item.variant } : {}),
          quantity: Number(item.quantity) || 1,
          ...(item.price != null && item.price !== "" ? { price: Number(item.price) } : {}),
          ...(item.uom ? { uom: item.uom } : {}),
        })),
        store: selectedStore?.storeId,
        totalDiscount: Number(formData.totalDiscount) || 0,
        discountMode: "POST_TOTAL",
        orderSource: formData.orderSource || "POS",
      };

      setInvoiceLoading(true);
      const isUpdate = Boolean(createdInvoiceId);
      const result = await execute(
        isUpdate
          ? invoiceService.updateDraftInvoice(createdInvoiceId, invoiceData)
          : invoiceService.createDraftInvoice(invoiceData),
        {
          message: isUpdate
            ? (t("invoice.updateSuccess") || "Invoice updated successfully")
            : (t("invoice.invoiceCreatedSuccess") || "Invoice created successfully"),
        }
      );

      if (result?.success) {
        const targetId = isUpdate ? createdInvoiceId : (result?.data?.id || result?.data?._id);
        if (targetId) {
          if (!createdInvoiceId) setCreatedInvoiceId(targetId);
          setPaymentInvoiceId(targetId);
        } else {
          router.push("/dashboard/invoices");
        }
      } else {
        showError(
          result?.message || t("errors.unknown") || (isUpdate ? "Failed to update invoice" : "Failed to create invoice")
        );
      }
      setInvoiceLoading(false);
    },
    [formData, selectedStore?.storeId, createdInvoiceId, execute, router, showError, t]
  );

  // Back / Cancel with Discard Confirmation
  const handleBack = useCallback(() => {
    if (formData.items && formData.items.length > 0) {
      setPendingNavigation("/dashboard/invoices");
      setShowDiscardModal(true);
    } else {
      router.push("/dashboard/invoices");
    }
  }, [formData.items, router]);

  const handleCreateNew = useCallback(() => {
    if (formData.items && formData.items.length > 0) {
      setPendingNavigation("/dashboard/invoices/add");
      setShowDiscardModal(true);
    } else {
      setCreatedInvoiceId(null);
      setFormData(INITIAL_FORM_DATA);
    }
  }, [formData.items]);

  const handleConfirmDiscard = useCallback(() => {
    setShowDiscardModal(false);
    if (pendingNavigation === "/dashboard/invoices/add") {
      setCreatedInvoiceId(null);
      setFormData(INITIAL_FORM_DATA);
      setPendingNavigation(null);
    } else {
      router.push(pendingNavigation || "/dashboard/invoices");
    }
  }, [pendingNavigation, router]);

  const handleSaveDraftAndLeave = useCallback(async () => {
    const validItems = formData.items.filter(
      (item) => item.product && Number(item.quantity) > 0
    );

    if (validItems.length === 0) {
      setShowDiscardModal(false);
      router.push(pendingNavigation || "/dashboard/invoices");
      return;
    }

    const invoiceData = {
      customer: formData.customer || null,
      isWalkin: true,
      items: validItems.map((item) => ({
        product: item.product,
        ...(item.variant ? { variant: item.variant } : {}),
        quantity: Number(item.quantity) || 1,
        ...(item.price != null && item.price !== "" ? { price: Number(item.price) } : {}),
        ...(item.uom ? { uom: item.uom } : {}),
      })),
      store: selectedStore?.storeId,
      totalDiscount: Number(formData.totalDiscount) || 0,
      discountMode: "POST_TOTAL",
      orderSource: formData.orderSource || "POS",
    };

    setIsSavingDraft(true);
    let result;
    if (createdInvoiceId) {
      result = await execute(
        invoiceService.updateDraftInvoice(createdInvoiceId, invoiceData),
        {
          message:
            t("invoice.savedAsDraftSuccess") ||
            "Invoice saved as draft successfully",
        }
      );
    } else {
      result = await execute(
        invoiceService.createDraftInvoice(invoiceData),
        {
          message:
            t("invoice.savedAsDraftSuccess") ||
            "Invoice saved as draft successfully",
        }
      );
    }
    setIsSavingDraft(false);

    if (result?.success) {
      setShowDiscardModal(false);
      if (pendingNavigation === "/dashboard/invoices/add") {
        setCreatedInvoiceId(null);
        setFormData(INITIAL_FORM_DATA);
        setPendingNavigation(null);
      } else {
        router.push(pendingNavigation || "/dashboard/invoices");
      }
    } else {
      showError(
        result?.message || t("errors.unknown") || "Failed to save draft"
      );
    }
  }, [formData, selectedStore?.storeId, createdInvoiceId, execute, pendingNavigation, router, showError, t]);

  // 9. Shortcuts
  useCommonHotkeys({
    onSave: handleSubmit,
    onBack: handleBack,
  });

  // Show loading if store or permissions are not available yet
  if (!selectedStore?.storeId || permissionLoading) {
    return (
      <PageSkeleton
        label={
          permissionLoading
            ? t("invoice.verifyingPermissions")
            : t("invoice.loadingStoreData")
        }
      />
    );
  }

  // Pre-render guard for non-staff/restricted users
  if (!canCreate) {
    return null;
  }

  return (
    <div className="p-3 sm:p-5 w-full max-w-full overflow-x-hidden min-h-[calc(100vh-65px)] flex flex-col">
      <div className="max-w-8xl mx-auto w-full flex-1 flex flex-col min-w-0">
        {/* Back Button & Create New in Header Row */}
        <div className="mb-3 sm:mb-4 flex-shrink-0 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">
              {t("invoice.backToInvoices") || "Back to Invoices"}
            </span>
          </button>

          {createdInvoiceId && (
            <button
              type="button"
              onClick={handleCreateNew}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/10 hover:bg-[rgb(var(--color-primary))]/20 rounded-lg transition-colors border border-[rgb(var(--color-primary))]/30"
            >
              <Plus className="w-4 h-4" />
              <span>{t("invoice.createNewInvoice") || "Create New"}</span>
            </button>
          )}
        </div>

        {/* Form Container - Two Column Layout */}
        <div className="flex-1 w-full max-w-full min-w-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 w-full max-w-full min-w-0">
            <div className="lg:col-span-2 flex flex-col min-h-0 w-full max-w-full min-w-0">
              <div className="flex-1 min-h-0 w-full max-w-full">
                <form onSubmit={handleSubmit} className="h-full">
                  <InvoiceItemsSection
                    t={t}
                    products={products}
                    formData={formData}
                    setFormData={setFormData}
                    showError={showError}
                    lookupProductByCode={lookupProductByCode}
                    onProductResolved={handleProductResolved}
                    storeId={storeId}
                  />
                </form>
              </div>
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1 w-full max-w-full min-w-0">
              <InvoiceSidebar
                t={t}
                router={router}
                formData={formData}
                handleCustomerChange={handleCustomerChange}
                handleDiscountChange={handleDiscountChange}
                customers={customers}
                customersLoading={customersLoading}
                invoiceLoading={invoiceLoading}
                handleSubmit={handleSubmit}
                isEditMode={Boolean(createdInvoiceId)}
              />
            </div>
          </div>
        </div>

        {/* Sticky Bottom Actions Bar */}
        <div className="sticky bottom-0 z-20 mt-4 bg-[rgb(var(--color-bg-primary))] border border-[rgb(var(--color-border-primary))]/40 rounded-xl px-4 sm:px-6 py-3 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 w-full backdrop-blur-sm">
          <div className="flex items-center gap-2 sm:gap-4 text-sm text-[rgb(var(--color-text-secondary))] w-full sm:w-auto justify-between sm:justify-start">
            <span className="font-medium text-[rgb(var(--color-text-primary))]">
              {formData.items.length}{" "}
              {formData.items.length === 1
                ? t("invoice.item") || "item"
                : t("invoice.items") || "items"}{" "}
              {t("invoice.added") || "added"}
            </span>
            <span className="text-[rgb(var(--color-border-primary))]/60 hidden sm:inline">
              •
            </span>
            <span className="font-bold text-[rgb(var(--color-text-primary))] text-base sm:text-lg">
              {t("invoice.total") || "Total"}: ₹{Number(grandTotal).toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-initial min-w-[100px] justify-center"
              onClick={handleBack}
              disabled={invoiceLoading}
            >
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="flex-1 sm:flex-initial min-w-[140px] justify-center"
              onClick={handleSubmit}
              loading={invoiceLoading}
              leftIcon={createdInvoiceId ? Save : Plus}
              disabled={formData.items.length === 0}
            >
              {createdInvoiceId
                ? t("invoice.updateInvoice") || "Update Invoice"
                : t("invoice.createInvoiceButton") || "Create Invoice"}
            </Button>
          </div>
        </div>
      </div>

      <SideDrawer
        isOpen={showCustomerDrawer}
        onClose={() => {
          setShowCustomerDrawer(false);
        }}
        title={t("invoice.addNewCustomer") || "Add New Customer"}
        width="w-full md:w-2/3 lg:w-1/2"
      >
        <div className="p-6 h-full">
          <CreateCustomer
            storeId={storeId || ""}
            onSuccess={handleCustomerSuccess}
            onCancel={() => setShowCustomerDrawer(false)}
            showCancelButton={true}
            autoRedirect={false}
            mode="drawer"
          />
        </div>
      </SideDrawer>

      <PaymentConfirmModal
        open={Boolean(paymentInvoiceId)}
        invoiceId={paymentInvoiceId}
        source="create"
        dismissOnBackdrop={false}
        onClose={() => {
          setPaymentInvoiceId(null);
          // Transition to edit URL so that user is on the edit page for this draft
          if (createdInvoiceId) {
            router.replace(`/dashboard/invoices/edit/${createdInvoiceId}`);
          }
        }}
      />

      <DiscardInvoiceModal
        isOpen={showDiscardModal}
        onClose={() => setShowDiscardModal(false)}
        onDiscard={handleConfirmDiscard}
        onSaveDraft={handleSaveDraftAndLeave}
        isSaving={isSavingDraft}
        t={t}
      />
    </div>
  );
};

export default CreateInvoicePage;
