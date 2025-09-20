"use client"
import React from 'react';
import { Card, Badge } from '../ui';
import { Package, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

const ProductStats = ({
  stats = {},
  className = '',
  ...props
}) => {
  const {
    totalProducts = 0,
    activeProducts = 0,
    outOfStock = 0,
    lowStock = 0,
    totalValue = 0,
    averagePrice = 0,
    topCategory = '',
    recentAdditions = 0
  } = stats;
  
  const statCards = [
    {
      title: 'Total Products',
      value: totalProducts.toLocaleString(),
      change: '+12.5%',
      changeType: 'positive',
      icon: Package,
      color: 'blue'
    },
    {
      title: 'Active Products',
      value: activeProducts.toLocaleString(),
      change: '+8.2%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'green'
    },
    {
      title: 'Out of Stock',
      value: outOfStock.toLocaleString(),
      change: '-2.1%',
      changeType: 'negative',
      icon: AlertTriangle,
      color: 'red'
    },
    {
      title: 'Low Stock',
      value: lowStock.toLocaleString(),
      change: '+5.3%',
      changeType: 'positive',
      icon: TrendingDown,
      color: 'orange'
    }
  ];
  
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`} {...props}>
      {statCards.map((stat, index) => (
        <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-1">
                {stat.title}
              </p>
              <p className="text-3xl font-bold text-[rgb(var(--color-text-primary))] mb-2">
                {stat.value}
              </p>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-green-600' : 
                stat.changeType === 'negative' ? 'text-red-600' : 
                'text-[rgb(var(--color-text-secondary))]'
              }`}>
                {stat.changeType === 'positive' && <TrendingUp className="w-4 h-4" />}
                {stat.changeType === 'negative' && <TrendingDown className="w-4 h-4" />}
                <span>{stat.change}</span>
              </div>
            </div>
            <div className={`w-12 h-12 bg-[rgb(var(--color-primary))] bg-opacity-10 rounded-lg flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 text-[rgb(var(--color-primary))]`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ProductStats;
