"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, IndianRupee } from 'lucide-react';

// Import components
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { ExpenseForm } from '@/components/expenses';
import { expenseService } from '@/service';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { updateExpense } from '@/store/slices/expensesSlice';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

const EditExpensePage = ({ expenseId }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const { isUpdating, error } = useAppSelector((state) => state.expenses);
  const { selectedStore } = useAppSelector((state) => state.profile);
  const storeId = selectedStore?.storeId || selectedStore?._id || selectedStore?.id;

  const [submitError, setSubmitError] = useState(null);
  const [expense, setExpense] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchingError, setFetchingError] = useState(null);
  const hasFetched = useRef(false);
  const formRef = useRef(null);

  // Fetch expense data on component mount
  useEffect(() => {
    const fetchExpenseData = async () => {
      if (!expenseId || !storeId || hasFetched.current) return;

      hasFetched.current = true;
      try {
        setIsLoading(true);
        setFetchingError(null);

        const result = await expenseService.getExpenses({ id: expenseId, store: storeId });
        if (result.success && result.data) {
          setExpense(result.data);
        } else {
          setFetchingError(result.message || t('errors.failedToFetchData', { item: t('common.expense') }));
        }
      } catch (error) {
        setFetchingError(t('errors.failedToFetchDataTryAgain', { item: t('common.expense') }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenseData();
  }, [expenseId, storeId]);

  const handleSubmit = async (formData) => {
    try {
      setSubmitError(null);
      
      const updateData = {
        ...formData,
        store: storeId,
        timestamps: {
          ...expense.timestamps,
          updatedAt: new Date().toISOString()
        }
      };

      const result = await dispatch(updateExpense({
        expenseId: expenseId,
        expenseData: updateData,
        storeId: storeId
      }));
      
      if (result.payload?.success) {
        router.push('/dashboard/expenses');
      } else {
        setSubmitError(result.payload?.message || t('errors.failedToUpdate', { item: t('common.expense') }));
      }
    } catch (error) {
      setSubmitError(t('errors.failedToUpdateTryAgain', { item: t('common.expense') }));
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/expenses');
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full relative overflow-hidden">
        <Sidebar />
        <div className="min-h-screen w-full flex flex-col items-center justify-center">
          <Loading />
        </div>
      </div>
    );
  }

  if (!isLoading && (!expense || fetchingError)) {
    return (
      <div className="flex h-screen w-full relative overflow-hidden">
        <Sidebar />
        <div className="min-h-screen w-full flex flex-col">
          <Header 
            title={t('modals.notFound', { item: t('common.expense') })}
            description={t('common.doesntExistOrRemoved', { item: t('common.expense') })}
          />
          <div className="flex-1 p-6">
            <div className="max-w-8xl mx-auto">
              <Alert variant="error" className="mb-4">
                {fetchingError || t('errors.expenseNotFound')}
              </Alert>
              <Link href="/dashboard/expenses" className="inline-flex items-center space-x-2 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">{t('common.backTo', { item: t('common.expenses') })}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full relative overflow-hidden">
      <Sidebar />

      {/* Main Content */}
      <div className="min-h-screen w-full flex flex-col">
        {/* Header */}
        <Header 
          title={t('expenses.editExpense')}
          description={t('expenses.updateExpenseDetails', { title: expense?.title || t('common.loading') })} 
        />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-8xl mx-auto">
            {/* Back Button */}
            <div className="mb-4">
              <Link href="/dashboard/expenses" className="inline-flex items-center space-x-2 py-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))] rounded-lg transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">{t('common.backTo', { item: t('common.expenses') })}</span>
              </Link>
            </div>

            {/* Error Alert */}
            {(error || submitError || fetchingError) && (
              <Alert className="mb-4" variant="error">
                {error || submitError || fetchingError}
              </Alert>
            )}

            {/* Form Container - Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: 'calc(100vh - 200px)' }}>
              {/* Main Form - Left Side */}
              <div className="lg:col-span-2 flex flex-col h-full">
                <div className="flex-1 overflow-y-auto pe-3 max-h-[calc(100vh-228px)] min-h-[calc(100vh-228px)]">
                  <ExpenseForm
                    expense={expense}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isLoading={isUpdating}
                    error={error || submitError || fetchingError}
                    formRef={formRef}
                  />
                </div>
                
                {/* Action Buttons - Fixed Bottom */}
                <div className="mt-6 flex items-center justify-end space-x-3 bg-[rgb(var(--color-bg-primary))] border-t border-[rgb(var(--color-border-primary))] pt-4">
                  <Button variant="outline" onClick={handleCancel} disabled={isUpdating}>
                    {t('common.cancel')}
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (formRef.current) {
                        formRef.current.requestSubmit();
                      }
                    }}
                    disabled={isUpdating}
                    loading={isUpdating}
                    leftIcon={Save}
                  >
                    {t('expenses.updateExpense')}
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
                          <h4 className="text-sm font-medium text-[rgb(var(--color-text-primary))] mb-1">{t('expenses.gstInputCredit')}</h4>
                          <p className="text-xs text-[rgb(var(--color-text-secondary))]">{t('expenses.gstInputCreditDescription')}</p>
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
    </div>
  );
};

export default EditExpensePage;
