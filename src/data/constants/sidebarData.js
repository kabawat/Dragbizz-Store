import {
    Award,
    BadgePercent,
    BarChart3,
    BookOpen,
    Boxes,
    Building2,
    CalendarDays,
    ClipboardList,
    CreditCard,
    Crown,
    FileSignature,
    FileSpreadsheet,
    FileText,
    Gauge,
    Hash,
    Headphones,
    Landmark,
    Layers,
    LayoutDashboard,
    Package,
    PieChart,
    Plug,
    QrCode,
    Receipt,
    ReceiptText,
    Settings,
    Shield,
    ShoppingBag,
    ShoppingCart,
    Store,
    Tags,
    TrendingDown,
    TrendingUp,
    Truck,
    UserCheck,
    UserCog,
    Users,
    Wallet,
    Warehouse,
    Wrench,
} from "lucide-react";

/** Sales Management */
export const getSalesSubMenuItems = (t) => [
    {
        name: t("sidebar.pos") || "POS",
        icon: Store,
        href: "/dashboard/pos",
        shortcut: "k",
        module: "invoice",
        requireCapability: "pos",
    },
    {
        name: t("sidebar.invoices"),
        icon: ReceiptText,
        href: "/dashboard/invoices",
        shortcut: "i",
        module: "invoice",
    },
    {
        name: t("sidebar.sellOrders") || "Sales Orders",
        icon: ClipboardList,
        href: "/dashboard/sales-order",
        shortcut: "o",
        module: "sales_order",
    },
    {
        name: t("sidebar.customers"),
        icon: Users,
        href: "/dashboard/customers",
        shortcut: "c",
        module: "customer",
    },
];

/** Product Catalog & Inventory — products, stocks, categories, brands, variants */
export const getProductSubMenuItems = (t, stockSubMenuItems = []) => [
    {
        name: t("sidebar.products"),
        icon: Package,
        href: "/dashboard/products",
        shortcut: "p",
        module: "product",
    },
    ...(stockSubMenuItems || []),
    {
        name: t("sidebar.categories"),
        icon: Tags,
        href: "/dashboard/categories",
        module: "product",
    },
    {
        name: t("sidebar.brands"),
        icon: Award,
        href: "/dashboard/brands",
        module: "product",
    },
    {
        name: t("sidebar.variants"),
        icon: Layers,
        href: "/dashboard/variants",
        module: "product",
    },
];

/** Stock Management */
export const getStockSubMenuItems = (t) => [
    {
        name: t("sidebar.stocks"),
        icon: Warehouse,
        href: "/dashboard/stock",
        shortcut: "s",
        module: "inventory",
        requireCapability: "fifo",
    },
];

/** Purchase Management */
export const getPurchaseSubMenuItems = (t) => [
    {
        name: t("sidebar.purchaseOrders"),
        icon: ShoppingCart,
        href: "/dashboard/purchase-orders",
        shortcut: "shift+o",
        module: "purchase_order",
    },
    {
        name: t("sidebar.bills"),
        icon: Receipt,
        href: "/dashboard/bills",
        shortcut: "b",
        module: "billing",
    },
    {
        name: t("sidebar.suppliers"),
        icon: Building2,
        href: "/dashboard/suppliers",
        shortcut: "u",
        module: "supplier",
    },
    {
        name: t("sidebar.accounts") || "Supplier Accounts",
        icon: Landmark,
        href: "/dashboard/accounts",
        module: "supplier",
    },
    {
        name: t("sidebar.payments"),
        icon: CreditCard,
        href: "/dashboard/payments",
        shortcut: "y",
        module: "billing",
    },
];

/** Finance & Accounts */
export const getFinanceSubMenuItems = (t) => [
    {
        name: t("sidebar.cashbook"),
        icon: BookOpen,
        href: "/dashboard/cashbook",
        shortcut: "shift+c",
        module: "cashbook",
    },
    {
        name: t("sidebar.expenses"),
        icon: TrendingDown,
        href: "/dashboard/expenses",
        shortcut: "e",
        module: "expense",
    },
];

