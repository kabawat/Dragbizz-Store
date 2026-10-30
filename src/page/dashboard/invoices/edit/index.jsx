"use client";
import { PageSkeleton } from "@dragorbit/ui/app";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
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
import {
  findProductByScanCode,
  getProductId,
} from "@/utils/product/findProductByScanCode";

const barcodeCache = new Map();

const EditInvoicePage = ({ invoiceId }) => {
  const { t } = useTranslation();

  useDashboardHeader(
    t("invoice.editInvoice"),
    t("invoice.editInvoiceDescription")
  );
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId;
  const { showError } = useGlobalToast();
  const { execute } = useApiResponse();

  // Local state
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  const hasFetchedRef = useRef({ invoiceId: null, storeId: null });

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

  // Parallel fetch for invoice and customer data
  const loadInitialData = useCallback(async () => {
    if (!invoiceId || !storeId) return;

    if (
      hasFetchedRef.current.invoiceId === invoiceId &&
      hasFetchedRef.current.storeId === storeId
    ) {
      return;
    }

    hasFetchedRef.current = { invoiceId, storeId };
    setInitialLoading(true);
    setCustomersLoading(true);
    setError(null);

    try {
      const [invResult, custResult] = await Promise.all([
        execute(invoiceService.getInvoices({ id: invoiceId, store: storeId }), {
          showToast: false,
        }),
        execute(
          customerService.getCustomers({
            limit: 100,
            lightweight: true,
            store: storeId,
          }),
          { showToast: false }
        ),
      ]);

      // 1. Process Customers
      if (custResult?.success) {
        const serializedOptions = [
          { value: "", label: t("dashboard.walkInCustomer") },
          ...(custResult.data || []).map((customer) => ({
            value: customer.id || customer._id,
            label: `${customer.name || t("errors.unknown")} - ${customer.phone || t("errors.noPhone")}${customer.email ? ` - ${customer.email}` : ""}`,
          })),
        ];
        setCustomers(serializedOptions);
      }
      setCustomersLoading(false);

      // 2. Process Invoice
      if (invResult?.success && invResult.data) {
        const inv = invResult.data;

        if (inv.invoiceStatus !== "DRAFT") {
          setError(
            t("invoice.cannotEditNonDraft") ||
              `Only draft invoices can be edited. This invoice is already ${inv.invoiceStatus || "processed"} and cannot be modified.`
          );
          setInitialLoading(false);
          return;
        }

        const seedProducts = [];
        const seenProductIds = new Set();

        const transformedItems =
          inv.items?.map((item) => {
            const productObj =
              typeof item.product === "object" ? item.product : {};
            const productId = productObj.id || productObj._id || item.product;

            if (productId && !seenProductIds.has(String(productId))) {
              seenProductIds.add(String(productId));
              if (productObj.id || productObj._id) {
                seedProducts.push(productObj);
              }
            }

            const variantObj =
              typeof item.variant === "object" ? item.variant : null;
            const variantId =
              variantObj?.id ||
              variantObj?._id ||
              (typeof item.variant === "string" ? item.variant : null) ||
              null;

            return {
              product: productId,
              variant: variantId,
              productName: item.productName || productObj.name || "",
              sku: item.sku || variantObj?.sku || "",
              quantity: item.quantity || 1,
              price:
                item.price ?? productObj.sellingPrice ?? productObj.price ?? 0,
              total: item.total || 0,
              gstRate:
                item.gstRate ??
                item.gst?.rate ??
                productObj.gstInfo?.gstRate ??
                0,
              isInclusive:
                item.isInclusive !== undefined
                  ? item.isInclusive
                  : item.gst?.isInclusive !== undefined
                    ? item.gst.isInclusive
                    : (productObj.gstInfo?.isGstIncluded ?? false),
              uom: item.uom || productObj.uom || "Unit",
            };
          }) || [];

        if (seedProducts.length > 0) {
          setProducts(seedProducts);
        }

        setFormData({
          customer: inv.customer?.id || inv.customer?._id || "",
          totalDiscount: inv.totalDiscount || 0,
          discountMode: inv.discountMode || "POST_TOTAL",
          items: transformedItems,
          orderSource: inv.orderSource || "POS",
        });
      } else {
        setError(
          invResult?.message ||
            t("errors.failedToFetchData", { item: t("common.invoice") })
        );
      }
    } catch (err) {
      setError(err?.message || "Failed to load invoice details");
    } finally {
      setInitialLoading(false);
    }
  }, [invoiceId, storeId, execute, t]);

  useEffect(() => {
    if (storeId) {
      barcodeCache.clear();
      loadInitialData();
    }
  }, [storeId, loadInitialData]);

  const handleCustomerChange = useCallback((value) => {
    setFormData((prev) => ({ ...prev, customer: value }));
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

  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault?.();

      const validItems = formData.items.filter(
        (item) => item.product && item.quantity > 0
      );

      if (validItems.length === 0) {
        showError("Please add at least one item to the invoice");
        return;
      }

      const invoiceData = {
        customer: formData.customer || null,
        isWalkin: true,
        items: validItems.map((item) => ({
          product: item.product,
          ...(item.variant ? { variant: item.variant } : {}),
          quantity: item.quantity,
          ...(item.price != null ? { price: item.price } : {}),
          ...(item.uom ? { uom: item.uom } : {}),
        })),
        store: storeId,
        totalDiscount: formData.totalDiscount || 0,
        discountMode: formData.discountMode || "POST_TOTAL",
        orderSource: formData.orderSource || "POS",
      };

      setInvoiceLoading(true);
      const result = await execute(
        invoiceService.updateDraftInvoice(invoiceId, invoiceData),
        { message: t("invoice.updateSuccess") }
      );

      if (result?.success) {
        router.push(`/dashboard/invoices/${invoiceId}`);
      } else {
        showError(result?.message || t("invoice.updateError"));
      }
      setInvoiceLoading(false);
    },
    [formData, storeId, execute, invoiceId, router, showError, t]
  );

  useCommonHotkeys({
    onSave: handleSubmit,
    onBack: () => router.push("/dashboard/invoices"),
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
    <div className="p-5">
      <div className="max-w-8xl mx-auto w-full">
        {/* Back Button */}
        <div className="mb-4 flex-shrink-0 flex items-center justify-between">
          <Link
            href="/dashboard/invoices"
            className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">
              {t("common.backTo", { item: t("common.invoices") })}
            </span>
          </Link>
        </div>

        {/* Form Container - Two Column Layout */}
        <div className="overflow-hidden">
          <div className="min-h-[calc(100vh-150px)] lg:h-[calc(100vh-150px)] overflow-y-auto">
            <div className="min-h-full lg:h-full grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 flex flex-col min-h-0">
                <div className="flex-1 min-h-0">
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
              <InvoiceSidebar
                t={t}
                router={router}
                formData={formData}
                handleCustomerChange={handleCustomerChange}
                customers={customers}
                customersLoading={customersLoading}
                invoiceLoading={invoiceLoading}
                handleSubmit={handleSubmit}
                isEditMode={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditInvoicePage;
