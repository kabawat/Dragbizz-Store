"use client";
import { PageSkeleton } from "@dragorbit/ui/app";
import { ArrowLeft, FileText, Plus, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DiscardInvoiceModal from "@/components/invoice/create/DiscardInvoiceModal";
import InvoiceItemsSection from "@/components/invoice/create/InvoiceItemsSection";
import InvoiceSidebar from "@/components/invoice/create/InvoiceSidebar";
import { Button } from "@/components/ui";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
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

const getFormSnapshot = (data) => {
  if (!data) return "";
  return JSON.stringify({
    customer: String(data.customer?._id || data.customer?.id || data.customer || ""),
    totalDiscount: Number(data.totalDiscount) || 0,
    discountMode: String(data.discountMode || "POST_TOTAL"),
    orderSource: String(data.orderSource || "POS"),
    items: (data.items || []).map((item) => {
      const pId = typeof item.product === "object" ? item.product?._id || item.product?.id : item.product;
      const vId = typeof item.variant === "object" ? item.variant?._id || item.variant?.id : item.variant;
      return {
        product: String(pId || ""),
        variant: String(vId || ""),
        quantity: Number(item.quantity) || 0,
        price: Number(item.price) || 0,
        uom: String(item.uom || ""),
      };
    }),
  });
};

const EditInvoicePage = ({ invoiceId }) => {
  const { t } = useTranslation();

  useDashboardHeader(
    t("invoice.editInvoice") || "Edit Invoice",
    t("invoice.editInvoiceDescription") || "Update invoice details and items"
  );
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;
  const { showError, showSuccess } = useGlobalToast();
  const { execute } = useApiResponse();

  // Local state
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  const hasFetchedRef = useRef({ invoiceId: null, storeId: null });
  const initialSnapshotRef = useRef(null);

  // Permission Management
  const { can, loading: permissionLoading } = useModulePermissions("invoice");
  const canEdit = can("edit");

  useEffect(() => {
    if (!permissionLoading && !canEdit) {
      router.replace("/dashboard/invoices");
    }
  }, [canEdit, permissionLoading, router]);

  const [formData, setFormData] = useState({
    customer: "",
    totalDiscount: 0,
    discountMode: "POST_TOTAL",
    items: [],
    orderSource: "POS",
  });

  const isDirty = useMemo(() => {
    if (!initialSnapshotRef.current) return false;
    return getFormSnapshot(formData) !== initialSnapshotRef.current;
  }, [formData]);

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

  const handleCustomerChange = useCallback((value) => {
    setFormData((prev) => ({ ...prev, customer: value }));
  }, []);

  const handleDiscountChange = useCallback((value) => {
    setFormData((prev) => ({ ...prev, totalDiscount: value }));
  }, []);

  const fetchCustomers = useCallback(async () => {
    if (!storeId) return;

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
    }
    setCustomersLoading(false);
  }, [storeId, t, execute]);

  const loadInitialData = useCallback(async () => {
    if (!invoiceId || !storeId) return;

    setInitialLoading(true);
    setError(null);

    try {
      await fetchCustomers();

      const invoiceResult = await execute(
        invoiceService.getInvoiceById(invoiceId, storeId ? { store: storeId } : {}),
        { showToast: false }
      );

      if (!invoiceResult?.success || !invoiceResult?.data) {
        setError(invoiceResult?.message || t("invoice.fetchError") || "Failed to load invoice");
        setInitialLoading(false);
        return;
      }

      const invoice = invoiceResult.data;

      const currentStatus = invoice.invoiceStatus || invoice.status;
      if (currentStatus && currentStatus !== "DRAFT") {
        showError(t("invoice.cannotEditNonDraft") || "Only draft invoices can be edited");
        router.replace(`/dashboard/invoices/${invoiceId}`);
        return;
      }

      const mappedItems = (invoice.items || []).map((item) => {
        const prod = item.product || {};
        const pId = typeof prod === "object" ? prod._id || prod.id : prod;
        const vId = item.variant
          ? typeof item.variant === "object"
            ? item.variant._id || item.variant.id
            : item.variant
          : null;

        const unitPrice =
          Number(item.price) ||
          Number(item.unitPrice) ||
          Number(item.sellingPrice) ||
          0;
        const qty = Number(item.quantity) || 1;

        return {
          product: pId,
          variant: vId,
          productName: item.name || prod.name || item.productName || "Item",
          sku: item.sku || prod.sku || "",
          quantity: qty,
          price: unitPrice,
          total: unitPrice * qty,
          gstRate: Number(item.gstRate || item.gst?.rate || 0),
          isInclusive: Boolean(item.isInclusive ?? item.gst?.isInclusive),
          uom: item.uom || prod.uom || "Unit",
        };
      });

      const loadedFormData = {
        customer: invoice.customer?._id || invoice.customer?.id || invoice.customer || "",
        totalDiscount: Number(invoice.totalDiscount) || 0,
        discountMode: invoice.discountMode || "POST_TOTAL",
        items: mappedItems,
        orderSource: invoice.orderSource || "POS",
      };

      setFormData(loadedFormData);
      initialSnapshotRef.current = getFormSnapshot(loadedFormData);

      const extractedProducts = (invoice.items || [])
        .map((item) => (typeof item.product === "object" ? item.product : null))
        .filter(Boolean);
      if (extractedProducts.length > 0) {
        setProducts(extractedProducts);
      }
    } catch (err) {
      setError(err?.message || "Failed to load invoice data");
    } finally {
      setInitialLoading(false);
    }
  }, [invoiceId, storeId, fetchCustomers, execute, router, showError, t]);

  useEffect(() => {
    if (
      invoiceId &&
      storeId &&
      (hasFetchedRef.current.invoiceId !== invoiceId ||
        hasFetchedRef.current.storeId !== storeId)
    ) {
      hasFetchedRef.current = { invoiceId, storeId };
      loadInitialData();
    }
  }, [invoiceId, storeId, loadInitialData]);

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

  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault?.();
      if (!isDirty) return;

      const validItems = formData.items.filter(
        (item) => item.product && Number(item.quantity) > 0
      );

      if (validItems.length === 0) {
        showError(t("invoice.addAtLeastOneItem") || "Please add at least one item to the invoice");
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
        store: storeId,
        totalDiscount: Number(formData.totalDiscount) || 0,
        discountMode: formData.discountMode || "POST_TOTAL",
        orderSource: formData.orderSource || "POS",
      };

      setInvoiceLoading(true);
      const result = await execute(
        invoiceService.updateDraftInvoice(invoiceId, invoiceData),
        { message: t("invoice.updateSuccess") || "Invoice updated successfully" }
      );

      if (result?.success) {
        initialSnapshotRef.current = getFormSnapshot(formData);
        router.push(`/dashboard/invoices/${invoiceId}`);
      } else {
        showError(result?.message || t("invoice.updateError") || "Failed to update invoice");
      }
      setInvoiceLoading(false);
    },
    [formData, storeId, execute, invoiceId, router, showError, t, isDirty]
  );

  // Discard & Create New Handlers
  const handleBack = useCallback(() => {
    if (isDirty) {
      setPendingNavigation("/dashboard/invoices");
      setShowDiscardModal(true);
    } else {
      router.push("/dashboard/invoices");
    }
  }, [isDirty, router]);

  const handleCreateNew = useCallback(() => {
    if (isDirty) {
      setPendingNavigation("/dashboard/invoices/add");
      setShowDiscardModal(true);
    } else {
      router.push("/dashboard/invoices/add");
    }
  }, [isDirty, router]);

  const handleConfirmDiscard = useCallback(() => {
    setShowDiscardModal(false);
    router.push(pendingNavigation || "/dashboard/invoices");
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
      store: storeId,
      totalDiscount: Number(formData.totalDiscount) || 0,
      discountMode: formData.discountMode || "POST_TOTAL",
      orderSource: formData.orderSource || "POS",
    };

    setIsSavingDraft(true);
    const result = await execute(
      invoiceService.updateDraftInvoice(invoiceId, invoiceData),
      {
        message:
          t("invoice.updateSuccess") ||
          "Invoice updated successfully",
      }
    );
    setIsSavingDraft(false);

    if (result?.success) {
      initialSnapshotRef.current = getFormSnapshot(formData);
      setShowDiscardModal(false);
      router.push(pendingNavigation || "/dashboard/invoices");
    } else {
      showError(
        result?.message || t("invoice.updateError") || "Failed to save draft"
      );
    }
  }, [formData, storeId, invoiceId, execute, pendingNavigation, router, showError, t]);

  useCommonHotkeys({
    onSave: handleSubmit,
    onBack: handleBack,
  });

  if (!storeId || permissionLoading || initialLoading) {
    return <PageSkeleton />;
  }

  if (!canEdit) {
    return null;
  }

  if (error) {
    return (
      <div className="flex w-full h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
        <div className="min-h-screen w-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2">
              {t("common.errorLoading", { item: t("common.invoice") })}
            </h2>
            <p className="text-[rgb(var(--color-text-secondary))] mb-6">
              {error}
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                {t("common.retry")}
              </Button>
              <Button
                variant="primary"
                onClick={() => router.push("/dashboard/invoices")}
              >
                {t("common.backTo", { item: t("common.invoices") })}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-5 w-full max-w-full overflow-x-hidden min-h-[calc(100vh-65px)] flex flex-col">
      <div className="max-w-8xl mx-auto w-full flex-1 flex flex-col min-w-0">
        {/* Header Row: Back Button on Left, Create New Button on Right */}
        <div className="mb-3 sm:mb-4 flex-shrink-0 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">
              {t("invoice.backToInvoices") || t("common.backTo", { item: t("common.invoices") }) || "Back to Invoices"}
            </span>
          </button>

          <button
            type="button"
            onClick={handleCreateNew}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/10 hover:bg-[rgb(var(--color-primary))]/20 rounded-lg transition-colors border border-[rgb(var(--color-primary))]/30"
          >
            <Plus className="w-4 h-4" />
            <span>{t("invoice.createNewInvoice") || "Create New"}</span>
          </button>
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
                isEditMode={true}
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
              leftIcon={Save}
              disabled={!isDirty || invoiceLoading || formData.items.length === 0}
            >
              {t("invoice.updateInvoice") || "Update Invoice"}
            </Button>
          </div>
        </div>
      </div>

      <DiscardInvoiceModal
        isOpen={showDiscardModal}
        onClose={() => setShowDiscardModal(false)}
        onDiscard={handleConfirmDiscard}
        onSaveDraft={handleSaveDraftAndLeave}
        isSaving={isSavingDraft}
        isEdit={true}
        t={t}
      />
    </div>
  );
};

export default EditInvoicePage;
