"use client";
import {
  Building2,
  Calendar,
  IndianRupee,
  Minus,
  Package,
  Plus,
  Receipt,
  Save,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  AddActionButton,
  Button,
  Card,
  Input,
  Select,
  SideDrawer,
  Textarea,
} from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";
import { billService, productService } from "@/service/retailer";
import { useAppSelector } from "@/store/hooks";

const CreateBillDrawer = ({ isOpen, onClose, purchaseOrder, onSuccess }) => {
  const { t } = useTranslation();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId =
    selectedStore?.storeId || selectedStore?._id || selectedStore?.id || "";
  const [formData, setFormData] = useState({
    supplier: "",
    purchaseOrder: "",
    billDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    notes: "",
    goodsReceived: true,
    items: [],
  });

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize form data when purchase order changes
  useEffect(() => {
    if (purchaseOrder && isOpen) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      setFormData({
        supplier: purchaseOrder.supplier?.id || "",
        purchaseOrder: purchaseOrder.id || purchaseOrder._id || "",
        billDate: new Date().toISOString().split("T")[0],
        dueDate: dueDate.toISOString().split("T")[0],
        notes: "",
        goodsReceived: true,
        items:
          purchaseOrder.items?.map((item) => ({
            product: item.product,
            productName: "",
            quantity: item.quantity || 1,
            purchasePrice: 0,
            expiryDate: "",
          })) || [],
      });
    }
  }, [purchaseOrder, isOpen]);

  // Fetch products
  useEffect(() => {
    if (isOpen && storeId) {
      fetchProducts();
    }
  }, [isOpen, storeId, fetchProducts]);

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const result = await productService.getProducts({
        limit: 100,
        lightweight: true,
        store: storeId,
      });
      if (result.success) {
        const productsData = result.data || [];
        setProducts(productsData);

        // Update product names in form data
        setFormData((prev) => ({
          ...prev,
          items: prev.items.map((item) => ({
            ...item,
            productName:
              productsData.find((p) => (p.id || p._id) === item.product)
                ?.name || "",
          })),
        }));
      }
    } catch (_error) {
    } finally {
      setProductsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const handleItemChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product: "",
          productName: "",
          quantity: 1,
          purchasePrice: 0,
          expiryDate: "",
        },
      ],
    }));
  };

  const removeItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      return total + item.quantity * item.purchasePrice;
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.items.length === 0) {
      setErrors({ items: t("bills.atLeastOneItemRequired") });
      return;
    }

    try {
      setIsCreating(true);
      setErrors({});

      const billData = {
        ...formData,
        goodsReceived: !!formData.goodsReceived,
        store: storeId,
        totalAmount: calculateTotal(),
        items: formData.items.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          purchasePrice: item.purchasePrice,
          expiryDate: item.expiryDate,
        })),
      };

      const result = await billService.createBill(billData);

      if (result.success) {
        onSuccess?.(result.data);
        onClose();
      } else {
        setErrors({ submit: result.message || t("bills.failedToCreateBill") });
      }
    } catch (error) {
      setErrors({ submit: error.message || t("bills.failedToCreateBill") });
    } finally {
      setIsCreating(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  if (!isOpen || !purchaseOrder) return null;

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={t("bills.createBill")}
      icon={Receipt}
      description={t("bills.fromPurchaseOrder", {
        poNumber: purchaseOrder.poNumber,
      })}
      width="w-full md:w-2/3 lg:w-1/2"
    >
      <div className="p-3 sm:p-4 md:p-6 h-full">
        <div className="flex flex-col h-full">
          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-6 min-h-0 pb-4">
            <form
              onSubmit={handleSubmit}
              className="space-y-4 sm:space-y-6"
              id="create-bill-form"
            >
              {/* Purchase Order Info and Supplier Info - Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Purchase Order Info */}
                <Card className="p-4 shadow-none border-0 bg-[rgb(var(--color-bg-secondary))]">
                  <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-3 flex items-center">
                    <Receipt className="w-5 h-5 mr-2" />
                    {t("purchaseOrders.purchaseOrderDetails")}
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[rgb(var(--color-text-secondary))] w-40 whitespace-nowrap">
                        {t("purchaseOrders.poNumber")}:
                      </span>
                      <p
                        className="font-medium text-[rgb(var(--color-text-primary))] text-right flex-1 truncate"
                        title={String(purchaseOrder.poNumber)}
                      >
                        {purchaseOrder.poNumber}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[rgb(var(--color-text-secondary))] w-40 whitespace-nowrap">
                        {t("bills.poDate")}:
                      </span>
                      <p
                        className="font-medium text-[rgb(var(--color-text-primary))] text-right flex-1 truncate"
                        title={formatDate(purchaseOrder.poDate)}
                      >
                        {formatDate(purchaseOrder.poDate)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[rgb(var(--color-text-secondary))] w-40 whitespace-nowrap">
                        {t("bills.expectedDelivery")}:
                      </span>
                      <p
                        className="font-medium text-[rgb(var(--color-text-primary))] text-right flex-1 truncate"
                        title={formatDate(purchaseOrder.expectedDeliveryDate)}
                      >
                        {formatDate(purchaseOrder.expectedDeliveryDate)}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Supplier Info */}
                <Card className="p-4 shadow-none border-0 bg-[rgb(var(--color-bg-secondary))]">
                  <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-3 flex items-center">
                    <Building2 className="w-5 h-5 mr-2" />
                    {t("bills.supplierInformation")}
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[rgb(var(--color-text-secondary))] w-40 whitespace-nowrap">
                        {t("bills.name")}:
                      </span>
                      <p
                        className="font-medium text-[rgb(var(--color-text-primary))] text-right flex-1 truncate"
                        title={purchaseOrder.supplier?.name || ""}
                      >
                        {purchaseOrder.supplier?.name}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[rgb(var(--color-text-secondary))] w-40 whitespace-nowrap">
                        {t("bills.email")}:
                      </span>
                      <p
                        className="font-medium text-[rgb(var(--color-text-primary))] text-right flex-1 truncate"
                        title={purchaseOrder.supplier?.email || ""}
                      >
                        {purchaseOrder.supplier?.email}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[rgb(var(--color-text-secondary))] w-40 whitespace-nowrap">
                        {t("bills.phone")}:
                      </span>
                      <p
                        className="font-medium text-[rgb(var(--color-text-primary))] text-right flex-1 truncate"
                        title={purchaseOrder.supplier?.phone || ""}
                      >
                        {purchaseOrder.supplier?.phone}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Bill Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    label={t("bills.billDate")}
                    size="sm"
                    type="date"
                    value={formData.billDate}
                    onChange={(value) => handleInputChange("billDate", value)}
                    leftIcon={Calendar}
                  />
                </div>
                <div>
                  <Input
                    label={t("bills.dueDate")}
                    size="sm"
                    type="date"
                    value={formData.dueDate}
                    onChange={(value) => handleInputChange("dueDate", value)}
                    leftIcon={Calendar}
                  />
                </div>
              </div>

              {/* Items */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  {t("bills.items")} ({formData.items.length})
                </h3>
                <AddActionButton
                  onClick={addItem}
                  label={t("bills.addItem")}
                  Icon={Plus}
                  size="sm"
                  variant="success"
                />
              </div>

              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div
                    key={index}
                    className="group p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                        {t("bills.item")} {index + 1}
                      </h4>
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 cursor-pointer"
                          title={t("bills.removeItem")}
                        >
                          <Minus className="w-4 h-4 text-red-500 group-hover:text-red-600 transition-colors duration-200" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-4">
                        <Select
                          label={t("bills.product")}
                          size="sm"
                          value={item.product}
                          onChange={(value) => {
                            const selected = products.find(
                              (p) => (p.id || p._id) === value
                            );
                            handleItemChange(index, "product", value);
                            handleItemChange(
                              index,
                              "productName",
                              selected?.name || ""
                            );
                          }}
                          options={products.map((p) => ({
                            value: p.id || p._id,
                            label: p.name,
                          }))}
                          placeholder={t("bills.selectProduct")}
                          searchable
                          disabled={productsLoading}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          label={t("bills.quantity")}
                          size="sm"
                          type="number"
                          value={item.quantity}
                          onChange={(value) =>
                            handleItemChange(index, "quantity", value || "")
                          }
                          min="1"
                          className="text-center"
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          label={t("bills.purchasePricePerUnit")}
                          size="sm"
                          type="number"
                          value={item.purchasePrice}
                          onChange={(value) =>
                            handleItemChange(
                              index,
                              "purchasePrice",
                              value || ""
                            )
                          }
                          min="0"
                          step="0.01"
                          leftIcon={IndianRupee}
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          label={t("bills.expiryDate")}
                          size="sm"
                          type="date"
                          value={item.expiryDate}
                          onChange={(value) =>
                            handleItemChange(index, "expiryDate", value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {errors.items && (
                <p className="text-sm text-red-600 mt-2">{errors.items}</p>
              )}

              {/* Notes */}
              <div>
                <Textarea
                  label={t("bills.notes")}
                  value={formData.notes}
                  onChange={(value) => handleInputChange("notes", value)}
                  placeholder={t("bills.addAdditionalNotes")}
                  rows={3}
                />
              </div>

              <div className="border border-[rgb(var(--color-border-primary))] rounded-lg p-4 bg-[rgb(var(--color-bg-tertiary))]/30 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                    {t("bills.goodsAlreadyReceived")}
                  </p>
                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-1">
                    {t("bills.goodsReceivedDescription")}
                  </p>
                </div>
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-[rgb(var(--color-primary))] rounded"
                    checked={formData.goodsReceived}
                    onChange={(e) =>
                      handleInputChange("goodsReceived", e.target.checked)
                    }
                  />
                  <span className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                    {formData.goodsReceived ? t("bills.yes") : t("bills.no")}
                  </span>
                </label>
              </div>

              {/* Total */}
              <Card className="p-4 border-0 shadow-none">
                <div className="flex items-center justify-end gap-3">
                  <span className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
                    {t("bills.totalAmount")}:
                  </span>
                  <span className="text-xl font-bold text-[rgb(var(--color-primary))]">
                    {formatCurrency(calculateTotal())}
                  </span>
                </div>
              </Card>

              {/* Error Message */}
              {errors.submit && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.submit}
                  </p>
                </div>
              )}
            </form>
          </div>

          {/* Footer - Action Buttons */}
          <div className="flex-shrink-0 bg-[rgb(var(--color-bg-primary))] border-t border-[rgb(var(--color-border-primary))] p-3 sm:p-4 -mx-3 sm:-mx-4 md:-mx-6 -mb-3 sm:-mb-4 md:-mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-2 sm:gap-3">
            <Button
              variant="success"
              onClick={() => {
                const form = document.getElementById("create-bill-form");
                if (form) form.requestSubmit();
              }}
              disabled={isCreating}
              loading={isCreating}
              leftIcon={Save}
              className="w-full sm:w-auto"
              size="sm"
            >
              {t("bills.createBill")}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isCreating}
              className="w-full sm:w-auto"
              size="sm"
            >
              {t("payments.cancel")}
            </Button>
          </div>
        </div>
      </div>
    </SideDrawer>
  );
};

export default CreateBillDrawer;
