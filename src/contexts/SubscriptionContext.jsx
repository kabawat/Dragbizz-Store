"use client";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import SubscriptionUpgradeModal from "@/components/subscription/SubscriptionUpgradeModal";
import { subscriptionService } from "@/service/retailer";
import { useAppSelector } from "@/store/hooks";
import { handleSuccess } from "@/utils/responseHandler/success";
import {
  readPlanPreview,
  savePlanPreview,
  workspaceScope,
} from "@/utils/workspaceCache";
import { isKhataFreeSubscription } from "@/utils/subscriptionCapability.util";

const SubscriptionContext = createContext({
  subscription: null,
  isLoading: true,
  isVerified: false,
  hasPlanPreview: false,
  error: null,
  hasSubscription: false,
  isKhataFree: false,
  showUpgradeModal() {},
});
export const SubscriptionProvider = ({ children }) => {
  const pathname = usePathname();
  const isSetup = pathname?.startsWith("/setup") === true;
  const profile = useAppSelector((state) => state.profile);
  const scope = workspaceScope(profile);
  const [state, setState] = useState(() => {
    const preview = readPlanPreview(scope);
    return {
      scope,
      subscription: preview?.subscription ?? null,
      hasPlanPreview: Boolean(preview),
      isLoading: true,
      isVerified: false,
      error: null,
    };
  });
  const request = useRef(0);
  const inFlight = useRef(null);
  const reload = useCallback(async () => {
    if (!scope || isSetup) return;
    const generation = ++request.current;
    setState((previous) => {
      const preview =
        previous.scope === scope ? previous : readPlanPreview(scope);
      return {
        scope,
        subscription: preview?.subscription ?? null,
        hasPlanPreview: Boolean(preview?.hasPlanPreview ?? preview),
        isVerified: previous.scope === scope && previous.isVerified,
        isLoading: true,
        error: null,
      };
    });
    try {
      // Join concurrent reloads (including React Strict Mode effect replay).
      if (!inFlight.current || inFlight.current.scope !== scope) {
        const pending = {
          scope,
          promise: Promise.resolve()
            .then(() => subscriptionService.getSubscription())
            .then(handleSuccess),
        };
        inFlight.current = pending;
        pending.promise.then(
          () => {
            if (inFlight.current === pending) inFlight.current = null;
          },
          () => {
            if (inFlight.current === pending) inFlight.current = null;
          }
        );
      }
      const result = await inFlight.current.promise;
      if (generation !== request.current) return;
      const subscription = result.data ?? null;
      savePlanPreview(scope, subscription);
      setState({
        scope,
        subscription,
        hasPlanPreview: true,
        isLoading: false,
        isVerified: true,
        error: null,
      });
    } catch (error) {
      if (generation !== request.current) return;
      setState((previous) => ({
        ...previous,
        isLoading: false,
        error: error?.message || "Unable to load subscription.",
      }));
    }
  }, [scope, isSetup]);
  useEffect(() => {
    reload();
    return () => {
      request.current += 1;
    };
  }, [reload]);

  const [modal, setModal] = useState({
    open: false,
    message: "",
    type: "UPGRADE",
  });
  const showUpgradeModal = useCallback(
    (message, type = "UPGRADE") =>
      setModal({
        open: true,
        message: message || "Please upgrade your plan to access this feature.",
        type,
      }),
    []
  );
  const current =
    state.scope === scope
      ? state
      : {
          subscription: null,
          hasPlanPreview: false,
          isLoading: true,
          isVerified: false,
          error: null,
        };
  const value = useMemo(
    () => ({
      ...current,
      reload,
      hasSubscription: Boolean(current.subscription),
      isKhataFree: isKhataFreeSubscription(current.subscription),
      showUpgradeModal,
    }),
    [current, reload, showUpgradeModal]
  );
  return (
    <SubscriptionContext.Provider value={value}>
      {children}
      <SubscriptionUpgradeModal
        isOpen={modal.open}
        onClose={() => setModal((previous) => ({ ...previous, open: false }))}
        message={modal.message}
        type={modal.type}
      />
    </SubscriptionContext.Provider>
  );
};
export const useSubscription = () => useContext(SubscriptionContext);
