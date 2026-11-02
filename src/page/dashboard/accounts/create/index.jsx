"use client";
import {
  Building2,
  Calendar,
  CheckCircle,
  IndianRupee,
  Save,
  Shield,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDashboardHeader } from "@/hooks/ui/useDashboardHeader";
import { Button, Card, Input, Modal, Select, Textarea } from "@/components/ui";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createAccount } from "@/store/slices/accountsSlice";
import { getSuppliers } from "@/store/slices/supplier/supplierSlice";
import { useGlobalToast } from "@/contexts/ToastContext";
import logger from "@/utils/logger";
import useSelectedStoreId from "@/hooks/store/useSelectedStoreId";

const ACCOUNT_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "BLOCKED", label: "Blocked" },
];

const RISK_LEVEL_OPTIONS = [
  { value: "LOW", label: "Low Risk" },
  { value: "MEDIUM", label: "Medium Risk" },
  { value: "HIGH", label: "High Risk" },
  { value: "CRITICAL", label: "Critical Risk" },
];

const PAYMENT_TERMS_OPTIONS = [
  { value: "7_DAYS", label: "7 Days (Net 7)" },
  { value: "15_DAYS", label: "15 Days (Net 15)" },
  { value: "30_DAYS", label: "30 Days (Net 30)" },
  { value: "45_DAYS", label: "45 Days (Net 45)" },
  { value: "60_DAYS", label: "60 Days (Net 60)" },
  { value: "90_DAYS", label: "90 Days (Net 90)" },
  { value: "COD", label: "Cash on Delivery (COD)" },
];

const extractValue = (valOrEvent) => {
  if (valOrEvent && typeof valOrEvent === "object" && "target" in valOrEvent) {
    return valOrEvent.target.value;
  }
  return valOrEvent;
};

