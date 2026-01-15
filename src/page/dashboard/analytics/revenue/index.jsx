"use client"
import React, { useState, useMemo } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { useAppSelector } from '@/store/hooks';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { LineChart, TrendingUp, IndianRupee, Calendar, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { SortableMetricCard, SortableCard } from '@/components/analytics/SortableComponents';

const RevenueAnalytics = () => {
  const { t } = useTranslation();
  const { selectedStore } = useAppSelector((state) => state.profile);
  
  // Mock data structure matching API: 
  const analytics = useMemo(() => ({
    summary: {
      totalRevenue: 0,
      totalProfit: 0,
      totalDiscount: 0,
      totalGst: 0,
      profitMargin: 0
    },
    today: {
      revenue: 0,
      profit: 0,
      sales: 0
    },
    change: {
      revenue: 0,
      profit: 0,
      sales: 0,
      changeType: {
        revenue: "up",
        profit: "up",
        sales: "up"
      }
    }
  }), []);

  const formatCurrency = (amount) => `₹${(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatNumber = (num) => (num || 0).toLocaleString('en-IN');
  const formatPercent = (num) => `${(num || 0).toFixed(2)}%`;
  
  const [metrics, setMetrics] = useState([
    { 
      id: 'totalRevenue', 
      title: 'Total Revenue', 
      value: formatCurrency(analytics.summary.totalRevenue), 
      change: `${analytics.change.changeType.revenue === 'up' ? '+' : '-'}${formatPercent(analytics.change.revenue)} from last period`, 
      icon: IndianRupee, 
      iconColor: 'from-green-100 to-green-200', 
      textColor: 'text-[rgb(var(--color-text-primary))]' 
    },
    { 
      id: 'totalProfit', 
      title: 'Total Profit', 
      value: formatCurrency(analytics.summary.totalProfit), 
      change: `${analytics.change.changeType.profit === 'up' ? '+' : '-'}${formatPercent(analytics.change.profit)} from last period`, 
      icon: DollarSign, 
      iconColor: 'from-blue-100 to-blue-200', 
      textColor: 'text-[rgb(var(--color-text-primary))]' 
    },
    { 
      id: 'profitMargin', 
      title: 'Profit Margin', 
      value: formatPercent(analytics.summary.profitMargin), 
      change: 'Overall margin', 
      icon: TrendingUp, 
      iconColor: 'from-purple-100 to-purple-200', 
      textColor: 'text-[rgb(var(--color-text-primary))]' 
    },
    { 
      id: 'todayRevenue', 
      title: 'Today\'s Revenue', 
      value: formatCurrency(analytics.today.revenue), 
      change: `${formatNumber(analytics.today.sales)} sales`, 
      icon: Calendar, 
      iconColor: 'from-orange-100 to-orange-200', 
      textColor: 'text-[rgb(var(--color-text-primary))]' 
    },
  ]);

  const [cards, setCards] = useState([
    { id: 'chart1', type: 'chart', title: 'Revenue Trend' },
    { id: 'chart2', type: 'chart', title: 'Revenue by Source' },
    { id: 'breakdown', type: 'breakdown', title: 'Revenue Breakdown' },
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
          title={t('dashboard.revenueAnalytics') || 'Revenue Analytics'}
          description="View detailed revenue analytics and insights"
        />

        <div className="flex-1 p-6 overflow-y-auto">
          {/* Key Metrics - Draggable */}
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

          {/* All Cards - Draggable */}
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
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Today Revenue</p>
                                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">{formatCurrency(analytics.today.revenue)}</p>
                                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-1">{formatNumber(analytics.today.sales)} sales</p>
                                </div>
                                <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Today Profit</p>
                                  <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(analytics.today.profit)}</p>
                                </div>
                                <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Total Revenue</p>
                                  <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">{formatCurrency(analytics.summary.totalRevenue)}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Total Profit</p>
                                  <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">{formatCurrency(analytics.summary.totalProfit)}</p>
                                </div>
                                <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Total Discount</p>
                                  <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">{formatCurrency(analytics.summary.totalDiscount)}</p>
                                </div>
                                <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Total GST</p>
                                  <p className="text-lg font-semibold text-teal-600 dark:text-teal-400">{formatCurrency(analytics.summary.totalGst)}</p>
                                </div>
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

export default RevenueAnalytics;

