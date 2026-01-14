"use client"
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IndianRupee, Users, Package, Building2, TrendingUp, TrendingDown, ShoppingCart, FileText, UserPlus, PackagePlus, Building, GripVertical, Loader2, CreditCard, Receipt } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { dashboardService } from '@/service/retailer';
import { useAppSelector } from '@/store/hooks'; 
import { useTranslation } from '@/hooks/useTranslation';

// Lazy load components
const Sidebar = lazy(() => import('@/components/dashboard/Sidebar'));
const Header = lazy(() => import('@/components/dashboard/Header'));

const getQuickActions = (t) => [
  { title: t('dashboard.addCustomer'), icon: UserPlus, path: '/dashboard/customers/add' },
  { title: t('dashboard.addProduct'), icon: PackagePlus, path: '/dashboard/products/add' },
  { title: t('dashboard.newInvoice'), icon: FileText, path: '' },
  { title: t('dashboard.addSupplier'), icon: Building, path: '/dashboard/suppliers/add' }
];

const SortableSection = ({ id, children, isVisible, onToggleVisibility }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group mb-6 break-inside-avoid break-inside-avoid-column"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <div className="w-6 h-6 bg-[rgb(var(--color-bg-primary))] rounded border border-[rgb(var(--color-border-primary))] flex items-center justify-center shadow-sm">
          <GripVertical className="w-3 h-3 text-[rgb(var(--color-text-secondary))]" />
        </div>
      </div>

      {/* Section Content */}
      <div className={`transition-all duration-300 ${!isVisible ? 'opacity-50 pointer-events-none' : ''}`}>
        {children}
      </div>
    </div>
  );
};

