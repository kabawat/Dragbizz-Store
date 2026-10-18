"use client";
import {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { usePathname } from "next/navigation";
import SubscriptionUpgradeModal from "@/components/subscription/SubscriptionUpgradeModal";
import { subscriptionService } from "@/service/retailer";
import useApiResponse from "@/hooks/useApiResponse";
import { isKhataFreeSubscription } from "@/utils/subscriptionCapability.util";

const defaultContext = {
  subscription: null,
  isLoading: true,
  error: null,
  hasSubscription: false,
  isKhataFree: false,
  showUpgradeModal: () => {},
};

const SubscriptionContext = createContext(defaultContext);

export const SubscriptionProvider = ({ children }) => {
  const pathname = usePathname();
  const {
    execute: executeFetch,
    data: subscription,
    loading: isLoading,
  } = useApiResponse();
  const hasFetched = useRef(false);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState(null);
  const reload = useCallback(async () => {
    setInitialized(false);
    setError(null);
    try {
      const result = await executeFetch(subscriptionService.getSubscription(), {
        showToast: false,
      });
      if (!result?.success)
        setError(result?.message || "Unable to load subscription.");
    } catch (error) {
      setError(error?.message || "Unable to load subscription.");
    } finally {
      setInitialized(true);
    }
  }, [executeFetch]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("UPGRADE");

  useEffect(() => {
    if (pathname?.startsWith("/onboarding")) return;

    if (!hasFetched.current && executeFetch) {
      hasFetched.current = true;
      reload();
    }
  }, [executeFetch, pathname, reload]);

  const showUpgradeModal = useCallback((message, type = "UPGRADE") => {
    setModalMessage(
      message || "Please upgrade your plan to access this feature."
    );
    setModalType(type);
    setIsModalOpen(true);
  }, []);

  const closeUpgradeModal = () => {
    setIsModalOpen(false);
  };

  const isKhataFree = useMemo(
    () => isKhataFreeSubscription(subscription),
    [subscription]
  );

  const value = useMemo(
    () => ({
      subscription,
      isLoading: !initialized || isLoading,
      error,
      reload,
      hasSubscription: !!subscription,
      isKhataFree,
      showUpgradeModal,
    }),
    [
      subscription,
      isLoading,
      isKhataFree,
      initialized,
      error,
      reload,
      showUpgradeModal,
    ]
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
