"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import {
  CheckoutHeader,
  CheckoutContactForm,
  CheckoutOtpStep,
  CheckoutSuccessStep,
  CheckoutOrderSummary,
} from "@/components/checkout";
import { clearCart } from "@/store/slices/publicCartSlice";
import publicSalesOrderService from "@/service/public/salesOrder.service";
import { useToast } from "@/hooks/ui/useToast";
import { handleSuccess } from "@/utils/responseHandler/success";
import { handleError } from "@/utils/responseHandler/error";

const initialFormData = {
  name: "",
  phone: "",
  email: "",
  deliveryAddress: {
    line1: "",
    city: "",
    stateCode: "",
    pincode: "",
  },
};

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useDispatch();
  const toast = useToast();
  const catalogId = params?.catalogId;

  const items = useSelector((state) => state.publicCart.items);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [otp, setOtp] = useState("");
  const [secret, setSecret] = useState(null);
  const [orderResult, setOrderResult] = useState(null);

  const [formData, setFormData] = useState(initialFormData);

  const subtotal = items.reduce(
    (sum, item) => sum + item.sellingPrice * item.quantity,
    0
  );

  useEffect(() => {
    if (items.length === 0 && step !== 3) {
      router.push(`/c/${catalogId}`);
    }
  }, [items, step, catalogId, router]);

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!formData.name || (!formData.phone && !formData.email)) {
      setError("Please provide your name and contact details");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        store_catalog_id: catalogId,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        items: items.map((item) => ({
          product: item._id,
          quantity: parseInt(item.quantity, 10),
        })),
        deliveryAddress: formData.deliveryAddress,
        orderSource: "ONLINE",
      };

      const response = await publicSalesOrderService.createOrder(payload);
      const result = handleSuccess(response);

      if (result.success && result.data) {
        setSecret(result.data.secret);
        setStep(2);
        toast.showSuccess("OTP sent successfully!");
      } else {
        setError(result.message || "Failed to initiate order");
      }
    } catch (error) {
      const errResult = handleError(error);
      setError(errResult.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 5) return;

    try {
      setLoading(true);
      setError(null);

      const response = await publicSalesOrderService.verifyOtp({ secret, otp });
      const result = handleSuccess(response);

      if (result.success && result.data) {
        setOrderResult(result.data);
        dispatch(clearCart());
        setStep(3);
        toast.showSuccess("Order placed successfully!");
      } else {
        setError(result.message || "Invalid OTP or Error");
      }
    } catch (error) {
      const errResult = handleError(error);
      setError(errResult.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && step !== 3) return null;

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-tertiary))]/50">
      <CheckoutHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            {step === 1 && (
              <CheckoutContactForm
                formData={formData}
                onFormChange={setFormData}
                onSubmit={handleCreateOrder}
                loading={loading}
                error={error}
              />
            )}

            {step === 2 && (
              <CheckoutOtpStep
                contactDisplay={formData.phone || formData.email}
                otp={otp}
                onOtpChange={setOtp}
                onSubmit={handleVerifyOtp}
                onBack={() => setStep(1)}
                loading={loading}
                error={error}
              />
            )}

            {step === 3 && orderResult && (
              <CheckoutSuccessStep
                catalogId={catalogId}
                orderResult={orderResult}
                subtotal={subtotal}
              />
            )}
          </div>

          {step !== 3 && (
            <div className="lg:col-span-5">
              <CheckoutOrderSummary items={items} subtotal={subtotal} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
