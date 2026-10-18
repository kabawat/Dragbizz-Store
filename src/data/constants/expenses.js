// Expense Categories — kirana-first defaults at top, legacy categories retained
export const EXPENSE_CATEGORIES = [
  {
    value: "rent",
    label: "Rent (Kiraya)",
    subCategories: ["Shop Rent", "Godown Rent", "Electricity", "Water"],
  },
  {
    value: "daily-expenses",
    label: "Tea & Snacks (Chai)",
    subCategories: ["Chai", "Snacks", "Meals"],
  },
  {
    value: "transport",
    label: "Transport (Dhulai)",
    subCategories: ["Fuel", "Delivery", "Loading"],
  },
  {
    value: "shop-supplies",
    label: "Shop Supplies",
    subCategories: ["Bags", "Labels", "Packaging"],
  },
  {
    value: "staff-wages",
    label: "Staff Wages",
    subCategories: ["Daily Wage", "Helper", "Bonus"],
  },
  {
    value: "utilities",
    label: "Electricity & Water",
    subCategories: ["Electricity", "Water", "Gas"],
  },
  {
    value: "office-supplies",
    label: "Office Supplies",
    subCategories: ["Stationery", "Equipment", "Software"],
  },
  {
    value: "travel",
    label: "Travel & Transport",
    subCategories: ["Fuel", "Public Transport", "Accommodation", "Meals"],
  },

  // Marketing & Advertising
  {
    value: "marketing",
    label: "Marketing & Advertising",
    subCategories: ["Digital Ads", "Print Ads", "Social Media", "Events"],
  },
  {
    value: "promotions",
    label: "Promotions & Discounts",
    subCategories: ["Customer Discounts", "Bulk Offers", "Seasonal Sales"],
  },

  // Professional Services
  {
    value: "legal",
    label: "Legal & Professional",
    subCategories: ["Legal Fees", "Consulting", "Accounting", "Auditing"],
  },
  {
    value: "insurance",
    label: "Insurance",
    subCategories: [
      "Business Insurance",
      "Health Insurance",
      "Vehicle Insurance",
    ],
  },

  // Maintenance & Repairs
  {
    value: "maintenance",
    label: "Maintenance & Repairs",
    subCategories: [
      "Equipment Repair",
      "Building Maintenance",
      "Vehicle Maintenance",
    ],
  },
  {
    value: "cleaning",
    label: "Cleaning & Housekeeping",
    subCategories: [
      "Office Cleaning",
      "Equipment Cleaning",
      "Waste Management",
    ],
  },

  // Communication
  {
    value: "communication",
    label: "Communication",
    subCategories: ["Phone Bills", "Internet", "Postal Services", "Courier"],
  },

  // Training & Development
  {
    value: "training",
    label: "Training & Development",
    subCategories: ["Employee Training", "Skill Development", "Certifications"],
  },

  // Miscellaneous
  {
    value: "miscellaneous",
    label: "Miscellaneous",
    subCategories: ["Bank Charges", "Penalties", "Other Expenses"],
  },
];

// Payment Methods
export const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash", icon: "💵" },
  { value: "BANK_TRANSFER", label: "Bank Transfer", icon: "🏦" },
  { value: "UPI", label: "UPI", icon: "📱" },
  { value: "CREDIT_CARD", label: "Credit Card", icon: "💳" },
  { value: "DEBIT_CARD", label: "Debit Card", icon: "💳" },
  { value: "CHEQUE", label: "Cheque", icon: "📄" },
  { value: "NET_BANKING", label: "Net Banking", icon: "🌐" },
];

// Expense Status
export const EXPENSE_STATUS = [
  { value: "PAID", label: "Paid", color: "green" },
  { value: "PENDING", label: "Pending", color: "yellow" },
  { value: "OVERDUE", label: "Overdue", color: "red" },
  { value: "CANCELLED", label: "Cancelled", color: "gray" },
];

// GST Rates for Expenses
export const EXPENSE_GST_RATES = [
  { value: 0, label: "0% - Exempt", description: "Exempt from GST" },
  {
    value: 5,
    label: "5% - Essential Services",
    description: "Essential services",
  },
  { value: 12, label: "12% - Standard Rate", description: "Standard GST rate" },
  { value: 18, label: "18% - Standard Rate", description: "Standard GST rate" },
  { value: 28, label: "28% - Luxury Services", description: "Luxury services" },
];

