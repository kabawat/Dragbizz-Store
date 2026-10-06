import {
    Activity,
    Headphones,
    BadgePercent,
    BarChart3,
    Building2,
    DollarSign,
    FileText,
    IndianRupee,
    LayoutDashboard,
    LineChart,
    Package,
    PieChart,
    Plug,
    Receipt,
    Settings,
    ShoppingCart,
    ShoppingBag,
    Tags,
    Layers,
    Award,
    Users,
    UserCog,
    Warehouse,
    Shield,
    CreditCard,
    Wallet,
} from "lucide-react";

/** Sales Management */
export const getSalesSubMenuItems = (t) => [
    { name: t("sidebar.customers"), icon: Users, href: "/dashboard/customers", shortcut: "c", module: "customer" },
    { name: t("sidebar.pos") || "POS", icon: ShoppingBag, href: "/dashboard/pos", shortcut: "k", module: "invoice", requireCapability: "pos" },
    { name: t("sidebar.invoices"), icon: FileText, href: "/dashboard/invoices", shortcut: "i", module: "invoice" },
    { name: t("sidebar.sellOrders") || "Sales Orders", icon: ShoppingBag, href: "/dashboard/sales-order", shortcut: "o", module: "invoice" },
    { name: t("sidebar.cashbook"), icon: Wallet, href: "/dashboard/cashbook", shortcut: "b", module: "cashbook" },
    { name: t("sidebar.expenses"), icon: IndianRupee, href: "/dashboard/expenses", shortcut: "e", module: "expense" },
];

/** Product Catalog — category, brand, product, variant */
export const getProductSubMenuItems = (t) => [
    { name: t("sidebar.categories"), icon: Tags, href: "/dashboard/categories", module: "product" },
    { name: t("sidebar.brands"), icon: Award, href: "/dashboard/brands", module: "product" },
    { name: t("sidebar.products"), icon: Package, href: "/dashboard/products", shortcut: "p", module: "product" },
    { name: t("sidebar.variants"), icon: Layers, href: "/dashboard/variants", module: "product" },
];

/** Stock Management */
export const getStockSubMenuItems = (t) => [
    { name: t("sidebar.stocks"), icon: Warehouse, href: "/dashboard/stock", shortcut: "s", module: "inventory", requireCapability: "fifo" },
];

/** @deprecated use getProductSubMenuItems */
export const getInventorySubMenuItems = getProductSubMenuItems;

/** Purchase Management */
export const getPurchaseSubMenuItems = (t) => [
    { name: t("sidebar.suppliers"), icon: Building2, href: "/dashboard/suppliers", shortcut: "u", module: "supplier" },
    { name: t("sidebar.purchaseOrders"), icon: ShoppingCart, href: "/dashboard/purchase-orders", shortcut: "shift+o", module: "purchase_order" },
    { name: t("sidebar.bills"), icon: Receipt, href: "/dashboard/bills", shortcut: "b", module: "billing" },
    { name: t("sidebar.payments"), icon: IndianRupee, href: "/dashboard/payments", shortcut: "y", module: "billing" },
];

/** Analytics — `group` renders section headers in sidebar */
export const getAnalyticsSubMenuItems = (t, selectedStore) => [
    {
        name: t("dashboard.dailySales") || "Daily Sales",
        icon: Receipt,
        href: "/dashboard/analytics/daily-sales",
        module: "invoice",
        requireAnalytics: true,
        group: t("sidebar.salesManagement"),
    },
    {
        name: t("dashboard.revenueAnalytics") || "Revenue Analytics",
        icon: LineChart,
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
        icon: Activity,
        href: "/dashboard/analytics/customers",
        module: "customer",
        requireAnalytics: true,
        group: t("sidebar.salesManagement"),
    },
    {
        name: t("dashboard.expenseAnalytics") || "Expense Analytics",
        icon: DollarSign,
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
        icon: Receipt,
        href: "/dashboard/analytics/bills",
        module: "billing",
        requireAnalytics: true,
        group: t("sidebar.purchaseManagement"),
    },
];

