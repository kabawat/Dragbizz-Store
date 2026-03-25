"use client";
import { createContext, useContext, useState, useMemo } from "react";
import SubscriptionUpgradeModal from "@/components/subscription/SubscriptionUpgradeModal";

const defaultContext = {
  subscription: null,
  isLoading: false,
  error: null,
  hasSubscription: false,
  showUpgradeModal: () => {}, // no-op outside Provider
};

const SubscriptionContext = createContext(defaultContext);

export const SubscriptionProvider = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("UPGRADE"); // 'UPGRADE' | 'QUOTA'

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
      subscription: null,
      isLoading: false,
      error: null,
      hasSubscription: false,
      showUpgradeModal, // <- Exported Global function
    }),
    []
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
  // Returns the default context (with no-op functions) when used outside SubscriptionProvider
  return useContext(SubscriptionContext);
};