// Default values
export const DEFAULT_EXPENSE_CATEGORY = "rent";
export const DEFAULT_PAYMENT_METHOD = "CASH";
export const DEFAULT_EXPENSE_STATUS = "PAID";
export const DEFAULT_GST_RATE = 18;

export const getCategoryLabel = (categoryValue) => {
  if (!categoryValue) return "Rent (Kiraya)";
  const raw = String(categoryValue).trim();
  const normalized = raw.toLowerCase();

  // 1. Direct match on category value
  let category = EXPENSE_CATEGORIES.find(
    (c) => c.value.toLowerCase() === normalized
  );
  if (category) return category.label;

  // 2. Match on label
  category = EXPENSE_CATEGORIES.find(
    (c) =>
      c.label.toLowerCase() === normalized ||
      c.label.toLowerCase().includes(normalized)
  );
  if (category) return category.label;

  // 3. Match on subcategories
  for (const c of EXPENSE_CATEGORIES) {
    if (
      Array.isArray(c.subCategories) &&
      c.subCategories.some(
        (sub) =>
          sub.toLowerCase() === normalized ||
          normalized.includes(sub.toLowerCase())
      )
    ) {
      return c.label;
    }
  }

  // 4. Keyword fuzzy detection
  if (
    normalized.includes("chai") ||
    normalized.includes("tea") ||
    normalized.includes("snack") ||
    normalized.includes("food") ||
    normalized.includes("nashta")
  ) {
    return "Tea & Snacks (Chai)";
  }
  if (normalized.includes("rent") || normalized.includes("kiraya")) {
    return "Rent (Kiraya)";
  }
  if (
    normalized.includes("transport") ||
    normalized.includes("dhulai") ||
    normalized.includes("delivery") ||
    normalized.includes("fuel")
  ) {
    return "Transport (Dhulai)";
  }
  if (
    normalized.includes("wage") ||
    normalized.includes("salary") ||
    normalized.includes("pagar")
  ) {
    return "Staff Wages";
  }
  if (
    normalized.includes("elect") ||
    normalized.includes("bijli") ||
    normalized.includes("water") ||
    normalized.includes("pani")
  ) {
    return "Electricity & Water";
  }

  return raw || "Miscellaneous";
};

export const getSubCategoryOptions = (categoryValue) => {
  const category = EXPENSE_CATEGORIES.find((c) => c.value === categoryValue);
  return category
    ? category.subCategories.map((sub) => ({ value: sub, label: sub }))
    : [];
};

export const getPaymentMethodLabel = (methodValue) => {
  const method = PAYMENT_METHODS.find((m) => m.value === methodValue);
  return method ? method.label : "Cash";
};

export const getPaymentMethodIcon = (methodValue) => {
  const method = PAYMENT_METHODS.find((m) => m.value === methodValue);
  return method ? method.icon : "💵";
};

export const getStatusLabel = (statusValue) => {
  const status = EXPENSE_STATUS.find((s) => s.value === statusValue);
  return status ? status.label : "Paid";
};

export const getStatusColor = (statusValue) => {
  const status = EXPENSE_STATUS.find((s) => s.value === statusValue);
  return status ? status.color : "green";
};

export const getGSTRateLabel = (rate) => {
  const gstRate = EXPENSE_GST_RATES.find((r) => r.value === rate);
  return gstRate ? gstRate.label : "18% - Standard Rate";
};

// Expense form validation
export const EXPENSE_FORM_VALIDATION = {
  title: {
    required: true,
    minLength: 2,
    maxLength: 100,
  },
  billNumber: {
    required: false,
    maxLength: 50,
  },
  amount: {
    required: true,
    min: 0.01,
    max: 999999.99,
  },
  date: {
    required: true,
  },
  category: {
    required: true,
  },
  paymentMethod: {
    required: true,
  },
  vendor: {
    required: false,
    maxLength: 100,
  },
};

export default {
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  EXPENSE_STATUS,
  EXPENSE_GST_RATES,
  DEFAULT_EXPENSE_CATEGORY,
  DEFAULT_PAYMENT_METHOD,
  DEFAULT_EXPENSE_STATUS,
  DEFAULT_GST_RATE,
};