const SortableMetricCard = ({ id, title, value, change, changeType, icon: Icon, iconColor }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const ChangeIcon = changeType === 'up' ? TrendingUp : TrendingDown;
  const changeColor = changeType === 'up' ? 'text-green-600' : 'text-red-600';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-md rounded-lg border border-[rgb(var(--color-border-primary))]/50 p-6 hover:shadow-lg transition-all duration-300 hover:bg-[rgb(var(--color-bg-primary))]/30 relative group"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <div className="w-6 h-6 bg-[rgb(var(--color-bg-primary))] rounded border border-[rgb(var(--color-border-primary))] flex items-center justify-center shadow-sm">
          <GripVertical className="w-3 h-3 text-[rgb(var(--color-text-secondary))]" />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-1">{title}</p>
          <p className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">{value}</p>
          <div className={`flex items-center mt-2 ${changeColor}`}>
            <ChangeIcon className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">{change}</span>
          </div>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconColor}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, change, changeType, icon: Icon, iconColor }) => {
  const ChangeIcon = changeType === 'up' ? TrendingUp : TrendingDown;
  const changeColor = changeType === 'up' ? 'text-green-600' : 'text-red-600';

  return (
    <div className="bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-md rounded-lg border border-[rgb(var(--color-border-primary))]/50 p-6 hover:shadow-lg transition-all duration-300 hover:bg-[rgb(var(--color-bg-primary))]/30">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-1">{title}</p>
          <p className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">{value}</p>
          <div className={`flex items-center mt-2 ${changeColor}`}>
            <ChangeIcon className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">{change}</span>
          </div>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconColor}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

const statusStyles = {
  paid: 'bg-green-500/10 text-green-500 border border-green-500/20',
  released: 'bg-green-500/10 text-green-500 border border-green-500/20',
  completed: 'bg-green-500/10 text-green-500 border border-green-500/20',
  pending: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
  partial: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
  unpaid: 'bg-orange-500/10 text-orange-500 border border-orange-500/20',
  cancelled: 'bg-red-500/10 text-red-500 border border-red-500/20',
  draft: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
  default: 'bg-[rgb(var(--color-border-secondary))]/30 text-[rgb(var(--color-text-secondary))] border border-[rgb(var(--color-border-secondary))]/20'
};

const formatCurrency = (value = 0) => {
  const amount = Number(value) || 0;
  return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
};

const formatDate = (value) => {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatStatusLabel = (value, fallback, t) => {
  if (!value) return fallback || t('common.pending');
  return value
    .toString()
    .toLowerCase()
    .split(/[_\s-]+/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const normalizeApiList = (result, fallbackKey) => {
  if (!result) return [];
  const payload = result.data ?? result;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (fallbackKey && Array.isArray(payload?.[fallbackKey])) return payload[fallbackKey];
  if (fallbackKey && Array.isArray(result?.[fallbackKey])) return result[fallbackKey];
  return [];
};

const mapPaymentItems = (response, t) => {
  const list = normalizeApiList(response, 'payments');
  return list.map((payment) => {
    const statusValue = payment.paymentStatus || payment.status || 'pending';
    return {
      id: payment._id || payment.id,
      title: payment.paymentNumber || t('dashboard.supplierPayment'),
      subtitle: payment.supplier?.name || payment.supplierName || t('dashboard.supplier'),
      meta: payment.paymentMethod || payment.paymentType || '',
      amount: payment.totalAmount ?? payment.amount ?? 0,
      date: payment.paymentDate || payment.createdAt,
      status: statusValue,
      statusLabel: formatStatusLabel(statusValue, t('common.pending'), t),
      icon: CreditCard
    };
  });
};

const mapExpenseItems = (response, t) => {
  const list = normalizeApiList(response, 'expenses');
  return list.map((expense) => {
    const statusValue = expense.status || 'pending';
    return {
      id: expense._id || expense.id,
      title: expense.title || expense.category?.name || t('dashboard.expense'),
      subtitle: expense.vendor?.name || expense.vendor || expense.category?.name || t('dashboard.vendor'),
      meta: expense.category?.name || expense.category || '',
      amount: expense.amount ?? expense.netAmount ?? 0,
      date: expense.date || expense.createdAt,
      status: statusValue,
      statusLabel: formatStatusLabel(statusValue, t('common.pending'), t),
      icon: Receipt
    };
  });
};

const mapInvoiceItems = (response, t) => {
  const list = normalizeApiList(response, 'invoices');
  return list.map((invoice) => {
    const statusValue = invoice.paymentStatus || invoice.invoiceStatus || 'pending';
    return {
      id: invoice._id || invoice.id,
      title: invoice.invoiceNumber || t('dashboard.invoice'),
      subtitle: invoice.customer?.name || t('dashboard.walkInCustomer'),
      meta: invoice.customer?.phone || invoice.invoiceStatus || '',
      amount: invoice.totalAmount ?? 0,
      date: invoice.createdAt || invoice.releasedAt || invoice.updatedAt,
      status: statusValue,
      statusLabel: formatStatusLabel(statusValue, t('common.pending'), t),
      icon: FileText
    };
  });
};

const formatPercentChange = (value) => {
  const numericValue = Number(value);
  const safeValue = Number.isFinite(numericValue) ? numericValue : 0;
  return `${safeValue >= 0 ? '+' : ''}${safeValue.toFixed(1)}%`;
};

const RecentListItem = ({ icon: Icon = ShoppingCart, title, subtitle, meta, amount, date, status, statusLabel }) => {
  const statusKey = status?.toString().toLowerCase();
  const badgeClass = statusStyles[statusKey] || statusStyles.default;

  return (
    <div className="flex items-center justify-between p-4 bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-sm rounded-lg border border-[rgb(var(--color-border-primary))]/40 hover:shadow-md transition-all duration-300 hover:bg-[rgb(var(--color-bg-primary))]/30">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/10 rounded-full flex items-center justify-center">
          <Icon className="w-5 h-5 text-[rgb(var(--color-primary))]" />
        </div>
        <div>
          <p className="font-medium text-[rgb(var(--color-text-primary))]">{title}</p>
          {subtitle && <p className="text-sm text-[rgb(var(--color-text-secondary))]">{subtitle}</p>}
          {meta && <p className="text-xs text-[rgb(var(--color-text-tertiary))]">{meta}</p>}
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-[rgb(var(--color-text-primary))]">{formatCurrency(amount)}</p>
        <p className="text-xs text-[rgb(var(--color-text-secondary))]">{formatDate(date)}</p>
        <span className={`inline-flex px-2 py-1 mt-2 text-xs font-medium rounded-full ${badgeClass}`}>
          {statusLabel || formatStatusLabel(status)}
        </span>
      </div>
    </div>
  );
};

const RecentSectionCard = ({ title, items, loading, emptyMessage, error, onViewMore, t }) => (
  <div className="bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-md rounded-lg border border-[rgb(var(--color-border-primary))]/50 p-6 shadow-xs">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">{title}</h2>
      {onViewMore && (
        <button
          type="button"
          onClick={onViewMore}
          className="text-sm font-medium text-[rgb(var(--color-primary))] hover:underline"
        >
          {t('dashboard.viewAll')}
        </button>
      )}
    </div>
    {error && (
      <p className="text-xs text-red-500 mb-3">
        {error}
      </p>
    )}
    {loading ? (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-[rgb(var(--color-primary))]" />
      </div>
    ) : items.length > 0 ? (
      <div className="space-y-3">
        {items.map((item) => (
          <RecentListItem key={item.id || `${item.title}-${item.date}`} {...item} />
        ))}
      </div>
    ) : (
      <div className="text-center py-8 text-[rgb(var(--color-text-secondary))]">
        {emptyMessage}
      </div>
    )}
  </div>
);

const QuickActionButton = ({ title, icon: Icon, onClick }) => (
  <button onClick={onClick} className="cursor-pointer flex flex-col items-center justify-center p-6 bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-sm border-2 border-dashed border-[rgb(var(--color-border-secondary))]/60 rounded-lg hover:border-[rgb(var(--color-primary))]/80 hover:bg-[rgb(var(--color-primary))]/10 transition-all duration-300 group">
    <div className="w-12 h-12 bg-[rgb(var(--color-bg-tertiary))] rounded-lg flex items-center justify-center mb-3 group-hover:bg-[rgb(var(--color-primary))]/10 transition-colors">
      <Icon className="w-6 h-6 text-[rgb(var(--color-text-tertiary))] group-hover:text-[rgb(var(--color-primary))]" />
    </div>
    <span className="text-sm font-medium text-[rgb(var(--color-text-secondary))] group-hover:text-[rgb(var(--color-primary))]">{title}</span>
  </button>
);

const buildRecentState = (loading = false) => ({
  payments: { items: [], loading, error: null },
  expenses: { items: [], loading, error: null },
  invoices: { items: [], loading, error: null }
});

const getSectionMeta = (t) => ({
  recentPayments: {
    stateKey: 'payments',
    title: t('dashboard.recentPayments'),
    emptyMessage: t('dashboard.noData'),
    path: '/dashboard/payments'
  },
  recentExpenses: {
    stateKey: 'expenses',
    title: t('dashboard.recentExpenses'),
    emptyMessage: t('dashboard.noData'),
    path: '/dashboard/expenses'
  },
  recentInvoices: {
    stateKey: 'invoices',
    title: t('dashboard.recentInvoices'),
    emptyMessage: t('dashboard.noData'),
    path: '/dashboard/invoices'
  }
});

export default function Dashboard() {
  const { t } = useTranslation();
  const [selectedStore, setSelectedStore] = useState(null);
  const router = useRouter();
  const { selectedStore: storeFromRedux } = useAppSelector((state) => state.profile);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState([
    {
      id: 'revenue',
      title: t('dashboard.totalRevenue'),
      value: '₹0',
      change: '0%',
      changeType: 'up',
      icon: IndianRupee,
      iconColor: 'bg-green-500'
    },
    {
      id: 'customers',
      title: t('dashboard.totalCustomers'),
      value: '0',
      change: '0%',
      changeType: 'up',
      icon: Users,
      iconColor: 'bg-blue-500'
    },
    {
      id: 'products',
      title: t('dashboard.productsInStock'),
      value: '0',
      change: '0%',
      changeType: 'up',
      icon: Package,
      iconColor: 'bg-purple-500'
    },
    {
      id: 'suppliers',
      title: t('dashboard.suppliers'),
      value: '0',
      change: '0%',
      changeType: 'up',
      icon: Building2,
      iconColor: 'bg-orange-500'
    }
  ]);

  const [recentData, setRecentData] = useState(buildRecentState(true));
  const [sections, setSections] = useState([
    { id: 'quickActions', visible: true },
    { id: 'recentExpenses', visible: true },
    { id: 'recentInvoices', visible: true },
    { id: 'recentPayments', visible: true }
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadDashboardMetrics = async (storeId) => {
    const response = await dashboardService.getDashboard({
      period: 30,
      storeId
    });

    if (response.success && response.data) {
      const dashboardData = response.data;
      const updatedMetrics = [
        {
          id: 'revenue',
          title: t('dashboard.totalRevenue'),
          value: `₹${dashboardData.metrics.revenue.value.toLocaleString('en-IN')}`,
          change: formatPercentChange(dashboardData.metrics.revenue.change),
          changeType: dashboardData.metrics.revenue.changeType,
          icon: IndianRupee,
          iconColor: 'bg-green-500'
        },
        {
          id: 'customers',
          title: t('dashboard.totalCustomers'),
          value: dashboardData.metrics.customers.value.toLocaleString('en-IN'),
          change: formatPercentChange(dashboardData.metrics.customers.change),
          changeType: dashboardData.metrics.customers.changeType,
          icon: Users,
          iconColor: 'bg-blue-500'
        },
        {
          id: 'products',
          title: t('dashboard.productsInStock'),
          value: dashboardData.metrics.products.value.toLocaleString('en-IN'),
          change: formatPercentChange(dashboardData.metrics.products.change),
          changeType: dashboardData.metrics.products.changeType,
          icon: Package,
          iconColor: 'bg-purple-500'
        },
        {
          id: 'suppliers',
          title: t('dashboard.suppliers'),
          value: dashboardData.metrics.suppliers.value.toLocaleString('en-IN'),
          change: formatPercentChange(dashboardData.metrics.suppliers.change),
          changeType: dashboardData.metrics.suppliers.changeType,
          icon: Building2,
          iconColor: 'bg-orange-500'
        }
      ];
      setMetrics(updatedMetrics);
    }
  };

  const loadRecentSections = async (storeId) => {
    // Dynamically import services only when needed
    const { paymentService } = await import('@/service/retailer');
    const { expenseService } = await import('@/service/retailer');
    const { invoiceService } = await import('@/service/retailer');

    const recentFetchers = [
      {
        key: 'payments',
        label: 'payments',
        fetcher: () => paymentService.getPayments({
          store: storeId,
          limit: 5,
          page: 1,
          lightweight: true,
          sortBy: 'paymentDate'
        }),
        mapper: mapPaymentItems
      },
      {
        key: 'expenses',
        label: 'expenses',
        fetcher: () => expenseService.getExpenses({
          store: storeId,
          limit: 5,
          page: 1
        }),
        mapper: mapExpenseItems
      },
      {
        key: 'invoices',
        label: 'invoices',
        fetcher: () => invoiceService.getInvoices({
          store: storeId,
          limit: 5,
          page: 1,
          invoiceStatus: 'RELEASED'
        }),
        mapper: mapInvoiceItems
      }
    ];

    await Promise.all(recentFetchers.map(async ({ key, label, fetcher, mapper }) => {
      setRecentData((prev) => ({
        ...prev,
        [key]: {
          ...(prev[key] || { items: [], loading: true, error: null }),
          loading: true,
          error: null
        }
      }));

      try {
        const result = await fetcher();
        if (!result.success) {
          throw new Error(result.message || t('dashboard.failedToFetch', { label }));
        }
        const items = mapper(result, t);
        setRecentData((prev) => ({
          ...prev,
          [key]: {
            items,
            loading: false,
            error: null
          }
        }));
      } catch (error) {
        setRecentData((prev) => ({
          ...prev,
          [key]: {
            ...(prev[key] || { items: [], loading: false, error: null }),
            loading: false,
            error: error.message || t('dashboard.unableToLoad', { label })
          }
        }));
      }
    }));
  };

  // Fetch dashboard data
  useEffect(() => {
    const storeId = storeFromRedux?._id || storeFromRedux?.id || storeFromRedux?.storeId;
    
    if (!storeId) {
      setLoading(false);
      setRecentData(buildRecentState(false));
      return;
    }

    setRecentData(buildRecentState(true));

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          loadDashboardMetrics(storeId),
          loadRecentSections(storeId)
        ]);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [storeFromRedux?._id, storeFromRedux?.id, storeFromRedux?.storeId]);


  // Load saved layout from localStorage
  useEffect(() => {
    const savedMetrics = localStorage.getItem('dashboard-metrics-order');
    const savedSections = localStorage.getItem('dashboard-sections-order');

    if (savedMetrics && !loading) {
      try {
        const savedOrder = JSON.parse(savedMetrics);
        setMetrics(prevMetrics => {
          const reorderedMetrics = savedOrder.map(id =>
            prevMetrics.find(metric => metric.id === id)
          ).filter(Boolean);
          return reorderedMetrics.length === prevMetrics.length ? reorderedMetrics : prevMetrics;
        });
      } catch (error) {
      }
    }

    if (savedSections) {
      try {
        const savedOrder = JSON.parse(savedSections);
        setSections(prevSections => {
          const reorderedSections = savedOrder.map(id =>
            prevSections.find(section => section.id === id)
          ).filter(Boolean);
          return reorderedSections.length === prevSections.length ? reorderedSections : prevSections;
        });
      } catch (error) {
      }
    }
  }, [loading]);

  // Save layout to localStorage
  const saveMetricsOrder = (newMetrics) => {
    const order = newMetrics.map(metric => metric.id);
    localStorage.setItem('dashboard-metrics-order', JSON.stringify(order));
  };

  const saveSectionsOrder = (newSections) => {
    const order = newSections.map(section => section.id);
    localStorage.setItem('dashboard-sections-order', JSON.stringify(order));
  };

  const handleMetricsDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setMetrics((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        const newMetrics = arrayMove(items, oldIndex, newIndex);
        saveMetricsOrder(newMetrics);
        return newMetrics;
      });
    }
  };

  const handleSectionsDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        const newSections = arrayMove(items, oldIndex, newIndex);
        saveSectionsOrder(newSections);
        return newSections;
      });
    }
  };

  const handleViewMore = (path) => {
    if (!path) return;
    router.push(path);
  };

  const handleStoreChange = (storeObject) => {
    setSelectedStore(storeObject);
  };

  const handleRedirect = (path) => {
    router.push(path);
  };

  const renderSectionContent = (section) => {
    if (section.id === 'quickActions') {
      return (
        <div className="bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-md rounded-lg border border-[rgb(var(--color-border-primary))]/50 p-6 shadow-xs">
          <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-4">{t('dashboard.quickActions')}</h2>
          <div className="grid grid-cols-2 gap-4">
            {getQuickActions(t).map((action, index) => (
              <QuickActionButton key={index} {...action} onClick={() => handleRedirect(action.path)} />
            ))}
          </div>
        </div>
      );
    }

    const meta = getSectionMeta(t)[section.id];
    if (!meta) {
      return null;
    }

    const sectionState = recentData[meta.stateKey] || { items: [], loading: false, error: null };

    return (
      <RecentSectionCard
        title={meta.title}
        items={sectionState.items}
        loading={sectionState.loading}
        emptyMessage={meta.emptyMessage}
        error={sectionState.error}
        onViewMore={() => handleViewMore(meta.path)}
        t={t}
      />
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[rgb(var(--color-bg-secondary))] relative">
      <Suspense fallback={<div className="w-64 bg-[rgb(var(--color-bg-primary))] border-r border-[rgb(var(--color-border-primary))]" />}>
        <Sidebar onStoreChange={handleStoreChange} />
      </Suspense>

      {/* Main Content Area */}
      <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col overflow-hidden">
        {/* Header */}
        <Suspense fallback={
          <div className="h-20 bg-[rgb(var(--color-bg-primary))] border-b border-[rgb(var(--color-border-primary))] flex items-center px-6">
            <div className="h-6 bg-[rgb(var(--color-bg-secondary))] rounded w-48 animate-pulse" />
          </div>
        }>
          <Header
            title={t('dashboard.title')}
            description={t('dashboard.description')}
          />
        </Suspense>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">

          {/* Metrics Cards - Sortable */}
           <div className="mb-8">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-md rounded-lg border border-[rgb(var(--color-border-primary))]/50 p-6 animate-pulse">
                    <div className="h-4 bg-[rgb(var(--color-bg-secondary))] rounded w-24 mb-2"></div>
                    <div className="h-8 bg-[rgb(var(--color-bg-secondary))] rounded w-32 mb-2"></div>
                    <div className="h-4 bg-[rgb(var(--color-bg-secondary))] rounded w-20"></div>
                  </div>
                ))}
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleMetricsDragEnd}
              >
                <SortableContext items={metrics.map(m => m.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {metrics.map((metric) => (
                      <SortableMetricCard key={metric.id} {...metric} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          {/* Content Grid - Sortable Sections */}
           <div className="mb-8">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleSectionsDragEnd}
            >
               <SortableContext items={sections.map(s => s.id)} strategy={rectSortingStrategy}>
                 <div className="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6">
                  {sections.map((section) => (
                    <SortableSection
                      key={section.id}
                      id={section.id}
                      isVisible={section.visible}
                      onToggleVisibility={() => { }}
                    >
                       <div className="inline-block w-full">
                         {renderSectionContent(section)}
                       </div>
                    </SortableSection>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

        </div>
      </div>
    </div>
  );
}
