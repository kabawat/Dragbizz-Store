import {
  User,
  ShoppingCart,
  Bell,
  AlertTriangle,
  CreditCard,
  Info,
  Package,
} from "lucide-react";

// Get customer id from notification data
const getCustomerId = (data) =>
  data?.customer ||
  data?.customerId ||
  data?.customer_id ||
  data?.data?.customer ||
  data?.data?.customerId ||
  data?.data?.customer_id;

// Resolve payment notification link to khata tab
const resolvePaymentUrl = (data) => {
  const custId = getCustomerId(data);
  if (custId) return `/dashboard/customers/${custId}?tab=khata`;
  if (data?.url && data.url !== "#") return data.url;
  return "/dashboard/payments";
};

// Notification routing and icons by type
export const getNotificationConfig = (type, data) => {
  const configs = {
    SALE_ORDER_CUSTOMER: {
      url: data?.customer ? `/dashboard/customers/${data.customer}` : "#",
      icon: <User className="w-5 h-5 text-blue-500" />,
    },
    CUSTOMER_CREATED: {
      url: data?.customer ? `/dashboard/customers/${data.customer}` : "#",
      icon: <User className="w-5 h-5 text-blue-500" />,
    },
    SALES_ORDER: {
      url: data?.order ? `/dashboard/sales-order/${data.order}` : "#",
      icon: <ShoppingCart className="w-5 h-5 text-green-500" />,
    },
    STOCK_ALERT: {
      url: "/dashboard/products",
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    },
    PAYMENT: {
      url: resolvePaymentUrl(data),
      icon: <CreditCard className="w-5 h-5 text-emerald-500" />,
    },
    PAYMENT_RECEIVED: {
      url: resolvePaymentUrl(data),
      icon: <CreditCard className="w-5 h-5 text-emerald-500" />,
    },
    SYSTEM: {
      url: data?.url && data.url !== "#" ? data.url : "#",
      icon: <Info className="w-5 h-5 text-sky-500" />,
    },
    INVENTORY: {
      url: "/dashboard/products",
      icon: <Package className="w-5 h-5 text-amber-500" />,
    },
    LOW_STOCK: {
      url: "/dashboard/products",
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    },
    OUT_OF_STOCK: {
      url: "/dashboard/products",
      icon: <AlertTriangle className="w-5 h-5 text-rose-500" />,
    },
    DAILY_BRIEF: {
      url: "/dashboard",
      icon: <Info className="w-5 h-5 text-indigo-500" />,
    },
  };

  return (
    configs[type] || {
      url: data?.url && data.url !== "#" ? data.url : "#",
      icon: <Bell className="w-5 h-5 text-gray-500" />,
    }
  );
};
