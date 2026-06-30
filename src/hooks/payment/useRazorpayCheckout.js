"use client";

import { useCallback, useRef } from "react";
import paymentOrderService from "@/service/retailer/paymentOrder.service";
import { handleSuccess } from "@/utils/responseHandler/success";
import { handleError } from "@/utils/responseHandler/error";

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

let razorpayScriptPromise = null;

const loadRazorpayScript = () => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay is only available in the browser"));
  }
  if (window.Razorpay) {
    return Promise.resolve(window.Razorpay);
  }
  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = RAZORPAY_SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve(window.Razorpay);
      script.onerror = () => reject(new Error("Failed to load Razorpay checkout"));
      document.body.appendChild(script);
    });
  }
  return razorpayScriptPromise;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const pollPaymentOrderStatus = async ({ storeId, paymentOrderId, timeoutMs = 60000 }) => {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const response = await paymentOrderService.getPaymentOrderStatus(storeId, paymentOrderId);
    const result = handleSuccess(response);
    const status = result?.data?.status;
    if (status === "CAPTURED") {
      return result.data;
    }
    if (status === "FAILED" || status === "EXPIRED") {
      throw new Error(`Payment ${status.toLowerCase()}`);
    }
    await sleep(2000);
  }
  throw new Error("Payment confirmation timed out");
};

export const useRazorpayCheckout = () => {
  const checkoutRef = useRef(null);

  const startCheckout = useCallback(async ({
    storeId,
    invoiceId,
    amount,
    storeName,
    customerName,
    onSuccess,
    onFailure,
  }) => {
    try {
      const checkoutResponse = await paymentOrderService.createCheckout(storeId, invoiceId);
      const checkout = handleSuccess(checkoutResponse)?.data;
      if (!checkout?.keyId || !checkout?.gatewayOrderId || !checkout?.paymentOrderId) {
        throw new Error("Invalid checkout response from server");
      }

      const Razorpay = await loadRazorpayScript();
      const amountPaise = Math.round(Number(amount || checkout.amount || 0) * 100);

      await new Promise((resolve, reject) => {
        const options = {
          key: checkout.keyId,
          amount: amountPaise,
          currency: checkout.currency || "INR",
          name: storeName || "DragBizz",
          description: `Invoice payment`,
          order_id: checkout.gatewayOrderId,
          prefill: customerName ? { name: customerName } : {},
          handler: async (response) => {
            try {
              await paymentOrderService.verifyPayment(storeId, {
                paymentOrderId: checkout.paymentOrderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              const finalStatus = await pollPaymentOrderStatus({
                storeId,
                paymentOrderId: checkout.paymentOrderId,
              });
              onSuccess?.(finalStatus);
              resolve(finalStatus);
            } catch (error) {
              reject(error);
            }
          },
          modal: {
            ondismiss: () => reject(new Error("Payment cancelled")),
          },
        };

        checkoutRef.current = new Razorpay(options);
        checkoutRef.current.on("payment.failed", (event) => {
          reject(new Error(event?.error?.description || "Payment failed"));
        });
        checkoutRef.current.open();
      });
    } catch (error) {
      const parsed = handleError(error);
      onFailure?.(parsed);
      throw parsed;
    }
  }, []);

  return { startCheckout };
};

export default useRazorpayCheckout;
