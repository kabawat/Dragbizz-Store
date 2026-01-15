"use client"
import React, { useState, useMemo } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { useAppSelector } from '@/store/hooks';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { FileText, CheckCircle, XCircle, FileX } from 'lucide-react';
import { Card } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { SortableMetricCard, SortableCard } from '@/components/analytics/SortableComponents';

const SalesAnalytics = () => {
  const { t } = useTranslation();
  const { selectedStore } = useAppSelector((state) => state.profile);
  
  // Mock data structure matching Invoice Analytics API: { counts: {...}, amounts: {...}, today: {...} }
  const analytics = useMemo(() => ({
    counts: {
      totalInvoices: 0,
      releasedInvoices: 0,
      draftInvoices: 0,
      cancelledInvoices: 0
    },
    amounts: {
      totalAmount: 0,
      averageOrderValue: 0
    },
    today: {
      totalInvoices: 0,
      releasedInvoices: 0
    }
  }), []);

  const formatNumber = (num) => (num || 0).toLocaleString('en-IN');
  const formatCurrency = (amount) => `₹${(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  
  const [metrics, setMetrics] = useState([
    { 
      id: 'totalInvoices', 
      title: 'Total Invoices', 
      value: formatNumber(analytics.counts.totalInvoices), 
      change: `${formatNumber(analytics.counts.releasedInvoices)} released, ${formatNumber(analytics.counts.draftInvoices)} draft`, 
      icon: FileText, 
      iconColor: 'from-blue-100 to-blue-200', 
      textColor: 'text-[rgb(var(--color-text-primary))]' 
    },
    { 
      id: 'releasedInvoices', 
      title: 'Released Invoices', 
      value: formatNumber(analytics.counts.releasedInvoices), 
      change: formatCurrency(analytics.amounts.totalAmount), 
      icon: CheckCircle, 
      iconColor: 'from-green-100 to-green-200', 
      textColor: 'text-[rgb(var(--color-text-primary))]' 
    },
    { 
      id: 'draftInvoices', 
      title: 'Draft Invoices', 
      value: formatNumber(analytics.counts.draftInvoices), 
      change: 'Pending release', 
      icon: FileText, 
      iconColor: 'from-yellow-100 to-yellow-200', 
      textColor: 'text-[rgb(var(--color-text-primary))]' 
    },
    { 
      id: 'cancelledInvoices', 
      title: 'Cancelled Invoices', 
      value: formatNumber(analytics.counts.cancelledInvoices), 
      change: 'Cancelled', 
      icon: XCircle, 
      iconColor: 'from-red-100 to-red-200', 
      textColor: 'text-[rgb(var(--color-text-primary))]' 
    },
  ]);

  const [cards, setCards] = useState([
    { id: 'chart1', type: 'chart', title: 'Sales Trend' },
    { id: 'chart2', type: 'chart', title: 'Sales by Product' },
    { id: 'breakdown', type: 'breakdown', title: 'Sales Breakdown' },
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
          title={t('dashboard.salesAnalytics') || 'Sales Analytics'}
          description="View detailed sales analytics and insights"
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
                                <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Today's Invoices</p>
                                <p className="text-lg font-semibold text-green-600 dark:text-green-400">{formatNumber(analytics.today.totalInvoices)}</p>
                                <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-1">{formatNumber(analytics.today.releasedInvoices)} released</p>
                              </div>
                              <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Total Amount</p>
                                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(analytics.amounts.totalAmount)}</p>
                              </div>
                              <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Avg Order Value</p>
                                <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">{formatCurrency(analytics.amounts.averageOrderValue)}</p>
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

export default SalesAnalytics;
