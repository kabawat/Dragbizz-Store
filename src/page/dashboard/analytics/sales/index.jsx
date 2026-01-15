"use client"
import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { useAppSelector } from '@/store/hooks';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { BarChart3, TrendingUp, ShoppingCart, Calendar } from 'lucide-react';
import { Card } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { SortableMetricCard, SortableCard } from '@/components/analytics/SortableComponents';

const SalesAnalytics = () => {
  const { t } = useTranslation();
  const { selectedStore } = useAppSelector((state) => state.profile);
  
  const [metrics, setMetrics] = useState([
    { id: 'totalSales', title: 'Total Sales', value: '0', change: '+0.0% from last period', icon: ShoppingCart, iconColor: 'from-blue-100 to-blue-200', textColor: 'text-[rgb(var(--color-text-primary))]' },
    { id: 'avgOrderValue', title: 'Avg Order Value', value: '₹0', change: '+0.0% from last period', icon: BarChart3, iconColor: 'from-green-100 to-green-200', textColor: 'text-[rgb(var(--color-text-primary))]' },
    { id: 'conversionRate', title: 'Conversion Rate', value: '0%', change: 'Steady growth', icon: TrendingUp, iconColor: 'from-purple-100 to-purple-200', textColor: 'text-[rgb(var(--color-text-primary))]' },
    { id: 'salesTarget', title: 'Sales Target', value: '0', change: '0% achieved', icon: Calendar, iconColor: 'from-orange-100 to-orange-200', textColor: 'text-[rgb(var(--color-text-primary))]' },
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Today</p>
                                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">0</p>
                                </div>
                                <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">This Week</p>
                                  <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">0</p>
                                </div>
                                <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">This Month</p>
                                  <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">0</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">This Quarter</p>
                                  <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">0</p>
                                </div>
                                <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">This Year</p>
                                  <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">0</p>
                                </div>
                                <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">All Time</p>
                                  <p className="text-lg font-semibold text-teal-600 dark:text-teal-400">0</p>
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

export default SalesAnalytics;
