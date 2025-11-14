"use client"
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button, Card, Input, Loading, Select } from '@/components/ui';
import { packageService, checkoutService } from '@/service';
import { cookieManager } from '@/utils/cookieManager';
import { getCurrencySymbol } from '@/data/constants/currencies';
  import {
    CheckCircle,
    CreditCard,
    Lock,
    ArrowLeft,
    Calendar,
    Tag,
    Shield,
    Sparkles
  } from 'lucide-react';
  import ProductHeader from '@/components/layout/ProductHeader';

  const CheckoutContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const packageId = searchParams.get('packageId');

    const [packageData, setPackageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
      months: 1,
      couponCode: ''
    });
    const [orderData, setOrderData] = useState(null);
  const [showRazorpay, setShowRazorpay] = useState(false);

  const getDurationOptions = () => {
    if (!packageData?.pricing?.durationPricing) {
      return [];
    }

    const currency = packageData.pricing.currency || 'INR';
    const currencySymbol = getCurrencySymbol(currency);

    return packageData.pricing.durationPricing
      .sort((a, b) => a.months - b.months)
      .map((dp) => {
        const months = dp.months;
        const price = dp.discountedPrice || dp.price;
        const discount = dp.discount || 0;

        let label = `${months} ${months === 1 ? 'Month' : 'Months'}`;

        if (discount > 0) {
          const originalPrice = dp.price;
          label += ` - ${currencySymbol}${price.toFixed(2)} (${discount}% off)`;
        } else {
          label += ` - ${currencySymbol}${price.toFixed(2)}`;
        }

        return {
          value: months,
          label: label
        };
      });
  };

  useEffect(() => {
    if (packageId) {
      fetchPackage();
    } else {
      setError('Package ID is required');
      setLoading(false);
    }
  }, [packageId]);

  const fetchPackage = async () => {
    try {
      setLoading(true);
      const response = await packageService.getPackages({ id: packageId });
      if (response.success && response.data) {
        setPackageData(response.data);
        const durationPricing = response.data.pricing?.durationPricing || [];
        if (durationPricing.length > 0) {
          const sortedDurations = [...durationPricing].sort((a, b) => a.months - b.months);
          const firstDuration = sortedDurations[0];
          const currentMonths = formData.months;
          const isValidDuration = durationPricing.some(dp => dp.months === currentMonths);

          if (!isValidDuration) {
            setFormData(prev => ({ ...prev, months: firstDuration.months }));
          }
        }
      } else {
        setError('Package not found');
      }
    } catch (err) {
      setError('Failed to load package');
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = () => {
    if (!packageData) return { base: 0, discount: 0, gst: 0, final: 0, months: 0 };

    const months = formData.months || 1;
    const durationPricing = packageData.pricing?.durationPricing?.find(dp => dp.months === months);

    if (!durationPricing) {
      return { base: 0, discount: 0, gst: 0, final: 0, months: months };
    }

    const baseAmount = durationPricing.discountedPrice || durationPricing.price;
    const gstPercentage = packageData.pricing?.gstPercentage || 0;

    const gstAmount = (baseAmount * gstPercentage) / 100;
    const finalAmount = baseAmount + gstAmount;

    return {
      base: baseAmount,
      discount: 0,
      gst: gstAmount,
      gstPercentage: gstPercentage,
      final: finalAmount,
      discountPercent: durationPricing.discount || 0,
      months: months
    };
  };

  const handleCreateOrder = async () => {
    if (!packageId || !formData.months) {
      setError('Please select number of months');
      return;
    }

    const authToken = cookieManager.getAuthToken();
    if (!authToken) {
      const currentUrl = window.location.href;
      router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const orderPayload = {
        packageId,
        months: formData.months,
        ...(formData.couponCode && { couponCode: formData.couponCode })
      };

      const response = await checkoutService.createPaymentOrder(orderPayload);

      if (response.success && response.data) {
        setOrderData(response.data);
        initializeRazorpay(response.data);
      } else {
        setError(response.message || 'Failed to create order');
      }
    } catch (err) {
      setError('Failed to create payment order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const initializeRazorpay = (order) => {
    if (typeof window === 'undefined' || !window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        openRazorpay(order);
      };
      document.body.appendChild(script);
    } else {
      openRazorpay(order);
    }
  };

  const openRazorpay = (order) => {
    const options = {
      key: order.keyId,
      amount: order.amount * 100,
      currency: order.currency,
      name: 'DragBizz',
      description: `Payment for ${packageData?.name || 'Package'}`,
      order_id: order.razorpayOrderId,
      handler: async (response) => {
        await handlePaymentSuccess(response, order);
      },
      prefill: {
        name: '',
        email: '',
        contact: ''
      },
      theme: {
        color: '#6366f1'
      },
      modal: {
        ondismiss: () => {
          setProcessing(false);
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
    setShowRazorpay(true);
  };

  const handlePaymentSuccess = async (razorpayResponse, order) => {
    try {
      setProcessing(true);

      const verifyPayload = {
        orderId: order.orderId,
        razorpayOrderId: razorpayResponse.razorpay_order_id,
        razorpayPaymentId: razorpayResponse.razorpay_payment_id,
        razorpaySignature: razorpayResponse.razorpay_signature
      };

      const response = await checkoutService.verifyPayment(verifyPayload);

      if (response.success) {
        router.push(`/checkout/success?orderId=${order.orderId}`);
      } else {
        setError(response.message || 'Payment verification failed');
      }
    } catch (err) {
      setError('Payment verification failed. Please contact support.');
    } finally {
      setProcessing(false);
    }
  };

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

  if (error && !packageData) {
    return (
      <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]">
        <ProductHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="p-8 text-center max-w-md">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => router.push('/')}>Go Back Home</Button>
          </Card>
        </div>
      </div>
    );
  }

  const pricing = calculatePrice();
  const currency = packageData?.pricing?.currency || 'INR';
  const currencySymbol = getCurrencySymbol(currency);
  const durationOptions = getDurationOptions();

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
          <div className="lg:col-span-2">
            <Card className="p-6 md:p-8">
              <h1 className="text-2xl md:text-3xl font-bold mb-6 text-[rgb(var(--color-text-primary))]">
                Package Details
              </h1>

              {packageData && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl md:text-2xl font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                      {packageData.name}
                    </h2>
                    <p className="text-[rgb(var(--color-text-secondary))]">
                      {packageData.shortDescription || packageData.description}
                    </p>
                  </div>

                  {packageData.featureUsageLimits && packageData.featureUsageLimits.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-[rgb(var(--color-text-primary))]">
                        What's Included
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {packageData.featureUsageLimits.filter(f => f.enabled !== false).map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-[rgb(var(--color-text-secondary))]">
                              {feature.featureName || feature.featureKey}
                              {feature.usageType && feature.usageType !== 'UNLIMITED' && feature.totalLimit
                                ? ` (${feature.usageType.replace(/_/g, ' ')} - ${feature.totalLimit})`
                                : ''}
                            </span>
                          </div>
                        ))}
                        {packageData.maxSubscribers && (
                          <div className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-[rgb(var(--color-text-secondary))]">
                              {packageData.maxSubscribers.toLocaleString()} total subscriptions available
                            </span>
                          </div>
                        )}
                        {packageData.trialPeriod?.enabled && packageData.trialPeriod?.days && (
                          <div className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-[rgb(var(--color-text-secondary))]">
                              {packageData.trialPeriod.days} Days Free Trial
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-[rgb(var(--color-border-primary))] space-y-3">
                    <div className="flex items-center gap-2 text-sm text-[rgb(var(--color-text-secondary))]">
                      <Shield className="w-5 h-5" />
                      <span>Secure Payment</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[rgb(var(--color-text-secondary))]">
                      <Sparkles className="w-5 h-5" />
                      <span>Instant Activation</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[rgb(var(--color-text-secondary))]">
                      <Calendar className="w-5 h-5" />
                      <span>Cancel Anytime</span>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8">
              <h2 className="text-xl font-bold mb-6 text-[rgb(var(--color-text-primary))]">
                Payment Details
              </h2>

              <div className="space-y-6">
                <div>
                  <Select
                    label="Select Duration"
                    options={durationOptions}
                    value={formData.months}
                    onChange={(value) => setFormData({ ...formData, months: parseInt(value) })}
                    placeholder="Select duration"
                    required
                    disabled={!durationOptions.length}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[rgb(var(--color-text-primary))]">
                    Coupon Code (Optional)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={formData.couponCode}
                      onChange={(e) => setFormData({ ...formData, couponCode: e.target.value })}
                      leftIcon={Tag}
                      className="flex-1"
                    />
                    <Button variant="outline" size="md">
                      Apply
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t border-[rgb(var(--color-border-primary))]">
                  <h3 className="text-lg font-semibold mb-4 text-[rgb(var(--color-text-primary))]">
                    Order Summary
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[rgb(var(--color-text-secondary))]">Price</span>
                      <span className="text-[rgb(var(--color-text-primary))]">
                        {currencySymbol}{pricing.base.toFixed(2)}
                      </span>
                    </div>
                    {pricing.gst > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[rgb(var(--color-text-secondary))]">GST ({pricing.gstPercentage}%)</span>
                        <span className="text-[rgb(var(--color-text-primary))]">
                          {currencySymbol}{pricing.gst.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-[rgb(var(--color-border-primary))]">
                      <span className="text-[rgb(var(--color-text-primary))]">Total Amount</span>
                      <span className="text-[rgb(var(--color-primary))]">
                        {currencySymbol}{pricing.final.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

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
                    {processing ? 'Processing...' : 'Proceed to Payment'}
                  </Button>

                  {error && (
                    <p className="text-red-500 text-sm mt-3 text-center">{error}</p>
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
    <Suspense fallback={
      <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]">
        <ProductHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loading />
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
};

export default CheckoutPage;

