import {
  User,
  ShoppingCart,
  Bell,
  AlertTriangle,
  CreditCard,
  Info,
  Package,
} from "lucide-react";

/** Notification routing + icons by type (socket + FCM). */
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
      url: "/dashboard/inventory",
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    },
    PAYMENT: {
      url: "/dashboard/payments",
      icon: <CreditCard className="w-5 h-5 text-emerald-500" />,
    },
    SYSTEM: {
      url: data?.url && data.url !== "#" ? data.url : "#",
      icon: <Info className="w-5 h-5 text-sky-500" />,
    },
    INVENTORY: {
      url: "/dashboard/inventory",
      icon: <Package className="w-5 h-5 text-amber-500" />,
    },
  };

  return (
    configs[type] || {
      url: data?.url && data.url !== "#" ? data.url : "#",
      icon: <Bell className="w-5 h-5 text-gray-500" />,
    }
  );
};
