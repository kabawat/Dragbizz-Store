"use client"
import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { getPaymentReports, getPaymentStats } from '@/store/slices/paymentsSlice';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { AnimatedBackground } from '@/components/ui';
import { 
  BarChart3, 
  Download, 
  Calendar,
  IndianRupee,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { Button, Select, Card } from '@/components/ui';

const PaymentReports = () => {
  const dispatch = useAppDispatch();
  const { stats, isLoading, error } = useAppSelector((state) => state.payments);
  const { selectedStore } = useAppSelector((state) => state.profile);

  const [reportType, setReportType] = useState('summary');
  const [dateRange, setDateRange] = useState('month');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  // Fetch payment stats on component mount
  useEffect(() => {
    if (selectedStore?.id) {
      dispatch(getPaymentStats(selectedStore.id));
    }
  }, [dispatch, selectedStore]);

  // Handle report type change
  const handleReportTypeChange = (value) => {
    setReportType(value);
    // Fetch specific report data
    if (selectedStore?.id) {
      dispatch(getPaymentReports({
        store: selectedStore.id,
        type: value,
        dateRange,
        supplier: supplierFilter,
        method: methodFilter
      }));
    }
  };

  // Handle date range change
  const handleDateRangeChange = (value) => {
    setDateRange(value);
    // Refetch report data
    if (selectedStore?.id) {
      dispatch(getPaymentReports({
        store: selectedStore.id,
        type: reportType,
        dateRange: value,
        supplier: supplierFilter,
        method: methodFilter
      }));
    }
  };

  // Handle supplier filter change
  const handleSupplierFilterChange = (value) => {
    setSupplierFilter(value);
    // Refetch report data
    if (selectedStore?.id) {
      dispatch(getPaymentReports({
        store: selectedStore.id,
        type: reportType,
        dateRange,
        supplier: value,
        method: methodFilter
      }));
    }
  };

  // Handle method filter change
  const handleMethodFilterChange = (value) => {
    setMethodFilter(value);
    // Refetch report data
    if (selectedStore?.id) {
      dispatch(getPaymentReports({
        store: selectedStore.id,
        type: reportType,
        dateRange,
        supplier: supplierFilter,
        method: value
      }));
    }
  };

  // Handle export
  const handleExport = () => {
    // Implement export logic
    console.log('Exporting payment report:', { reportType, dateRange, supplierFilter, methodFilter });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative">
      <AnimatedBackground variant="default" />
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
        {/* Header */}
        <Header
          title="Payment Reports"
          description="View detailed payment reports and analytics"
        />

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Report Controls */}
          <Card className="mb-6">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <Select
                    value={reportType}
                    onChange={handleReportTypeChange}
                    options={[
                      { value: 'summary', label: 'Summary Report' },
                      { value: 'detailed', label: 'Detailed Report' },
                      { value: 'supplier', label: 'Supplier Analysis' },
                      { value: 'method', label: 'Payment Method Analysis' },
                      { value: 'trends', label: 'Trend Analysis' },
                      { value: 'approval', label: 'Approval Report' }
                    ]}
                  />

                  <Select
                    value={dateRange}
                    onChange={handleDateRangeChange}
                    options={[
                      { value: 'week', label: 'Last Week' },
                      { value: 'month', label: 'Last Month' },
                      { value: 'quarter', label: 'Last Quarter' },
                      { value: 'year', label: 'Last Year' },
                      { value: 'custom', label: 'Custom Range' }
                    ]}
                  />

                  <Select
                    value={supplierFilter}
                    onChange={handleSupplierFilterChange}
                    options={[
                      { value: 'all', label: 'All Suppliers' },
                      { value: 'supplier1', label: 'Supplier 1' },
                      { value: 'supplier2', label: 'Supplier 2' }
                    ]}
                  />

                  <Select
                    value={methodFilter}
                    onChange={handleMethodFilterChange}
                    options={[
                      { value: 'all', label: 'All Methods' },
                      { value: 'cash', label: 'Cash' },
                      { value: 'bank_transfer', label: 'Bank Transfer' },
                      { value: 'cheque', label: 'Cheque' },
                      { value: 'upi', label: 'UPI' },
                      { value: 'card', label: 'Card' }
                    ]}
                  />
                </div>

                <Button
                  variant="outline"
                  leftIcon={Download}
                  onClick={handleExport}
                >
                  Export Report
                </Button>
              </div>
            </div>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Payments</p>
                  <p className="text-2xl font-bold">{stats.totalPayments}</p>
                  <p className="text-blue-200 text-xs flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +15% from last month
                  </p>
                </div>
                <CreditCard className="w-8 h-8 text-blue-200" />
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Amount</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</p>
                  <p className="text-green-200 text-xs flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12% from last month
                  </p>
                </div>
                <IndianRupee className="w-8 h-8 text-green-200" />
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Pending Payments</p>
                  <p className="text-2xl font-bold">{stats.pendingPayments}</p>
                  <p className="text-yellow-200 text-xs flex items-center mt-1">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    -8% from last month
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-200" />
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Approved Payments</p>
                  <p className="text-2xl font-bold">{stats.approvedPayments}</p>
                  <p className="text-purple-200 text-xs flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +18% from last month
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-purple-200" />
              </div>
            </Card>
          </div>

          {/* Report Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Status Chart */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Payment Status Distribution
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                      <span className="text-gray-700">Approved</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-gray-900">75%</span>
                      <span className="text-gray-600 ml-2">({stats.approvedPayments})</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-yellow-500 rounded mr-3"></div>
                      <span className="text-gray-700">Pending</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-gray-900">20%</span>
                      <span className="text-gray-600 ml-2">({stats.pendingPayments})</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-500 rounded mr-3"></div>
                      <span className="text-gray-700">Rejected</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-gray-900">5%</span>
                      <span className="text-gray-600 ml-2">({stats.rejectedPayments})</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Payment Methods */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Methods Distribution
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                      <span className="text-gray-700">Bank Transfer</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-gray-900">45%</span>
                      <span className="text-gray-600 ml-2">({formatCurrency(450000)})</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                      <span className="text-gray-700">Cash</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-gray-900">25%</span>
                      <span className="text-gray-600 ml-2">({formatCurrency(250000)})</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-yellow-500 rounded mr-3"></div>
                      <span className="text-gray-700">Cheque</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-gray-900">20%</span>
                      <span className="text-gray-600 ml-2">({formatCurrency(200000)})</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-purple-500 rounded mr-3"></div>
                      <span className="text-gray-700">UPI</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-gray-900">10%</span>
                      <span className="text-gray-600 ml-2">({formatCurrency(100000)})</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Top Suppliers */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Building2 className="w-5 h-5 mr-2" />
                  Top Suppliers by Payment Amount
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-medium text-sm">1</span>
                      </div>
                      <span className="text-gray-700">Supplier A</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-gray-900">25 payments</span>
                      <span className="text-gray-600 ml-2">({formatCurrency(350000)})</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-green-600 font-medium text-sm">2</span>
                      </div>
                      <span className="text-gray-700">Supplier B</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-gray-900">18 payments</span>
                      <span className="text-gray-600 ml-2">({formatCurrency(280000)})</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-yellow-600 font-medium text-sm">3</span>
                      </div>
                      <span className="text-gray-700">Supplier C</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-gray-900">15 payments</span>
                      <span className="text-gray-600 ml-2">({formatCurrency(220000)})</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Monthly Trends */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Monthly Payment Trends
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">This Month</span>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900 mr-2">45 payments</span>
                      <span className="text-green-600 text-sm">+15%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Last Month</span>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900 mr-2">39 payments</span>
                      <span className="text-red-600 text-sm">-5%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">2 Months Ago</span>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900 mr-2">41 payments</span>
                      <span className="text-green-600 text-sm">+8%</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Approval Performance */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Approval Performance
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Average Approval Time</span>
                    <span className="font-medium text-gray-900">2.5 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Approval Rate</span>
                    <span className="font-medium text-green-600">85%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Rejection Rate</span>
                    <span className="font-medium text-red-600">15%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Pending Review</span>
                    <span className="font-medium text-yellow-600">20%</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Payment Efficiency */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Payment Efficiency Metrics
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">On-Time Payment Rate</span>
                    <span className="font-medium text-green-600">92%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Late Payment Rate</span>
                    <span className="font-medium text-red-600">8%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Average Processing Time</span>
                    <span className="font-medium text-blue-600">1.8 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Payment Success Rate</span>
                    <span className="font-medium text-green-600">98%</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentReports;
