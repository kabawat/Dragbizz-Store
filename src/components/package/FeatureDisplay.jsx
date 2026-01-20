"use client";
import {
  Building2,
  CheckCircle2,
  CreditCard,
  FileText,
  IndianRupee,
  Infinity,
  Info,
  Package,
  Receipt,
  ShoppingCart,
  TrendingUp,
  Users,
  Warehouse,
  XCircle,
} from "lucide-react";
import { useState } from "react";

// Feature icons mapping
const FEATURE_ICONS = {
  product_management: Package,
  inventory_management: Warehouse,
  stock_management: Warehouse,
  invoice_management: FileText,
  customer_management: Users,
  expense_management: IndianRupee,
  purchase_management: ShoppingCart,
  supplier_management: Building2,
  bill_management: Receipt,
  payment_management: CreditCard,
  store_management: Building2,
};

// Feature categories
const FEATURE_CATEGORIES = {
  "Product & Inventory": [
    "product_management",
    "inventory_management",
    "stock_management",
  ],
  "Sales & Billing": ["invoice_management", "customer_management"],
  Financial: ["expense_management", "payment_management"],
  "Purchase & Procurement": [
    "purchase_management",
    "supplier_management",
    "bill_management",
  ],
  "Store Management": ["store_management"],
};

// Usage type badges
const getUsageTypeBadge = (usageType, totalLimit) => {
  if (usageType === "UNLIMITED") {
    return {
      label: "Unlimited",
      icon: Infinity,
      className:
        "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
      iconClassName: "text-green-600 dark:text-green-400",
    };
  }

  if (usageType === "TOTAL") {
    return {
      label: `${totalLimit} Total`,
      icon: CheckCircle2,
      className:
        "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
      iconClassName: "text-blue-600 dark:text-blue-400",
    };
  }

  if (usageType === "DAILY_FIXED") {
    return {
      label: `${totalLimit}/Day`,
      icon: TrendingUp,
      className:
        "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200",
      iconClassName: "text-purple-600 dark:text-purple-400",
    };
  }

  if (usageType === "MONTHLY_TOTAL") {
    return {
      label: `${totalLimit}/Month`,
      icon: TrendingUp,
      className:
        "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200",
      iconClassName: "text-orange-600 dark:text-orange-400",
    };
  }

  return {
    label: `${totalLimit} Limit`,
    icon: Info,
    className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    iconClassName: "text-gray-600 dark:text-gray-400",
  };
};

