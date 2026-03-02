"use client";
import { createContext, useContext, useState, useMemo } from "react";
import SubscriptionUpgradeModal from "@/components/subscription/SubscriptionUpgradeModal";

const SubscriptionContext = createContext();

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
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};
