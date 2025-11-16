"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { getExpenses, deleteExpense, setViewMode, setSortOptions, toggleExpenseSelection, selectAllExpenses, deselectAllExpenses } from '@/store/slices/expensesSlice';
import { ExpenseCard, ExpenseTable } from '@/components/expenses';
import { Button, Input, AnimatedBackground } from '@/components/ui';
import { Plus, Search, Grid3X3, List, IndianRupee } from 'lucide-react';
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';

const ExpensesPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { expenses, selectedExpenses, isLoading, error, viewMode, currentFilter, sortBy, sortOrder } = useAppSelector((state) => state.expenses);
  const { selectedStore } = useAppSelector((state) => state.profile);

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [deletedExpenseName, setDeletedExpenseName] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Load view mode from localStorage
  useEffect(() => {
    const savedViewMode = localStorage.getItem('expenses-view-mode');
    if (savedViewMode && (savedViewMode === 'table' || savedViewMode === 'card')) {
      dispatch(setViewMode(savedViewMode));
    }
  }, [dispatch]);

  useEffect(() => {
    fetchExpenses();
  }, [selectedStore, currentFilter, sortBy, sortOrder]);

  const fetchExpenses = async () => {
    const params = {
      store: selectedStore?.storeId,
      limit: 20,
      ...(currentFilter !== 'all' && { status: currentFilter }),
      ...(sortBy && { sortBy }),
      ...(sortOrder && { sortOrder })
    };

    await dispatch(getExpenses(params));
  };

  const handleViewModeChange = (mode) => {
    dispatch(setViewMode(mode));
    localStorage.setItem('expenses-view-mode', mode);
  };

  const handleSort = (column, order) => {
    dispatch(setSortOptions({ sortBy: column, sortOrder: order }));
  };

  const handleExpenseSelect = (expenseId) => {
    dispatch(toggleExpenseSelection(expenseId));
  };

  const handleSelectAll = () => {
    if (selectedExpenses.length === expenses.length) {
      dispatch(deselectAllExpenses());
    } else {
      dispatch(selectAllExpenses());
    }
  };

  const handleAddExpense = () => {
    router.push('/dashboard/expenses/add');
  };

  const handleEditExpense = (expense) => {
    router.push(`/dashboard/expenses/edit/${expense.id}`);
  };

  const handleViewExpense = (expense) => {
    router.push(`/dashboard/expenses/view/${expense.id}`);
  };

  const handleDeleteExpense = (expense) => {
    setExpenseToDelete(expense);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!expenseToDelete) return;

    setIsDeleting(true);
    try {
      await dispatch(deleteExpense({
        expenseId: expenseToDelete.id,
        storeId: selectedStore?.id
      }));
      setShowDeleteModal(false);
      setDeletedExpenseName(expenseToDelete.title);
      setExpenseToDelete(null);
      setShowDeleteSuccessModal(true);
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative overflow-hidden">
      <AnimatedBackground variant="default" />
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
        {/* Header */}
        <Header title="Expenses" description="Track and manage your business expenses" />

        {/* Main Content */}
        <div className="flex-1 p-5">
          <div className="max-w-8xl mx-auto">
            {/* Loading */}
            {isLoading && expenses.length === 0 && (
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-8 mb-6">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-2"> Loading Expenses... </h2>
                    <p className="text-[rgb(var(--color-text-secondary))]"> Please wait while we fetch your expenses </p>
                  </div>
                </div>
              </div>
            )}

            {/* Search and Filter Card */}
            {expenses.length > 0 && (
              <div className="mb-3">
                <div className="flex justify-between items-center lg:flex-row gap-4 mb-0">
                  {/* Search */}
                  <div className="w-100 bg-red">
                    <Input
                      type="text"
                      placeholder="Search expenses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      leftIcon={Search}
                      className="w-100"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {/* View Toggle */}
                    <div className="flex bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                      <button
                        onClick={() => handleViewModeChange('table')}
                        className={`px-3 cursor-pointer py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === 'table'
                          ? 'bg-[rgb(var(--color-primary))] text-white'
                          : 'text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]'
                          }`}
                      >
                        <List className="w-4 h-4" />
                        Table
                      </button>
                      <button
                        onClick={() => handleViewModeChange('card')}
                        className={`px-3 cursor-pointer py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === 'card'
                          ? 'bg-[rgb(var(--color-primary))] text-white'
                          : 'text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]'
                          }`}
                      >
                        <Grid3X3 className="w-4 h-4" />
                        Cards
                      </button>
                    </div>

                    <Button variant="primary" onClick={handleAddExpense} leftIcon={Plus}> Add Expense </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && expenses.length === 0 && (
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))]">
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 bg-[rgb(var(--color-bg-tertiary))] rounded-full flex items-center justify-center mb-4">
                    <IndianRupee className="w-8 h-8 text-[rgb(var(--color-text-tertiary))]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                    No expenses found
                  </h3>
                  <p className="text-[rgb(var(--color-text-secondary))] text-center max-w-md mb-4">
                    No expenses match your current criteria. Try adjusting your search or add new expenses.
                  </p>
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 max-w-md">
                      <p className="text-red-600 text-sm">
                        <strong>Error:</strong> {error}
                      </p>
                    </div>
                  )}
                  <div className="pt-4">
                    <Button variant="primary" onClick={handleAddExpense} leftIcon={Plus}> Add Expense </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Expenses List */}
            {expenses.length > 0 && (
              <div className="bg-[rgb(var(--color-bg-primary))] rounded-xl border border-[rgb(var(--color-border-primary))] overflow-hidden">
                <div className="h-[calc(100vh-200px)] overflow-y-auto">
                  {viewMode === 'table' ? (
                    <div className="h-full">
                      <ExpenseTable
                        expenses={expenses}
                        selectedExpenses={selectedExpenses}
                        onSelectExpense={handleExpenseSelect}
                        onSelectAllExpenses={handleSelectAll}
                        onEdit={handleEditExpense}
                        onDelete={handleDeleteExpense}
                        onView={handleViewExpense}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSort={handleSort}
                      />
                    </div>
                  ) : (
                    <div>
                      {/* Select All Header for Card View */}
                      {expenses.length > 0 && (
                        <div className="bg-gradient-to-r from-[rgb(var(--color-bg-tertiary))] to-[rgb(var(--color-bg-secondary))] border-b border-[rgb(var(--color-border-primary))] px-6 py-4 sticky top-0 z-20">
                          <div className="flex items-center gap-4">
                            <input
                              type="checkbox"
                              checked={selectedExpenses.length === expenses.length && expenses.length > 0}
                              onChange={(e) => handleSelectAll(e.target.checked)}
                              className="w-4 h-4 text-[rgb(var(--color-primary))] border-[rgb(var(--color-border-primary))] rounded focus:ring-[rgb(var(--color-primary))] focus:ring-2"
                            />
                            <span className="text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wider">
                              Select all {expenses.length} expenses
                            </span>
                            {selectedExpenses.length > 0 && (
                              <span className="text-xs text-[rgb(var(--color-primary))] font-medium">
                                ({selectedExpenses.length} selected)
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {expenses.map((expense) => (
                          <ExpenseCard
                            key={expense.id}
                            expense={expense}
                            isSelected={selectedExpenses.includes(expense.id)}
                            onSelect={handleExpenseSelect}
                            onEdit={handleEditExpense}
                            onDelete={handleDeleteExpense}
                            onView={handleViewExpense}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Fixed Footer */}
                <div className="bg-[rgb(var(--color-bg-tertiary))] border-t border-[rgb(var(--color-border-primary))] px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                      Showing <span className="font-semibold text-[rgb(var(--color-text-primary))]">{expenses.length}</span> expenses
                      <span className="ml-2 text-xs text-[rgb(var(--color-text-tertiary))]">
                        • All expenses loaded
                      </span>
                    </div>
                    <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                      {selectedExpenses.length > 0 && (
                        <span className="font-semibold text-[rgb(var(--color-primary))]">
                          {selectedExpenses.length} selected
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-[9999]">
          <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">
              Delete Expense
            </h3>
            <p className="text-[rgb(var(--color-text-secondary))] mb-6">
              Are you sure you want to delete "{expenseToDelete?.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDelete} loading={isDeleting}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Success Modal */}
      {showDeleteSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-[9999]">
          <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-[rgb(var(--color-success))] mb-4">
              Success
            </h3>
            <p className="text-[rgb(var(--color-text-secondary))] mb-6">
              "{deletedExpenseName}" has been deleted successfully.
            </p>
            <div className="flex gap-3 justify-end">
              <Button onClick={() => setShowDeleteSuccessModal(false)}>
                OK
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesPage;
