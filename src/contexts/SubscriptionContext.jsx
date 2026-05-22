"use client";
import { createContext, useContext, useState, useMemo, useEffect, useRef } from "react";
import SubscriptionUpgradeModal from "@/components/subscription/SubscriptionUpgradeModal";
import { subscriptionService } from "@/service/retailer";
import useApiResponse from "@/hooks/useApiResponse";

const defaultContext = {
  subscription: null,
  isLoading: false,
  error: null,
  hasSubscription: false,
  showUpgradeModal: () => { },
};

const SubscriptionContext = createContext(defaultContext);

export const SubscriptionProvider = ({ children }) => {
  const { execute: executeFetch, data: subscription, loading: isLoading } = useApiResponse();
  const hasFetched = useRef(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("UPGRADE"); // 'UPGRADE' | 'QUOTA'

  useEffect(() => {
    if (!hasFetched.current && executeFetch) {
      hasFetched.current = true;
      executeFetch(
        subscriptionService.getSubscription(),
        { showToast: false }
      );
    }
  }, [executeFetch]);

  const showUpgradeModal = (message, type = "UPGRADE") => {
    setModalMessage(message || "Please upgrade your plan to access this feature.");
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeUpgradeModal = () => {
    setIsModalOpen(false);
  };

  const value = useMemo(
    () => ({
      subscription,
      isLoading,
      hasSubscription: !!subscription,
      showUpgradeModal,
    }),
    [subscription, isLoading]
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
      <SubscriptionUpgradeModal
        isOpen={isModalOpen}
        onClose={closeUpgradeModal}
        message={modalMessage}
        type={modalType}
      />
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  return useContext(SubscriptionContext);
};
