"use client"
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { getBillAnalytics } from '@/store/slices/billsSlice';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { Receipt, CheckCircle, XCircle, AlertTriangle, Download, FileSpreadsheet, ChevronDown, FileText } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { SortableMetricCard, SortableCard } from '@/components/analytics/SortableComponents';
import BillsReportTemplate from '@/components/analytics/bills/BillsReportTemplate';
import { useAnalyticsReportPrint } from '@/hooks/useAnalyticsReportPrint';

const BillAnalytics = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { selectedStore } = useAppSelector((state) => state.profile);
  const { analytics, isLoading } = useAppSelector((state) => state.bills);
  const hasFetchedRef = useRef({ storeId: null, fetched: false });
  
  useEffect(() => {
    const storeId = selectedStore?._id || selectedStore?.id || selectedStore?.storeId;
    if (!storeId) return;
    
    const lastFetched = hasFetchedRef.current;
    if (lastFetched.fetched && lastFetched.storeId === storeId) {
      return;
    }
    
    hasFetchedRef.current = { storeId, fetched: true };
    dispatch(getBillAnalytics(storeId));
  }, [dispatch, selectedStore?._id, selectedStore?.id, selectedStore?.storeId]);
  
  useEffect(() => {
    const storeId = selectedStore?._id || selectedStore?.id || selectedStore?.storeId;
    if (storeId && hasFetchedRef.current.storeId !== storeId) {
      hasFetchedRef.current = { storeId: null, fetched: false };
    }
  }, [selectedStore?._id, selectedStore?.id, selectedStore?.storeId]);

  const formatNumber = (num) => (num || 0).toLocaleString('en-IN');
  const formatCurrency = (amount) => `₹${(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  
  const { handleDownloadPDF, handleDownloadXLSX } = useAnalyticsReportPrint(isLoading, analytics, 'bills-report-area', 'bills-analytics-report');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);
  
  // Memoize derived values
  const counts = useMemo(() => analytics?.counts || {
    totalBills: 0,
    paidBills: 0,
    pendingBills: 0,
    overdueBills: 0
  }, [analytics?.counts]);
  
  const amounts = useMemo(() => analytics?.amounts || {
    totalPayable: 0,
    totalPaid: 0,
    totalDue: 0
  }, [analytics?.amounts]);
  
  const [metrics, setMetrics] = useState([
    { 
      id: 'totalBills', 
      title: 'Total Bills', 
      value: '0', 
      change: '0 paid, 0 pending', 
      icon: Receipt, 
      iconColor: 'from-red-100 to-red-200', 
      textColor: 'text-[rgb(var(--color-text-primary))]' 
    },
    { 
      id: 'paidBills', 
      title: 'Paid Bills', 
      value: '0', 
      change: '₹0.00', 
      icon: CheckCircle, 
      iconColor: 'from-green-100 to-green-200', 
      textColor: 'text-[rgb(var(--color-text-primary))]' 
    },
    { 
      id: 'pendingBills', 
      title: 'Pending Bills', 
      value: '0', 
      change: '₹0.00', 
      icon: AlertTriangle, 
      iconColor: 'from-yellow-100 to-yellow-200', 
      textColor: 'text-[rgb(var(--color-text-primary))]' 
    },
    { 
      id: 'overdueBills', 
      title: 'Overdue Bills', 
      value: '0', 
      change: 'Urgent action needed', 
      icon: XCircle, 
      iconColor: 'from-orange-100 to-orange-200', 
      textColor: 'text-[rgb(var(--color-text-primary))]' 
    },
  ]);

  const [amountCards, setAmountCards] = useState([
    { id: 'amount1', type: 'amount', title: 'Total Payable', value: '₹0.00', label: 'Total amount payable', color: 'text-red-600 dark:text-red-400' },
    { id: 'amount2', type: 'amount', title: 'Total Paid', value: '₹0.00', label: 'Total amount paid', color: 'text-green-600 dark:text-green-400' },
    { id: 'amount3', type: 'amount', title: 'Total Due', value: '₹0.00', label: 'Outstanding amount', color: 'text-orange-600 dark:text-orange-400' },
  ]);

  // Update metrics when analytics data changes
  useEffect(() => {
    if (analytics && counts && amounts) {
      setMetrics((prevMetrics) => {
        const metricsMap = new Map(prevMetrics.map(m => [m.id, m]));
        
        if (metricsMap.has('totalBills')) {
          metricsMap.set('totalBills', {
            ...metricsMap.get('totalBills'),
            value: formatNumber(counts.totalBills),
            change: `${formatNumber(counts.paidBills)} paid, ${formatNumber(counts.pendingBills)} pending`
          });
        }
        if (metricsMap.has('paidBills')) {
          metricsMap.set('paidBills', {
            ...metricsMap.get('paidBills'),
            value: formatNumber(counts.paidBills),
            change: formatCurrency(amounts.totalPaid)
          });
        }
        if (metricsMap.has('pendingBills')) {
          metricsMap.set('pendingBills', {
            ...metricsMap.get('pendingBills'),
            value: formatNumber(counts.pendingBills),
            change: formatCurrency(amounts.totalDue)
          });
        }
        if (metricsMap.has('overdueBills')) {
          metricsMap.set('overdueBills', {
            ...metricsMap.get('overdueBills'),
            value: formatNumber(counts.overdueBills),
            change: 'Urgent action needed'
          });
        }
        
        return Array.from(metricsMap.values());
      });

      setAmountCards((prevCards) => {
        const cardsMap = new Map(prevCards.map(c => [c.id, c]));
        
        if (cardsMap.has('amount1')) {
          cardsMap.set('amount1', {
            ...cardsMap.get('amount1'),
            value: formatCurrency(amounts.totalPayable)
          });
        }
        if (cardsMap.has('amount2')) {
          cardsMap.set('amount2', {
            ...cardsMap.get('amount2'),
            value: formatCurrency(amounts.totalPaid)
          });
        }
        if (cardsMap.has('amount3')) {
          cardsMap.set('amount3', {
            ...cardsMap.get('amount3'),
            value: formatCurrency(amounts.totalDue)
          });
        }
        
        return Array.from(cardsMap.values());
      });
    }
  }, [analytics, counts, amounts]);

  // Handle click outside export menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showExportMenu]);

  const getBillsXLSXConfig = () => {
    return {
      title: 'BILLS ANALYTICS REPORT',
      columns: 2,
      sections: [
        {
          title: 'SUMMARY',
          headers: ['Metric', 'Value'],
          columns: 2,
          data: [
            ['Total Bills', formatNumber(counts.totalBills)],
            ['Paid Bills', formatNumber(counts.paidBills)],
            ['Pending Bills', formatNumber(counts.pendingBills)],
            ['Overdue Bills', formatNumber(counts.overdueBills)]
          ]
        },
        {
          title: 'FINANCIAL BREAKDOWN',
          headers: ['Category', 'Amount'],
          columns: 2,
          data: [
            ['Total Payable', formatCurrency(amounts.totalPayable)],
            ['Total Paid', formatCurrency(amounts.totalPaid)],
            ['Total Due', formatCurrency(amounts.totalDue)],
            ['Paid Bills', formatNumber(counts.paidBills)],
            ['Pending Bills', formatNumber(counts.pendingBills)]
          ],
          amountColumns: [1]
        }
      ]
    };
  };

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

      <div id="bills-report-area" style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '850px' }}>
        {analytics && (
          <BillsReportTemplate 
            analyticsData={analytics} 
            selectedStore={selectedStore} 
          />
        )}
      </div>

      <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative">
        <Sidebar />

        <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
          <Header
            title={t('dashboard.billAnalytics') || 'Bill Analytics'}
            description="View detailed bill analytics and insights"
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
                                <p className="text-lg font-semibold text-green-600 dark:text-green-400">{formatNumber(counts.paidBills)}</p>
                                <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-1">{formatCurrency(amounts.totalPaid)}</p>
                              </div>
                              <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Pending Bills</p>
                                <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">{formatNumber(counts.pendingBills)}</p>
                                <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-1">{formatCurrency(amounts.totalDue)}</p>
                              </div>
                              <div className="bg-[rgb(var(--color-bg-secondary))]/50 rounded-lg p-4 border-[var(--color-border-primary-light)] text-center">
                                <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-2">Overdue Bills</p>
                                <p className="text-lg font-semibold text-red-600 dark:text-red-400">{formatNumber(counts.overdueBills)}</p>
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

      <div className="no-print fixed bottom-6 right-6 z-50" ref={exportMenuRef}>
        <div className="relative">
          <Button
            variant="primary"
            leftIcon={Download}
            rightIcon={ChevronDown}
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={isLoading || !analytics}
          >
            Download Report
          </Button>
          
          {showExportMenu && (
            <div className="absolute bottom-full right-0 mb-2 w-48 bg-[rgb(var(--color-bg-primary))] rounded-lg shadow-lg border border-[rgb(var(--color-border-primary))] py-1 z-50">
              <button
                onClick={() => {
                  handleDownloadPDF(analytics);
                  setShowExportMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors duration-200 cursor-pointer hover:bg-[rgb(var(--color-bg-secondary))] focus:outline-none text-[rgb(var(--color-text-primary))]"
              >
                <FileText className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                Download as PDF
              </button>
              <button
                onClick={() => {
                  handleDownloadXLSX(analytics, selectedStore, 'bills-analytics-report', getBillsXLSXConfig());
                  setShowExportMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors duration-200 cursor-pointer hover:bg-[rgb(var(--color-bg-secondary))] focus:outline-none text-[rgb(var(--color-text-primary))]"
              >
                <FileSpreadsheet className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                Download as XLSX
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default BillAnalytics;
