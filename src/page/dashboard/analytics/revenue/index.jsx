"use client"
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { getRevenueAnalytics } from '@/store/slices/analyticsSlice';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { LineChart, TrendingUp, IndianRupee, Calendar, DollarSign, Download } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { SortableMetricCard, SortableCard } from '@/components/analytics/SortableComponents';
import RevenueReportTemplate from '@/components/analytics/revenue/RevenueReportTemplate';
import { useRevenueReportPrint } from './hooks/useRevenueReportPrint';

const RevenueAnalytics = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { revenue: analytics, isLoading } = useAppSelector((state) => state.analytics);
  const hasFetchedRef = useRef({ storeId: null, fetched: false });
  
  useEffect(() => {
    const storeId = selectedStore?._id || selectedStore?.id || selectedStore?.storeId;
    if (!storeId) return;
    
    const lastFetched = hasFetchedRef.current;
    if (lastFetched.fetched && lastFetched.storeId === storeId) {
      return;
    }
    
    hasFetchedRef.current = { storeId, fetched: true };
    dispatch(getRevenueAnalytics(storeId));
  }, [dispatch, selectedStore?._id, selectedStore?.id, selectedStore?.storeId]);
  
  useEffect(() => {
    const storeId = selectedStore?._id || selectedStore?.id || selectedStore?.storeId;
    if (storeId && hasFetchedRef.current.storeId !== storeId) {
      hasFetchedRef.current = { storeId: null, fetched: false };
    }
  }, [selectedStore?._id, selectedStore?.id, selectedStore?.storeId]);
  
  const summary = useMemo(() => analytics?.summary || {
    totalRevenue: 0,
    totalProfit: 0,
    totalDiscount: 0,
    totalGst: 0,
    profitMargin: 0
  }, [analytics?.summary]);
  
  const today = useMemo(() => analytics?.today || {
    revenue: 0,
    profit: 0,
    sales: 0
  }, [analytics?.today]);
  
  const change = useMemo(() => analytics?.change || {
    revenue: 0,
    profit: 0,
    sales: 0,
    changeType: {
      revenue: "up",
      profit: "up",
      sales: "up"
    }
  }, [analytics?.change]);

  const formatCurrency = (amount) => `₹${(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatNumber = (num) => (num || 0).toLocaleString('en-IN');
  const formatPercent = (num) => `${(num || 0).toFixed(2)}%`;
  
  const { handlePrint, handleDownloadPDF } = useRevenueReportPrint(isLoading, analytics);
  
  const [metrics, setMetrics] = useState([
    { 
      id: 'totalRevenue', 
      title: 'Total Revenue', 
      value: '₹0.00', 
      change: '+0.00% from last period', 
      icon: IndianRupee, 
      iconColor: 'from-green-100 to-green-200', 
      textColor: 'text-[rgb(var(--color-text-primary))]' 
    },
    { 
      id: 'totalProfit', 
      title: 'Total Profit', 
      value: '₹0.00', 
      change: '+0.00% from last period', 
      icon: DollarSign, 
      iconColor: 'from-blue-100 to-blue-200', 
      textColor: 'text-[rgb(var(--color-text-primary))]' 
    },
    { 
      id: 'profitMargin', 
      title: 'Profit Margin', 
      value: '0.00%', 
      change: 'Overall margin', 
      icon: TrendingUp, 
      iconColor: 'from-purple-100 to-purple-200', 
      textColor: 'text-[rgb(var(--color-text-primary))]' 
    },
    { 
      id: 'todayRevenue', 
      title: 'Today\'s Revenue', 
      value: '₹0.00', 
      change: '0 sales', 
      icon: Calendar, 
      iconColor: 'from-orange-100 to-orange-200', 
      textColor: 'text-[rgb(var(--color-text-primary))]' 
    },
  ]);

  useEffect(() => {
    if (analytics && summary && change && today) {
      setMetrics((prevMetrics) => {
        const metricsMap = new Map(prevMetrics.map(m => [m.id, m]));
        
        if (metricsMap.has('totalRevenue')) {
          metricsMap.set('totalRevenue', {
            ...metricsMap.get('totalRevenue'),
            value: formatCurrency(summary.totalRevenue),
            change: `${change.changeType?.revenue === 'up' ? '+' : '-'}${formatPercent(change.revenue)} from last period`
          });
        }
        if (metricsMap.has('totalProfit')) {
          metricsMap.set('totalProfit', {
            ...metricsMap.get('totalProfit'),
            value: formatCurrency(summary.totalProfit),
            change: `${change.changeType?.profit === 'up' ? '+' : '-'}${formatPercent(change.profit)} from last period`
          });
        }
        if (metricsMap.has('profitMargin')) {
          metricsMap.set('profitMargin', {
            ...metricsMap.get('profitMargin'),
            value: formatPercent(summary.profitMargin),
            change: 'Overall margin'
          });
        }
        if (metricsMap.has('todayRevenue')) {
          metricsMap.set('todayRevenue', {
            ...metricsMap.get('todayRevenue'),
            value: formatCurrency(today.revenue),
            change: `${formatNumber(today.sales)} sales`
          });
        }
        
        return Array.from(metricsMap.values());
      });
    }
  }, [analytics, summary, change, today]);

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
    <>
      <style jsx global>{`
        @media print {
          .no-print,
          nav,
          header,
          .sidebar,
          .header,
          button,
          .btn,
          .action-buttons {
            display: none !important;
          }
          
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          
          @page {
            margin: 1cm;
            size: A4;
          }
        }
      `}</style>

      <div id="revenue-report-area" style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '850px' }}>
        {analytics && (
          <RevenueReportTemplate 
            analyticsData={analytics} 
            selectedStore={selectedStore} 
          />
        )}
      </div>

      <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative">
        <Sidebar />

        <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
          <Header
            title={t('dashboard.revenueAnalytics') || 'Revenue Analytics'}
            description="View detailed revenue analytics and insights"
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
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Today Revenue</p>
                                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">{formatCurrency(today.revenue)}</p>
                                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-1">{formatNumber(today.sales)} sales</p>
                                </div>
                                <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Today Profit</p>
                                  <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(today.profit)}</p>
                                </div>
                                <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Total Revenue</p>
                                  <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">{formatCurrency(summary.totalRevenue)}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Total Profit</p>
                                  <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">{formatCurrency(summary.totalProfit)}</p>
                                </div>
                                <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Total Discount</p>
                                  <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">{formatCurrency(summary.totalDiscount)}</p>
                                </div>
                                <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Total GST</p>
                                  <p className="text-lg font-semibold text-teal-600 dark:text-teal-400">{formatCurrency(summary.totalGst)}</p>
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
            </>
          )}
        </div>
      </div>

      <div className="no-print fixed bottom-6 right-6 z-50">
        <Button
          variant="primary"
          leftIcon={Download}
          onClick={() => handleDownloadPDF(analytics)}
          disabled={isLoading || !analytics}
        >
          Download Report
        </Button>
      </div>
    </div>
    </>
  );
};

export default RevenueAnalytics;

