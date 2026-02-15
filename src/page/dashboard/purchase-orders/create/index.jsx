"use client";
import Link from "next/link";
import { productService, purchaseOrderService, supplierService, } from "@/service/retailer";
import { useCallback, useEffect, useRef, useState } from "react";
import { AddSupplierDrawer } from "@/components/supplier";
import { useTranslation } from "@/hooks/useTranslation";
import { useAppSelector } from "@/store/hooks";
import { ArrowLeft, } from "lucide-react";
import { useRouter } from "next/navigation";

// Sub-components
import AdvancePaymentCard from "@/components/purchaseOrders/create/AdvancePaymentCard";
import useErrorHandling from "@/hooks/useErrorHandling";
import SaveDraftModal from "@/components/purchaseOrders/create/SaveDraftModal";
import BasicInfoCard from "@/components/purchaseOrders/create/BasicInfoCard";
import ItemsSection from "@/components/purchaseOrders/create/ItemsSection";
import AddressCard from "@/components/purchaseOrders/create/AddressCard";
import POActions from "@/components/purchaseOrders/create/POActions";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";

const formInit = {
  supplier: "",
  expectedDeliveryDate: "",
  paymentBy: "30_DAYS",
  reference: "",
  note: "",
  products: [],
  payment: [],
  billingAddress: null,
  shippingAddress: null,
};

