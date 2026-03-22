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
import Header from "@/components/dashboard/header";
import Sidebar from "@/components/dashboard/sidebar";
import { Button, Card, Input, Modal, Select, Textarea } from "@/components/ui";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createAccount } from "@/store/slices/accountsSlice";
import { getSuppliers } from "@/store/slices/supplier/supplierSlice";
import logger from "@/utils/logger";

const CreateAccount = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { suppliers } = useAppSelector((state) => state.suppliers);
  const { isCreating, error } = useAppSelector((state) => state.accounts);
  const { selectedStore } = useAppSelector((state) => state.profile);

  const [formData, setFormData] = useState({
    supplierId: "",
    accountStatus: "active",
    riskLevel: "low",
    creditLimit: 0,
    paymentTerms: "30",
    gracePeriod: "7",
    notes: "",
    // Additional account settings
    autoApproval: false,
    requireApproval: false,
    maxTransactionAmount: 0,
    dailyTransactionLimit: 0,
    monthlyTransactionLimit: 0,
  });

  const [errors, setErrors] = useState({});
  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);

  // Fetch suppliers on component mount
  useEffect(() => {
    if (selectedStore?.id) {
      dispatch(getSuppliers({ store: selectedStore.id }));
    }
  }, [dispatch, selectedStore]);

  // Handle input changes
  const handleInputChange = (field, value) => {
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

    if (!formData.creditLimit || formData.creditLimit <= 0) {
      newErrors.creditLimit = "Valid credit limit is required";
    }

    if (!formData.paymentTerms || formData.paymentTerms <= 0) {
      newErrors.paymentTerms = "Valid payment terms are required";
    }

    if (!formData.gracePeriod || formData.gracePeriod < 0) {
      newErrors.gracePeriod = "Valid grace period is required";
    }

    if (formData.maxTransactionAmount && formData.maxTransactionAmount <= 0) {
      newErrors.maxTransactionAmount =
        "Valid max transaction amount is required";
    }

    if (formData.dailyTransactionLimit && formData.dailyTransactionLimit <= 0) {
      newErrors.dailyTransactionLimit =
        "Valid daily transaction limit is required";
    }

    if (
      formData.monthlyTransactionLimit &&
      formData.monthlyTransactionLimit <= 0
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
      return;
    }

    try {
      const accountData = {
        ...formData,
        status: isDraft ? "draft" : formData.accountStatus,
        storeId: selectedStore?.id,
      };

      const result = await dispatch(createAccount(accountData));

      if (result.type === "accounts/createAccount/fulfilled") {
        router.push("/dashboard/accounts");
      }
    } catch (error) {
      logger.error("Failed to create account:", error);
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
    }).format(amount);
  };

  return (
    <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
        {/* Header */}
        <Header
          title="Create Supplier Account"
          description="Create a new supplier account with credit limits"
        />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
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
                        options={[
                          { value: "", label: "Select Supplier" },
                          ...suppliers.map((supplier) => ({
                            value: supplier.id,
                            label: supplier.name,
                          })),
                        ]}
                        error={errors.supplierId}
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
                        options={[
                          { value: "active", label: "Active" },
                          { value: "pending", label: "Pending" },
                          { value: "suspended", label: "Suspended" },
                          { value: "inactive", label: "Inactive" },
                        ]}
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
                        options={[
                          { value: "low", label: "Low Risk" },
                          { value: "medium", label: "Medium Risk" },
                          { value: "high", label: "High Risk" },
                        ]}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Credit Limit *
                      </label>
                      <Input
                        type="number"
                        value={formData.creditLimit}
                        onChange={(e) =>
                          handleInputChange(
                            "creditLimit",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        error={errors.creditLimit}
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) =>
                        handleInputChange("notes", e.target.value)
                      }
                      placeholder="Additional notes about this account..."
                      rows={3}
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
                        Payment Terms (Days) *
                      </label>
                      <Input
                        type="number"
                        value={formData.paymentTerms}
                        onChange={(e) =>
                          handleInputChange(
                            "paymentTerms",
                            parseInt(e.target.value, 10) || 0
                          )
                        }
                        placeholder="30"
                        min="0"
                        error={errors.paymentTerms}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Grace Period (Days) *
                      </label>
                      <Input
                        type="number"
                        value={formData.gracePeriod}
                        onChange={(e) =>
                          handleInputChange(
                            "gracePeriod",
                            parseInt(e.target.value, 10) || 0
                          )
                        }
                        placeholder="7"
                        min="0"
                        error={errors.gracePeriod}
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
                        onChange={(e) =>
                          handleInputChange(
                            "maxTransactionAmount",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        error={errors.maxTransactionAmount}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Daily Transaction Limit
                      </label>
                      <Input
                        type="number"
                        value={formData.dailyTransactionLimit}
                        onChange={(e) =>
                          handleInputChange(
                            "dailyTransactionLimit",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        error={errors.dailyTransactionLimit}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monthly Transaction Limit
                      </label>
                      <Input
                        type="number"
                        value={formData.monthlyTransactionLimit}
                        onChange={(e) =>
                          handleInputChange(
                            "monthlyTransactionLimit",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        error={errors.monthlyTransactionLimit}
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
                          {formData.paymentTerms} days
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Grace Period:</span>
                        <span className="font-medium">
                          {formData.gracePeriod} days
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Risk Level:</span>
                        <span className="font-medium capitalize">
                          {formData.riskLevel}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Status:</span>
                        <span className="font-medium capitalize">
                          {formData.accountStatus}
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
        </div>
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
