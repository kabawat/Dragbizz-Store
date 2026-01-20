"use client";
import { FileText, IndianRupee, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  AddActionButton,
  Button,
  Card,
  Input,
  Select,
  Textarea,
} from "@/components/ui";
import SideDrawer from "@/components/ui/SideDrawer";
import useErrorHandling from "@/hooks/useErrorHandling";
import { useTranslation } from "@/hooks/useTranslation";
import { paymentService } from "@/service/retailer";
import { useAppSelector } from "@/store/hooks";

const AdvancePaymentDrawer = ({
  isOpen,
  onClose,
  purchaseOrder,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { handleApiError, handleApiResult, showSuccess } = useErrorHandling();

  // Payment methods options with translations
  const PAYMENT_METHODS = [
    { value: "CASH", label: t("purchaseOrders.cash") },
    { value: "UPI", label: t("purchaseOrders.upi") },
    { value: "BANK_TRANSFER", label: t("purchaseOrders.bankTransfer") },
    { value: "CHEQUE", label: t("purchaseOrders.cheque") },
  ];

  const [formData, setFormData] = useState({
    supplierId: "",
    paymentType: "ADVANCE_PAYMENT",
    notes: "",
    paymentMethods: [
      {
        amount: 0,
        method: "CASH",
        reference: "",
        bankName: "",
        accountNumber: "",
        ifscCode: "",
        holderName: "",
        upiId: "",
        transactionId: "",
        chequeNumber: "",
        chequeDate: "",
        chequeBankName: "",
        chequeBranchName: "",
      },
    ],
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Reset form when drawer opens
  useEffect(() => {
    if (isOpen && purchaseOrder) {
      setFormData((prev) => ({
        ...prev,
        supplierId:
          purchaseOrder.supplier?._id ||
          purchaseOrder.supplier?.id ||
          purchaseOrder.supplier ||
          "",
        notes: t("purchaseOrders.addAdvancePaymentForPO", {
          poNumber: purchaseOrder.poNumber || purchaseOrder.billNumber || "",
        }),
        paymentMethods: [
          {
            amount: 0,
            method: "CASH",
            reference: "",
            bankName: "",
            accountNumber: "",
            ifscCode: "",
            holderName: "",
            upiId: "",
            transactionId: "",
            chequeNumber: "",
            chequeDate: "",
            chequeBankName: "",
            chequeBranchName: "",
          },
        ],
      }));
      setErrors({});
    }
  }, [isOpen, purchaseOrder, t]);

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Handle payment method change
  const handlePaymentMethodChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map((method, i) =>
        i === index ? { ...method, [field]: value } : method
      ),
    }));

    if (errors[`paymentMethods[${index}].${field}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`paymentMethods[${index}].${field}`];
        return newErrors;
      });
    }
  };

  const addPaymentMethod = () => {
    setFormData((prev) => ({
      ...prev,
      paymentMethods: [
        ...prev.paymentMethods,
        {
          amount: 0,
          method: "CASH",
          reference: "",
          bankName: "",
          accountNumber: "",
          ifscCode: "",
          holderName: "",
          upiId: "",
          transactionId: "",
          chequeNumber: "",
          chequeDate: "",
          chequeBankName: "",
          chequeBranchName: "",
        },
      ],
    }));
  };

  const removePaymentMethod = (index) => {
    if (formData.paymentMethods.length > 1) {
      setFormData((prev) => ({
        ...prev,
        paymentMethods: prev.paymentMethods.filter((_, i) => i !== index),
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.supplierId) {
      newErrors.supplierId = t("errors.supplierRequired");
    }

    if (!formData.paymentMethods || formData.paymentMethods.length === 0) {
      newErrors.paymentMethods = t("errors.atLeastOnePaymentMethodRequired");
    }

    formData.paymentMethods.forEach((method, index) => {
      if (!method.amount || parseFloat(method.amount) <= 0) {
        newErrors[`paymentMethods[${index}].amount`] = t(
          "errors.amountMustBeGreaterThanZero"
        );
      }

      if (!method.method) {
        newErrors[`paymentMethods[${index}].method`] = t(
          "errors.paymentMethodRequired"
        );
      }

      if (method.method === "BANK_TRANSFER") {
        if (!method.bankName) {
          newErrors[`paymentMethods[${index}].bankName`] = t(
            "errors.bankNameRequired"
          );
        }
        if (!method.ifscCode) {
          newErrors[`paymentMethods[${index}].ifscCode`] = t(
            "errors.ifscCodeRequired"
          );
        }
        if (!method.accountNumber) {
          newErrors[`paymentMethods[${index}].accountNumber`] = t(
            "errors.accountNumberRequired"
          );
        }
      }

      if (method.method === "UPI") {
        if (!method.upiId) {
          newErrors[`paymentMethods[${index}].upiId`] = t(
            "payments.upiIdRequired"
          );
        }
      }

      if (method.method === "CHEQUE") {
        if (!method.chequeNumber) {
          newErrors[`paymentMethods[${index}].chequeNumber`] = t(
            "payments.chequeNumberRequired"
          );
        }
        if (!method.chequeDate) {
          newErrors[`paymentMethods[${index}].chequeDate`] = t(
            "payments.chequeDateRequired"
          );
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const transformedPaymentMethods = formData.paymentMethods.map(
        (method) => {
          const methodLower = method.method.toLowerCase();
          const transformed = {
            amount: parseFloat(method.amount) || 0,
            method:
              methodLower === "bank_transfer" ? "bank_transfer" : methodLower,
            reference: method.reference || "",
          };

          if (
            method.method === "BANK_TRANSFER" ||
            methodLower === "bank_transfer"
          ) {
            transformed.bankName = method.bankName || "";
            transformed.ifscCode = method.ifscCode || "";
            transformed.accountNumber = method.accountNumber || "";
            transformed.holderName = method.holderName || "";
          } else if (method.method === "UPI" || methodLower === "upi") {
            transformed.upiId = method.upiId || "";
            transformed.transactionId = method.transactionId || "";
          } else if (method.method === "CHEQUE" || methodLower === "cheque") {
            transformed.chequeNumber = method.chequeNumber || "";
            transformed.chequeDate = method.chequeDate || "";
            transformed.chequeBankName = method.chequeBankName || "";
            transformed.chequeBranchName = method.chequeBranchName || "";
          }

          return transformed;
        }
      );

      const paymentData = {
        supplierId: formData.supplierId,
        paymentType: "ADVANCE_PAYMENT",
        purchaseOrder: purchaseOrder._id || purchaseOrder.id || purchaseOrder, // Optional
        paymentMethods: transformedPaymentMethods,
        notes: formData.notes || "",
        store:
          selectedStore?.storeId || selectedStore?._id || selectedStore?.id,
      };

      const result = await paymentService.createPayment(paymentData);

      if (result.success) {
        showSuccess(t("payments.paymentCreatedSuccess"));
        onSuccess?.();
        onClose();
      } else {
        setErrors({
          general: result.message || t("payments.failedToCreateAdvancePayment"),
        });
        handleApiError(result, "payment-creation");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        t("payments.failedToCreateAdvancePayment");
      setErrors({ general: errorMessage });
      handleApiError(error, "payment-creation");
    } finally {
      setLoading(false);
    }
  };

  // Calculate total amount
  const calculateTotal = () => {
    return formData.paymentMethods.reduce((sum, method) => {
      return sum + (parseFloat(method.amount) || 0);
    }, 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  if (!isOpen || !purchaseOrder) return null;

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={t("payments.advancePayment")}
      icon={IndianRupee}
      description={t("purchaseOrders.addAdvancePaymentForPO", {
        poNumber: purchaseOrder.poNumber || purchaseOrder.billNumber || "",
      })}
      width="w-full sm:w-5/6 md:w-2/3 lg:w-1/2 xl:w-2/5"
    >
      <div className="p-3 sm:p-4 md:p-6 h-full">
        <div className="flex flex-col h-full">
          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-6 min-h-0 pb-4">
            {/* Error message */}
            {errors.general && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 text-red-600 dark:text-red-400">
                {errors.general}
              </div>
            )}

            {/* Purchase Order Details */}
            <Card className="p-4 shadow-none border-0 bg-[rgb(var(--color-bg-secondary))]">
              <div className="flex items-center mb-3">
                <FileText className="w-4 h-4 mr-2 text-[rgb(var(--color-text-secondary))]" />
                <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                  {t("purchaseOrders.purchaseOrderDetails")}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[rgb(var(--color-text-secondary))]">
                    {t("purchaseOrders.poNumber")}:
                  </span>
                  <span className="font-semibold text-[rgb(var(--color-text-primary))]">
                    {purchaseOrder?.poNumber ||
                      purchaseOrder?.billNumber ||
                      t("common.na")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[rgb(var(--color-text-secondary))]">
                    {t("purchaseOrders.itemsOrdered")}:
                  </span>
                  <span className="font-semibold text-[rgb(var(--color-text-primary))]">
                    {(purchaseOrder?.items || []).reduce(
                      (sum, item) => sum + (item.quantity || 0),
                      0
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[rgb(var(--color-text-secondary))]">
                    {t("purchaseOrders.supplier")}:
                  </span>
                  <span className="font-semibold text-[rgb(var(--color-text-primary))] truncate ml-2">
                    {purchaseOrder?.supplier?.name || t("common.na")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[rgb(var(--color-text-secondary))]">
                    {t("purchaseOrders.advancePaid")}:
                  </span>
                  <span className="font-semibold text-[rgb(var(--color-text-primary))]">
                    {formatCurrency(
                      purchaseOrder?.advanceAmount ||
                        purchaseOrder?.paidAmount ||
                        0
                    )}
                  </span>
                </div>
              </div>
            </Card>

            {/* Payment Methods */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] flex items-center">
                  <IndianRupee className="w-5 h-5 mr-2 text-[rgb(var(--color-success))]" />
                  {t("payments.paymentMethods")}
                </h3>
                <AddActionButton
                  onClick={addPaymentMethod}
                  label={t("payments.addPaymentMethod")}
                  Icon={Plus}
                  size="sm"
                  variant="success"
                />
              </div>

              {formData.paymentMethods.map((method, index) => (
                <div
                  key={index}
                  className="bg-[rgb(var(--color-bg-tertiary))] rounded-lg p-3 sm:p-4 mb-4 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                      {t("payments.paymentMethodNumber", {
                        number: index + 1,
                      })}
                    </h4>
                    {formData.paymentMethods.length > 1 && (
                      <button
                        onClick={() => removePaymentMethod(index)}
                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-[rgba(var(--color-danger),0.1)] rounded-lg transition-all cursor-pointer"
                        title={t("payments.removePaymentMethod")}
                      >
                        <Trash2 className="w-4 h-4 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-danger))] transition-colors" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                        {t("payments.amountLabel")}
                      </label>
                      <Input
                        size="sm"
                        type="number"
                        value={method.amount}
                        onChange={(value) =>
                          handlePaymentMethodChange(
                            index,
                            "amount",
                            value || ""
                          )
                        }
                        placeholder={t("purchaseOrders.enterAmount")}
                        error={errors[`paymentMethods[${index}].amount`]}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                        {t("payments.paymentMethodLabel")}
                      </label>
                      <Select
                        size="sm"
                        value={method.method}
                        onChange={(value) =>
                          handlePaymentMethodChange(index, "method", value)
                        }
                        options={PAYMENT_METHODS}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                        {t("payments.referenceLabel")}
                      </label>
                      <Input
                        size="sm"
                        value={method.reference}
                        onChange={(value) =>
                          handlePaymentMethodChange(index, "reference", value)
                        }
                        placeholder={t("payments.paymentReference")}
                      />
                    </div>

                    {/* Bank Transfer fields */}
                    {method.method === "BANK_TRANSFER" && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                            {t("payments.bankName")}
                          </label>
                          <Input
                            size="sm"
                            value={method.bankName}
                            onChange={(value) =>
                              handlePaymentMethodChange(
                                index,
                                "bankName",
                                value
                              )
                            }
                            placeholder={t("payments.enterBankName")}
                            error={errors[`paymentMethods[${index}].bankName`]}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                            {t("payments.ifscCode")}
                          </label>
                          <Input
                            size="sm"
                            value={method.ifscCode}
                            onChange={(value) =>
                              handlePaymentMethodChange(
                                index,
                                "ifscCode",
                                value
                              )
                            }
                            placeholder={t("payments.enterIfscCode")}
                            error={errors[`paymentMethods[${index}].ifscCode`]}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                            {t("payments.accountNumber")}
                          </label>
                          <Input
                            size="sm"
                            value={method.accountNumber}
                            onChange={(value) =>
                              handlePaymentMethodChange(
                                index,
                                "accountNumber",
                                value
                              )
                            }
                            placeholder={t("payments.enterAccountNumber")}
                            error={
                              errors[`paymentMethods[${index}].accountNumber`]
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                            {t("payments.accountHolderName")}
                          </label>
                          <Input
                            size="sm"
                            value={method.holderName}
                            onChange={(value) =>
                              handlePaymentMethodChange(
                                index,
                                "holderName",
                                value
                              )
                            }
                            placeholder={t("payments.enterAccountHolderName")}
                          />
                        </div>
                      </>
                    )}

                    {/* UPI fields */}
                    {method.method === "UPI" && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                            {t("payments.upiId")}
                          </label>
                          <Input
                            size="sm"
                            value={method.upiId}
                            onChange={(value) =>
                              handlePaymentMethodChange(index, "upiId", value)
                            }
                            placeholder={t("purchaseOrders.supplierPaytm")}
                            error={errors[`paymentMethods[${index}].upiId`]}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                            {t("payments.transactionId")}
                          </label>
                          <Input
                            size="sm"
                            value={method.transactionId}
                            onChange={(value) =>
                              handlePaymentMethodChange(
                                index,
                                "transactionId",
                                value
                              )
                            }
                            placeholder={t("payments.enterTransactionId")}
                          />
                        </div>
                      </>
                    )}

                    {/* Cheque fields */}
                    {method.method === "CHEQUE" && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                            {t("payments.chequeNumber")}
                          </label>
                          <Input
                            size="sm"
                            value={method.chequeNumber}
                            onChange={(value) =>
                              handlePaymentMethodChange(
                                index,
                                "chequeNumber",
                                value
                              )
                            }
                            placeholder={t("payments.enterChequeNumber")}
                            error={
                              errors[`paymentMethods[${index}].chequeNumber`]
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                            {t("payments.chequeDate")}
                          </label>
                          <Input
                            size="sm"
                            type="date"
                            value={method.chequeDate}
                            onChange={(value) =>
                              handlePaymentMethodChange(
                                index,
                                "chequeDate",
                                value
                              )
                            }
                            error={
                              errors[`paymentMethods[${index}].chequeDate`]
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                            {t("payments.chequeBankName")}
                          </label>
                          <Input
                            size="sm"
                            value={method.chequeBankName}
                            onChange={(value) =>
                              handlePaymentMethodChange(
                                index,
                                "chequeBankName",
                                value
                              )
                            }
                            placeholder={t("payments.enterBankName")}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                            {t("payments.chequeBranchName")}
                          </label>
                          <Input
                            size="sm"
                            value={method.chequeBranchName}
                            onChange={(value) =>
                              handlePaymentMethodChange(
                                index,
                                "chequeBranchName",
                                value
                              )
                            }
                            placeholder={t("payments.enterBranchName")}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Total Amount */}
            <Card className="p-4 shadow-none border-0 bg-[rgb(var(--color-bg-secondary))]">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
                  {t("payments.totalAmount")}:
                </span>
                <span className="text-xl font-bold text-[rgb(var(--color-primary))]">
                  {formatCurrency(calculateTotal())}
                </span>
              </div>
            </Card>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                {t("payments.notes")}
              </label>
              <Textarea
                value={formData.notes}
                onChange={(value) => handleInputChange("notes", value)}
                placeholder={t("payments.additionalNotes")}
                rows={3}
              />
            </div>
          </div>

          {/* Footer - Action Buttons */}
          <div className="flex-shrink-0 bg-[rgb(var(--color-bg-primary))] border-t border-[rgb(var(--color-border-primary))] p-3 sm:p-4 -mx-3 sm:-mx-4 md:-mx-6 -mb-3 sm:-mb-4 md:-mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-2 sm:gap-3">
            <Button
              variant="success"
              onClick={handleSubmit}
              disabled={loading}
              loading={loading}
              leftIcon={Save}
              className="w-full sm:w-auto"
              size="sm"
            >
              {t("payments.createPaymentButton")}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
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

export default AdvancePaymentDrawer;
