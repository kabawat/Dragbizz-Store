"use client";
import { ArrowLeft, Calendar, CheckCircle, CreditCard, Lock, Package, Shield, Sparkles, Star, Tag, Users, } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import ProductHeader from "@/components/layout/ProductHeader";
import { Button, Card, Input, Loading, Select } from "@/components/ui";
import { getCurrencySymbol } from "@/data/constants/currencies";
import { checkoutService, packageService } from "@/service";
import { useAppSelector } from "@/store/hooks";

// Constants
const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";
const RAZORPAY_THEME_COLOR = "#6366f1";
const DEFAULT_CURRENCY = "INR";
const DEFAULT_MONTHS = 1;

// Helper Functions
const getUserContactInfo = (authProfile, retailerUser = null) => {
  console.log("authProfile", authProfile);
  let email = "";
  let phone = "";
  let name = "";

  // First check authProfile
  if (authProfile) {
    email = authProfile.email || "";
    phone = authProfile.phone || "";
    name =
      authProfile.firstName && authProfile.lastName
        ? `${authProfile.firstName} ${authProfile.lastName}`
        : authProfile.name || "";
  }

  // Fallback to retailer user if not found in authProfile
  if (!email && retailerUser?.email) {
    email = retailerUser.email;
  }
  if (!phone && retailerUser?.phone) {
    phone = retailerUser.phone;
  }

  return { email, phone, name };
};

const cleanPhoneNumber = (phone) => {
  return phone?.replace(/[\s\-\(\)]/g, "") || "";
};

const formatPrice = (amount, currencySymbol) => {
  return `${currencySymbol}${amount.toFixed(2)}`;
};

