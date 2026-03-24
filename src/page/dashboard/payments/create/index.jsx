"use client";
import {
  ArrowLeft,
  Building2,
  CreditCard,
  FileText,
  Plus,
  Save,
  Smartphone,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import { Button, Card, Input, Select, Textarea } from "@/components/ui";
import { useApiResponse } from "@/hooks/useApiResponse";
import { useTranslation } from "@/hooks/ui/useTranslation";
import {
  billService,
  paymentService,
  supplierService,
} from "@/service/retailer";
import { useAppSelector } from "@/store/hooks";

const CreatePayment = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedStore } = useAppSelector((state) => state.profile);

  const [suppliers, setSuppliers] = useState([]);
  const [bills, setBills] = useState([]);

  const [formData, setFormData] = useState({
    supplierId: "",
    paymentType: "BILL_PAYMENT",
    billId: "",
    notes: "",
    // Payment methods array
    paymentMethods: [
      {
        amount: 0,
        method: "cash",
        reference: "",
        // Bank transfer details
        bankName: "",
        accountNumber: "",
        ifscCode: "",
        holderName: "",
        // UPI details
        upiId: "",
        transactionId: "",
        // Cheque details
        chequeNumber: "",
        chequeDate: "",
        chequeBankName: "",
        chequeBranchName: "",
      },
    ],
  });

  const [errors, setErrors] = useState({});
  const { execute: executeSubmit, loading } = useApiResponse();
  const { execute: fetchSuppliersApi, loading: suppliersLoading } = useApiResponse();
  const { execute: fetchBillsApi, loading: billsLoading } = useApiResponse();

  // Refs to prevent duplicate API calls
  const suppliersFetchedRef = useRef({ storeId: null, fetched: false });
  const billsFetchedRef = useRef({
    storeId: null,
    supplierId: null,
    fetched: false,
  });

  // Get stable storeId
  const storeId =
    selectedStore?.storeId;

  // Get bill ID from URL params
  const billId = searchParams.get("billId");

  // Set bill ID in form data if provided in URL
  useEffect(() => {
    if (billId) {
      setFormData((prev) => ({
        ...prev,
        billId: billId,
        paymentType: "BILL_PAYMENT",
      }));
    }
  }, [billId]);

  const fetchSuppliers = async () => {
    if (!storeId) { setSuppliers([]); return; }
    if (suppliersFetchedRef.current.storeId === storeId && suppliersFetchedRef.current.fetched) return;

    suppliersFetchedRef.current = { storeId, fetched: true };

    const result = await fetchSuppliersApi(
      supplierService.getSuppliers({ limit: 100, lightweight: true, store: storeId }),
      { showToast: false }
    );
    setSuppliers(result?.success ? (result.data?.data || result.data || []) : []);
  };

  const fetchBills = async (supplierId) => {
    if (!supplierId || !storeId) { setBills([]); return; }
    if (
      billsFetchedRef.current.storeId === storeId &&
      billsFetchedRef.current.supplierId === supplierId &&
      billsFetchedRef.current.fetched
    ) return;

    billsFetchedRef.current = { storeId, supplierId, fetched: true };

    const result = await fetchBillsApi(
      billService.getBills({ store: storeId, supplier: supplierId, lightweight: true, limit: 100 }),
      { showToast: false }
    );
    setBills(result?.success ? (result.data?.data || result.data || []) : []);
  };

  // Reset refs when storeId changes
  useEffect(() => {
    if (storeId && suppliersFetchedRef.current.storeId !== storeId) {
      suppliersFetchedRef.current = { storeId: null, fetched: false };
    }
    if (storeId && billsFetchedRef.current.storeId !== storeId) {
      billsFetchedRef.current = {
        storeId: null,
        supplierId: null,
        fetched: false,
      };
    }
  }, [storeId]);

  // Fetch suppliers on component mount or store change (only once per store)
  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // Fetch available bills when supplier is selected
  useEffect(() => {
    if (formData.supplierId && storeId) {
      // Reset bills ref when supplier changes
      if (billsFetchedRef.current.supplierId !== formData.supplierId) {
        billsFetchedRef.current = {
          storeId: null,
          supplierId: null,
          fetched: false,
        };
      }
      fetchBills(formData.supplierId);
    }
  }, [formData.supplierId, storeId]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Auto-fill amount when bill is selected
    if (field === "billId" && value) {
      const selectedBill = bills.find((bill) => bill._id === value);
      if (selectedBill?.dueAmount) {
        setFormData((prev) => ({
          ...prev,
          [field]: value,
          paymentMethods: (Array.isArray(prev.paymentMethods)
            ? prev.paymentMethods
            : []
          ).map((method, index) =>
            index === 0 ? { ...method, amount: selectedBill.dueAmount } : method
          ),
        }));
      }
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  // Handle payment method changes
  const handlePaymentMethodChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethods: (Array.isArray(prev.paymentMethods)
        ? prev.paymentMethods
        : []
      ).map((method, i) =>
        i === index ? { ...method, [field]: value } : method
      ),
    }));

    // Clear error when user starts typing
    if (errors[`paymentMethod_${index}_${field}`]) {
      setErrors((prev) => ({
        ...prev,
        [`paymentMethod_${index}_${field}`]: null,
      }));
    }
  };

  // Add new payment method
  const addPaymentMethod = () => {
    setFormData((prev) => ({
      ...prev,
      paymentMethods: [
        ...(Array.isArray(prev.paymentMethods) ? prev.paymentMethods : []),
        {
          amount: "",
          method: "cash",
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

  // Remove payment method
  const removePaymentMethod = (index) => {
    if (
      Array.isArray(formData.paymentMethods) &&
      formData.paymentMethods.length > 1
    ) {
      setFormData((prev) => ({
        ...prev,
        paymentMethods: (Array.isArray(prev.paymentMethods)
          ? prev.paymentMethods
          : []
        ).filter((_, i) => i !== index),
      }));
    }
  };

  // Calculate total amount
  const getTotalAmount = () => {
    const methods = Array.isArray(formData?.paymentMethods)
      ? formData.paymentMethods
      : [];
    return methods.reduce(
      (total, method) => total + (parseFloat(method?.amount) || 0),
      0
    );
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.supplierId) {
      newErrors.supplierId = t("payments.supplierRequired");
    }

    // Validate payment methods
    if (
      !Array.isArray(formData.paymentMethods) ||
      formData.paymentMethods.length === 0
    ) {
      newErrors.paymentMethods = t("payments.atLeastOnePaymentMethodRequired");
    }

    const totalAmount = getTotalAmount();
    if (totalAmount <= 0) {
      newErrors.totalAmount = t("payments.totalAmountMustBeGreaterThanZero");
    }

    // Validate payment type specific requirements
    if (formData.paymentType === "BILL_PAYMENT" && !formData.billId) {
      newErrors.billId = t("payments.selectBillForPayment");
    }

    // Validate each payment method
    (Array.isArray(formData.paymentMethods)
      ? formData.paymentMethods
      : []
    ).forEach((method, index) => {
      if (!method.amount || method.amount <= 0) {
        newErrors[`paymentMethod_${index}_amount`] = t(
          "payments.validAmountRequired"
        );
      }

      if (!method.method) {
        newErrors[`paymentMethod_${index}_method`] = t(
          "payments.paymentMethodRequired"
        );
      }

      // Validate payment method specific details
      switch (method.method) {
        case "bank_transfer":
          if (!method.bankName) {
            newErrors[`paymentMethod_${index}_bankName`] = t(
              "payments.bankNameRequired"
            );
          }
          if (!method.ifscCode) {
            newErrors[`paymentMethod_${index}_ifscCode`] = t(
              "payments.ifscCodeRequired"
            );
          }
          if (!method.accountNumber) {
            newErrors[`paymentMethod_${index}_accountNumber`] = t(
              "payments.accountNumberRequired"
            );
          }
          if (!method.holderName) {
            newErrors[`paymentMethod_${index}_holderName`] = t(
              "payments.holderNameRequired"
            );
          }
          break;

        case "upi":
          if (!method.upiId) {
            newErrors[`paymentMethod_${index}_upiId`] = t(
              "payments.upiIdRequired"
            );
          }
          if (!method.transactionId) {
            newErrors[`paymentMethod_${index}_transactionId`] = t(
              "payments.transactionIdRequired"
            );
          }
          break;

        case "cheque":
          if (!method.chequeNumber) {
            newErrors[`paymentMethod_${index}_chequeNumber`] = t(
              "payments.chequeNumberRequired"
            );
          }
          if (!method.chequeDate) {
            newErrors[`paymentMethod_${index}_chequeDate`] = t(
              "payments.chequeDateRequired"
            );
          }
          if (!method.chequeBankName) {
            newErrors[`paymentMethod_${index}_chequeBankName`] = t(
              "payments.chequeBankNameRequired"
            );
          }
          if (!method.chequeBranchName) {
            newErrors[`paymentMethod_${index}_chequeBranchName`] = t(
              "payments.chequeBranchNameRequired"
            );
          }
          break;

        case "cash":
        case "credit":
          // Only reference is optional for cash and credit
          break;
      }
    });

    // Validate notes length (max 500 characters)
    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = t("payments.notesCannotExceed500");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setErrors({});
    const paymentData = {
      ...formData,
      store: selectedStore?.storeId,
    };

    const result = await executeSubmit(
      paymentService.createPayment(paymentData),
      { message: t("payments.paymentCreatedSuccess") }
    );

    if (result?.success) {
      setTimeout(() => {
        router.push(billId ? `/dashboard/bills/${billId}` : "/dashboard/payments");
      }, 1500);
    } else if (result?.fieldErrors) {
      setErrors(result.fieldErrors);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.push("/dashboard/payments");
  };

  return (
    <div className="flex h-screen w-full relative overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="min-h-screen w-full flex flex-col">
        {/* Header */}
        <Header
          title={t("payments.createNewPayment")}
          description={t("payments.createNewPaymentDescription")}
        />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-8xl mx-auto">
            {/* Back Button */}
            <div className="mb-6">
              <Link
                href="/dashboard/payments"
                className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {t("payments.backToPayments")}
                </span>
              </Link>
            </div>

            {/* Form Container - Two Column Layout */}
            <div
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              style={{ height: "calc(100vh - 200px)" }}
            >
              {/* Main Form - Left Side */}
              <div className="lg:col-span-2 flex flex-col h-full">
                <div className="flex-1 overflow-y-auto pe-3 max-h-[calc(100vh-260px)]">
                  <form>
                    {/* Basic Details Section */}
                    <Card className="mb-6">
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4 flex items-center">
                          <Building2 className="w-5 h-5 mr-2" />
                          {t("payments.basicDetails")}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
                              {t("payments.paymentType")} *
                            </label>
                            <Select
                              size="sm"
                              value={formData.paymentType}
                              onChange={(value) =>
                                handleInputChange("paymentType", value)
                              }
                              options={[
                                {
                                  value: "BILL_PAYMENT",
                                  label: t("payments.billPayment"),
                                },
                                {
                                  value: "ADVANCE_PAYMENT",
                                  label: t("payments.advancePayment"),
                                },
                                {
                                  value: "ADJUSTMENT",
                                  label: t("payments.adjustment"),
                                },
                                {
                                  value: "REFUND",
                                  label: t("payments.refund"),
                                },
                              ]}
                              error={errors.paymentType}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
                              {t("payments.supplier")} *
                            </label>
                            <Select
                              size="sm"
                              value={formData.supplierId}
                              onChange={(value) =>
                                handleInputChange("supplierId", value)
                              }
                              options={[
                                {
                                  value: "",
                                  label: suppliersLoading
                                    ? t("payments.loadingSuppliers")
                                    : t("payments.selectSupplier"),
                                },
                                ...suppliers.map((supplier) => ({
                                  value: supplier.id || supplier._id,
                                  label: supplier.name || supplier.supplierName,
                                })),
                              ]}
                              error={errors.supplierId}
                              disabled={suppliersLoading}
                              searchable={true}
                              placeholder={t(
                                "payments.searchAndSelectSupplier"
                              )}
                            />
                          </div>

                          {formData.paymentType === "BILL_PAYMENT" && (
                            <div>
                              <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
                                {t("payments.selectBill")} *
                              </label>
                              <Select
                                size="sm"
                                value={formData.billId}
                                onChange={(value) =>
                                  handleInputChange("billId", value)
                                }
                                options={[
                                  {
                                    value: "",
                                    label: billsLoading
                                      ? t("payments.loadingBills")
                                      : bills.length === 0 &&
                                        formData.supplierId &&
                                        !billsLoading
                                        ? t("payments.noPendingBills")
                                        : t("payments.selectBill"),
                                  },
                                  ...bills.map((bill) => ({
                                    value: bill._id,
                                    label: `₹${bill.dueAmount} - ${bill.supplier?.name || t("payments.supplier")}`,
                                  })),
                                ]}
                                error={errors.billId}
                                disabled={billsLoading}
                              />
                              {billId && (
                                <div className="mt-1 text-xs text-green-600">
                                  {t("payments.billAutoSelected")}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="mt-4">
                          <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
                            {t("payments.notes")}
                          </label>
                          <Textarea
                            value={formData.notes}
                            onChange={(value) =>
                              handleInputChange("notes", value)
                            }
                            placeholder={t("payments.additionalNotes")}
                            rows={3}
                          />
                        </div>
                      </div>
                    </Card>

                    {/* Payment Methods Section */}
                    <Card className="mb-6">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] flex items-center">
                            <CreditCard className="w-5 h-5 mr-2" />
                            {t("payments.paymentMethods")}
                          </h3>
                          <button
                            type="button"
                            onClick={addPaymentMethod}
                            className="flex items-center gap-2 px-3 py-2 cursor-pointer text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-500/10 dark:hover:bg-green-500/20 rounded-lg transition-colors duration-200"
                            title={t("payments.addPaymentMethod")}
                          >
                            <Plus className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {t("payments.addPaymentMethod")}
                            </span>
                          </button>
                        </div>

                        {/* Total Amount Display */}
                        <div className="mb-4 p-3 rounded-lg bg-[rgb(var(--color-primary))]/10">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                              {t("payments.totalAmount")}:
                            </span>
                            <span className="text-lg font-bold text-[rgb(var(--color-text-primary))]">
                              ₹ {getTotalAmount().toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Payment Methods List */}
                        <div className="space-y-4">
                          {formData.paymentMethods.map((method, index) => (
                            <Card
                              key={index}
                              className="rounded-lg p-4 bg-[rgb(var(--color-bg-secondary))]"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-md font-medium text-[rgb(var(--color-text-primary))]">
                                  {t("payments.paymentMethod", {
                                    number: index + 1,
                                  })}
                                </h4>
                                {formData.paymentMethods.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removePaymentMethod(index)}
                                    className="p-2 cursor-pointer text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-500/10 dark:hover:bg-red-500/20 rounded-lg transition-colors duration-200"
                                    title={t("payments.removePayment")}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                  <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
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
                                    placeholder="0.00"
                                    min="0.01"
                                    step="0.01"
                                    error={
                                      errors[`paymentMethod_${index}_amount`]
                                    }
                                  />
                                </div>

                                <div className="relative z-30">
                                  <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
                                    {t("payments.paymentMethodLabel")}
                                  </label>
                                  <Select
                                    size="sm"
                                    value={method.method}
                                    onChange={(value) =>
                                      handlePaymentMethodChange(
                                        index,
                                        "method",
                                        value
                                      )
                                    }
                                    options={[
                                      {
                                        value: "cash",
                                        label: t("payments.cash"),
                                      },
                                      {
                                        value: "upi",
                                        label: t("payments.upi"),
                                      },
                                      {
                                        value: "bank_transfer",
                                        label: t("payments.bankTransfer"),
                                      },
                                      {
                                        value: "cheque",
                                        label: t("payments.cheque"),
                                      },
                                      {
                                        value: "credit",
                                        label: t("payments.credit"),
                                      },
                                    ]}
                                    error={
                                      errors[`paymentMethod_${index}_method`]
                                    }
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
                                    {t("payments.referenceLabel")}
                                  </label>
                                  <Input
                                    size="sm"
                                    value={method.reference}
                                    onChange={(value) =>
                                      handlePaymentMethodChange(
                                        index,
                                        "reference",
                                        value
                                      )
                                    }
                                    placeholder={t("payments.paymentReference")}
                                  />
                                </div>
                              </div>

                              {/* Payment Method Specific Details */}
                              <div>
                                {method.method === "bank_transfer" && (
                                  <div className="mt-4 pt-4 border-t border-[rgb(var(--color-border-primary))]">
                                    <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-4 flex items-center">
                                      <Building2 className="w-5 h-5 mr-2" />
                                      {t("payments.bankTransferDetails")}
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
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
                                          placeholder={t(
                                            "payments.enterBankName"
                                          )}
                                          error={
                                            errors[
                                            `paymentMethod_${index}_bankName`
                                            ]
                                          }
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
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
                                          placeholder={t(
                                            "payments.enterIfscCode"
                                          )}
                                          error={
                                            errors[
                                            `paymentMethod_${index}_ifscCode`
                                            ]
                                          }
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
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
                                          placeholder={t(
                                            "payments.enterAccountNumber"
                                          )}
                                          error={
                                            errors[
                                            `paymentMethod_${index}_accountNumber`
                                            ]
                                          }
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
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
                                          placeholder={t(
                                            "payments.enterAccountHolderName"
                                          )}
                                          error={
                                            errors[
                                            `paymentMethod_${index}_holderName`
                                            ]
                                          }
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* UPI Details */}
                                {(method.method === "upi" ||
                                  method.method === "UPI") && (
                                    <div className="mt-4 pt-4 border-t border-[rgb(var(--color-border-primary))]">
                                      <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-4 flex items-center">
                                        <Smartphone className="w-5 h-5 mr-2" />
                                        {t("payments.upiDetails")}
                                      </h3>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
                                            {t("payments.upiId")}
                                          </label>
                                          <Input
                                            size="sm"
                                            value={method.upiId}
                                            onChange={(value) =>
                                              handlePaymentMethodChange(
                                                index,
                                                "upiId",
                                                value
                                              )
                                            }
                                            placeholder={t("payments.enterUpiId")}
                                            error={
                                              errors[
                                              `paymentMethod_${index}_upiId`
                                              ]
                                            }
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
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
                                            placeholder={t(
                                              "payments.enterTransactionId"
                                            )}
                                            error={
                                              errors[
                                              `paymentMethod_${index}_transactionId`
                                              ]
                                            }
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                {/* Cheque Details */}
                                {method.method === "cheque" && (
                                  <div className="mt-4 pt-4 border-t border-[rgb(var(--color-border-primary))]">
                                    <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-4 flex items-center">
                                      <FileText className="w-5 h-5 mr-2" />
                                      {t("payments.chequeDetails")}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
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
                                          placeholder={t(
                                            "payments.enterChequeNumber"
                                          )}
                                          error={
                                            errors[
                                            `paymentMethod_${index}_chequeNumber`
                                            ]
                                          }
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
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
                                            errors[
                                            `paymentMethod_${index}_chequeDate`
                                            ]
                                          }
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
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
                                          placeholder={t(
                                            "payments.enterBankName"
                                          )}
                                          error={
                                            errors[
                                            `paymentMethod_${index}_chequeBankName`
                                            ]
                                          }
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
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
                                          placeholder={t(
                                            "payments.enterBranchName"
                                          )}
                                          error={
                                            errors[
                                            `paymentMethod_${index}_chequeBranchName`
                                            ]
                                          }
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </form>
                </div>

                {/* Action Buttons - Fixed Bottom */}
                <div className="mt-6 flex items-center justify-end space-x-3 bg-[rgb(var(--color-bg-primary))] border-t border-[rgb(var(--color-border-primary))] pt-4">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    {t("payments.cancel")}
                  </Button>
                  <Button
                    variant="success"
                    onClick={handleSubmit}
                    disabled={loading}
                    loading={loading}
                    leftIcon={Save}
                  >
                    {t("payments.createPaymentButton")}
                  </Button>
                </div>
              </div>

              {/* Tips Section - Right Side */}
              <div className="lg:col-span-1">
                <div className="sticky top-6">
                  <div className="bg-gradient-to-br from-[rgb(var(--color-primary))]/5 to-[rgb(var(--color-primary))]/10 backdrop-blur-md rounded-lg border border-[rgb(var(--color-primary))]/20 p-6 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/20 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
                          Payment Management Tips
                        </h3>
                        <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                          Best practices for efficient payment processing
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Payment Tracking */}
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-green-600 text-sm">💰</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">
                            Payment Tracking
                          </h4>
                          <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                            Keep track of all supplier payments and maintain
                            clear records
                          </p>
                        </div>
                      </div>

                      {/* Payment Methods */}
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-yellow-600 text-sm">💳</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">
                            Payment Methods
                          </h4>
                          <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                            Choose the most convenient payment method for your
                            business
                          </p>
                        </div>
                      </div>

                      {/* Financial Records */}
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-purple-600 text-sm">📊</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">
                            Financial Records
                          </h4>
                          <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                            Maintain accurate financial records for tax and
                            audit purposes
                          </p>
                        </div>
                      </div>

                      {/* Supplier Relations */}
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-orange-600 text-sm">🤝</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">
                            Supplier Relations
                          </h4>
                          <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                            Timely payments help maintain good supplier
                            relationships
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Tips Section */}
                    <div className="mt-6 p-4 bg-[rgb(var(--color-bg-primary))]/20 rounded-lg border border-[rgb(var(--color-border-primary))]/30">
                      <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                        💡 Pro Tips
                      </h4>
                      <ul className="text-xs text-[rgb(var(--color-text-secondary))] space-y-1">
                        <li>
                          • Always verify payment details before processing
                        </li>
                        <li>• Keep payment references for easy tracking</li>
                        <li>
                          • Allocate payments to specific bills when possible
                        </li>
                        <li>
                          • Regular payments improve supplier relationships
                        </li>
                        <li>• Maintain backup of all payment records</li>
                      </ul>
                    </div>

                    {/* Payment Status Info */}
                    <div className="mt-4 p-4 bg-[rgb(var(--color-bg-primary))]/20 rounded-lg border border-[rgb(var(--color-border-primary))]/30">
                      <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
                        📝 Payment Status
                      </h4>
                      <div className="space-y-2 text-xs text-[rgb(var(--color-text-secondary))]">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span>Pending - Awaiting approval</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Approved - Payment processed</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span>Rejected - Payment declined</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CreatePayment;