const FeatureDisplay = ({
  features = [],
  variant = "card", // 'card', 'list', 'grid', 'compact'
  showCategories = true,
  maxFeatures = null,
}) => {
  const [expandedCategories, setExpandedCategories] = useState({});
  const [_hoveredFeature, setHoveredFeature] = useState(null);

  // Group features by category
  const groupedFeatures = showCategories
    ? features.reduce((acc, feature) => {
        const featureKey = feature.featureKey || feature.key;
        const category =
          Object.keys(FEATURE_CATEGORIES).find((cat) =>
            FEATURE_CATEGORIES[cat].includes(featureKey)
          ) || "Other";

        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(feature);
        return acc;
      }, {})
    : { "All Features": features };

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const renderFeature = (feature, index) => {
    const featureKey = feature.featureKey || feature.key;
    const featureName = feature.featureName || feature.name || featureKey;
    const Icon = FEATURE_ICONS[featureKey] || Package;
    const isEnabled = feature.enabled !== false;
    const usageType = feature.usageType;
    const totalLimit = feature.totalLimit;
    const highlight = feature.highlight;
    const badge = getUsageTypeBadge(usageType, totalLimit);
    const BadgeIcon = badge.icon;

    if (variant === "compact") {
      return (
        <div
          key={index}
          className={`flex items-center justify-between p-2 rounded-lg transition-all ${
            isEnabled
              ? "bg-[rgb(var(--color-bg-secondary))] hover:bg-[rgb(var(--color-bg-tertiary))]"
              : "bg-gray-50 dark:bg-gray-800 opacity-50"
          }`}
          onMouseEnter={() => setHoveredFeature(index)}
          onMouseLeave={() => setHoveredFeature(null)}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Icon
              className={`w-4 h-4 flex-shrink-0 ${
                isEnabled ? "text-[rgb(var(--color-primary))]" : "text-gray-400"
              }`}
            />
            <div className="flex-1 min-w-0">
              <span className="text-sm text-[rgb(var(--color-text-primary))] truncate block">
                {featureName}
              </span>
              {highlight && (
                <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-0.5 italic truncate">
                  {highlight}
                </p>
              )}
            </div>
          </div>
          {isEnabled && !highlight && badge && (
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.className}`}
            >
              <BadgeIcon className={`w-3 h-3 ${badge.iconClassName}`} />
              <span>{badge.label}</span>
            </div>
          )}
        </div>
      );
    }

    if (variant === "grid") {
      return (
        <div
          key={index}
          className={`p-4 rounded-xl border transition-all ${
            isEnabled
              ? "bg-[rgb(var(--color-bg-primary))] border-[rgb(var(--color-border-primary))] hover:border-[rgb(var(--color-primary))] hover:shadow-md"
              : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-50"
          }`}
          onMouseEnter={() => setHoveredFeature(index)}
          onMouseLeave={() => setHoveredFeature(null)}
        >
          <div className="flex items-start justify-between mb-3">
            <div
              className={`p-2 rounded-lg ${
                isEnabled
                  ? "bg-[rgb(var(--color-primary))]/10"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isEnabled
                    ? "text-[rgb(var(--color-primary))]"
                    : "text-gray-400"
                }`}
              />
            </div>
            {isEnabled ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <h4 className="font-semibold text-[rgb(var(--color-text-primary))] mb-1">
            {featureName}
          </h4>
          {highlight ? (
            <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1 italic">
              {highlight}
            </p>
          ) : (
            isEnabled &&
            badge && (
              <div
                className={`flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg text-xs font-medium ${badge.className}`}
              >
                <BadgeIcon className={`w-3.5 h-3.5 ${badge.iconClassName}`} />
                <span>{badge.label}</span>
              </div>
            )
          )}
        </div>
      );
    }

    // Default card/list variant
    return (
      <div
        key={index}
        className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
          isEnabled
            ? "bg-[rgb(var(--color-bg-secondary))] hover:bg-[rgb(var(--color-bg-tertiary))]"
            : "bg-gray-50 dark:bg-gray-800 opacity-50"
        }`}
        onMouseEnter={() => setHoveredFeature(index)}
        onMouseLeave={() => setHoveredFeature(null)}
      >
        <div
          className={`p-2 rounded-lg flex-shrink-0 ${
            isEnabled
              ? "bg-[rgb(var(--color-primary))]/10"
              : "bg-gray-200 dark:bg-gray-700"
          }`}
        >
          <Icon
            className={`w-4 h-4 ${
              isEnabled ? "text-[rgb(var(--color-primary))]" : "text-gray-400"
            }`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className="font-medium text-[rgb(var(--color-text-primary))] mb-1">
                {featureName}
              </h4>
              {highlight ? (
                <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1 italic">
                  {highlight}
                </p>
              ) : (
                isEnabled &&
                usageType &&
                usageType !== "UNLIMITED" && (
                  <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                    {usageType === "TOTAL" &&
                      "Overall limit for subscription period"}
                    {usageType === "DAILY_FIXED" && "Resets daily"}
                    {usageType === "MONTHLY_TOTAL" && "Resets monthly"}
                    {usageType === "DAILY_ROLLING" &&
                      "Daily limit with monthly total"}
                  </p>
                )
              )}
            </div>
            {isEnabled ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
            )}
          </div>
          {isEnabled && !highlight && badge && (
            <div
              className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-xs font-medium ${badge.className}`}
            >
              <BadgeIcon className={`w-3.5 h-3.5 ${badge.iconClassName}`} />
              <span>{badge.label}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const displayFeatures = maxFeatures
    ? features.slice(0, maxFeatures)
    : features;

  if (variant === "list" || !showCategories) {
    return (
      <div className="space-y-2">
        {displayFeatures.map((feature, index) => renderFeature(feature, index))}
        {maxFeatures && features.length > maxFeatures && (
          <div className="text-center pt-2">
            <span className="text-xs text-[rgb(var(--color-text-tertiary))]">
              + {features.length - maxFeatures} more features
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => {
        const isExpanded = expandedCategories[category] !== false;
        const displayCategoryFeatures = maxFeatures
          ? categoryFeatures.slice(0, maxFeatures)
          : categoryFeatures;

        return (
          <div
            key={category}
            className="border border-[rgb(var(--color-border-primary))] rounded-xl overflow-hidden"
          >
            <button
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center justify-between p-4 bg-[rgb(var(--color-bg-secondary))] hover:bg-[rgb(var(--color-bg-tertiary))] transition-colors"
            >
              <h3 className="font-semibold text-[rgb(var(--color-text-primary))]">
                {category}
              </h3>
              <span className="text-sm text-[rgb(var(--color-text-secondary))]">
                {categoryFeatures.length}{" "}
                {categoryFeatures.length === 1 ? "feature" : "features"}
              </span>
            </button>
            {isExpanded && (
              <div
                className={`p-4 space-y-2 ${
                  variant === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                    : "space-y-2"
                }`}
              >
                {displayCategoryFeatures.map((feature, index) =>
                  renderFeature(feature, index)
                )}
                {maxFeatures && categoryFeatures.length > maxFeatures && (
                  <div className="text-center pt-2 col-span-full">
                    <span className="text-xs text-[rgb(var(--color-text-tertiary))]">
                      + {categoryFeatures.length - maxFeatures} more in this
                      category
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FeatureDisplay;