const CheckoutContent = () => {
  // Hooks
  const searchParams = useSearchParams();
  const router = useRouter();
  const packageId = searchParams.get("packageId");

  // Redux State
  const { authProfile, authProfileLoading, user } = useAppSelector(
    (state) => state.profile
  );

  // Local State
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    months: DEFAULT_MONTHS,
    couponCode: "",
  });

  // Memoized Values
  const userContactInfo = useMemo(
    () => getUserContactInfo(authProfile, user),
    [authProfile, user]
  );

  const pricing = useMemo(() => {
    if (!packageData?.pricing?.durationPricing) {
      return { base: 0, discount: 0, gst: 0, final: 0, months: 0 };
    }

    const durationPricing = packageData.pricing.durationPricing.find(
      (dp) => dp.months === formData.months
    );

    if (!durationPricing) {
      return { base: 0, discount: 0, gst: 0, final: 0, months: formData.months };
    }

    const baseAmount = durationPricing.discountedPrice || durationPricing.price;
    const gstPercentage = packageData.pricing?.gstPercentage || 0;
    const gstAmount = (baseAmount * gstPercentage) / 100;
    const finalAmount = baseAmount + gstAmount;

    return {
      base: baseAmount,
      discount: 0,
      gst: gstAmount,
      gstPercentage,
      final: finalAmount,
      discountPercent: durationPricing.discount || 0,
      months: formData.months,
    };
  }, [packageData, formData.months]);

  const currency = packageData?.pricing?.currency || DEFAULT_CURRENCY;
  const currencySymbol = useMemo(
    () => getCurrencySymbol(currency),
    [currency]
  );

  const durationOptions = useMemo(() => {
    if (!packageData?.pricing?.durationPricing) return [];

    return packageData.pricing.durationPricing
      .sort((a, b) => a.months - b.months)
      .map((dp) => {
        const months = dp.months;
        const price = dp.discountedPrice || dp.price;
        const discount = dp.discount || 0;
        const priceLabel = formatPrice(price, currencySymbol);

        let label = `${months} ${months === 1 ? "Month" : "Months"}`;
        if (discount > 0) {
          label += ` - ${priceLabel} (${discount}% off)`;
        } else {
          label += ` - ${priceLabel}`;
        }

        return { value: months, label };
      });
  }, [packageData, currencySymbol]);

  // Note: getAuthProfile is called in layout.js when user has token

  const fetchPackage = useCallback(async () => {
    if (!packageId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await packageService.getPackages({ id: packageId });

      if (!response.success || !response.data) {
        setError("Package not found");
        return;
      }

      setPackageData(response.data);

      const durationPricing = response.data.pricing?.durationPricing || [];
      if (durationPricing.length > 0) {
        const sortedDurations = [...durationPricing].sort(
          (a, b) => a.months - b.months
        );
        const firstDuration = sortedDurations[0];

        setFormData((prev) => {
          const isValidDuration = durationPricing.some(
            (dp) => dp.months === prev.months
          );

          if (!isValidDuration) {
            return { ...prev, months: firstDuration.months };
          }
          return prev;
        });
      }
    } catch (err) {
      console.error("Failed to fetch package:", err);
      setError("Failed to load package. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [packageId]);

  useEffect(() => {
    if (packageId) {
      fetchPackage();
    } else {
      setError("Package ID is required");
      setLoading(false);
    }
  }, [packageId, fetchPackage]);

  // Handlers
  const handleCreateOrder = async () => {
    if (!packageId || !formData.months) {
      setError("Please select number of months");
      return;
    }

    // Wait for auth profile to load if still loading
    if (authProfileLoading) {
      setError("Please wait while we load your profile...");
      return;
    }

    // Check if user is authenticated and has required profile data
    if (!authProfile) {
      const currentUrl = window.location.href;
      router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }

    // Get contact info using helper function (checks both authProfile and retailer user)
    const { email, phone } = getUserContactInfo(authProfile, user);
    console.log("email", email);
    console.log("phone", phone);

    if (!email && !phone) {
      setError(
        "Email and phone number are required. Please update your profile."
      );
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const orderPayload = {
        packageId,
        months: formData.months,
        email: email,
        phone: cleanPhoneNumber(phone),
        ...(formData.couponCode && { couponCode: formData.couponCode }),
      };

      const response = await checkoutService.createPaymentOrder(orderPayload);

      if (response.success && response.data) {
        initializeRazorpay(response.data);
      } else {
        setError(response.message || "Failed to create order");
      }
    } catch (err) {
      console.error("Failed to create payment order:", err);
      setError("Failed to create payment order. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const initializeRazorpay = (order) => {
    if (typeof window === "undefined") return;

    if (window.Razorpay) {
      openRazorpay(order);
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_URL;
    script.onload = () => openRazorpay(order);
    script.onerror = () => {
      setError("Failed to load payment gateway. Please refresh the page.");
      setProcessing(false);
    };
    document.body.appendChild(script);
  };

  const openRazorpay = (order) => {
    if (!window.Razorpay) {
      setError("Payment gateway not available. Please refresh the page.");
      setProcessing(false);
      return;
    }

    const { email, phone, name } = userContactInfo;

    const options = {
      key: order.keyId,
      amount: order.amount * 100,
      currency: order.currency,
      name: "DragBizz",
      description: `Payment for ${packageData?.name || "Package"}`,
      order_id: order.razorpayOrderId,
      handler: async (response) => {
        await handlePaymentSuccess(response, order);
      },
      prefill: {
        name: name || "",
        email: email || "",
        contact: phone || "",
      },
      theme: {
        color: RAZORPAY_THEME_COLOR,
      },
      modal: {
        ondismiss: () => {
          setProcessing(false);
        },
      },
    };

    try {
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error("Failed to open Razorpay:", err);
      setError("Failed to initialize payment. Please try again.");
      setProcessing(false);
    }
  };

  const handlePaymentSuccess = async (razorpayResponse, order) => {
    try {
      setProcessing(true);
      setError(null);

      const verifyPayload = {
        orderId: order.orderId,
        razorpayOrderId: razorpayResponse.razorpay_order_id,
        razorpayPaymentId: razorpayResponse.razorpay_payment_id,
        razorpaySignature: razorpayResponse.razorpay_signature,
      };

      const response = await checkoutService.verifyPayment(verifyPayload);

      if (response.success) {
        router.push(`/checkout/success?orderId=${order.orderId}`);
      } else {
        setError(response.message || "Payment verification failed");
      }
    } catch (err) {
      console.error("Payment verification failed:", err);
      setError("Payment verification failed. Please contact support.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDurationChange = (value) => {
    setFormData((prev) => ({ ...prev, months: parseInt(value, 10) }));
  };

  const handleCouponChange = (e) => {
    setFormData((prev) => ({ ...prev, couponCode: e.target.value }));
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]">
        <ProductHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loading />
        </div>
      </div>
    );
  }

  // Error State (No Package Data)
  if (error && !packageData) {
    return (
      <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]">
        <ProductHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="p-8 text-center max-w-md">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => router.push("/")}>Go Back Home</Button>
          </Card>
        </div>
      </div>
    );
  }

  // Main Render
  const highlightedFeatures =
    packageData?.featureUsageLimits?.filter(
      (feature) => feature.enabled !== false && feature.highlight
    ) || [];

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] pt-20 md:pt-24">
      <ProductHeader />

      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-8 md:py-12 lg:py-16">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
          leftIcon={ArrowLeft}
        >
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Package Details Section */}
          <div className="lg:col-span-2">
            <Card className="p-6 md:p-8 relative overflow-visible">
              {/* Badge */}
              {packageData?.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-[rgb(var(--color-primary))] text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg">
                    MOST POPULAR
                  </span>
                </div>
              )}
              {packageData?.isRecommended && !packageData?.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-[rgb(var(--color-success))] text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg">
                    RECOMMENDED
                  </span>
                </div>
              )}

              {packageData && (
                <div className="space-y-6">
                  {/* Package Header */}
                  <div className="mb-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[rgb(var(--color-primary))]/10 to-[rgb(var(--color-primary))]/20 rounded-xl flex items-center justify-center border border-[rgb(var(--color-primary))]/20 flex-shrink-0">
                        <Package className="w-8 h-8 text-[rgb(var(--color-primary))]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h1 className="text-xl md:text-xl font-bold text-[rgb(var(--color-text-primary))]">
                            {packageData.name}
                          </h1>
                          {packageData.isPopular && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex-shrink-0">
                              <Star className="w-3 h-3" />
                              Popular
                            </span>
                          )}
                          {packageData.isRecommended && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex-shrink-0">
                              Recommended
                            </span>
                          )}
                        </div>
                        {packageData.shortDescription && (
                          <p className="text-[rgb(var(--color-text-secondary))] mb-3">
                            {packageData.shortDescription}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Features Section */}
                  {highlightedFeatures.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-[rgb(var(--color-text-primary))] flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                        What's Included
                      </h3>
                      <div className="space-y-2">
                        {highlightedFeatures.map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 p-2 rounded-lg bg-[rgb(var(--color-bg-secondary))]"
                          >
                            <CheckCircle className="w-4 h-4 text-[rgb(var(--color-success))] flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-[rgb(var(--color-text-primary))]">
                              {feature.highlight}
                            </p>
                          </div>
                        ))}
                      </div>

                      {packageData.maxSubscribers && (
                        <div className="mt-3 p-3 rounded-lg bg-[rgb(var(--color-primary))]/10 border border-[rgb(var(--color-primary))]/20">
                          <p className="text-sm text-[rgb(var(--color-primary))] flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Limited to{" "}
                            {packageData.maxSubscribers.toLocaleString()}{" "}
                            subscribers
                          </p>
                        </div>
                      )}

                      {packageData.trialPeriod?.enabled &&
                        packageData.trialPeriod?.days && (
                          <div className="mt-3 p-3 rounded-lg bg-[rgb(var(--color-success))]/10 border border-[rgb(var(--color-success))]/20">
                            <p className="text-sm text-[rgb(var(--color-success))] flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              {packageData.trialPeriod.days} Days Free Trial
                            </p>
                          </div>
                        )}
                    </div>
                  )}

                  {/* Trust Indicators */}
                  <div className="pt-6 border-t border-[rgb(var(--color-border-primary))]">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                        <div className="p-2 bg-[rgb(var(--color-success))]/20 rounded-lg">
                          <Shield className="w-5 h-5 text-[rgb(var(--color-success))]" />
                        </div>
                        <div>
                          <div className="text-xs text-[rgb(var(--color-success))] font-medium">
                            Secure
                          </div>
                          <div className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                            Payment
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                        <div className="p-2 bg-[rgb(var(--color-primary))]/20 rounded-lg">
                          <Sparkles className="w-5 h-5 text-[rgb(var(--color-primary))]" />
                        </div>
                        <div>
                          <div className="text-xs text-[rgb(var(--color-primary))] font-medium">
                            Instant
                          </div>
                          <div className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                            Activation
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                          <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                            Cancel
                          </div>
                          <div className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
                            Anytime
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Payment Details Section */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8">
              <h2 className="text-xl font-bold mb-6 text-[rgb(var(--color-text-primary))]">
                Payment Details
              </h2>

              <div className="space-y-6">
                {/* Duration Select */}
                <div>
                  <Select
                    label="Select Duration"
                    options={durationOptions}
                    value={formData.months}
                    onChange={handleDurationChange}
                    placeholder="Select duration"
                    required
                    disabled={!durationOptions.length}
                  />
                </div>

                {/* Coupon Code */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-[rgb(var(--color-text-primary))]">
                    Coupon Code (Optional)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={formData.couponCode}
                      onChange={handleCouponChange}
                      leftIcon={Tag}
                      className="flex-1"
                    />
                    <Button variant="outline" size="md">
                      Apply
                    </Button>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="pt-4 border-t border-[rgb(var(--color-border-primary))]">
                  <h3 className="text-lg font-semibold mb-4 text-[rgb(var(--color-text-primary))]">
                    Order Summary
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[rgb(var(--color-text-secondary))]">
                        Price
                      </span>
                      <span className="text-[rgb(var(--color-text-primary))]">
                        {formatPrice(pricing.base, currencySymbol)}
                      </span>
                    </div>
                    {pricing.gst > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[rgb(var(--color-text-secondary))]">
                          GST ({pricing.gstPercentage}%)
                        </span>
                        <span className="text-[rgb(var(--color-text-primary))]">
                          {formatPrice(pricing.gst, currencySymbol)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-[rgb(var(--color-border-primary))]">
                      <span className="text-[rgb(var(--color-text-primary))]">
                        Total Amount
                      </span>
                      <span className="text-[rgb(var(--color-primary))]">
                        {formatPrice(pricing.final, currencySymbol)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Button */}
                <div className="pt-4 border-t border-[rgb(var(--color-border-primary))]">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleCreateOrder}
                    loading={processing}
                    disabled={processing}
                    rightIcon={CreditCard}
                    className="text-lg py-4"
                  >
                    {processing ? "Processing..." : "Proceed to Payment"}
                  </Button>

                  {error && (
                    <p className="text-red-500 text-sm mt-3 text-center">
                      {error}
                    </p>
                  )}

                  <div className="flex items-center justify-center gap-2 mt-4 text-sm text-[rgb(var(--color-text-secondary))]">
                    <Lock className="w-4 h-4" />
                    <span>Secure payment powered by Razorpay</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckoutPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]">
          <ProductHeader />
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loading />
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
};

export default CheckoutPage;
