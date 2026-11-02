"use client";
import { CreateAdvancePaymentCardPresentation } from "@dragorbit/features/purchase-orders";

import { useState } from "react";

const PAYMENT_METHODS = (t) => [
  { value: "CASH", label: t("purchaseOrders.cash") },
  { value: "UPI", label: t("purchaseOrders.upi") },
  { value: "BANK_TRANSFER", label: t("purchaseOrders.bankTransfer") },
  { value: "CHEQUE", label: t("purchaseOrders.cheque") },
];

const AdvancePaymentCard = ({ t, formData, setFormData }) => {
  const [showAdvancePayment, setShowAdvancePayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentDetails, setPaymentDetails] = useState({});

  const addPayment = () => {
    if (!paymentAmount || !paymentReference) return;

    const newPayment = {
      method: paymentMethod,
      amount: parseFloat(paymentAmount),
      reference: paymentReference,
      details: paymentDetails,
    };

    setFormData((prev) => ({
      ...prev,
      payment: [...prev.payment, newPayment],
    }));

    // Reset form
    setPaymentAmount("");
    setPaymentReference("");
    setPaymentDetails({});
  };

  const removePayment = (index) => {
    const updatedPayments = formData.payment.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, payment: updatedPayments }));
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setPaymentDetails({});
  };

  const updatePaymentDetails = (key, value) => {
    setPaymentDetails((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <CreateAdvancePaymentCardPresentation
      model={{
        t,
        showAdvancePayment,
        setShowAdvancePayment,
        paymentMethod,
        handlePaymentMethodChange,
        PAYMENT_METHODS,
        paymentAmount,
        setPaymentAmount,
        paymentReference,
        setPaymentReference,
        paymentDetails,
        updatePaymentDetails,
        addPayment,
        formData,
        removePayment,
      }}
    />
  );
};

export default AdvancePaymentCard;
