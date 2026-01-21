"use client";
import { Download, Edit, Receipt, Trash2 } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { getPaymentStatusBadge } from "./BillHeader";

const BillActions = ({
  billData,
  onEditBill,
  onDeleteBill,
  onDownloadPDF,
  formatCurrency,
  formatDate,
  formatDateTime,
}) => {
  return (
    <div className="lg:col-span-1">
      <div className="sticky top-6">
        <div className="bg-gradient-to-br from-[rgb(var(--color-primary))]/5 to-[rgb(var(--color-primary))]/10 backdrop-blur-md rounded-lg border border-[rgb(var(--color-primary))]/20 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/20 rounded-lg flex items-center justify-center">
              <Receipt className="w-5 h-5 text-[rgb(var(--color-primary))]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
                Quick Actions
              </h3>
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                Manage this bill
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              className="flex-1"
              onClick={onEditBill}
              leftIcon={Edit}
            >
              Edit
            </Button>

            <Button
              variant="danger"
              className="flex-1"
              onClick={onDeleteBill}
              leftIcon={Trash2}
            >
              Delete
            </Button>

            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onDownloadPDF?.(billData)}
              leftIcon={Download}
            >
              <span className="hidden sm:inline">Download</span>
              <span className="sm:hidden">Download</span>
            </Button>
          </div>

          {/* Status Display */}
          <div className="mt-6 p-4 bg-[rgb(var(--color-bg-primary))]/20 rounded-lg border border-[rgb(var(--color-border-primary))]/30">
            <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3">
              Status
            </h4>
            <div className="flex justify-center">
              {getPaymentStatusBadge(
                billData.paymentStatus,
                billData.isOverdue
              )}
            </div>
          </div>

          {/* Bill Stats */}
          <div className="mt-6 p-4 bg-[rgb(var(--color-bg-primary))]/20 rounded-lg border border-[rgb(var(--color-border-primary))]/30">
            <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3">
              Bill Stats
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">
                  Total Amount:
                </span>
                <span className="font-medium text-[rgb(var(--color-text-primary))]">
                  {formatCurrency(billData.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">
                  Paid Amount:
                </span>
                <span className="font-medium text-[rgb(var(--color-text-primary))]">
                  {formatCurrency(billData.paidAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">
                  Due Amount:
                </span>
                <span className="font-medium text-[rgb(var(--color-text-primary))]">
                  {formatCurrency(billData.dueAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">
                  Overdue Days:
                </span>
                <span className="font-medium text-[rgb(var(--color-text-primary))]">
                  {billData.overdueDays || 0} days
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">
                  Created:
                </span>
                <span className="font-medium text-[rgb(var(--color-text-primary))]">
                  {formatDate(billData.createdAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">
                  Last Updated:
                </span>
                <span className="font-medium text-[rgb(var(--color-text-primary))]">
                  {formatDateTime(billData.updatedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillActions;
