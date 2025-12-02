/**
 * Hardcoded Feature Constants for Frontend
 * These must match the feature keys in subscription service
 */

export const FEATURES = {
    // Store Management
    STORE_MANAGEMENT: 'store_management',
    
    // Product & Inventory Management
    PRODUCT_MANAGEMENT: 'product_management',
    INVENTORY_MANAGEMENT: 'inventory_management',
    STOCK_MANAGEMENT: 'stock_management',
    
    // Sales & Billing
    INVOICE_MANAGEMENT: 'invoice_management',
    CUSTOMER_MANAGEMENT: 'customer_management',
    
    // Financial Management
    EXPENSE_MANAGEMENT: 'expense_management',
    
    // Purchase & Procurement
    PURCHASE_MANAGEMENT: 'purchase_management',
    SUPPLIER_MANAGEMENT: 'supplier_management',
    BILL_MANAGEMENT: 'bill_management',
    PAYMENT_MANAGEMENT: 'payment_management',
};

// Feature display names
export const FEATURE_DISPLAY_NAMES = {
    store_management: 'Store Management',
    product_management: 'Product Management',
    inventory_management: 'Inventory Management',
    stock_management: 'Stock Management',
    invoice_management: 'Invoice Management',
    customer_management: 'Customer Management',
    expense_management: 'Expense Management',
    purchase_management: 'Purchase Management',
    supplier_management: 'Supplier Management',
    bill_management: 'Bill Management',
    payment_management: 'Payment Management',
};

// Feature to route mapping
export const FEATURE_ROUTES = {
    store_management: {
        routes: ['/dashboard/settings', '/onboarding/store'],
        menuItems: ['Settings'],
    },
    product_management: {
        routes: ['/dashboard/products', '/dashboard/products/add', '/dashboard/products/edit'],
        menuItems: ['Product & Stock'],
    },
    inventory_management: {
        routes: ['/dashboard/stock', '/dashboard/inventory'],
        menuItems: ['Product & Stock'],
    },
    stock_management: {
        routes: ['/dashboard/stock'],
        menuItems: ['Product & Stock'],
    },
    invoice_management: {
        routes: ['/dashboard/invoices', '/dashboard/invoices/add'],
        menuItems: ['Invoices'],
    },
    customer_management: {
        routes: ['/dashboard/customers', '/dashboard/customers/add'],
        menuItems: ['Customers'],
    },
    expense_management: {
        routes: ['/dashboard/expenses'],
        menuItems: ['Daily Expenses'],
    },
    purchase_management: {
        routes: ['/dashboard/purchase', '/dashboard/purchase-orders'],
        menuItems: ['Purchase'],
    },
    supplier_management: {
        routes: ['/dashboard/suppliers'],
        menuItems: ['Purchase'],
    },
    bill_management: {
        routes: ['/dashboard/bills'],
        menuItems: ['Purchase'],
    },
    payment_management: {
        routes: ['/dashboard/payments'],
        menuItems: ['Purchase'],
    },
};

