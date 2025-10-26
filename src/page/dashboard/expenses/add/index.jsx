"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, IndianRupee } from 'lucide-react';

// Import components
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Button, AnimatedBackground } from '@/components/ui';
import { ExpenseForm, ExpenseAddSuccessModal } from '@/components/expenses';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { createExpense } from '@/store/slices/expensesSlice';
import Link from 'next/link';

const AddExpensePage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const { isCreating, error } = useAppSelector((state) => state.expenses);
  const { selectedStore } = useAppSelector((state) => state.profile);

  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [addedExpenseName, setAddedExpenseName] = useState('');
  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setSubmitError(null);
      
      const expenseData = {
        ...formData,
        store: selectedStore?.storeId,
      };

      const result = await dispatch(createExpense(expenseData));
      
      if (result.payload?.success) {
        setAddedExpenseName(formData.title);
        setShowSuccessModal(true);
      } else {
        setSubmitError(result.payload?.message || 'Failed to create expense');
      }
    } catch (error) {
      console.error('Create expense error:', error);
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/expenses');
  };

  const handleContinue = () => {
    setShowSuccessModal(false);
    router.push('/dashboard/expenses');
  };

  const handleAddMore = () => {
    setShowSuccessModal(false);
    // Form will reset to initial state
  };

  return (
    <div className="flex h-screen w-full relative overflow-hidden">
      <AnimatedBackground variant="default" />
      <Sidebar />

      {/* Main Content */}
      <div className="min-h-screen w-full flex flex-col">
        {/* Header */}
        <Header 
          title="Add New Expense" 
          description="Create a new expense entry for your business" 
        />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-8xl mx-auto">
            {/* Back Button */}
            <div className="mb-4">
              <Link href="/dashboard/expenses" className="inline-flex items-center space-x-2 px-3 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Expenses</span>
              </Link>
            </div>

            {/* Form Container - Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: 'calc(100vh - 200px)' }}>
              {/* Main Form - Left Side */}
              <div className="lg:col-span-2 flex flex-col h-full">
                <div className="flex-1 overflow-y-auto pe-3 max-h-[calc(100vh-228px)] min-h-[calc(100vh-228px)]">
                  <ExpenseForm
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isLoading={loading || isCreating}
                    error={error || submitError}
                  />
                </div>
                
                {/* Action Buttons - Fixed Bottom */}
                <div className="mt-6 flex items-center justify-end space-x-3 bg-[rgb(var(--color-bg-primary))] border-t border-[rgb(var(--color-border-primary))] pt-4">
                  <Button variant="outline" onClick={handleCancel} disabled={loading || isCreating}>
                    Cancel
                  </Button>
                  <Button
                    variant="success"
                    onClick={() => {
                      const form = document.querySelector('form');
                      if (form) form.requestSubmit();
                    }}
                    disabled={loading || isCreating}
                    loading={loading || isCreating}
                    leftIcon={Save}
                  >
                    Save Expense
                  </Button>
                </div>
              </div>

              {/* Tips Section - Right Side */}
              <div className="lg:col-span-1">
                <div className="sticky top-6">
                  <div className="bg-gradient-to-br from-[rgb(var(--color-primary))]/5 to-[rgb(var(--color-primary))]/10 backdrop-blur-md rounded-lg border border-[rgb(var(--color-primary))]/20 p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/20 rounded-lg flex items-center justify-center">
                        <IndianRupee className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Why Track Expenses?</h3>
                        <p className="text-sm text-[rgb(var(--color-text-secondary))]">Stay organized with detailed expense tracking</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Tax Deduction Benefits */}
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-green-600 text-sm">💰</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Tax Deductions</h4>
                          <p className="text-xs text-[rgb(var(--color-text-secondary))]">Claim legitimate business expenses to reduce your tax burden</p>
                        </div>
                      </div>

                      {/* Budget Management */}
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 text-sm">📊</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Budget Management</h4>
                          <p className="text-xs text-[rgb(var(--color-text-secondary))]">Track spending patterns and maintain healthy cash flow</p>
                        </div>
                      </div>

                      {/* Financial Analysis */}
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-purple-600 text-sm">📈</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Financial Analysis</h4>
                          <p className="text-xs text-[rgb(var(--color-text-secondary))]">Analyze expenses to make informed business decisions</p>
                        </div>
                      </div>

                      {/* Compliance */}
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-orange-600 text-sm">📋</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">Compliance & Records</h4>
                          <p className="text-xs text-[rgb(var(--color-text-secondary))]">Maintain proper records for audits and compliance</p>
                        </div>
                      </div>

                      {/* GST Benefits */}
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-indigo-600 text-sm">🧾</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">GST Input Credit</h4>
                          <p className="text-xs text-[rgb(var(--color-text-secondary))]">Claim GST input credit on eligible business expenses</p>
                        </div>
                      </div>
                    </div>

                    {/* Tips Section */}
                    <div className="mt-6 p-4 bg-[rgb(var(--color-bg-primary))]/20 rounded-lg border border-[rgb(var(--color-border-primary))]/30">
                      <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">💡 Pro Tips</h4>
                      <ul className="text-xs text-[rgb(var(--color-text-secondary))] space-y-1">
                        <li>• Keep bills and receipts for all expenses</li>
                        <li>• Track expenses daily for accuracy</li>
                        <li>• Categorize properly for better reporting</li>
                        <li>• Update payment status promptly</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <ExpenseAddSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onContinue={handleContinue}
        onAddMore={handleAddMore}
        expenseName={addedExpenseName}
      />
    </div>
  );
};

export default AddExpensePage;