const CreatePurchaseOrder = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { selectedStore } = useAppSelector((state) => state.profile);

  const [suppliers, setSuppliers] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const [formData, setFormData] = useState(formInit);
  const [errors, setErrors] = useState({});
  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);
  const [showAddSupplierDrawer, setShowAddSupplierDrawer] = useState(false);

  const { showSuccess } = useErrorHandling();

  // Refs to prevent duplicate API calls
  const suppliersFetchedRef = useRef({ storeId: null, fetched: false });
  const productsFetchedRef = useRef({ storeId: null, fetched: false });

  // Get stable storeId
  const storeId =
    selectedStore?.storeId || selectedStore?._id || selectedStore?.id;

  // Fetch suppliers
  const fetchSuppliers = useCallback(async () => {
    if (!storeId) return;

    if (suppliersFetchedRef.current.storeId === storeId && suppliersFetchedRef.current.fetched) {
      return;
    }

    if (suppliersLoading) return;

    suppliersFetchedRef.current = { storeId, fetched: true };

    try {
      setSuppliersLoading(true);
      const result = await supplierService.getSuppliers({
        limit: 100,
        lightweight: true,
        store: storeId,
      });
      if (result.success) {
        const data = result.data?.data || result.data || [];
        setSuppliers(data);
      }
    } finally {
      setSuppliersLoading(false);
    }
  }, [storeId, suppliersLoading]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    if (!storeId) return;

    if (productsFetchedRef.current.storeId === storeId && productsFetchedRef.current.fetched) {
      return;
    }

    if (productsLoading) return;

    productsFetchedRef.current = { storeId, fetched: true };

    try {
      setProductsLoading(true);
      const result = await productService.getProducts({
        limit: 100,
        lightweight: true,
        store: storeId,
      });
      if (result.success) {
        const data = result.data?.data || result.data || [];
        setProducts(data);
      }
    } finally {
      setProductsLoading(false);
    }
  }, [storeId, productsLoading]);

  // Reset refs when storeId changes
  useEffect(() => {
    if (storeId && (suppliersFetchedRef.current.storeId !== storeId || productsFetchedRef.current.storeId !== storeId)) {
      suppliersFetchedRef.current = { storeId: null, fetched: false };
      productsFetchedRef.current = { storeId: null, fetched: false };
    }
  }, [storeId]);

  // Fetch data on mount or store change
  useEffect(() => {
    if (!storeId) return;
    fetchSuppliers();
    fetchProducts();
  }, [storeId, fetchProducts, fetchSuppliers]);

  const handleInputChange = (field, value) => {
    if (field === "supplier" && value === "__add_new_supplier__") {
      setShowAddSupplierDrawer(true);
      return;
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSupplierSuccess = async (newSupplier) => {
    suppliersFetchedRef.current = { storeId: null, fetched: false };
    await fetchSuppliers();
    if (newSupplier && (newSupplier.id || newSupplier._id)) {
      setFormData((prev) => ({
        ...prev,
        supplier: newSupplier.id || newSupplier._id,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.supplier) newErrors.supplier = t("purchaseOrders.supplierRequired");
    if (formData.note && formData.note.length > 500) newErrors.note = t("purchaseOrders.notesCannotExceed500");
    if (!formData.products || formData.products.length === 0) newErrors.items = t("purchaseOrders.atLeastOneProductRequired");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatAddressPayload = (address) => {
    if (!address) return undefined;
    const payload = {};
    const fields = ["label", "name", "phone", "addressLine1", "addressLine2", "city", "state", "pincode", "country", "sameAsStore"];
    fields.forEach((field) => {
      if (address[field]) payload[field] = address[field];
    });
    if (payload.addressLine1 && !payload.address) payload.address = payload.addressLine1;
    return Object.keys(payload).length > 0 ? payload : undefined;
  };

  const handleSubmit = async (isDraft = false) => {
    if (!validateForm() && !isDraft) return;
    try {
      setIsCreating(true);
      setCreateError(null);

      const poPayload = {
        store: selectedStore.storeId,
        supplier: formData.supplier,
        products: formData.products.map((item) => ({
          product: item.product,
          quantity: parseInt(item.quantity, 10),
        })),
        payment: formData.payment,
        paymentBy: formData.paymentBy,
        reference: formData.reference || undefined,
        note: formData.note || undefined,
        expectedDeliveryDate: formData.expectedDeliveryDate || undefined,
      };

      const billingPayload = formatAddressPayload(formData.billingAddress);
      if (billingPayload) poPayload.billingAddress = billingPayload;

      const shippingPayload = formatAddressPayload(formData.shippingAddress);
      if (shippingPayload) poPayload.deliveryAddress = shippingPayload;

      const result = await purchaseOrderService.createPurchaseOrder(poPayload);
      if (result.success) {
        const poNumber = result.data?.poNumber || `PO-${Date.now()}`;
        const poId = result.data?.id || result.data?._id || "";
        showSuccess(`${poNumber} has been created successfully!`);
        setTimeout(() => {
          setFormData(formInit);
          if (poId) router.push(`/dashboard/purchase-orders/${poId}`);
          else router.push("/dashboard/purchase-orders");
        }, 1500);
      } else {
        setCreateError(result.message || t("purchaseOrders.failedToCreatePO"));
      }
    } catch (_error) {
      setCreateError(t("purchaseOrders.unexpectedErrorCreatingPO"));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex w-full h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
      <Sidebar />
      <div className="min-h-screen w-full flex flex-col">
        <Header title={t("purchaseOrders.createPO")} description={t("purchaseOrders.createPODescription")} />
        <div className="flex-1 p-6">
          <div className="w-full">
            <div className="mb-4 w-full mx-auto">
              <Link href="/dashboard/purchase-orders" className="inline-flex items-center space-x-2 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-primary))] rounded-lg transition-all duration-200 border border-transparent hover:border-[rgb(var(--color-border-primary))]">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">{t("purchaseOrders.backToPurchaseOrders")}</span>
              </Link>
            </div>

            <div className="flex flex-col h-[calc(100vh-208px)]">
              <div className="flex-1 overflow-y-auto pe-3 max-h-[calc(100vh-200px)] min-h-[calc(100vh-200px)]">
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                  <div className="w-full mx-auto">
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

                        <AddressCard
                          t={t}
                          formData={formData}
                          setFormData={setFormData}
                          selectedStore={selectedStore}
                        />

                        <AdvancePaymentCard
                          t={t}
                          formData={formData}
                          setFormData={setFormData}
                        />

                        {createError && (
                          <div className="p-6 bg-[rgb(var(--color-bg-primary))] rounded-lg border border-[rgb(var(--color-border-primary))]">
                            <div className="flex items-center text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
                              <span className="text-sm font-medium">{createError}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
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
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <POActions
              t={t}
              formData={formData}
              isCreating={isCreating}
              handleSaveDraft={() => setShowSaveDraftModal(true)}
              handleSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>

      <AddSupplierDrawer
        isOpen={showAddSupplierDrawer}
        onClose={() => setShowAddSupplierDrawer(false)}
        onSuccess={handleSupplierSuccess}
      />

      <SaveDraftModal
        t={t}
        isOpen={showSaveDraftModal}
        onClose={() => setShowSaveDraftModal(false)}
        onConfirm={() => {
          handleSubmit(true);
          setShowSaveDraftModal(false);
        }}
      />
    </div>
  );
};

export default CreatePurchaseOrder;
