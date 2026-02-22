"use client";
import {
  ArrowLeft,
  CheckCircle,
  Crown,
  Lock,
  RefreshCw,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import ProductHeader from "@/components/layout/ProductHeader";
import { Button, Card, Loading } from "@/components/ui";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import { getCurrencySymbol } from "@/data/constants/currencies";
import { packageService, subscriptionService } from "@/service";

// Helper functions for package display
const planTypeColors = {
  BASIC: "blue",
  PROFESSIONAL: "purple",
  ENTERPRISE: "orange",
  CUSTOM: "blue",
};

const getColorClasses = (color) => {
  const colors = {
    blue: {
      border: "border-[rgb(var(--color-primary))]/30",
      button: "bg-[rgb(var(--color-primary))] hover:opacity-90",
    },
    purple: {
      border: "border-purple-500/30",
      button: "bg-purple-500 hover:bg-purple-600",
    },
    orange: {
      border: "border-orange-500/30",
      button: "bg-orange-500 hover:bg-orange-600",
    },
  };
  return colors[color] || colors.blue;
};

const getLowestPrice = (pkg) => {
  if (
    !pkg.pricing?.durationPricing ||
    pkg.pricing.durationPricing.length === 0
  ) {
    return { price: 0, months: 1, currency: "INR" };
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
    currency: pkg.pricing?.currency || "INR",
  };
};

const PackagesContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const upgrade = searchParams.get("upgrade");

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPackageId, setCurrentPackageId] = useState(null);

  const fetchCurrentSubscription = useCallback(async () => {
    try {
      const response = await subscriptionService.getActiveSubscription();
      if (response.success && response.data?.packageId) {
        const packageId = response.data.packageId._id
          ? response.data.packageId._id.toString()
          : response.data.packageId.toString();
        setCurrentPackageId(packageId);
      }
    } catch (err) {
      
    }
  }, []);

  const fetchPackages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await packageService.getPackages({
        status: "ACTIVE",
        isVisible: true,
        sortBy: "displayOrder",
        sortOrder: "asc",
        limit: 100,
      });

      if (response.success && response.data) {
        const packagesData = Array.isArray(response.data) ? response.data : [];
        setPackages(packagesData);
      } else {
        setError("Failed to load packages");
      }
    } catch (err) {
      setError(err.message || "Failed to load packages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPackages();
    fetchCurrentSubscription();
  }, [fetchPackages, fetchCurrentSubscription]);

  const handleSelectPackage = (packageId) => {
    router.push(`/checkout?packageId=${packageId}`);
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
            <Button onClick={() => router.push("/")}>Go Back Home</Button>
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
        {/* Header Section */}
        <div className="text-center mb-16 relative">
          {/* Background Decoration */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[rgb(var(--color-primary))]/10 via-purple-500/10 to-pink-500/10 rounded-full blur-3xl" />
          </div>

          {upgrade && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[rgb(var(--color-primary))]/10 to-purple-500/10 rounded-full mb-6 border border-[rgb(var(--color-primary))]/20 backdrop-blur-sm">
              <Crown className="w-4 h-4 text-[rgb(var(--color-primary))]" />
              <span className="text-sm font-medium text-[rgb(var(--color-primary))]">
                Upgrade Your Plan
              </span>
            </div>
          )}

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[rgb(var(--color-primary))]/10 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-[rgb(var(--color-primary))]" />
            <span className="text-sm font-medium text-[rgb(var(--color-primary))]">
              Flexible Pricing Plans
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[rgb(var(--color-text-primary))] mb-4 leading-tight">
            <span className="block mb-2">Choose Your</span>
            <span className="block bg-gradient-to-r from-[rgb(var(--color-primary))] via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Perfect Plan
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-[rgb(var(--color-text-secondary))] max-w-3xl mx-auto mb-8 leading-relaxed">
            Select the perfect subscription plan tailored for your business
            needs.
            <span className="block mt-2 text-base">
              All plans include our comprehensive features with flexible limits
              to scale as you grow.
            </span>
          </p>

          {/* Stats/Highlights Row */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mt-10 mb-6">
            <div className="flex items-center gap-3 px-4 py-3 bg-[rgb(var(--color-success))]/10 rounded-xl hover:bg-[rgb(var(--color-success))]/15 transition-all duration-300">
              <div className="p-2 bg-[rgb(var(--color-success))]/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-[rgb(var(--color-success))]" />
              </div>
              <div className="text-left">
                <div className="text-xs text-[rgb(var(--color-success))] font-medium">
                  No Credit Card
                </div>
                <div className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                  Required
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-3 bg-[rgb(var(--color-primary))]/10 rounded-xl hover:bg-[rgb(var(--color-primary))]/15 transition-all duration-300">
              <div className="p-2 bg-[rgb(var(--color-primary))]/20 rounded-lg">
                <RefreshCw className="w-5 h-5 text-[rgb(var(--color-primary))]" />
              </div>
              <div className="text-left">
                <div className="text-xs text-[rgb(var(--color-primary))] font-medium">
                  Cancel
                </div>
                <div className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                  Anytime
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-3 bg-purple-500/10 rounded-xl hover:bg-purple-500/15 transition-all duration-300">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-left">
                <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                  24/7
                </div>
                <div className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                  Support
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-3 bg-orange-500/10 rounded-xl hover:bg-orange-500/15 transition-all duration-300">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Star className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="text-left">
                <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                  Free Trial
                </div>
                <div className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                  Available
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mt-12">
            <div className="flex items-center gap-2 text-[rgb(var(--color-text-secondary))]">
              <TrendingUp className="w-5 h-5 text-[rgb(var(--color-primary))]" />
              <span className="text-sm font-medium">
                Trusted by 10,000+ businesses
              </span>
            </div>
            <div className="flex items-center gap-2 text-[rgb(var(--color-text-secondary))]">
              <Lock className="w-5 h-5 text-[rgb(var(--color-success))]" />
              <span className="text-sm font-medium">
                100% Secure & Encrypted
              </span>
            </div>
            <div className="flex items-center gap-2 text-[rgb(var(--color-text-secondary))]">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium">4.9/5 Customer Rating</span>
            </div>
          </div>
        </div>

        {/* Packages Grid */}
        {packages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {packages.map((pkg) => {
              const planType = pkg.planType || "BASIC";
              const color = planTypeColors[planType] || "blue";
              const colorClasses = getColorClasses(color);
              const lowestPrice = getLowestPrice(pkg);
              const currencySymbol = getCurrencySymbol(lowestPrice.currency);
              const packageId = pkg.id || pkg._id;
              const isCurrentPlan = currentPackageId && (
                packageId === currentPackageId ||
                packageId.toString() === currentPackageId
              );

              // Get features for FeatureDisplay component
              const features = pkg.featureUsageLimits || [];

              return (
                <Card
                  key={packageId}
                  className={`relative bg-[rgb(var(--color-bg-primary))] border-2 ${pkg.isPopular ? colorClasses.border : isCurrentPlan ? "border-[rgb(var(--color-success))]" : "border-[rgb(var(--color-border-primary))]"} rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-visible ${isCurrentPlan ? "ring-2 ring-[rgb(var(--color-success))]/20" : ""}`}
                >
                  {isCurrentPlan && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <span className="bg-[rgb(var(--color-success))] text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        CURRENT PLAN
                      </span>
                    </div>
                  )}

                  {pkg.isPopular && !isCurrentPlan && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-[rgb(var(--color-primary))] text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg">
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  {pkg.isRecommended && !pkg.isPopular && !isCurrentPlan && (
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
                          {currencySymbol}
                          {lowestPrice.price.toFixed(2)}
                        </span>
                        <span className="text-sm text-[rgb(var(--color-text-secondary))]">
                          /
                          {lowestPrice.months === 1
                            ? "month"
                            : `${lowestPrice.months} months`}
                        </span>
                      </div>
                      {pkg.pricing?.durationPricing &&
                        pkg.pricing.durationPricing.length > 1 && (
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
                        {pkg.highlights && pkg.highlights.length > 0 ? (
                          pkg.highlights.map((highlight, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-2 p-2 rounded-lg bg-[rgb(var(--color-bg-secondary))]"
                            >
                              <CheckCircle className="w-4 h-4 text-[rgb(var(--color-success))] flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-[rgb(var(--color-text-primary))]">
                                {highlight}
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
                            Limited to {pkg.maxSubscribers.toLocaleString()}{" "}
                            subscribers
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
                      variant={isCurrentPlan ? "outline" : "primary"}
                      size="md"
                      fullWidth
                      onClick={() => handleSelectPackage(packageId)}
                      className={pkg.isPopular && !isCurrentPlan ? colorClasses.button : ""}
                      disabled={isCurrentPlan}
                    >
                      {isCurrentPlan
                        ? "Current Plan"
                        : upgrade
                          ? "Upgrade Now"
                          : "Select Plan"}
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

        {/* FAQ / Help Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-[rgb(var(--color-bg-secondary))] rounded-xl border border-[rgb(var(--color-border-primary))] p-6 md:p-8">
            <h2 className="text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-6 text-center">
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                  Can I change my plan later?
                </h3>
                <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                  Yes! You can upgrade or downgrade your plan at any time.
                  Changes will be reflected in your next billing cycle.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                  We accept all major credit cards, debit cards, UPI, and bank
                  transfers. All payments are secure and encrypted.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                  Is there a free trial?
                </h3>
                <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                  Some plans offer free trials. Check the plan details above for
                  trial period information.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                  What happens if I exceed my limits?
                </h3>
                <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                  You'll receive notifications when approaching limits. Upgrade
                  your plan anytime to increase limits.
                </p>
              </div>
            </div>
          </div>
        </div>

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
    <Suspense
      fallback={
        <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]">
          <ProductHeader />
          <AnimatedBackground variant="default" />
          <div className="flex items-center justify-center min-h-[60vh] relative z-10">
            <Loading />
          </div>
        </div>
      }
    >
      <PackagesContent />
    </Suspense>
  );
};

export default PackagesPage;
