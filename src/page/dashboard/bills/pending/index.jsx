"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { getBills, getBillStats } from '@/store/slices/billsSlice';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { 
  Clock, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  IndianRupee,
  Calendar,
  Building2,
  AlertTriangle
} from 'lucide-react';
import { Button, Input, Select, Badge, Card } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';

const PendingBills = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { pendingBills, stats, isLoading, error } = useAppSelector((state) => state.bills);
  const { selectedStore } = useAppSelector((state) => state.profile);

  const [searchTerm, setSearchTerm] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  // Fetch pending bills and stats on component mount
  useEffect(() => {
    if (selectedStore?.id) {
      dispatch(getBills({ 
        store: selectedStore.id,
        status: 'pending',
        limit: 20,
        page: 1
      }));
      dispatch(getBillStats(selectedStore.id));
    }
  }, [dispatch, selectedStore]);

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    // Implement search logic here
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'supplier':
        setSupplierFilter(value);
        break;
      case 'date':
        setDateRange(value);
        break;
      default:
        break;
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate days until due
  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get urgency badge
  const getUrgencyBadge = (dueDate) => {
    const days = getDaysUntilDue(dueDate);
    
    if (days < 0) {
      return { variant: 'danger', text: t('bills.overdue'), icon: AlertTriangle };
    } else if (days <= 3) {
      return { variant: 'warning', text: t('bills.dueSoon'), icon: Clock };
    } else if (days <= 7) {
      return { variant: 'info', text: t('bills.dueThisWeek'), icon: Calendar };
    } else {
      return { variant: 'success', text: t('bills.onTime'), icon: Clock };
    }
  };

  return (
    <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
        {/* Header */}
        <Header
          title={t('bills.pendingBills')}
          description={t('bills.viewAndManagePendingBills')}
        />

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">{t('bills.totalPending')}</p>
                  <p className="text-2xl font-bold">{stats.pendingBills}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-200" />
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">{t('bills.overdueBills')}</p>
                  <p className="text-2xl font-bold">{stats.overdueBills}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-200" />
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">{t('bills.totalDueAmount')}</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.dueAmount)}</p>
                </div>
                <IndianRupee className="w-8 h-8 text-blue-200" />
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder={t('bills.searchPendingBills')}
                    value={searchTerm}
                    onChange={handleSearch}
                    className="pl-10"
                  />
                </div>

                <Select
                  value={supplierFilter}
                  onChange={(value) => handleFilterChange('supplier', value)}
                  options={[
                    { value: 'all', label: t('bills.allSuppliers') },
                    { value: 'supplier1', label: t('bills.supplier1') },
                    { value: 'supplier2', label: t('bills.supplier2') }
                  ]}
                />

                <Select
                  value={dateRange}
                  onChange={(value) => handleFilterChange('date', value)}
                  options={[
                    { value: 'all', label: t('bills.allTime') },
                    { value: 'overdue', label: t('bills.overdue') },
                    { value: 'week', label: t('bills.dueThisWeek') },
                    { value: 'month', label: t('bills.dueThisMonth') }
                  ]}
                />
              </div>
            </div>
          </Card>

          {/* Pending Bills Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-4 font-medium text-gray-900">{t('bills.billNumber')}</th>
                    <th className="text-left p-4 font-medium text-gray-900">{t('bills.supplier')}</th>
                    <th className="text-left p-4 font-medium text-gray-900">{t('bills.billDate')}</th>
                    <th className="text-left p-4 font-medium text-gray-900">{t('bills.dueDate')}</th>
                    <th className="text-left p-4 font-medium text-gray-900">{t('bills.amount')}</th>
                    <th className="text-left p-4 font-medium text-gray-900">{t('bills.daysUntilDue')}</th>
                    <th className="text-left p-4 font-medium text-gray-900">{t('bills.status')}</th>
                    <th className="text-left p-4 font-medium text-gray-900">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingBills.map((bill) => {
                    const urgencyBadge = getUrgencyBadge(bill.dueDate);
                    const UrgencyIcon = urgencyBadge.icon;
                    const daysUntilDue = getDaysUntilDue(bill.dueDate);
                    
                    return (
                      <tr key={bill.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4">
                          <div className="font-medium text-gray-900">{bill.billNumber}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">{bill.supplier?.name || t('common.na')}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-600">{formatDate(bill.billDate)}</td>
                        <td className="p-4 text-gray-600">{formatDate(bill.dueDate)}</td>
                        <td className="p-4 font-medium text-gray-900">{formatCurrency(bill.totalAmount)}</td>
                        <td className="p-4">
                          <span className={`font-medium ${
                            daysUntilDue < 0 ? 'text-red-600' :
                            daysUntilDue <= 3 ? 'text-yellow-600' :
                            daysUntilDue <= 7 ? 'text-blue-600' :
                            'text-green-600'
                          }`}>
                            {daysUntilDue < 0 ? t('bills.daysOverdue', { days: Math.abs(daysUntilDue) }) :
                             daysUntilDue === 0 ? t('bills.dueToday') :
                             t('bills.daysUntilDueCount', { days: daysUntilDue })}
                          </span>
                        </td>
                        <td className="p-4">
                          <Badge variant={urgencyBadge.variant} className="flex items-center gap-1">
                            <UrgencyIcon className="w-3 h-3" />
                            {urgencyBadge.text}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={Eye}
                              onClick={() => router.push(`/dashboard/bills/${bill.id}`)}
                            >
                              {t('common.view')}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={Edit}
                              onClick={() => router.push(`/dashboard/bills/${bill.id}/edit`)}
                            >
                              {t('common.edit')}
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              leftIcon={IndianRupee}
                              onClick={() => router.push(`/dashboard/payments/create?billId=${bill.id}`)}
                            >
                              {t('bills.payNow')}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {pendingBills.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('bills.noPendingBills')}</h3>
                <p className="text-gray-600 mb-4">{t('bills.allBillsUpToDate')}</p>
                <Button
                  variant="primary"
                  onClick={() => router.push('/dashboard/bills/create')}
                >
                  {t('bills.createNewBill')}
                </Button>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">{t('bills.loadingPendingBills')}</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PendingBills;