/** Utilities / Business Tools */
export const getUtilitiesSubMenuItems = (t) => [
    {
        name: t("invoice.invoiceTemplates"),
        icon: FileText,
        href: "/dashboard/utilities/invoice-template",
    },
    {
        name: t("sidebar.invoiceNumber") || "Invoice Number Format",
        icon: Hash,
        href: "/dashboard/utilities/invoice-number",
        shortcut: "n",
    },
    {
        name: t("sidebar.signatures") || "Digital Signatures",
        icon: FileSignature,
        href: "/dashboard/utilities/signatures",
    },
];

/** Analytics — `group` renders section headers in sidebar */
export const getAnalyticsSubMenuItems = (t, selectedStore) => [
    {
        name: t("dashboard.dailySales") || "Daily Sales",
        icon: CalendarDays,
        href: "/dashboard/analytics/daily-sales",
        module: "invoice",
        requireAnalytics: true,
        group: t("sidebar.salesManagement"),
    },
    {
        name: t("dashboard.revenueAnalytics") || "Revenue Analytics",
        icon: TrendingUp,
        href: "/dashboard/analytics/revenue",
        module: "invoice",
        requireAnalytics: true,
        group: t("sidebar.salesManagement"),
    },
    {
        name: t("dashboard.salesAnalytics") || "Sales Analytics",
        icon: BarChart3,
        href: "/dashboard/analytics/sales",
        module: "invoice",
        requireAnalytics: true,
        group: t("sidebar.salesManagement"),
    },
    {
        name: t("dashboard.customerAnalytics") || "Customer Analytics",
        icon: UserCheck,
        href: "/dashboard/analytics/customers",
        module: "customer",
        requireAnalytics: true,
        group: t("sidebar.salesManagement"),
    },
    {
        name: t("dashboard.expenseAnalytics") || "Expense Analytics",
        icon: TrendingDown,
        href: "/dashboard/analytics/expenses",
        module: "expense",
        requireAnalytics: true,
        group: t("sidebar.salesManagement"),
    },
    ...(selectedStore?.gst
        ? [
            {
                name: t("gst.gstAnalytics") || "GST Analytics",
                icon: BadgePercent,
                href: "/dashboard/analytics/gst",
                module: "reports",
                requireAnalytics: true,
                requireCapability: "gst",
                group: t("sidebar.salesManagement"),
            },
        ]
        : []),
    {
        name: t("dashboard.productAnalytics") || "Product Analytics",
        icon: PieChart,
        href: "/dashboard/analytics/products",
        module: "product",
        requireAnalytics: true,
        group: t("sidebar.productManagement"),
    },
    {
        name: t("dashboard.stockAnalytics") || "Stock Analytics",
        icon: Warehouse,
        href: "/dashboard/analytics/stock",
        module: "inventory",
        requireAnalytics: true,
        group: t("sidebar.productManagement"),
    },
    {
        name: t("dashboard.supplierAnalytics") || "Supplier Analytics",
        icon: Building2,
        href: "/dashboard/analytics/suppliers",
        module: "supplier",
        requireAnalytics: true,
        group: t("sidebar.purchaseManagement"),
    },
    {
        name: t("dashboard.billAnalytics") || "Bill Analytics",
        icon: ReceiptText,
        href: "/dashboard/analytics/bills",
        module: "billing",
        requireAnalytics: true,
        group: t("sidebar.purchaseManagement"),
    },
];

export const getManagementSubMenuItems = (t) => [
    {
        name: t("sidebar.staff") || "Staff",
        icon: UserCog,
        href: "/dashboard/management/staff",
        shortcut: "f",
    },
    {
        name: t("sidebar.subscription") || "Subscription",
        icon: Crown,
        href: "/dashboard/management/subscription",
        shortcut: "m",
    },
    {
        name: t("sidebar.planLimits") || "Plan Limits",
        icon: Gauge,
        href: "/dashboard/management/limits",
        shortcut: "l",
    },
];

