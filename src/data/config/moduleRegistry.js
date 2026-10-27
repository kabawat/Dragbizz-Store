// Module constants — aligned with Core PACKAGE_MODULES
export const MODULE_KEYS = {
    CUSTOMERS: "customer",
    INVOICES: "invoice",
    EXPENSES: "expense",
    CASHBOOK: "cashbook",
    SALES_ORDER: "sales_order",
    PRODUCTS: "product",
    INVENTORY: "inventory",
    SUPPLIERS: "supplier",
    PURCHASE_ORDER: "purchase_order",
    BILLING: "billing",
    ANALYTICS: "analytics",
    REPORTS: "reports",
    STAFF: "staff",
    INTEGRATIONS: "integrations",
    MANAGEMENT: "management",
};

// Route to module mapping
export const ROUTE_MODULE_MAP = {
    "/dashboard/customers": MODULE_KEYS.CUSTOMERS,
    "/dashboard/invoices": MODULE_KEYS.INVOICES,
    "/dashboard/pos": MODULE_KEYS.INVOICES,
    "/dashboard/customer-payment": MODULE_KEYS.INVOICES,
    "/dashboard/expenses": MODULE_KEYS.EXPENSES,
    "/dashboard/cashbook": MODULE_KEYS.CASHBOOK,
    "/dashboard/sales-order": MODULE_KEYS.SALES_ORDER,
    "/dashboard/products": MODULE_KEYS.PRODUCTS,
    "/dashboard/categories": MODULE_KEYS.PRODUCTS,
    "/dashboard/brands": MODULE_KEYS.PRODUCTS,
    "/dashboard/variants": MODULE_KEYS.PRODUCTS,
    "/dashboard/suppliers": MODULE_KEYS.SUPPLIERS,
    "/dashboard/accounts": MODULE_KEYS.SUPPLIERS,
    "/dashboard/purchase-orders": MODULE_KEYS.PURCHASE_ORDER,
    "/dashboard/bills": MODULE_KEYS.BILLING,
    "/dashboard/payments": MODULE_KEYS.BILLING,
    // Analytics sub-routes map to the owning subscription module (not a fake "analytics" key)
    "/dashboard/analytics/daily-sales": MODULE_KEYS.INVOICES,
    "/dashboard/analytics/revenue": MODULE_KEYS.INVOICES,
    "/dashboard/analytics/sales": MODULE_KEYS.INVOICES,
    "/dashboard/analytics/customers": MODULE_KEYS.CUSTOMERS,
    "/dashboard/analytics/expenses": MODULE_KEYS.EXPENSES,
    "/dashboard/analytics/gst": MODULE_KEYS.REPORTS,
    "/dashboard/analytics/products": MODULE_KEYS.PRODUCTS,
    "/dashboard/analytics/stock": MODULE_KEYS.INVENTORY,
    "/dashboard/analytics/suppliers": MODULE_KEYS.SUPPLIERS,
    "/dashboard/analytics/bills": MODULE_KEYS.BILLING,
    "/dashboard/reports": MODULE_KEYS.REPORTS,
    // More specific integration paths first (tally is gated by reports + tally capability)
    "/dashboard/integrations/tally": MODULE_KEYS.REPORTS,
    "/dashboard/integrations/payment": "customer_payment_gateway",
    "/dashboard/integrations": MODULE_KEYS.INTEGRATIONS,
    "/dashboard/utilities/invoice-number": MODULE_KEYS.STORE,
    "/dashboard/utilities/signatures": MODULE_KEYS.STORE,
    "/dashboard/utilities": MODULE_KEYS.STORE,
    "/dashboard/management/staff": MODULE_KEYS.STAFF,
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
    'cashbook': MODULE_KEYS.CASHBOOK,
    'sales_order': MODULE_KEYS.SALES_ORDER,
    'billing': MODULE_KEYS.BILLING,
    'payments': MODULE_KEYS.BILLING,
    'bills': MODULE_KEYS.BILLING,
    'integrations': MODULE_KEYS.INTEGRATIONS,
    'staff': MODULE_KEYS.STAFF,
};

// Extract action (create/edit/etc) from path
export const getActionFromPath = (path) => {
    if (path.includes("/create")) return "create";
    if (path.includes("/edit")) return "edit";
    if (path.includes("/analytics")) return "analytics";
    if (path.includes("/report")) return "report";
    return "read";
};

/** Capability required for specific routes (beyond module access) */
export const getCapabilityFromPath = (path) => {
    if (path === "/dashboard/pos" || path.startsWith("/dashboard/pos/")) {
        return "pos";
    }
    if (path.startsWith("/dashboard/analytics/gst")) {
        return "gst";
    }
    if (path.startsWith("/dashboard/integrations/tally")) {
        return "tally";
    }
    return null;
};
