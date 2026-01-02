"use client"
import React from 'react';
import { Card, Button } from '@/components/ui';
import { CheckCircle, Sparkles } from 'lucide-react';
import { getCurrencySymbol } from '@/data/constants/currencies';

const PackageCard = ({ 
  pkg, 
  onSelect,
  buttonText = 'Select Plan',
  showBadge = true
}) => {
  const planTypeColors = {
    'BASIC': 'blue',
    'PROFESSIONAL': 'purple',
    'ENTERPRISE': 'orange',
    'CUSTOM': 'blue'
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        border: 'border-[rgb(var(--color-primary))]/30',
        button: 'bg-[rgb(var(--color-primary))] hover:opacity-90',
      },
      purple: {
        border: 'border-purple-500/30',
        button: 'bg-purple-500 hover:bg-purple-600',
      },
      orange: {
        border: 'border-orange-500/30',
        button: 'bg-orange-500 hover:bg-orange-600',
      }
    };
    return colors[color] || colors.blue;
  };

  const planType = pkg.planType || 'BASIC';
  const color = planTypeColors[planType] || 'blue';
  const colorClasses = getColorClasses(color);

  const getLowestPrice = (pkg) => {
    if (!pkg.pricing?.durationPricing || pkg.pricing.durationPricing.length === 0) {
      return { price: 0, months: 1, currency: 'INR' };
    }
    
    const sortedPricing = [...pkg.pricing.durationPricing].sort((a, b) => {
      const priceA = a.discountedPrice || a.price || 0;
      const priceB = b.discountedPrice || b.price || 0;
      return priceA - priceB;
    });
    
    const lowest = sortedPricing[0];
    return {
      price: lowest.discountedPrice || lowest.price || 0,
      months: lowest.months || 1,
      currency: pkg.pricing?.currency || 'INR'
    };
  };

  const lowestPrice = getLowestPrice(pkg);
  const currencySymbol = getCurrencySymbol(lowestPrice.currency);
  const features = pkg.featureUsageLimits || [];
  const highlights = features.filter(feature => feature.enabled !== false && feature.highlight);

  const handleSelect = () => {
    if (onSelect) {
      onSelect(pkg.id || pkg._id);
    } else {
      window.location.href = `/checkout?packageId=${pkg.id || pkg._id}`;
    }
  };

  return (
    <Card
      className={`relative bg-[rgb(var(--color-bg-primary))] border-2 ${pkg.isPopular ? colorClasses.border : 'border-[rgb(var(--color-border-primary))]'} rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-visible`}
    >
      {showBadge && pkg.isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-[rgb(var(--color-primary))] text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg">
            MOST POPULAR
          </span>
        </div>
      )}
      
      {showBadge && pkg.isRecommended && !pkg.isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-[rgb(var(--color-success))] text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg">
            RECOMMENDED
          </span>
        </div>
      )}

      <div className="p-6">
        {/* Package Name */}
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-2">
            {pkg.name}
          </h3>
          {pkg.shortDescription && (
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
              {pkg.shortDescription}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-[rgb(var(--color-text-primary))]">
              {currencySymbol}{lowestPrice.price.toFixed(2)}
            </span>
            <span className="text-sm text-[rgb(var(--color-text-secondary))]">
              /{lowestPrice.months === 1 ? 'month' : `${lowestPrice.months} months`}
            </span>
          </div>
          {pkg.pricing?.durationPricing && pkg.pricing.durationPricing.length > 1 && (
            <p className="text-xs text-[rgb(var(--color-text-tertiary))] mt-1">
              Starting from
            </p>
          )}
        </div>

        {/* Features */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-[rgb(var(--color-text-primary))] mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[rgb(var(--color-primary))]" />
            What's Included
          </h4>
          <div className="space-y-2">
            {highlights.length > 0 ? (
              highlights.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-2 rounded-lg bg-[rgb(var(--color-bg-secondary))]"
                >
                  <CheckCircle className="w-4 h-4 text-[rgb(var(--color-success))] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[rgb(var(--color-text-primary))]">
                    {feature.highlight}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-[rgb(var(--color-text-secondary))] italic">
                No highlights available
              </p>
            )}
          </div>
          {pkg.maxSubscribers && (
            <div className="mt-3 p-2 rounded-lg bg-[rgb(var(--color-primary))]/10">
              <p className="text-xs text-[rgb(var(--color-primary))]">
                Limited to {pkg.maxSubscribers.toLocaleString()} subscribers
              </p>
            </div>
          )}
          {pkg.trialPeriod?.enabled && pkg.trialPeriod?.days && (
            <div className="mt-2 p-2 rounded-lg bg-[rgb(var(--color-success))]/10">
              <p className="text-xs text-[rgb(var(--color-success))]">
                {pkg.trialPeriod.days} Days Free Trial
              </p>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <Button
          variant="primary"
          size="md"
          fullWidth
          onClick={handleSelect}
          className={pkg.isPopular ? colorClasses.button : ''}
        >
          {buttonText}
        </Button>
      </div>
    </Card>
  );
};

export default PackageCard;

