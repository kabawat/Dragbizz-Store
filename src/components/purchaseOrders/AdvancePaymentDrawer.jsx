"use client";
import { AdvancePaymentDrawerPresentation } from "@dragorbit/features/purchase-orders";

import { useEffect, useState } from "react";

import SideDrawer from "@/components/ui/SideDrawer";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useApiResponse } from "@/hooks/useApiResponse";
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
  const { execute, loading } = useApiResponse();

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
        i === index ? { ...method, [field]: value } : method,
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
          "errors.amountMustBeGreaterThanZero",
        );
      }

      if (!method.method) {
        newErrors[`paymentMethods[${index}].method`] = t(
          "errors.paymentMethodRequired",
        );
      }

      if (method.method === "BANK_TRANSFER") {
        if (!method.bankName) {
          newErrors[`paymentMethods[${index}].bankName`] = t(
            "errors.bankNameRequired",
          );
        }
        if (!method.ifscCode) {
          newErrors[`paymentMethods[${index}].ifscCode`] = t(
            "errors.ifscCodeRequired",
          );
        }
        if (!method.accountNumber) {
          newErrors[`paymentMethods[${index}].accountNumber`] = t(
            "errors.accountNumberRequired",
          );
        }
      }

      if (method.method === "UPI") {
        if (!method.upiId) {
          newErrors[`paymentMethods[${index}].upiId`] = t(
            "payments.upiIdRequired",
          );
        }
      }

      if (method.method === "CHEQUE") {
        if (!method.chequeNumber) {
          newErrors[`paymentMethods[${index}].chequeNumber`] = t(
            "payments.chequeNumberRequired",
          );
        }
        if (!method.chequeDate) {
          newErrors[`paymentMethods[${index}].chequeDate`] = t(
            "payments.chequeDateRequired",
          );
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setErrors({});
    const paymentData = {
      supplierId: formData.supplierId,
      paymentType: "ADVANCE_PAYMENT",
      purchaseOrder: purchaseOrder._id || purchaseOrder.id || purchaseOrder,
      paymentMethods: formData.paymentMethods.map((method) => {
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
      }),
      notes: formData.notes || "",
      store: selectedStore?.storeId,
    };

    const result = await execute(paymentService.createPayment(paymentData), {
      message: t("payments.paymentCreatedSuccess"),
    });

    if (result?.success) {
      onSuccess?.();
      onClose();
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
    <AdvancePaymentDrawerPresentation
      model={{
        SideDrawer,
        isOpen,
        onClose,
        t,
        purchaseOrder,
        errors,
        formatCurrency,
        addPaymentMethod,
        formData,
        removePaymentMethod,
        handlePaymentMethodChange,
        PAYMENT_METHODS,
        calculateTotal,
        handleInputChange,
        handleSubmit,
        loading,
      }}
    />
  );
};

export default AdvancePaymentDrawer;
