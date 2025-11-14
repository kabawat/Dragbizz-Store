"use client"
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, Button, Loading } from '@/components/ui';
import { CheckCircle, Sparkles, ArrowLeft, Crown } from 'lucide-react';
import { packageService } from '@/service';
import ProductHeader from '@/components/layout/ProductHeader';
import AnimatedBackground from '@/components/ui/AnimatedBackground';
import { getCurrencySymbol } from '@/data/constants/currencies';

const PackagesContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const upgrade = searchParams.get('upgrade');
  
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const planTypeColors = {
    'BASIC': 'blue',
    'PROFESSIONAL': 'purple',
    'ENTERPRISE': 'orange',
    'CUSTOM': 'blue'
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        ribbon: 'bg-blue-500',
        button: 'bg-blue-500 hover:bg-blue-600',
        border: 'border-blue-200'
      },
      purple: {
        ribbon: 'bg-purple-500',
        button: 'bg-purple-500 hover:bg-purple-600',
        border: 'border-purple-200'
      },
      orange: {
        ribbon: 'bg-orange-500',
        button: 'bg-orange-500 hover:bg-orange-600',
        border: 'border-orange-200'
      }
    };
    return colors[color] || colors.blue;
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await packageService.getPackages({
        status: 'ACTIVE',
        isVisible: true,
        sortBy: 'displayOrder',
        sortOrder: 'asc',
        limit: 100
      });

      if (response.success && response.data) {
        const packagesData = Array.isArray(response.data) ? response.data : [];
        setPackages(packagesData);
      } else {
        setError('Failed to load packages');
      }
    } catch (err) {
      console.error('Error fetching packages:', err);
      setError(err.message || 'Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPackage = (packageId) => {
    router.push(`/checkout?packageId=${packageId}`);
  };

  const getLowestPrice = (pkg) => {
    if (!pkg.pricing?.durationPricing || pkg.pricing.durationPricing.length === 0) {
      return { price: 0, months: 1, currency: 'INR' };
    }
    
    const sorted = [...pkg.pricing.durationPricing].sort((a, b) => 
      (a.discountedPrice || a.price) - (b.discountedPrice || b.price)
    );
    
    return {
      price: sorted[0].discountedPrice || sorted[0].price,
      months: sorted[0].months,
      currency: pkg.pricing.currency || 'INR'
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]">
        <ProductHeader />
        <AnimatedBackground variant="default" />
        <div className="flex items-center justify-center min-h-[60vh] relative z-10">
          <Loading />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]">
        <ProductHeader />
        <AnimatedBackground variant="default" />
        <div className="flex items-center justify-center min-h-[60vh] relative z-10">
          <Card className="p-8 text-center max-w-md">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => router.push('/')}>Go Back Home</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] relative overflow-hidden">
      <AnimatedBackground variant="default" />
      <ProductHeader />
      
      <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          {upgrade && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[rgb(var(--color-primary))]/10 rounded-full mb-4">
              <Crown className="w-4 h-4 text-[rgb(var(--color-primary))]" />
              <span className="text-sm font-medium text-[rgb(var(--color-primary))]">
                Upgrade Your Plan
              </span>
            </div>
          )}
          <h1 className="text-4xl md:text-5xl font-bold text-[rgb(var(--color-text-primary))] mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-[rgb(var(--color-text-secondary))] max-w-2xl mx-auto">
            Select the perfect subscription plan for your business needs. All plans include our core features with varying limits and capabilities.
          </p>
        </div>

        {/* Packages Grid */}
        {packages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {packages.map((pkg) => {
              const planType = pkg.planType || 'BASIC';
              const color = planTypeColors[planType] || 'blue';
              const colorClasses = getColorClasses(color);
              const lowestPrice = getLowestPrice(pkg);
              const currencySymbol = getCurrencySymbol(lowestPrice.currency);

              // Get features
              const features = pkg.featureUsageLimits
                ?.filter(f => f.enabled !== false)
                .map(f => {
                  const featureName = f.featureName || f.featureKey;
                  if (f.usageType && f.usageType !== 'UNLIMITED') {
                    const limitSuffix = f.totalLimit ? ` - ${f.totalLimit}` : '';
                    return `${featureName}${limitSuffix}`;
                  }
                  return featureName;
                }) || [];

              if (pkg.maxSubscribers) {
                features.push(`Limited to ${pkg.maxSubscribers.toLocaleString()} subscribers`);
              }
              if (pkg.trialPeriod?.enabled && pkg.trialPeriod?.days) {
                features.push(`${pkg.trialPeriod.days} Days Free Trial`);
              }

              return (
                <Card
                  key={pkg.id || pkg._id}
                  className={`relative bg-[rgb(var(--color-bg-secondary))] border-2 ${pkg.isPopular ? colorClasses.border : 'border-[rgb(var(--color-border-primary))]'} rounded-xl shadow-lg overflow-visible`}
                >
                  {pkg.isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-[rgb(var(--color-primary))] text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg">
                        MOST POPULAR
                      </span>
                    </div>
                  )}
                  
                  {pkg.isRecommended && !pkg.isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-green-500 text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg">
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
                        Features
                      </h4>
                      <ul className="space-y-2">
                        {features.slice(0, 8).map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-[rgb(var(--color-text-secondary))]">
                              {feature}
                            </span>
                          </li>
                        ))}
                        {features.length > 8 && (
                          <li className="text-xs text-[rgb(var(--color-text-tertiary))] pl-6">
                            + {features.length - 8} more features
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* CTA Button */}
                    <Button
                      variant="primary"
                      size="md"
                      fullWidth
                      onClick={() => handleSelectPackage(pkg.id || pkg._id)}
                      className={pkg.isPopular ? colorClasses.button : ''}
                    >
                      {upgrade ? 'Upgrade Now' : 'Select Plan'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[rgb(var(--color-text-secondary))]">
              No packages available at the moment.
            </p>
          </div>
        )}

        {/* Back Button */}
        <div className="text-center mt-12">
          <Button
            variant="outline"
            onClick={() => router.back()}
            leftIcon={ArrowLeft}
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

const PackagesPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]">
        <ProductHeader />
        <AnimatedBackground variant="default" />
        <div className="flex items-center justify-center min-h-[60vh] relative z-10">
          <Loading />
        </div>
      </div>
    }>
      <PackagesContent />
    </Suspense>
  );
};

export default PackagesPage;

