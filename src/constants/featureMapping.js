// Feature to Route/Menu Mapping
// This maps feature names to routes and menu items

export const FEATURE_ROUTES = {
  // Product & Stock Management
  'product_management': {
    routes: ['/dashboard/products', '/dashboard/products/add', '/dashboard/products/edit', '/dashboard/products/view'],
    menuItems: ['Product & Stock'],
    subMenuItems: ['Products', 'Stocks', 'Low Stock Alerts']
  },
  'stock_management': {
    routes: ['/dashboard/stock', '/dashboard/stock/alerts', '/dashboard/inventory'],
    menuItems: ['Product & Stock'],
    subMenuItems: ['Stocks', 'Low Stock Alerts']
  },
  
  // Invoice Management
  'invoice_management': {
    routes: ['/dashboard/invoices', '/dashboard/invoices/add', '/dashboard/invoices/edit', '/dashboard/invoices/view'],
    menuItems: ['Invoices'],
    subMenuItems: ['All Invoices', 'Add New Invoice', 'View Invoice']
  },
  
  // Expense Management
  'expense_management': {
    routes: ['/dashboard/expenses', '/dashboard/expenses/reports'],
    menuItems: ['Daily Expenses'],
    subMenuItems: ['All Expenses', 'Add New Expense', 'Expense Reports']
  },

  // Customer Management
  'customer_management': {
    routes: ['/dashboard/customers', '/dashboard/customers/add', '/dashboard/customers/inactive'],
    menuItems: ['Customers'],
    subMenuItems: ['All Customers', 'Add New Customer', 'Inactive Customers']
  },
  
  // Purchase Management
  'purchase_management': {
    routes: ['/dashboard/purchase', '/dashboard/purchase-orders', '/dashboard/suppliers'],
    menuItems: ['Purchase'],
    subMenuItems: ['Suppliers', 'Purchase Orders']
  },
  
  // Bill Management
  'bill_management': {
    routes: ['/dashboard/bills', '/dashboard/bills/create', '/dashboard/bills/pending', '/dashboard/bills/overdue', '/dashboard/bills/reports'],
    menuItems: ['Purchase'],
    subMenuItems: ['Bills']
  },
  
  // Payment Management
  'payment_management': {
    routes: ['/dashboard/payments', '/dashboard/payments/create', '/dashboard/payments/pending', '/dashboard/payments/reports'],
    menuItems: ['Purchase'],
    subMenuItems: ['Payments']
  },
  
  // Supplier Management
  'supplier_management': {
    routes: ['/dashboard/suppliers'],
    menuItems: ['Purchase'],
    subMenuItems: ['Suppliers']
  }
};

// Feature names that should match feature.name in database
export const FEATURE_NAMES = {
  PRODUCT_MANAGEMENT: 'Product Management',
  STOCK_MANAGEMENT: 'Stock Management',
  INVOICE_MANAGEMENT: 'Invoice Management',
  EXPENSE_MANAGEMENT: 'Expense Management',
  CUSTOMER_MANAGEMENT: 'Customer Management',
  PURCHASE_MANAGEMENT: 'Purchase Management',
  BILL_MANAGEMENT: 'Bill Management',
  PAYMENT_MANAGEMENT: 'Payment Management',
  SUPPLIER_MANAGEMENT: 'Supplier Management'
};

// Helper function to check if a route requires a feature
export const getRequiredFeatureForRoute = (route) => {
  for (const [featureKey, featureData] of Object.entries(FEATURE_ROUTES)) {
    if (featureData.routes.some(r => route.startsWith(r))) {
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

