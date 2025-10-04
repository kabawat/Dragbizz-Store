"use client"
import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { AnimatedBackground } from '@/components/ui';
import { IndianRupee, Users, Package, Building2, TrendingUp, TrendingDown, ShoppingCart, Plus, FileText, UserPlus, PackagePlus, Building, GripVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';
const transactions = [
  { customer: 'John Smith', date: '2025-01-08', amount: '₹234.50', status: 'completed' },
  { customer: 'Sarah Johnson', date: '2025-01-08', amount: '₹89.99', status: 'pending' },
  { customer: 'Mike Davis', date: '2025-01-07', amount: '₹456.20', status: 'completed' },
  { customer: 'Lisa Brown', date: '2025-01-07', amount: '₹123.45', status: 'completed' }
];

const quickActions = [
  { title: 'Add Customer', icon: UserPlus, path: '/dashboard/customers/add' },
  { title: 'Add Product', icon: PackagePlus, path: '/dashboard/products/add' },
  { title: 'New Invoice', icon: FileText, path: '' },
  { title: 'Add Supplier', icon: Building, path: '/dashboard/suppliers/add' }
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
    <div ref={setNodeRef} style={style} className="relative group">
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

const TransactionItem = ({ customer, date, amount, status }) => {
  const statusColor = status === 'completed' ? 'bg-[rgb(var(--color-success))]/10 text-[rgb(var(--color-success))]' : 'bg-[rgb(var(--color-warning))]/10 text-[rgb(var(--color-warning))]';

  return (
    <div className="flex items-center justify-between p-4 bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-sm rounded-lg border border-[rgb(var(--color-border-primary))]/40 hover:shadow-md transition-all duration-300 hover:bg-[rgb(var(--color-bg-primary))]/30">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-[rgb(var(--color-primary))]/10 rounded-full flex items-center justify-center">
          <ShoppingCart className="w-5 h-5 text-[rgb(var(--color-primary))]" />
        </div>
        <div>
          <p className="font-medium text-[rgb(var(--color-text-primary))]">{customer}</p>
          <p className="text-sm text-[rgb(var(--color-text-secondary))]">{date}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-[rgb(var(--color-text-primary))]">{amount}</p>
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
          {status}
        </span>
      </div>
    </div>
  );
};

const QuickActionButton = ({ title, icon: Icon, onClick }) => (
  <button onClick={onClick} className="cursor-pointer flex flex-col items-center justify-center p-6 bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-sm border-2 border-dashed border-[rgb(var(--color-border-secondary))]/60 rounded-lg hover:border-[rgb(var(--color-primary))]/80 hover:bg-[rgb(var(--color-primary))]/10 transition-all duration-300 group">
    <div className="w-12 h-12 bg-[rgb(var(--color-bg-tertiary))] rounded-lg flex items-center justify-center mb-3 group-hover:bg-[rgb(var(--color-primary))]/10 transition-colors">
      <Icon className="w-6 h-6 text-[rgb(var(--color-text-tertiary))] group-hover:text-[rgb(var(--color-primary))]" />
    </div>
    <span className="text-sm font-medium text-[rgb(var(--color-text-secondary))] group-hover:text-[rgb(var(--color-primary))]">{title}</span>
  </button>
);

export default function Dashboard() {
  const [selectedStore, setSelectedStore] = useState(null);
  const router = useRouter();
  const [metrics, setMetrics] = useState([
    {
      id: 'revenue',
      title: 'Total Revenue',
      value: '₹1,24,532',
      change: '+12.5%',
      changeType: 'up',
      icon: IndianRupee,
      iconColor: 'bg-green-500'
    },
    {
      id: 'customers',
      title: 'Total Customers',
      value: '1,247',
      change: '+8.2%',
      changeType: 'up',
      icon: Users,
      iconColor: 'bg-blue-500'
    },
    {
      id: 'products',
      title: 'Products in Stock',
      value: '3,428',
      change: '-2.1%',
      changeType: 'down',
      icon: Package,
      iconColor: 'bg-purple-500'
    },
    {
      id: 'wholesalers',
      title: 'Wholesalers',
      value: '43',
      change: '+5.3%',
      changeType: 'up',
      icon: Building2,
      iconColor: 'bg-orange-500'
    }
  ]);

  const [sections, setSections] = useState([
    { id: 'transactions', title: 'Recent Transactions', visible: true, span: 'lg:col-span-2' },
    { id: 'quickActions', title: 'Quick Actions', visible: true, span: '' }
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load saved layout from localStorage
  useEffect(() => {
    const savedMetrics = localStorage.getItem('dashboard-metrics-order');
    const savedSections = localStorage.getItem('dashboard-sections-order');

    if (savedMetrics) {
      try {
        const savedOrder = JSON.parse(savedMetrics);
        const reorderedMetrics = savedOrder.map(id =>
          metrics.find(metric => metric.id === id)
        ).filter(Boolean);
        if (reorderedMetrics.length === metrics.length) {
          setMetrics(reorderedMetrics);
        }
      } catch (error) {
        console.error('Error loading metrics order:', error);
      }
    }

    if (savedSections) {
      try {
        const savedOrder = JSON.parse(savedSections);
        const reorderedSections = savedOrder.map(id =>
          sections.find(section => section.id === id)
        ).filter(Boolean);
        if (reorderedSections.length === sections.length) {
          setSections(reorderedSections);
        }
      } catch (error) {
        console.error('Error loading sections order:', error);
      }
    }
  }, []);

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

  const handleStoreChange = (storeObject) => {
    setSelectedStore(storeObject);
  };

  const handleRedirect = (path) => {
    router.push(path);
  };

  return (
    <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative">
      <AnimatedBackground variant="default" />
      <Sidebar onStoreChange={handleStoreChange} />

      {/* Main Content Area */}
      <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
        {/* Header */}
        <Header
          title="Dashboard"
          description="Overview of your store performance and analytics"
        />

        {/* Main Content */}
        <div className="flex-1 p-6">

          {/* Metrics Cards - Sortable */}
          <div className="mb-8">
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
          </div>

          {/* Content Grid - Sortable Sections */}
          <div className="mb-8">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleSectionsDragEnd}
            >
              <SortableContext items={sections.map(s => s.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {sections.map((section) => (
                    <SortableSection
                      key={section.id}
                      id={section.id}
                      isVisible={section.visible}
                      onToggleVisibility={() => { }}
                    >
                      <div className={section.span}>
                        {section.id === 'transactions' && (
                          <div className="bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-md rounded-lg border border-[rgb(var(--color-border-primary))]/50 p-6 shadow-lg">
                            <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-4">Recent Transactions</h2>
                            <div className="space-y-3">
                              {transactions.map((transaction, index) => (
                                <TransactionItem key={index} {...transaction} />
                              ))}
                            </div>
                          </div>
                        )}

                        {section.id === 'quickActions' && (
                          <div className="bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-md rounded-lg border border-[rgb(var(--color-border-primary))]/50 p-6 shadow-lg">
                            <h2 className="text-base font-semibold text-[rgb(var(--color-text-primary))] mb-4">Quick Actions</h2>
                            <div className="grid grid-cols-2 gap-4">
                              {quickActions.map((action, index) => (
                                <QuickActionButton key={index} {...action} onClick={() => handleRedirect(action.path)} />
                              ))}
                            </div>
                          </div>
                        )}
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
