export const FEATURE_ROUTES = {
  // Store Management
  store_management: {
    routes: ["/dashboard/settings", "/onboarding/store"],
    menuItems: ["Settings"],
    subMenuItems: ["Store Settings"],
  },

  // Product & Stock Management
  product_management: {
    routes: [
      "/dashboard/products",
      "/dashboard/products/add",
      "/dashboard/products/edit",
      "/dashboard/products/view",
    ],
    menuItems: ["Product & Stock"],
    subMenuItems: ["Products", "Stocks", "Low Stock Alerts"],
  },
  stock_management: {
    routes: [
      "/dashboard/stock",
      "/dashboard/stock/alerts",
      "/dashboard/stock/add",
      "/dashboard/stock/edit",
      "/dashboard/stock/view",
    ],
    menuItems: ["Product & Stock"],
    subMenuItems: ["Stocks", "Low Stock Alerts"],
  },
  inventory_management: {
    routes: [
      "/dashboard/inventory",
      "/dashboard/inventory/add",
      "/dashboard/inventory/edit",
      "/dashboard/inventory/view",
      "/dashboard/stock",
    ],
    menuItems: ["Product & Stock"],
    subMenuItems: ["Inventory", "Stocks"],
  },

  // Invoice Management
  invoice_management: {
    routes: [
      "/dashboard/invoices",
      "/dashboard/invoices/add",
      "/dashboard/invoices/edit",
      "/dashboard/invoices/view",
      "/dashboard/collect-payment",
    ],
    menuItems: ["Invoices"],
    subMenuItems: ["All Invoices", "Add New Invoice", "View Invoice"],
  },

  // Expense Management
  expense_management: {
    routes: [
      "/dashboard/expenses",
      "/dashboard/expenses/reports",
      "/dashboard/expenses/edit",
      "/dashboard/expenses/view",
    ],
    menuItems: ["Daily Expenses"],
    subMenuItems: ["All Expenses", "Add New Expense", "Expense Reports"],
  },

  // Customer Management
  customer_management: {
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

  // Purchase Management
  purchase_management: {
    routes: [
      "/dashboard/purchase",
      "/dashboard/purchase-orders",
      "/dashboard/purchase-orders/create",
      "/dashboard/purchase-orders/edit",
      "/dashboard/purchase-orders/view",
      "/dashboard/suppliers",
    ],
    menuItems: ["Purchase"],
    subMenuItems: ["Suppliers", "Purchase Orders"],
  },

  // Bill Management
  bill_management: {
    routes: [
      "/dashboard/bills",
      "/dashboard/bills/create",
    ],
    menuItems: ["Purchase"],
    subMenuItems: ["Bills"],
  },

  // Payment Management
  payment_management: {
    routes: [
      "/dashboard/payments",
      "/dashboard/payments/create",
      "/dashboard/payments/pending",
      "/dashboard/payments/reports",
    ],
    menuItems: ["Purchase"],
    subMenuItems: ["Payments"],
  },

  // Supplier Management
  supplier_management: {
    routes: [
      "/dashboard/suppliers",
      "/dashboard/suppliers/edit",
      "/dashboard/suppliers/view",
    ],
    menuItems: ["Purchase"],
    subMenuItems: ["Suppliers"],
  },
};

// Feature names that should match feature.name in database
export const FEATURE_NAMES = {
  STORE_MANAGEMENT: "Store Management",
  PRODUCT_MANAGEMENT: "Product Management",
  INVENTORY_MANAGEMENT: "Inventory Management",
  STOCK_MANAGEMENT: "Stock Management",
  INVOICE_MANAGEMENT: "Invoice Management",
  EXPENSE_MANAGEMENT: "Expense Management",
  CUSTOMER_MANAGEMENT: "Customer Management",
  PURCHASE_MANAGEMENT: "Purchase Management",
  BILL_MANAGEMENT: "Bill Management",
  PAYMENT_MANAGEMENT: "Payment Management",
  SUPPLIER_MANAGEMENT: "Supplier Management",
};

// Helper function to check if a route requires a feature
export const getRequiredFeatureForRoute = (route) => {
  for (const [featureKey, featureData] of Object.entries(FEATURE_ROUTES)) {
    if (featureData.routes.some((r) => route.startsWith(r))) {
      return featureKey;
    }
  }
  return null;
};

// Helper function to check if a menu item requires a feature
export const getRequiredFeatureForMenuItem = (menuItemName) => {
  for (const [featureKey, featureData] of Object.entries(FEATURE_ROUTES)) {
    if (featureData.menuItems.includes(menuItemName)) {
      return featureKey;
    }
  }
  return null;
};
