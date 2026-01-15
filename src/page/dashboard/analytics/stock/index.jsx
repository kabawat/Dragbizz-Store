"use client"
import React, { useState, useMemo } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { useAppSelector } from '@/store/hooks';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Warehouse, Package, AlertTriangle, XCircle, IndianRupee } from 'lucide-react';
import { Card } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { SortableMetricCard, SortableCard } from '@/components/analytics/SortableComponents';

const StockAnalytics = () => {
  const { t } = useTranslation();
  const { selectedStore } = useAppSelector((state) => state.profile);
  
  // Mock data structure matching API: { totals: {...}, valueSummary: { averageCost, totalStockValue } }
  const analytics = useMemo(() => ({
    totals: {
      totalSkus: 0,
      totalQuantity: 0,
      availableQuantity: 0,
      reservedQuantity: 0,
      soldQuantity: 0,
      lowStockItems: 0,
      outOfStockItems: 0
    },
    valueSummary: {
      averageCost: 0,
      totalStockValue: 0
    }
  }), []);

  const formatNumber = (num) => (num || 0).toLocaleString('en-IN');
  const formatCurrency = (amount) => `₹${(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  
  const [metrics, setMetrics] = useState([
    { 
      id: 'totalSKUs', 
      title: 'Total SKUs', 
      value: formatNumber(analytics.totals.totalSkus), 
      change: `${formatNumber(analytics.totals.availableQuantity)} available`, 
      icon: Package, 
      iconColor: 'from-indigo-100 to-indigo-200', 
      textColor: 'text-[rgb(var(--color-text-primary))]' 
    },
    { 
      id: 'totalQuantity', 
      title: 'Total Quantity', 
      value: formatNumber(analytics.totals.totalQuantity), 
      change: `${formatNumber(analytics.totals.availableQuantity)} available`, 
      icon: Warehouse, 
      iconColor: 'from-green-100 to-green-200', 
      textColor: 'text-[rgb(var(--color-text-primary))]' 
    },
    { 
      id: 'lowStock', 
      title: 'Low Stock Items', 
      value: formatNumber(analytics.totals.lowStockItems), 
      change: 'Needs attention', 
      icon: AlertTriangle, 
      iconColor: 'from-yellow-100 to-yellow-200', 
      textColor: 'text-[rgb(var(--color-text-primary))]' 
    },
    { 
      id: 'outOfStock', 
      title: 'Out of Stock', 
      value: formatNumber(analytics.totals.outOfStockItems), 
      change: 'Urgent action needed', 
      icon: XCircle, 
      iconColor: 'from-red-100 to-red-200', 
      textColor: 'text-[rgb(var(--color-text-primary))]' 
    },
  ]);

  const [cards, setCards] = useState([
    { id: 'status1', type: 'status', title: 'Available Stock', value: formatNumber(analytics.totals.availableQuantity), label: 'Items in stock', color: 'text-green-600 dark:text-green-400' },
    { id: 'status2', type: 'status', title: 'Reserved Stock', value: formatNumber(analytics.totals.reservedQuantity), label: 'Items reserved', color: 'text-yellow-600 dark:text-yellow-400' },
    { id: 'status3', type: 'status', title: 'Sold Stock', value: formatNumber(analytics.totals.soldQuantity), label: 'Items sold', color: 'text-blue-600 dark:text-blue-400' },
    { id: 'chart1', type: 'chart', title: 'Stock Trend' },
    { id: 'chart2', type: 'chart', title: 'Stock by Category' },
    { id: 'breakdown', type: 'breakdown', title: 'Stock Value Breakdown' },
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
          title={t('dashboard.stockAnalytics') || 'Stock Analytics'}
          description="View detailed stock analytics and insights"
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
                      {card.type === 'status' && (
                        <Card>
                          <div className="p-4">
                            <h3 className="text-sm font-semibold text-[rgb(var(--color-text-primary))] mb-3 text-center">
                              {card.title}
                            </h3>
                            <div className="text-center">
                              <p className={`text-2xl font-bold ${card.color} mb-1`}>{card.value}</p>
                              <p className="text-xs text-[rgb(var(--color-text-secondary))]">{card.label}</p>
                            </div>
                          </div>
                        </Card>
                      )}
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Total Stock Value</p>
                                <p className="text-lg font-semibold text-green-600 dark:text-green-400">{formatCurrency(analytics.valueSummary.totalStockValue)}</p>
                              </div>
                              <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Average Cost</p>
                                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(analytics.valueSummary.averageCost)}</p>
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

export default StockAnalytics;
