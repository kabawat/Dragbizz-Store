"use client";
import { StoreDeleteModalView } from "@dragorbit/features/settings";

import { useEffect, useRef, useState } from "react";

import storeService from "@/service/retailer/store.service";
import { useAppSelector } from "@/store/hooks";

const StoreDeleteModal = ({
  isOpen,
  storeToDelete,
  stores = [],
  onClose,
  onSuccess,
  onError,
}) => {
  const [step, setStep] = useState(1);
  const [channel, setChannel] = useState("sms");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [signature, setSignature] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const { authProfile: userProfile } = useAppSelector((state) => state.profile);
  const inputRefs = useRef([]);
  useEffect(() => {
    if (isOpen && step === 1 && userProfile) {
      // Auto-select available channel based on existing profile
      if (userProfile?.phone && !userProfile?.email) {
        setChannel("sms");
      } else if (userProfile?.email && !userProfile?.phone) {
        setChannel("email");
      }
    }
  }, [isOpen, step, userProfile]);

  const formatPhoneNumber = (phone, countryCode) => {
    if (!phone) return "Not available";
    const code = countryCode || "+91";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length >= 10) {
      const last3 = cleaned.slice(-3);
      const middle = cleaned.slice(-6, -3);
      const masked = "x".repeat(Math.max(0, cleaned.length - 6));
      return `${code} ${masked}-${middle}-${last3}`;
    }
    return `${code} ${phone}`;
  };

  const formatEmail = (email) => {
    if (!email) return "Not available";
    const [local, domain] = email.split("@");
    if (local && domain) {
      const visible = local.slice(0, 2);
      const masked = "*".repeat(Math.max(0, local.length - 2));
      return `${visible}${masked}@${domain}`;
    }
    return email;
  };

  useEffect(() => {
    if (step === 2 && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, timeLeft]);

  const handleCancel = () => {
    setStep(1);
    setChannel("sms");
    setOtp(["", "", "", "", "", ""]);
    setSignature(null);
    setIsLoading(false);
    setError("");
    setTimeLeft(0);
    onClose?.();
  };

  const handleRequestOtp = async () => {
    if (!storeToDelete) return;

    const storeIdToDelete = storeToDelete._id || storeToDelete.id;
    if (!storeIdToDelete) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await storeService.requestDeleteStoreOtp(
        storeIdToDelete,
        channel,
      );

      if (result?.success) {
        setSignature(result?.data?.signature);
        setTimeLeft(600);
        setStep(2);
      } else {
        const message =
          result?.message || result?.error?.message || "Failed to send OTP.";
        setError(message);
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1 || !/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== "")) {
      handleVerifyOtp(newOtp.join(""));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (otpCode) => {
    if (!storeToDelete || !signature) return;

    const storeIdToDelete = storeToDelete._id || storeToDelete.id;
    if (!storeIdToDelete) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await storeService.verifyDeleteStoreOtp(
        storeIdToDelete,
        signature,
        otpCode,
      );

      if (result?.success) {
        onSuccess?.(result.message || "Store deleted successfully!");
        handleCancel();
      } else {
        const message =
          result?.message ||
          result?.error?.message ||
          "Invalid OTP. Please try again.";
        setError(message);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "An unexpected error occurred.";
      setError(errorMessage);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <StoreDeleteModalView
      model={{
        isOpen,
        handleCancel,
        step,
        storeToDelete,
        userProfile,
        isLoading,
        setChannel,
        channel,
        formatPhoneNumber,
        formatEmail,
        error,
        handleRequestOtp,
        otp,
        inputRefs,
        handleOtpChange,
        handleOtpKeyDown,
        timeLeft,
        formatTime,
        handleVerifyOtp,
      }}
    />
  );
};

export default StoreDeleteModal;
