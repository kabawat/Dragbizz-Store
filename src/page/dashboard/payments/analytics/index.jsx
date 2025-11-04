"use client"
import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { getPayments } from '@/store/slices/paymentsSlice';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { AnimatedBackground } from '@/components/ui';
import { 
  TrendingUp, 
  TrendingDown,
  BarChart3, 
  Download, 
  Calendar,
  IndianRupee,
  CreditCard,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Target,
  Zap,
  Activity
} from 'lucide-react';
import { Button, Select, Card } from '@/components/ui';

const PaymentAnalytics = () => {
  const dispatch = useAppDispatch();
  const { stats, isLoading, error } = useAppSelector((state) => state.payments);
  const { selectedStore } = useAppSelector((state) => state.profile);

  const [timeRange, setTimeRange] = useState('month');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [viewType, setViewType] = useState('overview');

  // Fetch payment data on component mount
  useEffect(() => {
    if (selectedStore?.id) {
      dispatch(getPayments({ store: selectedStore.id }));
    }
  }, [dispatch, selectedStore]);

  // Handle time range change
  const handleTimeRangeChange = (value) => {
    setTimeRange(value);
    // Fetch analytics data
    if (selectedStore?.id) {
      dispatch(getPayments({
        store: selectedStore.id,
        timeRange: value,
        supplier: supplierFilter,
        method: methodFilter
      }));
    }
  };

  // Handle supplier filter change
  const handleSupplierFilterChange = (value) => {
    setSupplierFilter(value);
    // Refetch analytics data
    if (selectedStore?.id) {
      dispatch(getPayments({
        store: selectedStore.id,
        timeRange,
        supplier: value,
        method: methodFilter
      }));
    }
  };

  // Handle method filter change
  const handleMethodFilterChange = (value) => {
    setMethodFilter(value);
    // Refetch analytics data
    if (selectedStore?.id) {
      dispatch(getPayments({
        store: selectedStore.id,
        timeRange,
        supplier: supplierFilter,
        method: value
      }));
    }
  };

  // Handle view type change
  const handleViewTypeChange = (value) => {
    setViewType(value);
  };

  // Handle export
  const handleExport = () => {
    // Implement export logic
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

  // Calculate growth rate
  const calculateGrowthRate = (current, previous) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  return (
    <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative">
      <AnimatedBackground variant="default" />
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
        {/* Header */}
        <Header
          title="Payment Analytics"
          description="View detailed payment analytics and insights"
        />

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Analytics Controls */}
          <Card className="mb-6">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <Select
                    value={timeRange}
                    onChange={handleTimeRangeChange}
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

                  <Select
                    value={viewType}
                    onChange={handleViewTypeChange}
                    options={[
                      { value: 'overview', label: 'Overview' },
                      { value: 'trends', label: 'Trends' },
                      { value: 'performance', label: 'Performance' },
                      { value: 'predictions', label: 'Predictions' }
                    ]}
                  />
                </div>

                <Button
                  variant="outline"
                  leftIcon={Download}
                  onClick={handleExport}
                >
                  Export Analytics
                </Button>
              </div>
            </div>
          </Card>

          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Payments</p>
                  <p className="text-2xl font-bold">{stats.totalPayments}</p>
                  <p className="text-blue-200 text-xs flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +15% from last period
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
                    +12% from last period
                  </p>
                </div>
                <IndianRupee className="w-8 h-8 text-green-200" />
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Avg. Payment</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalPayments > 0 ? stats.totalAmount / stats.totalPayments : 0)}</p>
                  <p className="text-purple-200 text-xs flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +8% from last period
                  </p>
                </div>
                <Target className="w-8 h-8 text-purple-200" />
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Processing Time</p>
                  <p className="text-2xl font-bold">2.5 days</p>
                  <p className="text-orange-200 text-xs flex items-center mt-1">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    -15% from last period
                  </p>
                </div>
                <Clock className="w-8 h-8 text-orange-200" />
              </div>
            </Card>
          </div>

          {/* Analytics Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Trends */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Payment Trends
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Weekly Growth</span>
                    <div className="flex items-center">
                      <span className="font-medium text-green-600 mr-2">+12.5%</span>
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Monthly Growth</span>
                    <div className="flex items-center">
                      <span className="font-medium text-green-600 mr-2">+18.3%</span>
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Quarterly Growth</span>
                    <div className="flex items-center">
                      <span className="font-medium text-green-600 mr-2">+25.7%</span>
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Yearly Growth</span>
                    <div className="flex items-center">
                      <span className="font-medium text-green-600 mr-2">+42.1%</span>
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Payment Efficiency */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Payment Efficiency
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Success Rate</span>
                    <div className="flex items-center">
                      <span className="font-medium text-green-600 mr-2">98.5%</span>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Approval Rate</span>
                    <div className="flex items-center">
                      <span className="font-medium text-green-600 mr-2">85.2%</span>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Rejection Rate</span>
                    <div className="flex items-center">
                      <span className="font-medium text-red-600 mr-2">14.8%</span>
                      <XCircle className="w-4 h-4 text-red-600" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Processing Efficiency</span>
                    <div className="flex items-center">
                      <span className="font-medium text-blue-600 mr-2">92.3%</span>
                      <Activity className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Supplier Performance */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Building2 className="w-5 h-5 mr-2" />
                  Supplier Performance
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-green-600 font-medium text-sm">A</span>
                      </div>
                      <span className="text-gray-700">Supplier A</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-gray-900">95%</span>
                      <span className="text-green-600 text-sm ml-2">↑</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-medium text-sm">B</span>
                      </div>
                      <span className="text-gray-700">Supplier B</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-gray-900">88%</span>
                      <span className="text-green-600 text-sm ml-2">↑</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-yellow-600 font-medium text-sm">C</span>
                      </div>
                      <span className="text-gray-700">Supplier C</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-gray-900">82%</span>
                      <span className="text-red-600 text-sm ml-2">↓</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Payment Method Analysis */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Payment Method Analysis
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Bank Transfer</span>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900 mr-2">45%</span>
                      <span className="text-green-600 text-sm">↑</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Cash</span>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900 mr-2">25%</span>
                      <span className="text-red-600 text-sm">↓</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Cheque</span>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900 mr-2">20%</span>
                      <span className="text-yellow-600 text-sm">→</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">UPI</span>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900 mr-2">10%</span>
                      <span className="text-green-600 text-sm">↑</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Predictive Analytics */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Predictive Analytics
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Next Month Forecast</span>
                    <div className="text-right">
                      <span className="font-medium text-gray-900">{formatCurrency(1250000)}</span>
                      <span className="text-green-600 text-sm ml-2">↑</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Expected Growth</span>
                    <div className="text-right">
                      <span className="font-medium text-green-600">+15.2%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Risk Level</span>
                    <div className="text-right">
                      <span className="font-medium text-green-600">Low</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Confidence Score</span>
                    <div className="text-right">
                      <span className="font-medium text-blue-600">87%</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Performance Metrics
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Payment Velocity</span>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900 mr-2">High</span>
                      <span className="text-green-600 text-sm">↑</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Cost Efficiency</span>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900 mr-2">92%</span>
                      <span className="text-green-600 text-sm">↑</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Customer Satisfaction</span>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900 mr-2">4.8/5</span>
                      <span className="text-green-600 text-sm">↑</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">System Uptime</span>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900 mr-2">99.9%</span>
                      <span className="text-green-600 text-sm">↑</span>
                    </div>
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

export default PaymentAnalytics;