export const getManagementSubMenuItems = (t) => [
    { name: t("sidebar.staff") || "Staff", icon: UserCog, href: "/dashboard/management/staff", shortcut: "f" },
    { name: t("sidebar.subscription") || "Subscription", icon: CreditCard, href: "/dashboard/management/subscription", shortcut: "m" },
    { name: t("sidebar.planLimits") || "Plan Limits", icon: Activity, href: "/dashboard/management/limits", shortcut: "l" },
];

export const getIntegrationsSubMenuItems = (t) => [
    { name: t("sidebar.tally") || "Tally", icon: FileText, href: "/dashboard/integrations/tally" },
    {
        name: t("sidebar.paymentGateway") || "Payment Gateway",
        icon: CreditCard,
        href: "/dashboard/integrations/payment",
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
    stockSubMenuItems = [],
) => [
    { name: t("sidebar.dashboard"), icon: LayoutDashboard, href: "/dashboard", shortcut: "d" },
    {
        name: t("sidebar.salesManagement"),
        icon: Receipt,
        href: "/dashboard/customers",
        hasSubMenu: true,
        subMenuItems: salesSubMenuItems,
        key: "sales",
    },
    {
        name: t("sidebar.productManagement"),
        icon: Package,
        href: "/dashboard/products",
        hasSubMenu: true,
        subMenuItems: productSubMenuItems,
        key: "products",
    },
    ...(stockSubMenuItems.length
        ? [
              {
                  name: t("sidebar.stockManagement"),
                  icon: Warehouse,
                  href: "/dashboard/stock",
                  hasSubMenu: true,
                  subMenuItems: stockSubMenuItems,
                  key: "stock",
              },
          ]
        : []),
    {
        name: t("sidebar.purchaseManagement"),
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
    { name: t("sidebar.supportCenter") || "Support Center", icon: Headphones, href: "/dashboard/support", shortcut: "h" },
    { name: t("sidebar.settings"), icon: Settings, href: "/dashboard/settings", shortcut: "," },
];

export const getMenuToFeatureMap = (t) => ({
    [t("sidebar.salesManagement")]: [
        "Customer Management",
        "Invoice Management",
        "Expense Management",
        "customer_management",
        "invoice_management",
        "expense_management",
    ],
    [t("sidebar.productManagement")]: [
        "Product Management",
        "product_management",
    ],
    [t("sidebar.stockManagement")]: [
        "Stock Management",
        "stock_management",
    ],
    [t("sidebar.inventory")]: [
        "Product Management",
        "Stock Management",
        "product_management",
        "stock_management",
    ],
    [t("sidebar.purchaseManagement")]: ["Purchase Management", "purchase_management"],
    [t("sidebar.purchase")]: ["Purchase Management", "purchase_management"],
});

export const getSubMenuToFeatureMap = (t) => ({
    [t("sidebar.customers")]: ["Customer Management", "customer_management"],
    [t("sidebar.invoices")]: ["Invoice Management", "invoice_management"],
    [t("sidebar.pos") || "POS"]: ["Invoice Management", "invoice_management"],
    [t("sidebar.sellOrders") || "Sell Orders"]: ["Invoice Management", "invoice_management"],
    [t("sidebar.expenses")]: ["Expense Management", "expense_management"],
    [t("sidebar.products")]: ["Product Management", "product_management"],
    [t("sidebar.categories")]: ["Product Management", "product_management"],
    [t("sidebar.brands")]: ["Product Management", "product_management"],
    [t("sidebar.variants")]: ["Product Management", "product_management"],
    [t("sidebar.stocks")]: ["Stock Management", "stock_management"],
    [t("sidebar.lowStockAlerts")]: ["Stock Management", "stock_management"],
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
