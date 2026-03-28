"use client";
import { Download, Edit, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui";

const CustomerActions = ({
  customerData,
  onEdit,
  onDelete,
  onDownloadPDF,
  canEdit = true,
  canDelete = true,
}) => {
  return (
    <div className="lg:col-span-1">
      <div className="sticky top-6">
        <div className="bg-gradient-to-br from-[rgb(var(--color-primary))]/5 to-[rgb(var(--color-primary))]/10 backdrop-blur-md rounded-lg border border-[rgb(var(--color-primary))]/20 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/20 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-[rgb(var(--color-primary))]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
              Quick Actions
            </h3>
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
              Manage this customer
            </p>
          </div>
        </div>

          <div className="flex flex-col sm:flex-row gap-3">
          {canEdit && (
            <Button
              variant="primary"
              className="flex-1"
              onClick={onEdit}
              leftIcon={Edit}
            >
                Edit
            </Button>
          )}

          {canDelete && (
            <Button
              variant="danger"
              className="flex-1"
              onClick={onDelete}
              leftIcon={Trash2}
            >
              Delete
            </Button>
          )}

            {onDownloadPDF && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onDownloadPDF(customerData)}
                leftIcon={Download}
              >
                <span className="hidden sm:inline">Download</span>
                <span className="sm:hidden">Download</span>
          </Button>
            )}
        </div>

        {customerData.account && (
          <div className="mt-6 p-4 bg-[rgb(var(--color-bg-primary))]/20 rounded-lg border border-[rgb(var(--color-border-primary))]/30">
            <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3">
              Quick Stats
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">
                  Total Invoices:
                </span>
                <span className="font-medium text-[rgb(var(--color-text-primary))]">
                  {customerData.account.totalInvoices || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">
                  Total Spent:
                </span>
                <span className="font-medium text-[rgb(var(--color-text-primary))]">
                  ₹
                  {customerData.account.totalAmount?.toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                  }) || "0.00"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">
                  Total Due:
                </span>
                <span
                  className={`font-medium ${customerData.account.totalDue > 0 ? "text-orange-500" : "text-[rgb(var(--color-text-primary))]"}`}
                >
                  ₹
                  {customerData.account.totalDue?.toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                  }) || "0.00"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">
                  Items Purchased:
                </span>
                <span className="font-medium text-[rgb(var(--color-text-primary))]">
                  {customerData.account.totalItemsPurchased || 0}
                </span>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default CustomerActions;
