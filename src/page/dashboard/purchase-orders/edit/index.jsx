"use client";
import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { Button } from "@/components/ui";
import {
  productService,
  purchaseOrderService,
  supplierService,
} from "@/service/retailer";
import { useAppSelector } from "@/store/hooks";
import { useApiResponse } from "@/hooks/useApiResponse";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";

// Sub-components
import BasicInfoCard from "@/components/purchaseOrders/edit/BasicInfoCard";
import ItemsSection from "@/components/purchaseOrders/edit/ItemsSection";
import POActions from "@/components/purchaseOrders/edit/POActions";
import StatusModals from "@/components/purchaseOrders/edit/StatusModals";
import { AlertCircle } from "lucide-react";

const formInit = {
  supplier: "",
  expectedDeliveryDate: "",
  paymentBy: "30_DAYS",
  reference: "",
  note: "",
  products: [],
};

const EditPurchaseOrder = ({ poId }) => {
  const { t } = useTranslation();
  useDashboardHeader(
    t("purchaseOrders.editPO"),
    t("purchaseOrders.editPODescription") || "Update purchase order details"
  );
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);

  const { can, loading: permissionsLoading } = useModulePermissions("purchase_order");

  useEffect(() => {
    if (!permissionsLoading && !can("edit")) {
      router.push("/dashboard/purchase-orders");
    }
  }, [can, permissionsLoading, router]);

  const [suppliers, setSuppliers] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const [updateError, setUpdateError] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  const [formData, setFormData] = useState(formInit);
  const [errors, setErrors] = useState({});

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [updatedPONumber, setUpdatedPONumber] = useState("");
  const hasFetched = useRef(false);
  const suppliersFetchedRef = useRef({ storeId: null, fetched: false });
  const productsFetchedRef = useRef({ storeId: null, fetched: false });

  const { execute: executeFetchPO, loading: fetching } = useApiResponse();
  const { execute: executeFetchSuppliers } = useApiResponse();
  const { execute: executeFetchProducts } = useApiResponse();
  const { execute: executeUpdate, loading: isUpdating } = useApiResponse();

  // Fetch suppliers
  const fetchSuppliers = async () => {
    const storeId = selectedStore?.storeId;
    if (!storeId) return;
    if (suppliersFetchedRef.current.storeId === storeId && suppliersFetchedRef.current.fetched) return;
    suppliersFetchedRef.current = { storeId, fetched: true };

    setSuppliersLoading(true);
    const result = await executeFetchSuppliers(
      supplierService.getSuppliers({ limit: 100, lightweight: true, store: storeId }),
      { showToast: false }
    );
    setSuppliersLoading(false);
    if (result?.success) {
      setSuppliers(result.data?.data || result.data || []);
    } else {
      suppliersFetchedRef.current = { storeId: null, fetched: false };
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    const storeId = selectedStore?.storeId;
    if (!storeId) return;
    if (productsFetchedRef.current.storeId === storeId && productsFetchedRef.current.fetched) return;
    productsFetchedRef.current = { storeId, fetched: true };

    setProductsLoading(true);
    const result = await executeFetchProducts(
      productService.getProducts({ limit: 100, lightweight: true, store: storeId }),
      { showToast: false }
    );
    setProductsLoading(false);
    if (result?.success) {
      setProducts(result.data?.data || result.data || []);
    } else {
      productsFetchedRef.current = { storeId: null, fetched: false };
    }
  };

  // Fetch current PO
  useEffect(() => {
    const load = async () => {
      if (!poId || !selectedStore?.storeId || hasFetched.current) return;
      hasFetched.current = true;

      const result = await executeFetchPO(
        purchaseOrderService.getPurchaseOrders({
          id: poId,
          paymentType: "ADVANCE_PAYMENT",
          store: selectedStore.storeId,
        }),
        { showToast: false }
      );

      if (result?.success && result.data) {
        const po = result.data;
        const mappedProducts = (po.items || po.products || []).map((it) => ({
          product: it.product?._id || it.product?.id || it.product || "",
          productName: it.product?.name || it.productName || it.name || "",
          quantity: parseInt(it.quantity, 10) || 1,
        }));
        setFormData({
          supplier: po.supplier?.id || po.supplier?._id || po.supplier || "",
          expectedDeliveryDate: po.expectedDeliveryDate
            ? new Date(po.expectedDeliveryDate).toISOString().split("T")[0]
            : "",
          paymentBy: po.paymentBy || po.paymentTerms || "30_DAYS",
          reference: po.reference || "",
          note: po.note || po.notes || "",
          products: mappedProducts.length ? mappedProducts : [],
        });
        setUpdatedPONumber(po.poNumber || po.reference || "");
      } else {
        setFetchError(result?.message || "Failed to load purchase order");
      }
    };
    load();
  }, [poId, selectedStore, executeFetchPO]);

  useEffect(() => {
    const storeId = selectedStore?.storeId;
    if (!storeId) return;

    if (suppliersFetchedRef.current.storeId !== storeId || !suppliersFetchedRef.current.fetched) {
      fetchSuppliers();
    }
    if (productsFetchedRef.current.storeId !== storeId || !productsFetchedRef.current.fetched) {
      fetchProducts();
    }
  }, [selectedStore?.storeId, fetchProducts, fetchSuppliers]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.supplier) newErrors.supplier = "Supplier is required";
    if (!formData.products || formData.products.length === 0)
      newErrors.items = "At least one product is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validateForm()) return;
    setUpdateError(null);

    const payload = {
      store: selectedStore.storeId,
      supplier: formData.supplier,
      products: formData.products.map((it) => ({
        product: it.product,
        quantity: parseInt(it.quantity, 10),
      })),
      paymentBy: formData.paymentBy,
      reference: formData.reference || undefined,
      note: formData.note || undefined,
      expectedDeliveryDate: formData.expectedDeliveryDate || undefined,
    };

    const result = await executeUpdate(
      purchaseOrderService.updatePurchaseOrder(poId, payload, selectedStore.storeId),
      { message: "Purchase order updated successfully" }
    );

    if (result?.success) {
      setUpdatedPONumber(result.data?.poNumber || updatedPONumber || `PO-${Date.now()}`);
      setShowSuccessModal(true);
    } else {
      setUpdateError(result?.message || "Failed to update purchase order");
    }
  };

  if (fetching) {
    return (
      <div className="flex w-full h-screen relative overflow-hidden">
        <div className="min-h-screen w-full flex flex-col">
          <div className="flex-1 p-6">
            <div className="max-w-8xl mx-auto w-full text-center">
              <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-base font-semibold">{t("common.loadingStoreData")}</h2>
              <p>{t("common.pleaseWaitWhileWeFetch", { item: t("purchaseOrders.title") })}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex w-full h-screen relative overflow-hidden items-center justify-center">
        <div className="text-center max-w-md p-8">
          <AlertCircle className="w-20 h-20 text-red-600 mx-auto mb-6" />
          <h2 className="text-lg font-bold mb-3">{t("common.reportNotFound")}</h2>
          <p className="mb-8">{t("common.doesntExistOrRemoved", { item: t("purchaseOrders.title") })}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => router.push("/dashboard/purchase-orders")}>{t("purchaseOrders.backToPurchaseOrders")}</Button>
            <Button variant="primary" onClick={() => window.location.reload()}>{t("common.retry")}</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="max-w-8xl mx-auto w-full">
        <div className="p-5">
          <Link href="/dashboard/purchase-orders" className="inline-flex items-center space-x-2 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">{t("purchaseOrders.backToPurchaseOrders")}</span>
          </Link>
        </div>

        <div className="h-[calc(100vh-210px)] overflow-y-auto px-5 pb-5">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="space-y-6">
                <BasicInfoCard
                  t={t}
                  formData={formData}
                  handleInputChange={handleInputChange}
                  suppliers={suppliers}
                  suppliersLoading={suppliersLoading}
                  errors={errors}
                />

                {updateError && (
                  <div className="p-6 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-600">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">{updateError}</span>
                  </div>
                )}
              </div>

              <ItemsSection
                t={t}
                formData={formData}
                setFormData={setFormData}
                products={products}
                productsLoading={productsLoading}
                errors={errors}
                setErrors={setErrors}
              />
            </div>
          </form>
        </div>

        <POActions
          t={t}
          productsCount={formData.products.length}
          onSaveDraft={() => setShowSaveModal(true)}
          onUpdatePO={handleSubmit}
          isUpdating={isUpdating}
        />
      </div>

      <StatusModals
        t={t}
        showSaveModal={showSaveModal}
        setShowSaveModal={setShowSaveModal}
        showSuccessModal={showSuccessModal}
        setShowSuccessModal={setShowSuccessModal}
        handleSubmit={handleSubmit}
        updatedPONumber={updatedPONumber}
        poId={poId}
        router={router}
      />
    </div>
  );
};

export default EditPurchaseOrder;
