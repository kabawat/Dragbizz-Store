import dynamic from "next/dynamic";

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="w-8 h-8 border-4 border-[rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export const createLazyComponent = (importFn, options = {}) => {
  const {
    loading: LoadingComponent = LoadingFallback,
    ssr = true,
    ...restOptions
  } = options;

  return dynamic(importFn, {
    loading: LoadingComponent,
    ssr,
    ...restOptions,
  });
};

export const LazySidebar = createLazyComponent(
  () => import("@/components/dashboard/sidebar"),
  { ssr: false }
);

export const LazyHeader = createLazyComponent(
  () => import("@/components/dashboard/header"),
  { ssr: false }
);

export const LazyBillPaymentDrawer = createLazyComponent(
  () => import("@/components/bills/BillPaymentDrawer"),
  { ssr: false }
);

export const LazyProductForm = createLazyComponent(
  () => import("@/components/product/ProductForm"),
  { ssr: false }
);

export const LazyAdvancePaymentDrawer = createLazyComponent(
  () => import("@/components/purchaseOrders/AdvancePaymentDrawer"),
  { ssr: false }
);

export const LazyInvoiceDownloadDrawer = createLazyComponent(
  () => import("@/components/invoice/InvoiceDownloadDrawer"),
  { ssr: false }
);

export const LazyExpenseDownloadDrawer = createLazyComponent(
  () => import("@/components/expenses/ExpenseDownloadDrawer"),
  { ssr: false }
);

export const LazySupplierDownloadDrawer = createLazyComponent(
  () => import("@/components/supplier/SupplierDownloadDrawer"),
  { ssr: false }
);

export const LazyVoiceAISupplier = createLazyComponent(
  () => import("@/components/supplier/VoiceAISupplier"),
  { ssr: false }
);

export const LazyVoiceAICustomer = createLazyComponent(
  () => import("@/components/customer/VoiceAICustomer"),
  { ssr: false }
);

export const LazyCustomerForm = createLazyComponent(
  () => import("@/components/customer/CustomerForm"),
  { ssr: false }
);

export const LazyCreateBillDrawer = createLazyComponent(
  () => import("@/components/purchaseOrders/CreateBillDrawer"),
  { ssr: false }
);

export const LazyPricingGSTSection = createLazyComponent(
  () => import("@/components/product/PricingGSTSection"),
  { ssr: false }
);

export const LazyProductHeader = createLazyComponent(
  () => import("@/components/layout/ProductHeader"),
  { ssr: true }
);

export const LazyUpgradeModal = createLazyComponent(
  () => import("@/components/ui/UpgradeModal"),
  { ssr: false }
);

export const LazyRichTextEditor = createLazyComponent(
  () => import("@/components/ui/RichTextEditor"),
  { ssr: false }
);

export const LazyAnimatedBackground = createLazyComponent(
  () => import("@/components/ui/AnimatedBackground"),
  { ssr: false }
);
