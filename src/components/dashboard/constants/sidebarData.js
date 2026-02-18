import {
    Activity,
    BadgePercent,
    BarChart3,
    Building2,
    DollarSign,
    FileText,
    IndianRupee,
    LayoutDashboard,
    LineChart,
    Lightbulb,
    Package,
    PieChart,
    Receipt,
    Settings,
    ShoppingCart,
    ShoppingBag,
    Users,
    LifeBuoy,
    Warehouse,
} from "lucide-react";

export const getSalesSubMenuItems = (t) => [
    { name: t("sidebar.customers"), icon: Users, href: "/dashboard/customers" },
    {
        name: t("sidebar.invoices"),
        icon: FileText,
        href: "/dashboard/invoices",
    },
    {
        name: t("sidebar.expenses"),
        icon: IndianRupee,
        href: "/dashboard/expenses",
    },
    {
        name: t("sidebar.sellOrders") || "Sell Orders",
        icon: ShoppingBag,
        href: "/dashboard/sales-order",
    },
];

export const getInventorySubMenuItems = (t) => [
    { name: t("sidebar.products"), icon: Package, href: "/dashboard/products" },
    { name: t("sidebar.stocks"), icon: Warehouse, href: "/dashboard/stock" },
];

export const getPurchaseSubMenuItems = (t) => [
    {
        name: t("sidebar.suppliers"),
        icon: Building2,
        href: "/dashboard/suppliers",
    },
    {
        name: t("sidebar.purchaseOrders"),
        icon: ShoppingCart,
        href: "/dashboard/purchase-orders",
    },
    { name: t("sidebar.bills"), icon: Receipt, href: "/dashboard/bills" },
    {
        name: t("sidebar.payments"),
        icon: IndianRupee,
        href: "/dashboard/payments",
    },
];

export const getAnalyticsSubMenuItems = (t, selectedStore) => [
    {
        name: t("dashboard.revenueAnalytics") || "Revenue Analytics",
        icon: LineChart,
        href: "/dashboard/analytics/revenue",
    },
    {
        name: t("dashboard.salesAnalytics") || "Sales Analytics",
        icon: BarChart3,
        href: "/dashboard/analytics/sales",
    },
    {
        name: t("dashboard.stockAnalytics") || "Stock Analytics",
        icon: Warehouse,
        href: "/dashboard/analytics/stock",
    },
    {
        name: t("dashboard.productAnalytics") || "Product Analytics",
        icon: PieChart,
        href: "/dashboard/analytics/products",
    },
    {
        name: t("dashboard.customerAnalytics") || "Customer Analytics",
        icon: Activity,
        href: "/dashboard/analytics/customers",
    },
    {
        name: t("dashboard.supplierAnalytics") || "Supplier Analytics",
        icon: Building2,
        href: "/dashboard/analytics/suppliers",
    },
    {
        name: t("dashboard.billAnalytics") || "Bill Analytics",
        icon: Receipt,
        href: "/dashboard/analytics/bills",
    },
    {
        name: t("dashboard.expenseAnalytics") || "Expense Analytics",
        icon: DollarSign,
        href: "/dashboard/analytics/expenses",
    },
    ...(selectedStore?.gst ? [{
        name: t("gst.gstAnalytics") || "GST Analytics",
        icon: BadgePercent,
        href: "/dashboard/analytics/gst",
    }] : []),
];

export const getNavigationItems = (t, salesSubMenuItems, inventorySubMenuItems, purchaseSubMenuItems, analyticsSubMenuItems) => [
    { name: t("sidebar.dashboard"), icon: LayoutDashboard, href: "/dashboard" },
    {
        name: t("sidebar.salesTransactions"),
        icon: Receipt,
        href: "/dashboard/sales",
        hasSubMenu: true,
        subMenuItems: salesSubMenuItems,
        key: "sales",
    },
    {
        name: t("sidebar.inventory"),
        icon: Package,
        href: "/dashboard/products",
        hasSubMenu: true,
        subMenuItems: inventorySubMenuItems,
        key: "inventory",
    },
    {
        name: t("sidebar.purchase"),
        icon: ShoppingCart,
        href: "/dashboard/purchase-orders",
        hasSubMenu: true,
        subMenuItems: purchaseSubMenuItems,
        key: "purchase",
    },
    {
        name: t("sidebar.analytics") || "Analytics",
        icon: BarChart3,
        href: "/dashboard/analytics/revenue",
        hasSubMenu: true,
        subMenuItems: analyticsSubMenuItems,
        key: "analytics",
    },
];

export const getBottomItems = (t) => [
    {
        name: t("sidebar.supportCenter") || "Support Center",
        icon: LifeBuoy,
        href: "/dashboard/support",
    },
    {
        name: t("sidebar.settings"),
        icon: Settings,
        href: "/dashboard/settings",
    },
];

export const getMenuToFeatureMap = (t) => ({
    [t("sidebar.salesTransactions")]: [
        "Customer Management",
        "Invoice Management",
        "Expense Management",
        "customer_management",
        "invoice_management",
        "expense_management",
        "Sell Orders",
    ],
    [t("sidebar.inventory")]: [
        "Product Management",
        "Stock Management",
        "product_management",
        "stock_management",
    ],
    [t("sidebar.purchase")]: ["Purchase Management", "purchase_management"],
});

export const getSubMenuToFeatureMap = (t) => ({
    [t("sidebar.customers")]: ["Customer Management", "customer_management"],
    [t("sidebar.invoices")]: ["Invoice Management", "invoice_management"],
    [t("sidebar.sellOrders") || "Sell Orders"]: ["Invoice Management", "invoice_management"],
    [t("sidebar.expenses")]: ["Expense Management", "expense_management"],
    [t("sidebar.products")]: ["Product Management", "product_management"],
    [t("sidebar.stocks")]: ["Stock Management", "stock_management"],

    [t("sidebar.suppliers")]: [
        "Purchase Management",
        "purchase_management",
        "Supplier Management",
        "supplier_management",
    ],
    [t("sidebar.purchaseOrders")]: [
        "Purchase Management",
        "purchase_management",
    ],
    [t("sidebar.bills")]: ["Bill Management", "bill_management"],
    [t("sidebar.payments")]: ["Payment Management", "payment_management"],
    [t("gst.gstAnalytics") || "GST Analytics"]: ["Invoice Management", "invoice_management"],
});