export const getIntegrationsSubMenuItems = (t) => [
    {
        name: t("sidebar.tally") || "Tally",
        icon: FileSpreadsheet,
        href: "/dashboard/integrations/tally",
        module: "reports",
        requireCapability: "tally",
    },
    {
        name: t("sidebar.paymentGateway") || "Payment Gateway",
        icon: QrCode,
        href: "/dashboard/integrations/payment",
        module: "customer_payment_gateway",
    },
];

export const getNavigationItems = (
    t,
    salesSubMenuItems,
    productSubMenuItems,
    purchaseSubMenuItems,
    analyticsSubMenuItems,
    managementSubMenuItems,
    integrationsSubMenuItems,
    _stockSubMenuItems = [],
    utilitiesSubMenuItems = [],
    financeSubMenuItems = []
) => [
        {
            name: t("sidebar.dashboard"),
            icon: LayoutDashboard,
            href: "/dashboard",
            shortcut: "d",
        },
        {
            name: t("sidebar.salesManagement"),
            icon: ShoppingBag,
            href: "/dashboard/pos",
            hasSubMenu: true,
            subMenuItems: salesSubMenuItems,
            key: "sales",
        },
        {
            name: t("sidebar.productManagement"),
            icon: Boxes,
            href: "/dashboard/products",
            hasSubMenu: true,
            subMenuItems: productSubMenuItems,
            key: "products",
        },
        {
            name: t("sidebar.purchaseManagement"),
            icon: Truck,
            href: "/dashboard/purchase-orders",
            hasSubMenu: true,
            subMenuItems: purchaseSubMenuItems,
            key: "purchase",
        },
        ...(financeSubMenuItems.length
            ? [
                {
                    name: t("sidebar.finance") || "Finance & Accounts",
                    icon: Wallet,
                    href: "/dashboard/cashbook",
                    hasSubMenu: true,
                    subMenuItems: financeSubMenuItems,
                    key: "finance",
                },
            ]
            : []),
        ...(utilitiesSubMenuItems.length
            ? [
                {
                    name: t("sidebar.utilities") || "Utilities",
                    icon: Wrench,
                    href: "/dashboard/utilities/invoice-number",
                    hasSubMenu: true,
                    subMenuItems: utilitiesSubMenuItems,
                    key: "utilities",
                },
            ]
            : []),
        {
            name: t("sidebar.analytics") || "Analytics",
            icon: BarChart3,
            href: "/dashboard/analytics/revenue",
            hasSubMenu: true,
            subMenuItems: analyticsSubMenuItems,
            key: "analytics",
        },
        {
            name: t("sidebar.management") || "Management",
            icon: Shield,
            href: "/dashboard/management/staff",
            hasSubMenu: true,
            subMenuItems: managementSubMenuItems,
            key: "management",
        },
        {
            name: t("sidebar.integrations") || "Integrations",
            icon: Plug,
            href: "/dashboard/integrations/tally",
            hasSubMenu: true,
            subMenuItems: integrationsSubMenuItems,
            key: "integrations",
        },
    ];

export const getBottomItems = (t) => [
    {
        name: t("sidebar.supportCenter") || "Support Center",
        icon: Headphones,
        href: "/dashboard/support",
        shortcut: "h",
    },
    {
        name: t("sidebar.settings"),
        icon: Settings,
        href: "/dashboard/settings",
        shortcut: ",",
    },
];

/** Default state for sidebar menus — all menus expanded by default */
export const DEFAULT_EXPANDED_MENUS = Object.freeze({
    sales: true,
    products: true,
    purchase: true,
    finance: true,
    utilities: true,
    analytics: true,
    management: true,
    integrations: true,
});
