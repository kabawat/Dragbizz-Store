"use client"
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { getCustomerAnalytics } from '@/store/slices/customersSlice';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Users, UserPlus, Calendar } from 'lucide-react';
import { Card } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { SortableMetricCard, SortableCard } from '@/components/analytics/SortableComponents';

const CustomerAnalytics = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { analytics, isLoading } = useAppSelector((state) => state.customers);
  const hasFetchedRef = useRef({ storeId: null, fetched: false });
  
  useEffect(() => {
    const storeId = selectedStore?._id || selectedStore?.id || selectedStore?.storeId;
    if (!storeId) return;
    
    const lastFetched = hasFetchedRef.current;
    if (lastFetched.fetched && lastFetched.storeId === storeId) {
      return;
    }
    
    hasFetchedRef.current = { storeId, fetched: true };
    dispatch(getCustomerAnalytics(storeId));
  }, [dispatch, selectedStore?._id, selectedStore?.id, selectedStore?.storeId]);
  
  useEffect(() => {
    const storeId = selectedStore?._id || selectedStore?.id || selectedStore?.storeId;
    if (storeId && hasFetchedRef.current.storeId !== storeId) {
      hasFetchedRef.current = { storeId: null, fetched: false };
    }
  }, [selectedStore?._id, selectedStore?.id, selectedStore?.storeId]);
  
  // Memoize derived values
  const newCustomers = useMemo(() => analytics?.newCustomers || {
    last1Day: 0,
    last7Days: 0,
    last15Days: 0,
    last30Days: 0,
    last3Months: 0,
    last6Months: 0,
    last12Months: 0
  }, [analytics?.newCustomers]);

  const formatNumber = (num) => (num || 0).toLocaleString('en-IN');
  
  const [metrics, setMetrics] = useState([
    { 
      id: 'totalCustomers', 
      title: 'Total Customers', 
      value: '0', 
      change: '0 today', 
      icon: Users, 
      iconColor: 'from-orange-100 to-orange-200', 
      textColor: 'text-[rgb(var(--color-text-primary))]' 
    },
    { 
      id: 'todayCustomers', 
      title: 'Today\'s Customers', 
      value: '0', 
      change: 'New today', 
      icon: Calendar, 
      iconColor: 'from-blue-100 to-blue-200', 
      textColor: 'text-[rgb(var(--color-text-primary))]' 
    },
    { 
      id: 'last7Days', 
      title: 'Last 7 Days', 
      value: '0', 
      change: 'New customers', 
      icon: UserPlus, 
      iconColor: 'from-green-100 to-green-200', 
      textColor: 'text-[rgb(var(--color-text-primary))]' 
    },
    { 
      id: 'last30Days', 
      title: 'Last 30 Days', 
      value: '0', 
      change: 'New customers', 
      icon: UserPlus, 
      iconColor: 'from-purple-100 to-purple-200', 
      textColor: 'text-[rgb(var(--color-text-primary))]' 
    },
  ]);

  // Update metrics when analytics data changes
  useEffect(() => {
    if (analytics) {
      setMetrics((prevMetrics) => {
        const metricsMap = new Map(prevMetrics.map(m => [m.id, m]));
        
        if (metricsMap.has('totalCustomers')) {
          metricsMap.set('totalCustomers', {
            ...metricsMap.get('totalCustomers'),
            value: formatNumber(analytics.totalCustomers || 0),
            change: `${formatNumber(analytics.todayCustomers || 0)} today`
          });
        }
        if (metricsMap.has('todayCustomers')) {
          metricsMap.set('todayCustomers', {
            ...metricsMap.get('todayCustomers'),
            value: formatNumber(analytics.todayCustomers || 0),
            change: 'New today'
          });
        }
        if (metricsMap.has('last7Days')) {
          metricsMap.set('last7Days', {
            ...metricsMap.get('last7Days'),
            value: formatNumber(newCustomers.last7Days),
            change: 'New customers'
          });
        }
        if (metricsMap.has('last30Days')) {
          metricsMap.set('last30Days', {
            ...metricsMap.get('last30Days'),
            value: formatNumber(newCustomers.last30Days),
            change: 'New customers'
          });
        }
        
        return Array.from(metricsMap.values());
      });
    }
  }, [analytics, newCustomers]);

  const [cards, setCards] = useState([
    { id: 'chart1', type: 'chart', title: 'Customer Growth Trend' },
    { id: 'chart2', type: 'chart', title: 'Customer Segments' },
    { id: 'breakdown', type: 'breakdown', title: 'Customer Statistics' },
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
          title={t('dashboard.customerAnalytics') || 'Customer Analytics'}
          description="View detailed customer analytics and insights"
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
                                <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Last 7 Days</p>
                                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{formatNumber(newCustomers.last7Days)}</p>
                              </div>
                              <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Last 30 Days</p>
                                <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">{formatNumber(newCustomers.last30Days)}</p>
                              </div>
                              <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Last 3 Months</p>
                                <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">{formatNumber(newCustomers.last3Months)}</p>
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

export default CustomerAnalytics;
