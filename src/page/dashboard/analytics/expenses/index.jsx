"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { getExpenseAnalytics } from '@/store/slices/expensesSlice';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { DollarSign, CheckCircle, AlertTriangle, Calendar, PieChart, CreditCard } from 'lucide-react';
import { Card } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { SortableMetricCard, SortableCard } from '@/components/analytics/SortableComponents';

const ExpenseAnalytics = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { analytics, isLoading } = useAppSelector((state) => state.expenses);
  
  // Format currency
  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Format number
  const formatNumber = (num) => {
    return (num || 0).toLocaleString('en-IN');
  };

  // Fetch analytics data
  useEffect(() => {
    if (selectedStore?.id) {
      dispatch(getExpenseAnalytics(selectedStore.id));
    }
  }, [dispatch, selectedStore]);

  // Memoize derived values to prevent infinite loops
  const counts = useMemo(() => analytics?.counts || {}, [analytics?.counts]);
  const amounts = useMemo(() => analytics?.amounts || {}, [analytics?.amounts]);
  
  // Convert Map to Object if needed
  const categoryData = useMemo(() => {
    const byCategory = analytics?.byCategory || {};
    return byCategory instanceof Map 
      ? Object.fromEntries(byCategory) 
      : byCategory;
  }, [analytics?.byCategory]);
  
  const paymentMethodData = useMemo(() => {
    const byPaymentMethod = analytics?.byPaymentMethod || {};
    return byPaymentMethod instanceof Map 
      ? Object.fromEntries(byPaymentMethod) 
      : byPaymentMethod;
  }, [analytics?.byPaymentMethod]);

  // State for drag-and-drop functionality - initialize with default values
  const [metrics, setMetrics] = useState([
    { 
      id: 'totalExpenses', 
      title: 'Total Expenses', 
      value: '0', 
      change: '0 paid, 0 pending', 
      icon: DollarSign, 
      iconColor: 'from-red-100 to-red-200', 
      textColor: 'text-[rgb(var(--color-text-primary))]' 
    },
    { 
      id: 'todayExpenses', 
      title: 'Today\'s Expenses', 
      value: '0', 
      change: '₹0.00', 
      icon: Calendar, 
      iconColor: 'from-blue-100 to-blue-200', 
      textColor: 'text-[rgb(var(--color-text-primary))]' 
    },
    { 
      id: 'paidExpenses', 
      title: 'Paid Expenses', 
      value: '0', 
      change: '₹0.00', 
      icon: CheckCircle, 
      iconColor: 'from-green-100 to-green-200', 
      textColor: 'text-[rgb(var(--color-text-primary))]' 
    },
    { 
      id: 'pendingExpenses', 
      title: 'Pending Expenses', 
      value: '0', 
      change: '₹0.00', 
      icon: AlertTriangle, 
      iconColor: 'from-yellow-100 to-yellow-200', 
      textColor: 'text-[rgb(var(--color-text-primary))]' 
    },
  ]);

  const [amountCards, setAmountCards] = useState([
    { id: 'amount1', type: 'amount', title: 'Total Amount', value: '₹0.00', label: 'Total expenses amount', color: 'text-red-600 dark:text-red-400' },
    { id: 'amount2', type: 'amount', title: 'Net Amount', value: '₹0.00', label: 'Net amount (excluding GST)', color: 'text-indigo-600 dark:text-indigo-400' },
    { id: 'amount3', type: 'amount', title: 'GST Amount', value: '₹0.00', label: 'Total GST amount', color: 'text-teal-600 dark:text-teal-400' },
  ]);

  // Update metrics when analytics data changes (only update values, preserve order for drag)
  useEffect(() => {
    if (analytics && counts && amounts) {
      setMetrics((prevMetrics) => {
        const metricsMap = new Map(prevMetrics.map(m => [m.id, m]));
        
        // Update values while preserving order
        if (metricsMap.has('totalExpenses')) {
          metricsMap.set('totalExpenses', {
            ...metricsMap.get('totalExpenses'),
            value: formatNumber(counts.totalExpenses),
            change: `${formatNumber(counts.paidExpenses)} paid, ${formatNumber(counts.pendingExpenses)} pending`
          });
        }
        if (metricsMap.has('todayExpenses')) {
          metricsMap.set('todayExpenses', {
            ...metricsMap.get('todayExpenses'),
            value: formatNumber(counts.todayExpenses),
            change: formatCurrency(amounts.todayAmount)
          });
        }
        if (metricsMap.has('paidExpenses')) {
          metricsMap.set('paidExpenses', {
            ...metricsMap.get('paidExpenses'),
            value: formatNumber(counts.paidExpenses),
            change: formatCurrency(amounts.paidAmount)
          });
        }
        if (metricsMap.has('pendingExpenses')) {
          metricsMap.set('pendingExpenses', {
            ...metricsMap.get('pendingExpenses'),
            value: formatNumber(counts.pendingExpenses),
            change: formatCurrency(amounts.pendingAmount)
          });
        }
        
        return Array.from(metricsMap.values());
      });

      setAmountCards((prevCards) => {
        const cardsMap = new Map(prevCards.map(c => [c.id, c]));
        
        if (cardsMap.has('amount1')) {
          cardsMap.set('amount1', {
            ...cardsMap.get('amount1'),
            value: formatCurrency(amounts.totalAmount)
          });
        }
        if (cardsMap.has('amount2')) {
          cardsMap.set('amount2', {
            ...cardsMap.get('amount2'),
            value: formatCurrency(amounts.totalNetAmount)
          });
        }
        if (cardsMap.has('amount3')) {
          cardsMap.set('amount3', {
            ...cardsMap.get('amount3'),
            value: formatCurrency(amounts.totalGstAmount)
          });
        }
        
        return Array.from(cardsMap.values());
      });
    }
  }, [analytics, counts.totalExpenses, counts.paidExpenses, counts.pendingExpenses, counts.todayExpenses, amounts.totalAmount, amounts.totalNetAmount, amounts.totalGstAmount, amounts.todayAmount, amounts.paidAmount, amounts.pendingAmount]);

  const [cards, setCards] = useState([
    { id: 'chart1', type: 'chart', title: 'Expenses by Category' },
    { id: 'chart2', type: 'chart', title: 'Expenses by Payment Method' },
    { id: 'breakdown', type: 'breakdown', title: 'Expense Breakdown' },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleMetricsDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setMetrics((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAmountCardsDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setAmountCards((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleCardsDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setCards((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative">
      <Sidebar />

      <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
        <Header
          title={t('dashboard.expenseAnalytics') || 'Expense Analytics'}
          description="View detailed expense analytics and insights"
        />

        <div className="flex-1 p-6 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-sm text-[rgb(var(--color-text-tertiary))]">Loading analytics data...</p>
            </div>
          ) : (
            <>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleMetricsDragEnd}
              >
                <SortableContext items={metrics.map(m => m.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {metrics.map((metric) => (
                      <SortableMetricCard key={metric.id} {...metric} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

          {/* Amount Cards - Single Row */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleAmountCardsDragEnd}
          >
            <SortableContext items={amountCards.map(c => c.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {amountCards.map((card) => (
                  <SortableCard key={card.id} id={card.id}>
                    <Card>
                      <div className="p-4">
                        <h3 className="text-sm font-semibold text-[rgb(var(--color-text-primary))] mb-2 text-center">
                          {card.title}
                        </h3>
                        <div className="text-center">
                          <p className={`text-2xl font-bold ${card.color} mb-1`}>{card.value}</p>
                          <p className="text-xs text-[rgb(var(--color-text-secondary))]">{card.label}</p>
                        </div>
                      </div>
                    </Card>
                  </SortableCard>
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Other Cards */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleCardsDragEnd}
          >
            <SortableContext items={cards.map(c => c.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card) => (
                  <SortableCard key={card.id} id={card.id}>
                      {card.type === 'chart' && card.id === 'chart1' && (
                        <Card>
                          <div className="p-6">
                            <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-4">
                              {card.title}
                            </h3>
                            {categoryData && Object.keys(categoryData).length > 0 ? (
                              <div className="space-y-3">
                                {Object.entries(categoryData).map(([category, data]) => (
                                  <div key={category} className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-3 border-[var(--color-border-primary-light)]">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-sm font-medium text-[rgb(var(--color-text-primary))]">{category}</span>
                                      <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">{formatCurrency(data.amount)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-[rgb(var(--color-text-secondary))]">
                                      <span>{formatNumber(data.count)} expenses</span>
                                      <span>{amounts.totalAmount > 0 ? ((data.amount / amounts.totalAmount) * 100).toFixed(1) : 0}%</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="h-64 bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg flex items-center justify-center border-[var(--color-border-primary-light)]">
                                <p className="text-sm text-[rgb(var(--color-text-tertiary))]">No category data available</p>
                              </div>
                            )}
                          </div>
                        </Card>
                      )}
                      {card.type === 'chart' && card.id === 'chart2' && (
                        <Card>
                          <div className="p-6">
                            <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-4">
                              {card.title}
                            </h3>
                            {paymentMethodData && Object.keys(paymentMethodData).length > 0 ? (
                              <div className="space-y-3">
                                {Object.entries(paymentMethodData).map(([method, data]) => (
                                  <div key={method} className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-3 border-[var(--color-border-primary-light)]">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-sm font-medium text-[rgb(var(--color-text-primary))]">{method}</span>
                                      <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{formatCurrency(data.amount)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-[rgb(var(--color-text-secondary))]">
                                      <span>{formatNumber(data.count)} expenses</span>
                                      <span>{amounts.totalAmount > 0 ? ((data.amount / amounts.totalAmount) * 100).toFixed(1) : 0}%</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="h-64 bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg flex items-center justify-center border-[var(--color-border-primary-light)]">
                                <p className="text-sm text-[rgb(var(--color-text-tertiary))]">No payment method data available</p>
                              </div>
                            )}
                          </div>
                        </Card>
                      )}
                      {card.type === 'breakdown' && (
                        <Card>
                          <div className="p-6">
                            <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-4">
                              {card.title}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Paid Amount</p>
                                <p className="text-lg font-semibold text-green-600 dark:text-green-400">{formatCurrency(amounts.paidAmount)}</p>
                                <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-1">{formatNumber(counts.paidExpenses)} expenses</p>
                              </div>
                              <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Pending Amount</p>
                                <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">{formatCurrency(amounts.pendingAmount)}</p>
                                <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-1">{formatNumber(counts.pendingExpenses)} expenses</p>
                              </div>
                              <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Today's Amount</p>
                                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(amounts.todayAmount)}</p>
                                <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-1">{formatNumber(counts.todayExpenses)} expenses</p>
                              </div>
                            </div>
                          </div>
                        </Card>
                      )}
                    </SortableCard>
                ))}
              </div>
            </SortableContext>
          </DndContext>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseAnalytics;

