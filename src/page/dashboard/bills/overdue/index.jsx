"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { getBills, getBillStats } from '@/store/slices/billsSlice';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { AnimatedBackground } from '@/components/ui';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  IndianRupee,
  Calendar,
  Building2,
  Clock,
  Phone,
  Mail
} from 'lucide-react';
import { Button, Input, Select, Badge, Card } from '@/components/ui';

const OverdueBills = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { bills, stats, isLoading, error } = useAppSelector((state) => state.bills);
  const { selectedStore } = useAppSelector((state) => state.profile);

  const [searchTerm, setSearchTerm] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [overdueFilter, setOverdueFilter] = useState('all');

  // Fetch overdue bills and stats on component mount
  useEffect(() => {
    if (selectedStore?.id) {
      dispatch(getBills({ 
        store: selectedStore.id,
        status: 'overdue',
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
      case 'overdue':
        setOverdueFilter(value);
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

  // Calculate overdue days
  const getOverdueDays = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get overdue severity badge
  const getOverdueSeverity = (overdueDays) => {
    if (overdueDays <= 7) {
      return { variant: 'warning', text: 'Recently Overdue', color: 'text-yellow-600' };
    } else if (overdueDays <= 30) {
      return { variant: 'danger', text: 'Overdue', color: 'text-orange-600' };
    } else if (overdueDays <= 90) {
      return { variant: 'danger', text: 'Severely Overdue', color: 'text-red-600' };
    } else {
      return { variant: 'danger', text: 'Critically Overdue', color: 'text-red-800' };
    }
  };

  // Handle send reminder
  const handleSendReminder = (bill) => {
    // Implement send reminder logic
    console.log('Sending reminder for bill:', bill.id);
  };

  // Handle contact supplier
  const handleContactSupplier = (supplier) => {
    // Implement contact supplier logic
    console.log('Contacting supplier:', supplier.id);
  };

  return (
    <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative">
      <AnimatedBackground variant="default" />
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
        {/* Header */}
        <Header
          title="Overdue Bills"
          description="View and manage overdue supplier bills"
        />

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Total Overdue</p>
                  <p className="text-2xl font-bold">{stats.overdueBills}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-200" />
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Overdue Amount</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.dueAmount)}</p>
                </div>
                <IndianRupee className="w-8 h-8 text-orange-200" />
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Avg. Overdue Days</p>
                  <p className="text-2xl font-bold">
                    {bills.length > 0 
                      ? Math.round(bills.reduce((sum, bill) => sum + getOverdueDays(bill.dueDate), 0) / bills.length)
                      : 0
                    }
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-yellow-200" />
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
                    placeholder="Search overdue bills..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="pl-10"
                  />
                </div>

                <Select
                  value={supplierFilter}
                  onChange={(value) => handleFilterChange('supplier', value)}
                  options={[
                    { value: 'all', label: 'All Suppliers' },
                    { value: 'supplier1', label: 'Supplier 1' },
                    { value: 'supplier2', label: 'Supplier 2' }
                  ]}
                />

                <Select
                  value={overdueFilter}
                  onChange={(value) => handleFilterChange('overdue', value)}
                  options={[
                    { value: 'all', label: 'All Overdue' },
                    { value: 'recent', label: 'Recently Overdue (1-7 days)' },
                    { value: 'moderate', label: 'Overdue (8-30 days)' },
                    { value: 'severe', label: 'Severely Overdue (31-90 days)' },
                    { value: 'critical', label: 'Critically Overdue (90+ days)' }
                  ]}
                />
              </div>
            </div>
          </Card>

          {/* Overdue Bills Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-4 font-medium text-gray-900">Bill Number</th>
                    <th className="text-left p-4 font-medium text-gray-900">Supplier</th>
                    <th className="text-left p-4 font-medium text-gray-900">Due Date</th>
                    <th className="text-left p-4 font-medium text-gray-900">Amount</th>
                    <th className="text-left p-4 font-medium text-gray-900">Overdue Days</th>
                    <th className="text-left p-4 font-medium text-gray-900">Severity</th>
                    <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((bill) => {
                    const overdueDays = getOverdueDays(bill.dueDate);
                    const severity = getOverdueSeverity(overdueDays);
                    
                    return (
                      <tr key={bill.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4">
                          <div className="font-medium text-gray-900">{bill.billNumber}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">{bill.supplier?.name || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-600">{formatDate(bill.dueDate)}</td>
                        <td className="p-4 font-medium text-gray-900">{formatCurrency(bill.totalAmount)}</td>
                        <td className="p-4">
                          <span className={`font-medium ${severity.color}`}>
                            {overdueDays} days
                          </span>
                        </td>
                        <td className="p-4">
                          <Badge variant={severity.variant} className="flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {severity.text}
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
                              View
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              leftIcon={IndianRupee}
                              onClick={() => router.push(`/dashboard/payments/create?billId=${bill.id}`)}
                            >
                              Pay Now
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              leftIcon={Mail}
                              onClick={() => handleSendReminder(bill)}
                            >
                              Remind
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              leftIcon={Phone}
                              onClick={() => handleContactSupplier(bill.supplier)}
                            >
                              Contact
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
            {bills.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No overdue bills</h3>
                <p className="text-gray-600 mb-4">Great! All bills are up to date.</p>
                <Button
                  variant="primary"
                  onClick={() => router.push('/dashboard/bills')}
                >
                  View All Bills
                </Button>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading overdue bills...</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OverdueBills;
