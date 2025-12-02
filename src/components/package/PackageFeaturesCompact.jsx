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
  CheckCircle2,
  Infinity,
  Sparkles
} from 'lucide-react';

// Feature categories with theme-aware colors
const FEATURE_CATEGORIES = {
  'Product & Inventory': {
    features: ['product_management', 'inventory_management', 'stock_management'],
    icon: Package,
    description: 'Complete product and inventory management',
    bgClass: 'bg-[rgb(var(--color-primary))]/10',
    iconClass: 'text-[rgb(var(--color-primary))]'
  },
  'Sales & Billing': {
    features: ['invoice_management', 'customer_management'],
    icon: FileText,
    description: 'Invoice and customer management',
    bgClass: 'bg-[rgb(var(--color-success))]/10',
    iconClass: 'text-[rgb(var(--color-success))]'
  },
  'Financial Management': {
    features: ['expense_management', 'payment_management'],
    icon: IndianRupee,
    description: 'Expense and payment tracking',
    bgClass: 'bg-purple-500/10',
    iconClass: 'text-purple-600 dark:text-purple-400'
  },
  'Purchase & Procurement': {
    features: ['purchase_management', 'supplier_management', 'bill_management'],
    icon: ShoppingCart,
    description: 'Purchase orders and supplier management',
    bgClass: 'bg-orange-500/10',
    iconClass: 'text-orange-600 dark:text-orange-400'
  },
  'Store Management': {
    features: ['store_management'],
    icon: Building2,
    description: 'Multi-store management',
    bgClass: 'bg-[rgb(var(--color-primary))]/10',
    iconClass: 'text-[rgb(var(--color-primary))]'
  },
};

const PackageFeaturesCompact = ({ features = [] }) => {
  // Group features by category
  const categorySummary = Object.entries(FEATURE_CATEGORIES).map(([categoryName, categoryInfo]) => {
    const categoryFeatures = features.filter(f => 
      categoryInfo.features.includes(f.featureKey || f.key) && f.enabled !== false
    );

    if (categoryFeatures.length === 0) return null;

    // Check if all features in category have same limit
    const limits = categoryFeatures.map(f => f.totalLimit).filter(Boolean);
    const usageTypes = [...new Set(categoryFeatures.map(f => f.usageType).filter(Boolean))];
    
    const allUnlimited = usageTypes.length === 1 && usageTypes[0] === 'UNLIMITED';
    const allSameLimit = limits.length > 0 && new Set(limits).size === 1;
    const commonLimit = allSameLimit ? limits[0] : null;
    const commonUsageType = usageTypes.length === 1 ? usageTypes[0] : null;

    return {
      categoryName,
      categoryInfo,
      count: categoryFeatures.length,
      totalInCategory: categoryInfo.features.length,
      allIncluded: categoryFeatures.length === categoryInfo.features.length,
      allUnlimited,
      commonLimit,
      commonUsageType,
      hasLimits: limits.length > 0
    };
  }).filter(Boolean);

  const totalFeatures = features.filter(f => f.enabled !== false).length;
  const unlimitedCount = features.filter(f => f.enabled !== false && f.usageType === 'UNLIMITED').length;
  const hasAllUnlimited = unlimitedCount === totalFeatures && totalFeatures > 0;

  // Get usage badge text
  const getUsageText = (usageType, limit) => {
    if (usageType === 'UNLIMITED') return 'Unlimited';
    if (usageType === 'TOTAL') return `${limit} Total`;
    if (usageType === 'DAILY_FIXED') return `${limit}/Day`;
    if (usageType === 'MONTHLY_TOTAL') return `${limit}/Month`;
    return limit ? `${limit} Limit` : 'Included';
  };

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[rgb(var(--color-primary))]/5 to-[rgb(var(--color-primary))]/10 rounded-lg">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[rgb(var(--color-primary))]" />
          <span className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
            {totalFeatures} Features Included
          </span>
        </div>
        {hasAllUnlimited && (
          <span className="flex items-center gap-1 px-2 py-1 bg-[rgb(var(--color-success))]/20 text-[rgb(var(--color-success))] rounded-full text-xs font-medium">
            <Infinity className="w-3 h-3" />
            All Unlimited
          </span>
        )}
      </div>

      {/* Category Summary Cards */}
      <div className="space-y-2">
        {categorySummary.map(({ categoryName, categoryInfo, count, totalInCategory, allIncluded, allUnlimited, commonLimit, commonUsageType }) => {
          const Icon = categoryInfo.icon;
          
          return (
            <div
              key={categoryName}
              className="flex items-center justify-between p-3 bg-[rgb(var(--color-bg-primary))] rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`p-2 rounded-lg ${categoryInfo.bgClass}`}>
                  <Icon className={`w-4 h-4 ${categoryInfo.iconClass}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-[rgb(var(--color-text-primary))]">
                      {categoryName}
                    </h4>
                    {allIncluded && (
                      <CheckCircle2 className="w-4 h-4 text-[rgb(var(--color-success))] flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-0.5">
                    {allIncluded 
                      ? `All ${count} features included`
                      : `${count} of ${totalInCategory} features included`
                    }
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 ml-3">
                {allUnlimited ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[rgb(var(--color-success))]/20 text-[rgb(var(--color-success))]">
                    <Infinity className="w-3 h-3" />
                    Unlimited
                  </span>
                ) : commonLimit && commonUsageType ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[rgb(var(--color-primary))]/20 text-[rgb(var(--color-primary))]">
                    {getUsageText(commonUsageType, commonLimit)}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[rgb(var(--color-bg-tertiary))] text-[rgb(var(--color-text-secondary))]">
                    Included
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Info */}
      {categorySummary.length === 0 && (
        <div className="text-center py-4 text-sm text-[rgb(var(--color-text-secondary))]">
          No features configured for this plan
        </div>
      )}
    </div>
  );
};

export default PackageFeaturesCompact;

