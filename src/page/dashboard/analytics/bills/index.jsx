"use client"
import React, { useState, useMemo } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { useAppSelector } from '@/store/hooks';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Receipt, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { SortableMetricCard, SortableCard } from '@/components/analytics/SortableComponents';

const BillAnalytics = () => {
  const { t } = useTranslation();
  const { selectedStore } = useAppSelector((state) => state.profile);
  
  // Mock data structure matching API: { counts: {...}, amounts: {...} }
  const analytics = useMemo(() => ({
    counts: {
      totalBills: 0,
      paidBills: 0,
      pendingBills: 0,
      overdueBills: 0
    },
    amounts: {
      totalPayable: 0,
      totalPaid: 0,
      totalDue: 0
    }
  }), []);

  const formatNumber = (num) => (num || 0).toLocaleString('en-IN');
  const formatCurrency = (amount) => `₹${(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  
  const [metrics, setMetrics] = useState([
    { 
      id: 'totalBills', 
      title: 'Total Bills', 
      value: formatNumber(analytics.counts.totalBills), 
      change: `${formatNumber(analytics.counts.paidBills)} paid, ${formatNumber(analytics.counts.pendingBills)} pending`, 
      icon: Receipt, 
      iconColor: 'from-red-100 to-red-200', 
      textColor: 'text-[rgb(var(--color-text-primary))]' 
    },
    { 
      id: 'paidBills', 
      title: 'Paid Bills', 
      value: formatNumber(analytics.counts.paidBills), 
      change: formatCurrency(analytics.amounts.totalPaid), 
      icon: CheckCircle, 
      iconColor: 'from-green-100 to-green-200', 
      textColor: 'text-[rgb(var(--color-text-primary))]' 
    },
    { 
      id: 'pendingBills', 
      title: 'Pending Bills', 
      value: formatNumber(analytics.counts.pendingBills), 
      change: formatCurrency(analytics.amounts.totalDue), 
      icon: AlertTriangle, 
      iconColor: 'from-yellow-100 to-yellow-200', 
      textColor: 'text-[rgb(var(--color-text-primary))]' 
    },
    { 
      id: 'overdueBills', 
      title: 'Overdue Bills', 
      value: formatNumber(analytics.counts.overdueBills), 
      change: 'Urgent action needed', 
      icon: XCircle, 
      iconColor: 'from-orange-100 to-orange-200', 
      textColor: 'text-[rgb(var(--color-text-primary))]' 
    },
  ]);

  const [amountCards, setAmountCards] = useState([
    { id: 'amount1', type: 'amount', title: 'Total Payable', value: formatCurrency(analytics.amounts.totalPayable), label: 'Total amount payable', color: 'text-red-600 dark:text-red-400' },
    { id: 'amount2', type: 'amount', title: 'Total Paid', value: formatCurrency(analytics.amounts.totalPaid), label: 'Total amount paid', color: 'text-green-600 dark:text-green-400' },
    { id: 'amount3', type: 'amount', title: 'Total Due', value: formatCurrency(analytics.amounts.totalDue), label: 'Outstanding amount', color: 'text-orange-600 dark:text-orange-400' },
  ]);

  const [cards, setCards] = useState([
    { id: 'chart1', type: 'chart', title: 'Bill Status Trend' },
    { id: 'chart2', type: 'chart', title: 'Bills by Supplier' },
    { id: 'breakdown', type: 'breakdown', title: 'Bill Statistics' },
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
          title={t('dashboard.billAnalytics') || 'Bill Analytics'}
          description="View detailed bill analytics and insights"
        />

        <div className="flex-1 p-6 overflow-y-auto">
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
                    {card.type === 'chart' && (
                        <Card>
                          <div className="p-6">
                            <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-4">
                              {card.title}
                            </h3>
                            <div className="h-64 bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg flex items-center justify-center border-[var(--color-border-primary-light)]">
                              <p className="text-sm text-[rgb(var(--color-text-tertiary))]">Chart will be displayed here</p>
                            </div>
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
                                <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Paid Bills</p>
                                <p className="text-lg font-semibold text-green-600 dark:text-green-400">{formatNumber(analytics.counts.paidBills)}</p>
                                <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-1">{formatCurrency(analytics.amounts.totalPaid)}</p>
                              </div>
                              <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Pending Bills</p>
                                <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">{formatNumber(analytics.counts.pendingBills)}</p>
                                <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-1">{formatCurrency(analytics.amounts.totalDue)}</p>
                              </div>
                              <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Overdue Bills</p>
                                <p className="text-lg font-semibold text-red-600 dark:text-red-400">{formatNumber(analytics.counts.overdueBills)}</p>
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
        </div>
      </div>
    </div>
  );
};

export default BillAnalytics;
