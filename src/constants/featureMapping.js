// Route / menu mapping aligned with subscription PACKAGE_MODULES (short keys)
export const FEATURE_ROUTES = {
  store: {
    routes: ["/dashboard/settings", "/onboarding/store"],
    menuItems: ["Settings"],
    subMenuItems: ["Store Settings"],
  },

  product: {
    routes: [
      "/dashboard/products",
      "/dashboard/products/add",
      "/dashboard/products/edit",
      "/dashboard/products/view",
      "/dashboard/categories",
      "/dashboard/brands",
      "/dashboard/variants",
      "/dashboard/variants/add",
      "/dashboard/variants/edit",
      "/dashboard/variants/view",
    ],
    menuItems: ["Product Catalog"],
    subMenuItems: ["Category", "Brand", "Products", "Variant"],
  },

  invoice: {
    routes: [
      "/dashboard/invoices",
      "/dashboard/invoices/add",
      "/dashboard/invoices/edit",
      "/dashboard/invoices/view",
      "/dashboard/pos",
      "/dashboard/customer-payment",
    ],
    menuItems: ["Invoices", "POS"],
    subMenuItems: ["All Invoices", "Add New Invoice", "View Invoice", "POS"],
  },

  sales_order: {
    routes: ["/dashboard/sales-order"],
    menuItems: ["Sales Orders"],
    subMenuItems: ["Sales Orders"],
  },

  expense: {
    routes: [
      "/dashboard/expenses",
      "/dashboard/expenses/reports",
      "/dashboard/expenses/edit",
      "/dashboard/expenses/view",
    ],
    menuItems: ["Daily Expenses"],
    subMenuItems: ["All Expenses", "Add New Expense", "Expense Reports"],
  },

  cashbook: {
    routes: ["/dashboard/cashbook"],
    menuItems: ["Cashbook"],
    subMenuItems: ["Cashbook"],
  },

  customer: {
    routes: [
      "/dashboard/customers",
      "/dashboard/customers/add",
      "/dashboard/customers/edit",
      "/dashboard/customers/view",
      "/dashboard/customers/inactive",
    ],
    menuItems: ["Customers"],
    subMenuItems: ["All Customers", "Add New Customer", "Inactive Customers"],
  },

  purchase_order: {
    routes: [
      "/dashboard/purchase",
      "/dashboard/purchase-orders",
      "/dashboard/purchase-orders/create",
      "/dashboard/purchase-orders/edit",
      "/dashboard/purchase-orders/view",
    ],
    menuItems: ["Purchase"],
    subMenuItems: ["Purchase Orders"],
  },

  billing: {
    routes: [
      "/dashboard/bills",
      "/dashboard/bills/create",
      "/dashboard/payments",
      "/dashboard/payments/create",
      "/dashboard/payments/pending",
      "/dashboard/payments/reports",
    ],
    menuItems: ["Purchase"],
    subMenuItems: ["Bills", "Payments"],
  },

  supplier: {
    routes: [
      "/dashboard/suppliers",
      "/dashboard/suppliers/edit",
      "/dashboard/suppliers/view",
      "/dashboard/accounts",
      "/dashboard/accounts/create",
    ],
    menuItems: ["Purchase"],
    subMenuItems: ["Suppliers", "Supplier Accounts"],
  },

  reports: {
    routes: ["/dashboard/reports", "/dashboard/analytics"],
    menuItems: ["Analytics", "Reports"],
    subMenuItems: [],
  },

  integrations: {
    routes: ["/dashboard/integrations"],
    menuItems: ["Integrations"],
    subMenuItems: ["Tally", "Payment Gateway"],
  },

  utilities: {
    routes: [
      "/dashboard/utilities",
      "/dashboard/utilities/invoice-number",
      "/dashboard/utilities/signatures",
    ],
    menuItems: ["Utilities"],
    subMenuItems: ["Invoice Number Format", "Digital Signatures"],
  },

  staff: {
    routes: ["/dashboard/management/staff"],
    menuItems: ["Management"],
    subMenuItems: ["Staff"],
  },
};

export const FEATURE_NAMES = {
  STORE: "Store Management",
  PRODUCT: "Product Catalog",
  INVENTORY: "Inventory Management",
  INVOICE: "Invoicing",
  EXPENSE: "Expense Tracking",
  CUSTOMER: "Customer Tracking",
  PURCHASE_ORDER: "Purchase Orders",
  BILLING: "Billing",
  SUPPLIER: "Supplier Management",
  CASHBOOK: "Cashbook",
  SALES_ORDER: "Sales Orders",
  REPORTS: "Reports & Analytics",
  STAFF: "Staff Accounts",
  INTEGRATIONS: "Integrations",
};

export const getRequiredFeatureForRoute = (route) => {
  for (const [featureKey, featureData] of Object.entries(FEATURE_ROUTES)) {
    if (featureData.routes.some((r) => route.startsWith(r))) {
      return featureKey;
    }
  }
  return null;
};

export const getRequiredFeatureForMenuItem = (menuItemName) => {
  for (const [featureKey, featureData] of Object.entries(FEATURE_ROUTES)) {
    if (featureData.menuItems.includes(menuItemName)) {
      return featureKey;
    }
  }
  return null;
};
