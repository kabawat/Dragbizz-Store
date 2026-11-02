"use client";
import PaymentConfirmModal from "@/components/payment/PaymentConfirmModal";
import { PageSkeleton } from "@dragorbit/ui/app";
import {
  InvoiceFormView,
  useInvoiceCalculations,
  useInvoiceDirtyCheck,
} from "@dragorbit/features/invoices";
import { Button } from "@/components/ui";
import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGlobalToast } from "@/contexts/ToastContext";
import { useCommonHotkeys } from "@/hooks/keyboard/useCommonHotkeys";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { useTranslation } from "@/hooks/ui/useTranslation";
import useApiResponse from "@/hooks/useApiResponse";
import { customerService, invoiceService } from "@/service";
import { variantService } from "@/service/retailer/variant.service";
import { useAppSelector } from "@/store/hooks";

const barcodeCache = new Map();

const EditInvoicePage = ({ invoiceId }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;

  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [paymentInvoiceId, setPaymentInvoiceId] = useState(null);

  const hasFetchedRef = useRef({ invoiceId: null, storeId: null });

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

  const { isDirty, setInitialSnapshot, markPristine } =
    useInvoiceDirtyCheck(formData);

  const { grandTotal } = useInvoiceCalculations({
    items: formData.items,
    totalDiscount: formData.totalDiscount,
    discountMode: formData.discountMode,
    supplierHasGst: true,
  });

  const { showError, showSuccess } = useGlobalToast();
  const { execute } = useApiResponse();

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
        invoiceService.getInvoiceById(
          invoiceId,
          storeId ? { store: storeId } : {}
        ),
        { showToast: false }
      );

      if (!invoiceResult?.success || !invoiceResult?.data) {
        setError(
          invoiceResult?.message ||
            t("invoice.fetchError") ||
            "Failed to load invoice"
        );
        setInitialLoading(false);
        return;
      }

      const invoice = invoiceResult.data;

      const currentStatus = invoice.invoiceStatus || invoice.status;
      if (currentStatus && currentStatus !== "DRAFT") {
        showError(
          t("invoice.cannotEditNonDraft") || "Only draft invoices can be edited"
        );
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
          productName: item.productName || prod.name || item.name || "Item",
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
        customer:
          invoice.customer?._id ||
          invoice.customer?.id ||
          invoice.customer ||
          "",
        totalDiscount: Number(invoice.totalDiscount) || 0,
        discountMode: invoice.discountMode || "POST_TOTAL",
        items: mappedItems,
        orderSource: invoice.orderSource || "POS",
      };

      setFormData(loadedFormData);
      setInitialSnapshot(loadedFormData);

      const extractedProducts = (invoice.items || [])
        .map((item) =>
          typeof item.product === "object" ? item.product : null
        )
        .filter(Boolean);
      if (extractedProducts.length > 0) {
        setProducts(extractedProducts);
      }
    } catch (err) {
      setError(err?.message || "Failed to load invoice data");
    } finally {
      setInitialLoading(false);
    }
  }, [
    invoiceId,
    storeId,
    fetchCustomers,
    execute,
    router,
    showError,
    t,
    setInitialSnapshot,
  ]);

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
      const normalizedCode = String(code || "").trim().toLowerCase();
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
            String(value || "").trim().toLowerCase() === normalizedCode
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
      return null;
    },
    [storeId, execute]
  );

  const handleProductResolved = useCallback((product) => {
    const id = product?.id || product?._id;
    if (!id) return;
    setProducts((prev) => {
      if (prev.some((p) => (p?.id || p?._id) === id)) return prev;
      return [...prev, product];
    });
  }, []);

  const handleRelease = useCallback(() => {
    if (invoiceId) {
      setPaymentInvoiceId(invoiceId);
    }
  }, [invoiceId]);

  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault?.();
      if (!isDirty) {
        handleRelease();
        return;
      }

      const validItems = formData.items.filter(
        (item) => item.product && Number(item.quantity) > 0
      );

      if (validItems.length === 0) {
        showError(
          t("invoice.addAtLeastOneItem") ||
            "Please add at least one item to the invoice"
        );
        return;
      }

      const invoiceData = {
        customer: formData.customer || null,
        isWalkin: true,
        items: validItems.map((item) => ({
          product: item.product,
          ...(item.variant ? { variant: item.variant } : {}),
          quantity: Number(item.quantity) || 1,
          ...(item.price != null && item.price !== ""
            ? { price: Number(item.price) }
            : {}),
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
        {
          message:
            t("invoice.updateSuccess") || "Invoice updated successfully",
        }
      );

      if (result?.success) {
        markPristine();
      } else {
        showError(
          result?.message ||
            t("invoice.updateError") ||
            "Failed to update invoice"
        );
      }
      setInvoiceLoading(false);
    },
    [
      formData,
      storeId,
      execute,
      invoiceId,
      router,
      showError,
      t,
      isDirty,
      markPristine,
    ]
  );

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
        ...(item.price != null && item.price !== ""
          ? { price: Number(item.price) }
          : {}),
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
          t("invoice.updateSuccess") || "Invoice updated successfully",
      }
    );
    setIsSavingDraft(false);

    if (result?.success) {
      markPristine();
      setShowDiscardModal(false);
      router.push(pendingNavigation || "/dashboard/invoices");
    } else {
      showError(
        result?.message ||
          t("invoice.updateError") ||
          "Failed to save draft"
      );
    }
  }, [
    formData,
    storeId,
    invoiceId,
    execute,
    pendingNavigation,
    router,
    showError,
    t,
    markPristine,
  ]);

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
    <InvoiceFormView
      t={t}
      formData={formData}
      setFormData={setFormData}
      products={products}
      customers={customers}
      customersLoading={customersLoading}
      invoiceLoading={invoiceLoading}
      isEditMode={true}
      isDirty={isDirty}
      grandTotal={grandTotal}
      storeId={storeId}
      onBack={handleBack}
      onCreateNew={handleCreateNew}
      onSubmit={handleSubmit}
      onCancel={handleBack}
      onCustomerChange={handleCustomerChange}
      onDiscountChange={handleDiscountChange}
      lookupProductByCode={lookupProductByCode}
      onProductResolved={handleProductResolved}
      fetchVariants={(params) => variantService.getVariants(params)}
      showError={showError}
      showDiscardModal={showDiscardModal}
      onCloseDiscardModal={() => setShowDiscardModal(false)}
      onConfirmDiscard={handleConfirmDiscard}
      onSaveDraft={handleSaveDraftAndLeave}
      isSavingDraft={isSavingDraft}
      onRelease={handleRelease}
      paymentModal={
        <PaymentConfirmModal
          open={Boolean(paymentInvoiceId)}
          invoiceId={paymentInvoiceId}
          source="release"
          dismissOnBackdrop={false}
          onClose={() => {
            setPaymentInvoiceId(null);
          }}
        />
      }
    />
  );
};

export default EditInvoicePage;
