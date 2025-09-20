"use client"
import React from 'react';
import { Card } from '../ui';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatsCard = ({
  title,
  value,
  change,
  changeType = 'neutral', // 'positive', 'negative', 'neutral'
  icon: Icon,
  className = '',
  ...props
}) => {
  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive':
        return <TrendingUp className="w-4 h-4" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };
  
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-[rgb(var(--color-text-secondary))]';
    }
  };
  
  return (
    <Card className={`p-6 hover:shadow-lg transition-all duration-300 ${className}`} {...props}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-[rgb(var(--color-text-primary))] mb-2">
            {value}
          </p>
          {change && (
            <div className={`flex items-center gap-1 text-sm font-medium ${getChangeColor()}`}>
              {getChangeIcon()}
              <span>{change}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="w-12 h-12 bg-[rgb(var(--color-primary))] bg-opacity-10 rounded-lg flex items-center justify-center">
            <Icon className="w-6 h-6 text-[rgb(var(--color-primary))]" />
          </div>
        )}
      </div>
    </Card>
  );
};

const StatsGrid = ({
  stats = [],
  columns = 4,
  className = '',
  ...props
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  };
  
  return (
    <div className={`grid ${gridCols[columns]} gap-6 ${className}`} {...props}>
      {stats.map((stat, index) => (
        <StatsCard
          key={index}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          changeType={stat.changeType}
          icon={stat.icon}
          className={stat.className}
        />
      ))}
    </div>
  );
};

export { StatsCard, StatsGrid };
export default StatsGrid;
