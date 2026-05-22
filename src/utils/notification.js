import { User, ShoppingCart, Bell, AlertTriangle, CreditCard, Info, Lightbulb } from "lucide-react";
//Get notification configuration based on type and data
export const getNotificationConfig = (type, data) => {
    const configs = {
        SALE_ORDER_CUSTOMER: {
            url: data?.customer ? `/dashboard/customers/${data.customer}` : "#",
            icon: <User className="w-5 h-5 text-blue-500" />
        },
        SALES_ORDER: {
            url: data?.order ? `/dashboard/sales-order/${data.order}` : "#",
            icon: <ShoppingCart className="w-5 h-5 text-green-500" />
        },
        STOCK_ALERT: {
            url: "/dashboard/inventory",
            icon: <AlertTriangle className="w-5 h-5 text-amber-500" />
        },
        PAYMENT: {
            url: "/dashboard/payments",
            icon: <CreditCard className="w-5 h-5 text-emerald-500" />
        },
        SYSTEM: {
            url: "#",
            icon: <Info className="w-5 h-5 text-sky-500" />
        }
    };

    return configs[type] || {
        url: "#",
        icon: <Bell className="w-5 h-5 text-gray-500" />
    };
};
