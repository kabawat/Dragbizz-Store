// Module constants
export const MODULE_KEYS = {
    CUSTOMERS: "customer",
    INVOICES: "invoice",
    EXPENSES: "expense",
    SALES_ORDER: "sales_order",
    PRODUCTS: "product",
    INVENTORY: "inventory",
    SUPPLIERS: "supplier",
    PURCHASE_ORDER: "purchase_order",
    BILLING: "billing",
    ANALYTICS: "analytics",
    REPORTS: "reports",
    MANAGEMENT: "management"
};

// Route to module mapping
export const ROUTE_MODULE_MAP = {
    "/dashboard/customers": MODULE_KEYS.CUSTOMERS,
    "/dashboard/invoices": MODULE_KEYS.INVOICES,
    "/dashboard/pos": MODULE_KEYS.INVOICES,
    "/dashboard/expenses": MODULE_KEYS.EXPENSES,
    "/dashboard/sales-order": MODULE_KEYS.SALES_ORDER,
    "/dashboard/products": MODULE_KEYS.PRODUCTS,
    "/dashboard/stock": MODULE_KEYS.INVENTORY,
    "/dashboard/suppliers": MODULE_KEYS.SUPPLIERS,
    "/dashboard/purchase-orders": MODULE_KEYS.PURCHASE_ORDER,
    "/dashboard/bills": MODULE_KEYS.BILLING,
    "/dashboard/payments": MODULE_KEYS.BILLING,
    "/dashboard/analytics": MODULE_KEYS.ANALYTICS,
    "/dashboard/reports": MODULE_KEYS.REPORTS,
};

// Extract module from path
export const getModuleFromPath = (path) => {
    for (const [route, module] of Object.entries(ROUTE_MODULE_MAP)) {
        if (path === route || path.startsWith(route + "/")) return module;
    }
    return null;
};

// Subscription feature mapping
export const SUB_MODULE_MAP = {
    'customers': MODULE_KEYS.CUSTOMERS,
    'invoices': MODULE_KEYS.INVOICES,
    'pos': MODULE_KEYS.INVOICES,
    'products': MODULE_KEYS.PRODUCTS,
    'stock': MODULE_KEYS.INVENTORY,
    'suppliers': MODULE_KEYS.SUPPLIERS,
    'purchase_order': MODULE_KEYS.PURCHASE_ORDER,
    'expenses': MODULE_KEYS.EXPENSES,
    'billing': MODULE_KEYS.BILLING,
    'payments': MODULE_KEYS.BILLING,
    'bills': MODULE_KEYS.BILLING,
};

// Extract action (create/edit/etc) from path
export const getActionFromPath = (path) => {
    if (path.includes("/create")) return "create";
    if (path.includes("/edit")) return "edit";
    if (path.includes("/analytics")) return "analytics";
    if (path.includes("/report")) return "report";
    return "read";
};
