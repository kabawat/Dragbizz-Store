"use client";
import React from "react";
import { X } from "lucide-react";
import { Button, Modal } from "@/components/ui";

const ExpenseAddSuccessModal = ({
  isOpen,
  onClose,
  onContinue,
  onAddMore,
  expenseName = "",
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="p-6">
        {/* Success Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-2">
            Expense Added Successfully!
          </h3>
          <p className="text-[rgb(var(--color-text-secondary))]">
            {expenseName
              ? `"${expenseName}" has been added to your expenses.`
              : "Your expense has been added successfully."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onAddMore} className="flex-1">
            Add More Expenses
          </Button>
          <Button variant="primary" onClick={onContinue} className="flex-1">
            Continue to Expenses
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExpenseAddSuccessModal;
