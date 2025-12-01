"use client"
import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { getBillReports, getBillStats } from '@/store/slices/billsSlice';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { AnimatedBackground } from '@/components/ui';
import { 
  BarChart3, 
  Download, 
  Calendar,
  IndianRupee,
  Receipt,
  TrendingUp,
  TrendingDown,
  Building2,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Button, Select, Card } from '@/components/ui';

const BillReports = () => {
  const dispatch = useAppDispatch();
  const { stats, isLoading, error } = useAppSelector((state) => state.bills);
  const { selectedStore } = useAppSelector((state) => state.profile);

  const [reportType, setReportType] = useState('summary');
  const [dateRange, setDateRange] = useState('month');
  const [supplierFilter, setSupplierFilter] = useState('all');

  // Fetch bill stats on component mount
  useEffect(() => {
    if (selectedStore?.id) {
      dispatch(getBillStats(selectedStore.id));
    }
  }, [dispatch, selectedStore]);

  // Handle report type change
  const handleReportTypeChange = (value) => {
    setReportType(value);
    // Fetch specific report data
    if (selectedStore?.id) {
      dispatch(getBillReports({
        store: selectedStore.id,
        type: value,
        dateRange,
        supplier: supplierFilter
      }));
    }
  };

  // Handle date range change
  const handleDateRangeChange = (value) => {
    setDateRange(value);
    // Refetch report data
    if (selectedStore?.id) {
      dispatch(getBillReports({
        store: selectedStore.id,
        type: reportType,
        dateRange: value,
        supplier: supplierFilter
      }));
    }
  };

  // Handle supplier filter change
  const handleSupplierFilterChange = (value) => {
    setSupplierFilter(value);
    // Refetch report data
    if (selectedStore?.id) {
      dispatch(getBillReports({
        store: selectedStore.id,
        type: reportType,
        dateRange,
        supplier: value
      }));
    }
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

  return (
    <div className="flex h-screen bg-[rgb(var(--color-bg-secondary))] relative">
      <AnimatedBackground variant="default" />
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
        {/* Header */}
        <Header
          title="Bill Reports"
          description="View detailed bill reports and analytics"
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
                      { value: 'trends', label: 'Trend Analysis' },
                      { value: 'aging', label: 'Aging Report' }
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
                  <p className="text-blue-100 text-sm font-medium">Total Bills</p>
                  <p className="text-2xl font-bold">{stats.totalBills}</p>
                  <p className="text-blue-200 text-xs flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12% from last month
                  </p>
                </div>
                <Receipt className="w-8 h-8 text-blue-200" />
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Amount</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</p>
                  <p className="text-green-200 text-xs flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +8% from last month
                  </p>
                </div>
                <IndianRupee className="w-8 h-8 text-green-200" />
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Pending Bills</p>
                  <p className="text-2xl font-bold">{stats.pendingBills}</p>
                  <p className="text-yellow-200 text-xs flex items-center mt-1">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    -5% from last month
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-200" />
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Overdue Bills</p>
                  <p className="text-2xl font-bold">{stats.overdueBills}</p>
                  <p className="text-red-200 text-xs flex items-center mt-1">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    -15% from last month
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-200" />
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
                      <span className="text-gray-700">Paid</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-gray-900">65%</span>
                      <span className="text-gray-600 ml-2">({stats.totalBills - stats.pendingBills - stats.overdueBills})</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-yellow-500 rounded mr-3"></div>
                      <span className="text-gray-700">Pending</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-gray-900">25%</span>
                      <span className="text-gray-600 ml-2">({stats.pendingBills})</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-500 rounded mr-3"></div>
                      <span className="text-gray-700">Overdue</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-gray-900">10%</span>
                      <span className="text-gray-600 ml-2">({stats.overdueBills})</span>
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
                  Top Suppliers by Bill Count
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
                      <span className="font-medium text-gray-900">45 bills</span>
                      <span className="text-gray-600 ml-2">({formatCurrency(125000)})</span>
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
                      <span className="font-medium text-gray-900">32 bills</span>
                      <span className="text-gray-600 ml-2">({formatCurrency(89000)})</span>
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
                      <span className="font-medium text-gray-900">28 bills</span>
                      <span className="text-gray-600 ml-2">({formatCurrency(67000)})</span>
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
                  Monthly Bill Trends
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">This Month</span>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900 mr-2">85 bills</span>
                      <span className="text-green-600 text-sm">+12%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Last Month</span>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900 mr-2">76 bills</span>
                      <span className="text-red-600 text-sm">-5%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">2 Months Ago</span>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900 mr-2">80 bills</span>
                      <span className="text-green-600 text-sm">+8%</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Payment Performance */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Payment Performance
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Average Payment Time</span>
                    <span className="font-medium text-gray-900">18 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">On-Time Payment Rate</span>
                    <span className="font-medium text-green-600">78%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Late Payment Rate</span>
                    <span className="font-medium text-red-600">22%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Average Overdue Days</span>
                    <span className="font-medium text-orange-600">12 days</span>
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

export default BillReports;
