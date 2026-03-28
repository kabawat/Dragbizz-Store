"use client";
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Plus,
  Save,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import { Button, Card, Modal } from "@/components/ui";
import { useTranslation } from "@/hooks/ui/useTranslation";
import {
  billService,
  paymentService,
  supplierService,
} from "@/service/retailer";
import { useAppSelector } from "@/store/hooks";
import { useApiResponse } from "@/hooks/useApiResponse";
import { useModulePermissions } from "@/hooks/permissions/useModulePermissions";
import { INITIAL_PAYMENT_METHOD } from "./constants";
import { transformApiMethodsToForm } from "./utils";
import { PaymentTipsSidebar } from "./components/PaymentTipsSidebar";
import { BasicDetails } from "./components/BasicDetails";
import { PaymentMethodItem } from "./components/PaymentMethodItem";

const EditPayment = ({ paymentId: propPaymentId }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const { selectedStore } = useAppSelector((state) => state.profile);

  // Permission Management
  const { can, loading: permissionLoading } = useModulePermissions("billing");
  const canEdit = can("edit");

  useEffect(() => {
    if (!permissionLoading && !canEdit) {
      router.replace("/dashboard/payments");
    }
  }, [canEdit, permissionLoading, router]);

  // Derived State
  const paymentId = propPaymentId || params?.id;

  // States
  const [suppliers, setSuppliers] = useState([]);
  const [bills, setBills] = useState([]);

  const [status, setStatus] = useState({ fetching: true });
  const [errors, setErrors] = useState({ fetch: null, update: null, form: {} });

  const { execute: executeFetchPayment } = useApiResponse();
  const { execute: executeUpdate, loading: updating } = useApiResponse();
  const { execute: executeBills, loading: billsLoading } = useApiResponse();
  const { execute: executeSuppliers, loading: suppliersLoading } = useApiResponse();

  const [formData, setFormData] = useState({
    supplierId: "",
    paymentType: "BILL_PAYMENT",
    billId: "",
    notes: "",
    paymentMethods: [INITIAL_PAYMENT_METHOD],
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const fetchedIdRef = useRef(null);

  // --- Date Fetching Logic ---
  const fetchBills = useCallback(async (supplierId) => {
    if (!supplierId || !selectedStore?.storeId) {
      setBills([]);
      return;
    }
    const result = await executeBills(billService.getBills({
      store: selectedStore.storeId,
      supplier: supplierId,
      lightweight: true,
      limit: 100,
    }), { showToast: false });
    
    if (result?.success) {
      setBills(result.data?.data || result.data || []);
    } else {
      setBills([]);
    }
  }, [selectedStore, executeBills]);

  const fetchSuppliers = useCallback(async () => {
    if (!selectedStore?.storeId) return;
    
    const result = await executeSuppliers(supplierService.getSuppliers({
      limit: 100,
      lightweight: true,
      store: selectedStore.storeId,
    }), { showToast: false });
    
    if (result?.success) {
      setSuppliers(result.data?.data || result.data || []);
    }
  }, [selectedStore, executeSuppliers]);

  useEffect(() => {
    const fetchPaymentData = async () => {
      if (!paymentId || !selectedStore?.storeId || fetchedIdRef.current === paymentId) return;
      fetchedIdRef.current = paymentId;

      try {
        setStatus(prev => ({ ...prev, fetching: true }));
        setErrors(prev => ({ ...prev, fetch: null }));

        const result = await executeFetchPayment(paymentService.getPayments({
          store: selectedStore.storeId,
          id: paymentId,
        }), { showToast: false });

        if (result?.success && result.data) {
          const data = result.data;
          const supplierId = data.supplier?._id || data.supplier?.id || data.supplier || "";
          const billId = data.paymentType === "BILL_PAYMENT" ? (data.bill?._id || data.bill?.id || data.bill || "") : "";

          setFormData({
            supplierId,
            paymentType: data.paymentType || "BILL_PAYMENT",
            billId,
            notes: data.notes || "",
            paymentMethods: transformApiMethodsToForm(data.paymentMethods),
          });

          if (supplierId) fetchBills(supplierId);
        } else {
          setErrors(prev => ({ ...prev, fetch: result?.message || "Failed to fetch payment" }));
        }
      } catch (error) {
        console.error("Fetch payment error:", error);
        setErrors(prev => ({ ...prev, fetch: "An error occurred while fetching payment data" }));
      } finally {
        setStatus(prev => ({ ...prev, fetching: false }));
      }
    };

    fetchPaymentData();
  }, [paymentId, selectedStore, fetchBills]);

  useEffect(() => {
    if (selectedStore?.storeId) fetchSuppliers();
  }, [selectedStore?.storeId, fetchSuppliers]);

  // --- Handlers ---
  const handleStoreChange = () => {
    fetchedIdRef.current = null;
    setStatus(prev => ({ ...prev, fetching: true }));
    setErrors(prev => ({ ...prev, fetch: null }));
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Auto-fill amount logic
      if (field === "billId" && value) {
        const selectedBill = bills.find((b) => b._id === value);
        if (selectedBill?.dueAmount) {
          newData.paymentMethods = prev.paymentMethods.map((m, i) =>
            i === 0 ? { ...m, amount: selectedBill.dueAmount } : m
          );
        }
      }
      return newData;
    });

    if (errors.form[field]) {
      setErrors(prev => ({ ...prev, form: { ...prev.form, [field]: null } }));
    }

    if (field === "supplierId") fetchBills(value);
  };

  const handlePaymentMethodChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map((m, i) =>
        i === index ? { ...m, [field]: value } : m
      ),
    }));
    if (errors.form[`paymentMethod_${index}_${field}`]) {
      setErrors(prev => ({ ...prev, form: { ...prev.form, [`paymentMethod_${index}_${field}`]: null } }));
    }
  };

  const addPaymentMethod = () => {
    setFormData(prev => ({ ...prev, paymentMethods: [...prev.paymentMethods, INITIAL_PAYMENT_METHOD] }));
  };

  const removePaymentMethod = (index) => {
    if (formData.paymentMethods.length > 1) {
      setFormData(prev => ({ ...prev, paymentMethods: prev.paymentMethods.filter((_, i) => i !== index) }));
    }
  };

  const totalAmount = useMemo(() => {
    return formData.paymentMethods.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0);
  }, [formData.paymentMethods]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.supplierId) newErrors.supplierId = `${t("errors.selectSupplier")} ${t("common.required")}`;
    if (!formData.paymentMethods.length) newErrors.paymentMethods = "At least one payment method is required";
    if (totalAmount <= 0) newErrors.totalAmount = "Total amount must be > 0";
    if (formData.paymentType === "BILL_PAYMENT" && !formData.billId) newErrors.billId = "Select a bill";
    if (formData.notes?.length > 500) newErrors.notes = "Notes too long";

    formData.paymentMethods.forEach((m, idx) => {
      if (!m.amount || m.amount <= 0) newErrors[`paymentMethod_${idx}_amount`] = "Invalid amount";
      if (!m.method) newErrors[`paymentMethod_${idx}_method`] = "Required";

      if (m.method === 'bank_transfer') {
        ['bankName', 'ifscCode', 'accountNumber', 'holderName'].forEach(field => {
          if (!m[field]) newErrors[`paymentMethod_${idx}_${field}`] = "Required";
        });
      }
      if (m.method === 'upi') {
        ['upiId', 'transactionId'].forEach(field => {
          if (!m[field]) newErrors[`paymentMethod_${idx}_${field}`] = "Required";
        });
      }
      if (m.method === 'cheque') {
        ['chequeNumber', 'chequeDate', 'chequeBankName', 'chequeBranchName'].forEach(field => {
          if (!m[field]) newErrors[`paymentMethod_${idx}_${field}`] = "Required";
        });
      }
    });

    setErrors(prev => ({ ...prev, form: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setErrors(prev => ({ ...prev, update: null, form: {} }));

    const dataToSubmit = { ...formData, store: selectedStore?.storeId };
    const transformedData = paymentService.transformPaymentData(dataToSubmit);

    const result = await executeUpdate(
      paymentService.updatePayment(paymentId, transformedData, selectedStore?.storeId)
    );

    if (result?.success) {
      // Redux slice update happens optimistically via component dispatches normally, but here we just show modal
      setShowSuccessModal(true);
    } else {
      setErrors(prev => ({ ...prev, update: result?.message || t("errors.failedToUpdate") }));
    }
  };

  // --- Render ---
  if (status.fetching) {
    return (
      <div className="flex h-screen w-full relative overflow-hidden">
        <Sidebar /><div className="min-h-screen w-full flex flex-col items-center justify-center"><div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin"></div></div>
      </div>
    );
  }

  if (errors.fetch) {
    return (
      <div className="flex h-screen w-full relative overflow-hidden">
        <Sidebar />
        <div className="p-6 w-full">
          <Card className="p-6 text-center">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Payment</h3>
            <p className="mb-4">{errors.fetch}</p>
            <Button onClick={() => router.push("/dashboard/payments")}>Back to Payments</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full relative overflow-hidden">
      <Sidebar onStoreChange={handleStoreChange} />
      <div className="min-h-screen w-full flex flex-col">
        <Header title={t("payments.editPayment")} description={t("payments.updatePaymentInformationAndDetails")} />

        <div className="flex-1 p-6">
          <div className="max-w-8xl mx-auto">
            <Link href="/dashboard/payments" className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] mb-6">
              <ArrowLeft className="w-4 h-4" /><span>{t("payments.backToPayments")}</span>
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
              <div className="lg:col-span-2 flex flex-col h-full">
                <div className="flex-1 overflow-y-auto pe-3 max-h-[calc(100vh-260px)]">
                  {(errors.update || errors.form.general) && (
                    <Card className="mb-6 p-4 bg-red-50 border-red-200 text-red-700">
                      {errors.update || errors.form.general}
                    </Card>
                  )}

                  <BasicDetails
                    formData={formData}
                    handleInputChange={handleInputChange}
                    suppliers={suppliers}
                    suppliersLoading={suppliersLoading}
                    bills={bills}
                    billsLoading={billsLoading}
                    errors={errors.form}
                  />

                  <Card className="mb-6 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold flex items-center"><CreditCard className="w-5 h-5 mr-2" /> Payment Methods</h3>
                      <button type="button" onClick={addPaymentMethod} className="flex items-center gap-2 px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg">
                        <Plus className="w-4 h-4" /><span>Add Method</span>
                      </button>
                    </div>

                    <div className="mb-4 p-3 rounded-lg bg-[rgb(var(--color-primary))]/10 flex justify-between">
                      <span className="font-medium">Total Amount:</span>
                      <span className="font-bold">₹ {totalAmount.toLocaleString()}</span>
                    </div>

                    <div className="space-y-4">
                      {formData.paymentMethods.map((method, index) => (
                        <PaymentMethodItem
                          key={index}
                          index={index}
                          method={method}
                          errors={errors.form}
                          onUpdate={handlePaymentMethodChange}
                          onRemove={removePaymentMethod}
                          showRemove={formData.paymentMethods.length > 1}
                          t={t}
                        />
                      ))}
                    </div>
                  </Card>
                </div>

                <div className="mt-6 flex justify-end space-x-3 bg-[rgb(var(--color-bg-primary))] pt-4 border-t">
                  <Button variant="outline" onClick={() => router.push("/dashboard/payments")} disabled={updating}>Cancel</Button>
                  <Button variant="success" onClick={handleSubmit} disabled={updating} loading={updating} leftIcon={Save}>Update Payment</Button>
                </div>
              </div>

              <PaymentTipsSidebar />
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} title="Updated Successfully" size="md">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto"><CheckCircle className="w-8 h-8 text-green-600" /></div>
          <p>Payment has been updated successfully.</p>
          <Button variant="primary" onClick={() => router.push("/dashboard/payments")}>Continue</Button>
        </div>
      </Modal>
    </div>
  );
};

export default EditPayment;
