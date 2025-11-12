"use client"
import React, { useState, useEffect } from 'react';
import { Card, Button, Loading } from '@/components/ui';
import { CheckCircle } from 'lucide-react';
import { packageService } from '@/service';

const PricingSection = ({
  title = 'Choose Your Plan',
  description = 'Select the perfect plan for your business needs',
  plans: defaultPlans = []
}) => {
  const [plans, setPlans] = useState(defaultPlans);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const planTypeColors = {
    'BASIC': 'blue',
    'PROFESSIONAL': 'purple',
    'ENTERPRISE': 'orange',
    'CUSTOM': 'blue'
  };

  const planTypeEmojis = {
    'BASIC': '🦊',
    'PROFESSIONAL': '🐼',
    'ENTERPRISE': '🦄',
    'CUSTOM': '📦'
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        ribbon: 'bg-blue-500',
        button: 'bg-blue-500 hover:bg-blue-600'
      },
      purple: {
        ribbon: 'bg-purple-500',
        button: 'bg-purple-500 hover:bg-purple-600'
      },
      orange: {
        ribbon: 'bg-orange-500',
        button: 'bg-orange-500 hover:bg-orange-600'
      }
    };
    return colors[color] || colors.blue;
  };

  const transformPackageToPlan = (pkg) => {
    const planType = pkg.planType || 'BASIC';
    const color = planTypeColors[planType] || 'blue';
    
    const features = pkg.featureUsageLimits
      ?.filter(f => f.enabled)
      .map(f => {
        const featureName = f.featureName || 'Feature';
        if (f.usageType && f.usageType !== 'UNLIMITED') {
          const limit = f.totalLimit ? ` (${f.totalLimit})` : '';
        return `${featureName}${limit}`;
        }
        return featureName;
      }) || [];

    if (pkg.maxSubscribers) {
      features.push(`${pkg.maxSubscribers.toLocaleString()} Subscriptions Available`);
    }
    if (pkg.trialPeriod?.enabled && pkg.trialPeriod?.days) {
      features.push(`${pkg.trialPeriod.days} Days Free Trial`);
    }

    const price = pkg.pricing?.discountedAmount || pkg.pricing?.amount || 0;
    const currency = pkg.pricing?.currency || 'INR';
    const billingCycle = pkg.pricing?.billingCycle?.toLowerCase() || 'month';

    return {
      id: pkg.id,
      name: pkg.name,
      emoji: planTypeEmojis[planType] || '📦',
      price: price,
      currency: currency,
      period: billingCycle,
      color: color,
      badge: pkg.isPopular ? 'MOST POPULAR' : pkg.isRecommended ? 'RECOMMENDED' : '',
      features: features.length > 0 ? features : [
        'Unlock all features from our site',
        '24/7 Priority support',
        'Access to Pro group',
        'Cancel anytime you want'
      ],
      shortDescription: pkg.shortDescription,
      description: pkg.description,
      planType: planType
    };
  };

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await packageService.getPackages({
          status: 'ACTIVE',
          isVisible: true,
          sortBy: 'displayOrder',
          sortOrder: 'asc',
          limit: 10
        });

        if (response.success && response.data) {
          const packages = Array.isArray(response.data) ? response.data : [];
          const transformedPlans = packages.map(transformPackageToPlan);
          
          if (transformedPlans.length > 0) {
            setPlans(transformedPlans);
          } else {
            setPlans(defaultPlans);
          }
        } else {
          setPlans(defaultPlans);
        }
      } catch (err) {
        console.error('Error fetching packages:', err);
        setError(err.message);
        setPlans(defaultPlans);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if no default plans provided
    if (defaultPlans.length === 0) {
      fetchPackages();
    } else {
      setLoading(false);
    }
  }, [defaultPlans.length]);

  if (loading) {
    return (
      <section id="pricing" className="relative py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 relative z-10">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loading />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="relative py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10" />
      
      <div className="container mx-auto px-3 sm:px-4 md:px-6 relative z-10">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-[rgb(var(--color-text-primary))]">
            {title}
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-[rgb(var(--color-text-secondary))] max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const colorClasses = getColorClasses(plan.color);
            
            return (
              <Card
                key={index}
                className="relative bg-white border border-gray-200 rounded-xl shadow-sm overflow-visible"
              >
                <div className="p-5 sm:p-6 md:p-7">
                  <div className="relative mb-5 sm:mb-6">
                    <div className="flex items-start gap-3 sm:gap-4 mb-3">
                      <div className="flex flex-col items-start gap-2">
                        <div className="text-3xl sm:text-4xl md:text-5xl leading-none">
                          {plan.emoji}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 font-medium whitespace-nowrap">
                          {plan.badge}
                        </p>
                      </div>
                      <div className="flex-1 pt-0.5">
                        <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                          {plan.name}
                        </h3>
                      </div>
                    </div>
                    
                    <div className={`absolute -top-2 -right-2 ${colorClasses.ribbon} text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg shadow-lg transform rotate-3`}>
                      <div className="text-right">
                        <div className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
                          ₹{plan.price}
                        </div>
                        <div className="text-xs sm:text-sm opacity-95">
                          /{plan.period}
                        </div>
                      </div>
                    </div>
                  </div>

                  <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm sm:text-base text-gray-700 leading-relaxed">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${colorClasses.button} text-white text-sm sm:text-base px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-colors shadow-md`}
                    onClick={() => window.location.href = `/checkout?packageId=${plan.id}`}
                  >
                    Buy now
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;

