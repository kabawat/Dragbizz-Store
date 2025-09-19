"use client"
import React from 'react';
import Header from './Header';
import { 
  DollarSign, 
  Users, 
  Package, 
  Building2, 
  TrendingUp, 
  TrendingDown,
  ShoppingCart,
  Plus,
  FileText,
  UserPlus,
  PackagePlus,
  Building
} from 'lucide-react';

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
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center p-6 bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-sm border-2 border-dashed border-[rgb(var(--color-border-secondary))]/60 rounded-lg hover:border-[rgb(var(--color-primary))]/80 hover:bg-[rgb(var(--color-primary))]/10 transition-all duration-300 group"
  >
    <div className="w-12 h-12 bg-[rgb(var(--color-bg-tertiary))] rounded-lg flex items-center justify-center mb-3 group-hover:bg-[rgb(var(--color-primary))]/10 transition-colors">
      <Icon className="w-6 h-6 text-[rgb(var(--color-text-tertiary))] group-hover:text-[rgb(var(--color-primary))]" />
    </div>
    <span className="text-sm font-medium text-[rgb(var(--color-text-secondary))] group-hover:text-[rgb(var(--color-primary))]">{title}</span>
  </button>
);

const DashboardContent = ({ selectedStore = 'Main Store' }) => {
  const metrics = [
    {
      title: 'Total Revenue',
      value: '₹1,24,532',
      change: '+12.5%',
      changeType: 'up',
      icon: DollarSign,
      iconColor: 'bg-green-500'
    },
    {
      title: 'Total Customers',
      value: '1,247',
      change: '+8.2%',
      changeType: 'up',
      icon: Users,
      iconColor: 'bg-blue-500'
    },
    {
      title: 'Products in Stock',
      value: '3,428',
      change: '-2.1%',
      changeType: 'down',
      icon: Package,
      iconColor: 'bg-purple-500'
    },
    {
      title: 'Wholesalers',
      value: '43',
      change: '+5.3%',
      changeType: 'up',
      icon: Building2,
      iconColor: 'bg-orange-500'
    }
  ];

  const transactions = [
    { customer: 'John Smith', date: '2025-01-08', amount: '₹234.50', status: 'completed' },
    { customer: 'Sarah Johnson', date: '2025-01-08', amount: '₹89.99', status: 'pending' },
    { customer: 'Mike Davis', date: '2025-01-07', amount: '₹456.20', status: 'completed' },
    { customer: 'Lisa Brown', date: '2025-01-07', amount: '₹123.45', status: 'completed' }
  ];

  const quickActions = [
    { title: 'Add Customer', icon: UserPlus },
    { title: 'Add Product', icon: PackagePlus },
    { title: 'New Invoice', icon: FileText },
    { title: 'Add Wholesaler', icon: Building }
  ];

  return (
    <div className="flex-1 bg-[rgb(var(--color-bg-secondary))] min-h-screen flex flex-col">
      {/* Header */}
      <Header selectedStore={selectedStore} />

      {/* Main Content */}
      <div className="flex-1 p-6">

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Transactions */}
          <div className="lg:col-span-2">
            <div className="bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-md rounded-lg border border-[rgb(var(--color-border-primary))]/50 p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-4">Recent Transactions</h2>
              <div className="space-y-3">
                {transactions.map((transaction, index) => (
                  <TransactionItem key={index} {...transaction} />
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="bg-[rgb(var(--color-bg-primary))]/20 backdrop-blur-md rounded-lg border border-[rgb(var(--color-border-primary))]/50 p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <QuickActionButton key={index} {...action} />
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardContent;
