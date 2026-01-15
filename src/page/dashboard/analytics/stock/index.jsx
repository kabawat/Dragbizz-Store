"use client"
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { getStockAnalytics } from '@/store/slices/productsSlice';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Warehouse, Package, AlertTriangle, XCircle, IndianRupee } from 'lucide-react';
import { Card } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { SortableMetricCard, SortableCard } from '@/components/analytics/SortableComponents';

const StockAnalytics = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { analytics, isLoading } = useAppSelector((state) => state.products);
  const hasFetchedRef = useRef({ storeId: null, fetched: false });
  
  useEffect(() => {
    const storeId = selectedStore?._id || selectedStore?.id || selectedStore?.storeId;
    if (!storeId) return;
    
    const lastFetched = hasFetchedRef.current;
    if (lastFetched.fetched && lastFetched.storeId === storeId) {
      return;
    }
    
    hasFetchedRef.current = { storeId, fetched: true };
    dispatch(getStockAnalytics(storeId));
  }, [dispatch, selectedStore?._id, selectedStore?.id, selectedStore?.storeId]);
  
  useEffect(() => {
    const storeId = selectedStore?._id || selectedStore?.id || selectedStore?.storeId;
    if (storeId && hasFetchedRef.current.storeId !== storeId) {
      hasFetchedRef.current = { storeId: null, fetched: false };
    }
  }, [selectedStore?._id, selectedStore?.id, selectedStore?.storeId]);
  
  // Memoize derived values
  const totals = useMemo(() => analytics?.totals || {
    totalSkus: 0,
    totalQuantity: 0,
    availableQuantity: 0,
    reservedQuantity: 0,
    soldQuantity: 0,
    lowStockItems: 0,
    outOfStockItems: 0
  }, [analytics?.totals]);
  
  const valueSummary = useMemo(() => analytics?.valueSummary || {
    averageCost: 0,
    totalStockValue: 0
  }, [analytics?.valueSummary]);

  const formatNumber = (num) => (num || 0).toLocaleString('en-IN');
  const formatCurrency = (amount) => `₹${(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  
  const [metrics, setMetrics] = useState([
    { 
      id: 'totalSKUs', 
      title: 'Total SKUs', 
      value: '0', 
      change: '0 available', 
      icon: Package, 
      iconColor: 'from-indigo-100 to-indigo-200', 
      textColor: 'text-[rgb(var(--color-text-primary))]' 
    },
    { 
      id: 'totalQuantity', 
      title: 'Total Quantity', 
      value: '0', 
      change: '0 available', 
      icon: Warehouse, 
      iconColor: 'from-green-100 to-green-200', 
      textColor: 'text-[rgb(var(--color-text-primary))]' 
    },
    { 
      id: 'lowStock', 
      title: 'Low Stock Items', 
      value: '0', 
      change: 'Needs attention', 
      icon: AlertTriangle, 
      iconColor: 'from-yellow-100 to-yellow-200', 
      textColor: 'text-[rgb(var(--color-text-primary))]' 
    },
    { 
      id: 'outOfStock', 
      title: 'Out of Stock', 
      value: '0', 
      change: 'Urgent action needed', 
      icon: XCircle, 
      iconColor: 'from-red-100 to-red-200', 
      textColor: 'text-[rgb(var(--color-text-primary))]' 
    },
  ]);

  const [cards, setCards] = useState([
    { id: 'status1', type: 'status', title: 'Available Stock', value: '0', label: 'Items in stock', color: 'text-green-600 dark:text-green-400' },
    { id: 'status2', type: 'status', title: 'Reserved Stock', value: '0', label: 'Items reserved', color: 'text-yellow-600 dark:text-yellow-400' },
    { id: 'status3', type: 'status', title: 'Sold Stock', value: '0', label: 'Items sold', color: 'text-blue-600 dark:text-blue-400' },
    { id: 'chart1', type: 'chart', title: 'Stock Trend' },
    { id: 'chart2', type: 'chart', title: 'Stock by Category' },
    { id: 'breakdown', type: 'breakdown', title: 'Stock Value Breakdown' },
  ]);

  // Update metrics and cards when analytics data changes
  useEffect(() => {
    if (analytics && totals && valueSummary) {
      setMetrics((prevMetrics) => {
        const metricsMap = new Map(prevMetrics.map(m => [m.id, m]));
        
        if (metricsMap.has('totalSKUs')) {
          metricsMap.set('totalSKUs', {
            ...metricsMap.get('totalSKUs'),
            value: formatNumber(totals.totalSkus),
            change: `${formatNumber(totals.availableQuantity)} available`
          });
        }
        if (metricsMap.has('totalQuantity')) {
          metricsMap.set('totalQuantity', {
            ...metricsMap.get('totalQuantity'),
            value: formatNumber(totals.totalQuantity),
            change: `${formatNumber(totals.availableQuantity)} available`
          });
        }
        if (metricsMap.has('lowStock')) {
          metricsMap.set('lowStock', {
            ...metricsMap.get('lowStock'),
            value: formatNumber(totals.lowStockItems),
            change: 'Needs attention'
          });
        }
        if (metricsMap.has('outOfStock')) {
          metricsMap.set('outOfStock', {
            ...metricsMap.get('outOfStock'),
            value: formatNumber(totals.outOfStockItems),
            change: 'Urgent action needed'
          });
        }
        
        return Array.from(metricsMap.values());
      });

      setCards((prevCards) => {
        const cardsMap = new Map(prevCards.map(c => [c.id, c]));
        
        if (cardsMap.has('status1')) {
          cardsMap.set('status1', {
            ...cardsMap.get('status1'),
            value: formatNumber(totals.availableQuantity)
          });
        }
        if (cardsMap.has('status2')) {
          cardsMap.set('status2', {
            ...cardsMap.get('status2'),
            value: formatNumber(totals.reservedQuantity)
          });
        }
        if (cardsMap.has('status3')) {
          cardsMap.set('status3', {
            ...cardsMap.get('status3'),
            value: formatNumber(totals.soldQuantity)
          });
        }
        
        return Array.from(cardsMap.values());
      });
    }
  }, [analytics, totals, valueSummary]);

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
                                <p className="text-lg font-semibold text-green-600 dark:text-green-400">{formatCurrency(valueSummary.totalStockValue)}</p>
                              </div>
                              <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Average Cost</p>
                                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(valueSummary.averageCost)}</p>
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

export default StockAnalytics;
