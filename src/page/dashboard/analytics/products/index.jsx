"use client"
import React, { useState, useMemo } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { useAppSelector } from '@/store/hooks';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Package, CheckCircle, XCircle, Download } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { SortableMetricCard, SortableCard } from '@/components/analytics/SortableComponents';
import ProductsReportTemplate from '@/components/analytics/products/ProductsReportTemplate';
import { useAnalyticsReportPrint } from '@/hooks/useAnalyticsReportPrint';

const ProductAnalytics = () => {
  const { t } = useTranslation();
  const { selectedStore } = useAppSelector((state) => state.profile);
  
  // Mock data structure matching API: { totals: { totalProducts, activeProducts, inactiveProducts } }
  const analytics = useMemo(() => ({
    totals: {
      totalProducts: 0,
      activeProducts: 0,
      inactiveProducts: 0
    }
  }), []);

  const formatNumber = (num) => (num || 0).toLocaleString('en-IN');
  
  const { handleDownloadPDF } = useAnalyticsReportPrint(false, analytics, 'products-report-area', 'products-analytics-report');
  
  const [metrics, setMetrics] = useState([
    { 
      id: 'totalProducts', 
      title: 'Total Products', 
      value: formatNumber(analytics.totals.totalProducts), 
      change: `${formatNumber(analytics.totals.activeProducts)} active, ${formatNumber(analytics.totals.inactiveProducts)} inactive`, 
      icon: Package, 
      iconColor: 'from-purple-100 to-purple-200', 
      textColor: 'text-[rgb(var(--color-text-primary))]' 
    },
    { 
      id: 'activeProducts', 
      title: 'Active Products', 
      value: formatNumber(analytics.totals.activeProducts), 
      change: 'Currently active', 
      icon: CheckCircle, 
      iconColor: 'from-green-100 to-green-200', 
      textColor: 'text-[rgb(var(--color-text-primary))]' 
    },
    { 
      id: 'inactiveProducts', 
      title: 'Inactive Products', 
      value: formatNumber(analytics.totals.inactiveProducts), 
      change: 'Not active', 
      icon: XCircle, 
      iconColor: 'from-gray-100 to-gray-200', 
      textColor: 'text-[rgb(var(--color-text-primary))]' 
    },
    { 
      id: 'totalCount', 
      title: 'Total Count', 
      value: formatNumber(analytics.totals.totalProducts), 
      change: 'All products', 
      icon: Package, 
      iconColor: 'from-blue-100 to-blue-200', 
      textColor: 'text-[rgb(var(--color-text-primary))]' 
    },
  ]);

  const [cards, setCards] = useState([
    { id: 'chart1', type: 'chart', title: 'Products by Category' },
    { id: 'chart2', type: 'chart', title: 'Top Selling Products' },
    { id: 'breakdown', type: 'breakdown', title: 'Product Statistics' },
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

      <div id="products-report-area" style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '850px' }}>
        {analytics && (
          <ProductsReportTemplate 
            analyticsData={analytics} 
            selectedStore={selectedStore} 
          />
        )}
      </div>

      <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative">
        <Sidebar />

        <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
          <Header
            title={t('dashboard.productAnalytics') || 'Product Analytics'}
            description="View detailed product analytics and insights"
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
                                <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Total Products</p>
                                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{formatNumber(analytics.totals.totalProducts)}</p>
                              </div>
                              <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Active Products</p>
                                <p className="text-lg font-semibold text-green-600 dark:text-green-400">{formatNumber(analytics.totals.activeProducts)}</p>
                              </div>
                              <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Inactive Products</p>
                                <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">{formatNumber(analytics.totals.inactiveProducts)}</p>
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

      <div className="no-print fixed bottom-6 right-6 z-50">
        <Button
          variant="primary"
          leftIcon={Download}
          onClick={() => handleDownloadPDF(analytics)}
          disabled={!analytics}
        >
          Download Report
        </Button>
      </div>
    </div>
    </>
  );
};

export default ProductAnalytics;