const CreateAccount = () => {
  useDashboardHeader("Create Supplier Account", "Create a new supplier account with credit limits");
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { suppliers } = useAppSelector((state) => state.suppliers);
  const { isCreating } = useAppSelector((state) => state.accounts);
  const { storeId, ready: storeReady } = useSelectedStoreId();
  const { showSuccess, showError } = useGlobalToast();

  const [formData, setFormData] = useState({
    supplierId: "",
    accountStatus: "ACTIVE",
    riskLevel: "LOW",
    creditLimit: "",
    paymentTerms: "30_DAYS",
    gracePeriod: "7",
    notes: "",
    // Additional account settings
    autoApproval: false,
    requireApproval: false,
    maxTransactionAmount: "",
    dailyTransactionLimit: "",
    monthlyTransactionLimit: "",
  });

  const [errors, setErrors] = useState({});
  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);

  // Fetch suppliers on component mount
  useEffect(() => {
    if (storeReady && storeId) {
      dispatch(getSuppliers({ store: storeId }));
    }
  }, [dispatch, storeReady, storeId]);

  // Handle input changes (supports direct value from UI kit or native event)
  const handleInputChange = (field, valOrEvent) => {
    const value = extractValue(valOrEvent);
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (field, checked) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked,
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.supplierId) {
      newErrors.supplierId = "Supplier is required";
    }

    if (
      formData.creditLimit === "" ||
      isNaN(Number(formData.creditLimit)) ||
      Number(formData.creditLimit) < 0
    ) {
      newErrors.creditLimit = "Valid credit limit (0 or more) is required";
    }

    if (!formData.paymentTerms) {
      newErrors.paymentTerms = "Valid payment terms are required";
    }

    if (
      formData.gracePeriod === "" ||
      isNaN(Number(formData.gracePeriod)) ||
      Number(formData.gracePeriod) < 0
    ) {
      newErrors.gracePeriod = "Valid grace period (0 or more) is required";
    }

    if (
      formData.maxTransactionAmount !== "" &&
      (isNaN(Number(formData.maxTransactionAmount)) ||
        Number(formData.maxTransactionAmount) < 0)
    ) {
      newErrors.maxTransactionAmount =
        "Valid max transaction amount is required";
    }

    if (
      formData.dailyTransactionLimit !== "" &&
      (isNaN(Number(formData.dailyTransactionLimit)) ||
        Number(formData.dailyTransactionLimit) < 0)
    ) {
      newErrors.dailyTransactionLimit =
        "Valid daily transaction limit is required";
    }

    if (
      formData.monthlyTransactionLimit !== "" &&
      (isNaN(Number(formData.monthlyTransactionLimit)) ||
        Number(formData.monthlyTransactionLimit) < 0)
    ) {
      newErrors.monthlyTransactionLimit =
        "Valid monthly transaction limit is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (isDraft = false) => {
    if (!validateForm() && !isDraft) {
      showError("Please fix form errors before submitting");
      return;
    }

    try {
      const accountData = {
        supplier: formData.supplierId,
        creditLimit: Number(formData.creditLimit) || 0,
        paymentTerms: formData.paymentTerms || "30_DAYS",
        gracePeriod: Number(formData.gracePeriod) || 0,
        accountStatus: formData.accountStatus || "ACTIVE",
        riskLevel: formData.riskLevel || "LOW",
        notes: formData.notes?.trim() || undefined,
        autoApproval: Boolean(formData.autoApproval),
        requireApproval: Boolean(formData.requireApproval),
        maxTransactionAmount: Number(formData.maxTransactionAmount) || 0,
        dailyTransactionLimit: Number(formData.dailyTransactionLimit) || 0,
        monthlyTransactionLimit: Number(formData.monthlyTransactionLimit) || 0,
        status: isDraft ? "draft" : formData.accountStatus,
        storeId,
      };

      const result = await dispatch(createAccount(accountData));

      if (result.type === "accounts/createAccount/fulfilled") {
        showSuccess(
          isDraft
            ? "Account draft saved successfully"
            : "Supplier account created successfully"
        );
        router.push("/dashboard/accounts");
      } else {
        showError(result.payload || "Failed to create supplier account");
      }
    } catch (err) {
      logger.error("Failed to create account:", err);
      showError(err?.message || "An unexpected error occurred");
    }
  };

  // Handle save draft
  const handleSaveDraft = () => {
    setShowSaveDraftModal(true);
  };

  // Confirm save draft
  const confirmSaveDraft = () => {
    handleSubmit(true);
    setShowSaveDraftModal(false);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(Number(amount) || 0);
  };

  const supplierOptions = [
    { value: "", label: "Select Supplier" },
    ...(suppliers || []).map((supplier) => ({
      value: supplier.id || supplier._id,
      label: supplier.name,
    })),
  ];

  return (
    <div className="p-6">
      <div className="max-w-8xl mx-auto w-full">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {/* Basic Account Information */}
          <Card className="mb-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building2 className="w-5 h-5 mr-2" />
                Basic Account Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supplier *
                  </label>
                  <Select
                    value={formData.supplierId}
                    onChange={(value) =>
                      handleInputChange("supplierId", value)
                    }
                    searchable
                    placeholder="Select Supplier"
                    options={supplierOptions}
                    error={Boolean(errors.supplierId)}
                    errorMessage={errors.supplierId}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Status *
                  </label>
                  <Select
                    value={formData.accountStatus}
                    onChange={(value) =>
                      handleInputChange("accountStatus", value)
                    }
                    options={ACCOUNT_STATUS_OPTIONS}
                    error={Boolean(errors.accountStatus)}
                    errorMessage={errors.accountStatus}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Risk Level *
                  </label>
                  <Select
                    value={formData.riskLevel}
                    onChange={(value) =>
                      handleInputChange("riskLevel", value)
                    }
                    options={RISK_LEVEL_OPTIONS}
                    error={Boolean(errors.riskLevel)}
                    errorMessage={errors.riskLevel}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Credit Limit *
                  </label>
                  <Input
                    type="number"
                    value={formData.creditLimit}
                    onChange={(val) => handleInputChange("creditLimit", val)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    error={Boolean(errors.creditLimit)}
                    errorMessage={errors.creditLimit}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <Textarea
                  value={formData.notes}
                  onChange={(val) => handleInputChange("notes", val)}
                  placeholder="Additional notes about this account..."
                  rows={3}
                  error={Boolean(errors.notes)}
                  errorMessage={errors.notes}
                />
              </div>
            </div>
          </Card>

          {/* Payment Terms */}
          <Card className="mb-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Payment Terms
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Terms *
                  </label>
                  <Select
                    value={formData.paymentTerms}
                    onChange={(value) =>
                      handleInputChange("paymentTerms", value)
                    }
                    options={PAYMENT_TERMS_OPTIONS}
                    error={Boolean(errors.paymentTerms)}
                    errorMessage={errors.paymentTerms}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grace Period (Days) *
                  </label>
                  <Input
                    type="number"
                    value={formData.gracePeriod}
                    onChange={(val) => handleInputChange("gracePeriod", val)}
                    placeholder="7"
                    min="0"
                    error={Boolean(errors.gracePeriod)}
                    errorMessage={errors.gracePeriod}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Transaction Limits */}
          <Card className="mb-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Transaction Limits
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Transaction Amount
                  </label>
                  <Input
                    type="number"
                    value={formData.maxTransactionAmount}
                    onChange={(val) =>
                      handleInputChange("maxTransactionAmount", val)
                    }
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    error={Boolean(errors.maxTransactionAmount)}
                    errorMessage={errors.maxTransactionAmount}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daily Transaction Limit
                  </label>
                  <Input
                    type="number"
                    value={formData.dailyTransactionLimit}
                    onChange={(val) =>
                      handleInputChange("dailyTransactionLimit", val)
                    }
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    error={Boolean(errors.dailyTransactionLimit)}
                    errorMessage={errors.dailyTransactionLimit}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Transaction Limit
                  </label>
                  <Input
                    type="number"
                    value={formData.monthlyTransactionLimit}
                    onChange={(val) =>
                      handleInputChange("monthlyTransactionLimit", val)
                    }
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    error={Boolean(errors.monthlyTransactionLimit)}
                    errorMessage={errors.monthlyTransactionLimit}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Approval Settings */}
          <Card className="mb-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Approval Settings
              </h3>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoApproval"
                    checked={formData.autoApproval}
                    onChange={(e) =>
                      handleCheckboxChange("autoApproval", e.target.checked)
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="autoApproval"
                    className="ml-2 text-sm font-medium text-gray-700"
                  >
                    Enable Auto-Approval
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requireApproval"
                    checked={formData.requireApproval}
                    onChange={(e) =>
                      handleCheckboxChange(
                        "requireApproval",
                        e.target.checked
                      )
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="requireApproval"
                    className="ml-2 text-sm font-medium text-gray-700"
                  >
                    Require Manual Approval
                  </label>
                </div>
              </div>
            </div>
          </Card>

          {/* Account Summary */}
          <Card className="mb-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <IndianRupee className="w-5 h-5 mr-2" />
                Account Summary
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Credit Limit:</span>
                    <span className="font-medium">
                      {formatCurrency(formData.creditLimit)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Terms:</span>
                    <span className="font-medium">
                      {PAYMENT_TERMS_OPTIONS.find(
                        (p) => p.value === formData.paymentTerms
                      )?.label || formData.paymentTerms || "30 Days"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Grace Period:</span>
                    <span className="font-medium">
                      {formData.gracePeriod || 0} days
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Risk Level:</span>
                    <span className="font-medium capitalize">
                      {formData.riskLevel?.toLowerCase()}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Status:</span>
                    <span className="font-medium capitalize">
                      {formData.accountStatus?.toLowerCase()}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Auto-Approval:</span>
                    <span className="font-medium">
                      {formData.autoApproval ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/accounts")}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              leftIcon={Save}
              onClick={handleSaveDraft}
            >
              Save Draft
            </Button>
            <Button
              type="submit"
              variant="primary"
              leftIcon={Building2}
              loading={isCreating}
            >
              Create Account
            </Button>
          </div>
        </form>
      </div>

      {/* Save Draft Confirmation Modal */}
      <Modal
        isOpen={showSaveDraftModal}
        onClose={() => setShowSaveDraftModal(false)}
        title="Save as Draft"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to save this account as a draft? You can
            continue editing it later.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowSaveDraftModal(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={confirmSaveDraft}>
              Save Draft
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CreateAccount;
