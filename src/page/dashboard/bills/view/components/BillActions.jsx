"use client";
import React from 'react';
import { Receipt, CreditCard, CheckCircle, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui';

const BillActions = ({ 
  billData, 
  onMakePayment, 
  onPaymentCompleted, 
  onEditBill, 
  onDeleteBill,
  formatCurrency,
  formatDate,
  formatDateTime
}) => {
  return (
    <div className="lg:col-span-1">
      <div className="bg-gradient-to-br from-[rgb(var(--color-primary))]/5 to-[rgb(var(--color-primary))]/10 backdrop-blur-md rounded-lg border border-[rgb(var(--color-primary))]/20 p-6 sticky top-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/20 rounded-lg flex items-center justify-center">
            <Receipt className="w-5 h-5 text-[rgb(var(--color-primary))]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Quick Actions</h3>
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">Manage this bill</p>
          </div>
        </div>

        <div className="space-y-3">
          {billData.dueAmount > 0 ? (
            <Button
              variant="primary"
              className="w-full"
              onClick={onMakePayment}
              leftIcon={CreditCard}
            >
              Make Payment
            </Button>
          ) : (
            <Button
              variant="success"
              className="w-full"
              onClick={onPaymentCompleted}
              leftIcon={CheckCircle}
            >
              Payment Completed
            </Button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={onEditBill}
              leftIcon={Edit}
            >
              Edit
            </Button>

            <Button
              variant="danger"
              className="w-full"
              onClick={onDeleteBill}
              leftIcon={Trash2}
            >
              Delete
            </Button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-[rgb(var(--color-bg-primary))]/20 rounded-lg border border-[rgb(var(--color-border-primary))]/30">
          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-3">Bill Stats</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[rgb(var(--color-text-secondary))]">Total Amount:</span>
              <span className="font-medium text-[rgb(var(--color-text-primary))]">
                {formatCurrency(billData.totalAmount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[rgb(var(--color-text-secondary))]">Paid Amount:</span>
              <span className="font-medium text-[rgb(var(--color-text-primary))]">
                {formatCurrency(billData.paidAmount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[rgb(var(--color-text-secondary))]">Due Amount:</span>
              <span className="font-medium text-[rgb(var(--color-text-primary))]">
                {formatCurrency(billData.dueAmount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[rgb(var(--color-text-secondary))]">Overdue Days:</span>
              <span className="font-medium text-[rgb(var(--color-text-primary))]">
                {billData.overdueDays || 0} days
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[rgb(var(--color-text-secondary))]">Created:</span>
              <span className="font-medium text-[rgb(var(--color-text-primary))]">
                {formatDate(billData.createdAt)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[rgb(var(--color-text-secondary))]">Last Updated:</span>
              <span className="font-medium text-[rgb(var(--color-text-primary))]">
                {formatDateTime(billData.updatedAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillActions;

