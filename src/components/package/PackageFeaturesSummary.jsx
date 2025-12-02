"use client"
import { 
  Package, 
  Users, 
  FileText, 
  ShoppingCart, 
  Warehouse, 
  IndianRupee, 
  Building2, 
  Receipt,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Infinity,
  CheckCircle2
} from 'lucide-react';
import { useState } from 'react';

// Feature categories with icons
const FEATURE_CATEGORIES = {
  'Product & Inventory': {
    features: ['product_management', 'inventory_management', 'stock_management'],
    icon: Package,
    color: 'blue',
    bgClass: 'bg-blue-100 dark:bg-blue-900/20',
    iconClass: 'text-blue-600 dark:text-blue-400'
  },
  'Sales & Billing': {
    features: ['invoice_management', 'customer_management'],
    icon: FileText,
    color: 'green',
    bgClass: 'bg-green-100 dark:bg-green-900/20',
    iconClass: 'text-green-600 dark:text-green-400'
  },
  'Financial Management': {
    features: ['expense_management', 'payment_management'],
    icon: IndianRupee,
    color: 'purple',
    bgClass: 'bg-purple-100 dark:bg-purple-900/20',
    iconClass: 'text-purple-600 dark:text-purple-400'
  },
  'Purchase & Procurement': {
    features: ['purchase_management', 'supplier_management', 'bill_management'],
    icon: ShoppingCart,
    color: 'orange',
    bgClass: 'bg-orange-100 dark:bg-orange-900/20',
    iconClass: 'text-orange-600 dark:text-orange-400'
  },
  'Store Management': {
    features: ['store_management'],
    icon: Building2,
    color: 'indigo',
    bgClass: 'bg-indigo-100 dark:bg-indigo-900/20',
    iconClass: 'text-indigo-600 dark:text-indigo-400'
  },
};

// Feature display names
const FEATURE_NAMES = {
  product_management: 'Product Management',
  inventory_management: 'Inventory Management',
  stock_management: 'Stock Management',
  invoice_management: 'Invoice Management',
  customer_management: 'Customer Management',
  expense_management: 'Expense Management',
  payment_management: 'Payment Management',
  purchase_management: 'Purchase Management',
  supplier_management: 'Supplier Management',
  bill_management: 'Bill Management',
  store_management: 'Store Management',
};

const PackageFeaturesSummary = ({ features = [] }) => {
  const [expandedCategories, setExpandedCategories] = useState({});
  const [showAll, setShowAll] = useState(false);

  // Group features by category
  const categoryData = Object.entries(FEATURE_CATEGORIES).map(([categoryName, categoryInfo]) => {
    const categoryFeatures = features.filter(f => 
      categoryInfo.features.includes(f.featureKey || f.key)
    );

    if (categoryFeatures.length === 0) return null;

    // Get common usage type and limit for summary
    const usageTypes = [...new Set(categoryFeatures.map(f => f.usageType).filter(Boolean))];
    const limits = categoryFeatures.map(f => f.totalLimit).filter(Boolean);
    
    // Determine if all have same limit
    const allSameLimit = limits.length > 0 && new Set(limits).size === 1;
    const commonLimit = allSameLimit ? limits[0] : null;
    const commonUsageType = usageTypes.length === 1 ? usageTypes[0] : null;

    return {
      categoryName,
      categoryInfo,
      features: categoryFeatures,
      count: categoryFeatures.length,
      commonLimit,
      commonUsageType,
      allUnlimited: usageTypes.length === 1 && usageTypes[0] === 'UNLIMITED'
    };
  }).filter(Boolean);

  const toggleCategory = (categoryName) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  const getUsageBadge = (usageType, totalLimit) => {
    if (usageType === 'UNLIMITED') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">
          <Infinity className="w-3 h-3" />
          Unlimited
        </span>
      );
    }
    
    if (usageType === 'TOTAL') {
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
          {totalLimit} Total
        </span>
      );
    }
    
    if (usageType === 'DAILY_FIXED') {
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200">
          {totalLimit}/Day
        </span>
      );
    }
    
    if (usageType === 'MONTHLY_TOTAL') {
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200">
          {totalLimit}/Month
        </span>
      );
    }
    
    return totalLimit ? (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
        {totalLimit} Limit
      </span>
    ) : null;
  };

  const visibleCategories = showAll ? categoryData : categoryData.slice(0, 3);

  return (
    <div className="space-y-3">
      {visibleCategories.map(({ categoryName, categoryInfo, features: categoryFeatures, count, commonLimit, commonUsageType, allUnlimited }) => {
        const Icon = categoryInfo.icon;
        const isExpanded = expandedCategories[categoryName];
        const hasMultipleLimits = categoryFeatures.some(f => 
          f.usageType !== commonUsageType || f.totalLimit !== commonLimit
        );

        return (
          <div
            key={categoryName}
            className="border border-[rgb(var(--color-border-primary))] rounded-lg overflow-hidden bg-[rgb(var(--color-bg-primary))]"
          >
            <button
              onClick={() => toggleCategory(categoryName)}
              className="w-full flex items-center justify-between p-3 hover:bg-[rgb(var(--color-bg-secondary))] transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className={`p-2 rounded-lg ${categoryInfo.bgClass}`}>
                  <Icon className={`w-4 h-4 ${categoryInfo.iconClass}`} />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-[rgb(var(--color-text-primary))]">
                      {categoryName}
                    </h4>
                    <span className="text-xs text-[rgb(var(--color-text-tertiary))]">
                      ({count} {count === 1 ? 'feature' : 'features'})
                    </span>
                  </div>
                  {!isExpanded && (
                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                      {allUnlimited ? (
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                          All Unlimited
                        </span>
                      ) : hasMultipleLimits ? (
                        <span className="text-xs text-[rgb(var(--color-text-secondary))]">
                          Various limits
                        </span>
                      ) : commonLimit && commonUsageType ? (
                        getUsageBadge(commonUsageType, commonLimit)
                      ) : (
                        <span className="text-xs text-[rgb(var(--color-text-secondary))]">
                          Included
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
              )}
            </button>

            {isExpanded && (
              <div className="border-t border-[rgb(var(--color-border-primary))] p-3 bg-[rgb(var(--color-bg-secondary))] space-y-2">
                {categoryFeatures.map((feature, idx) => {
                  const featureName = feature.featureName || FEATURE_NAMES[feature.featureKey || feature.key] || feature.featureKey || feature.key;
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-[rgb(var(--color-bg-tertiary))]"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-[rgb(var(--color-text-primary))]">
                          {featureName}
                        </span>
                      </div>
                      {feature.usageType && feature.usageType !== 'UNLIMITED' && (
                        getUsageBadge(feature.usageType, feature.totalLimit)
                      )}
                      {feature.usageType === 'UNLIMITED' && (
                        getUsageBadge('UNLIMITED', null)
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {categoryData.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full text-center py-2 text-sm text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary))]/80 transition-colors"
        >
          {showAll ? 'Show Less' : `+ ${categoryData.length - 3} More Categories`}
        </button>
      )}

      {/* Total Features Count */}
      <div className="pt-2 border-t border-[rgb(var(--color-border-primary))]">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[rgb(var(--color-text-secondary))]">
            Total Features
          </span>
          <span className="font-semibold text-[rgb(var(--color-text-primary))]">
            {features.filter(f => f.enabled !== false).length} Included
          </span>
        </div>
      </div>
    </div>
  );
};

export default PackageFeaturesSummary;

