import {
  MousePointer2,
  Navigation2,
  Settings2,
  ShoppingBag,
  Zap,
} from "lucide-react";

// On Mac: Ctrl → Cmd (⌘), Alt → Option (⌥)
export const getShortcutCategories = (t, isMac = false) => {
  const ctrl = isMac ? "Cmd" : "Ctrl";
  const alt = isMac ? "Option" : "Alt";

  return [
    {
      title: t("shortcuts.categories.navigation") || "Global Navigation",
      description:
        t("shortcuts.descriptions.navigation") ||
        "Jump to any section from anywhere",
      icon: Navigation2,
      items: [
        {
          keys: [alt, "H"],
          action: t("shortcuts.actions.home") || "Home / Dashboard",
        },
        {
          keys: [alt, "C"],
          action: t("shortcuts.actions.customers") || "Customers List",
        },
        {
          keys: [alt, "I"],
          action: t("shortcuts.actions.invoices") || "Invoices Management",
        },
        {
          keys: [alt, "P"],
          action: t("shortcuts.actions.products") || "Products / Inventory",
        },
        {
          keys: [alt, "E"],
          action: t("shortcuts.actions.expenses") || "Expense Tracker",
        },
        {
          keys: [alt, "Shift", "S"],
          action: t("shortcuts.actions.stock") || "Stock Management",
        },
        {
          keys: [alt, "A"],
          action: t("shortcuts.actions.analytics") || "Business Analytics",
        },
        { keys: [alt, "K"], action: t("shortcuts.actions.pos") || "POS" },
        {
          keys: [alt, "O"],
          action: t("shortcuts.actions.salesOrders") || "Sales Orders",
        },
        {
          keys: [alt, "U"],
          action: t("shortcuts.actions.suppliers") || "Suppliers Directory",
        },
        {
          keys: [alt, "Shift", "O"],
          action: t("shortcuts.actions.purchaseOrders") || "Purchase Orders",
        },
        {
          keys: [alt, "B"],
          action: t("shortcuts.actions.bills") || "Bills Management",
        },
        {
          keys: [alt, "Y"],
          action: t("shortcuts.actions.payments") || "Payments History",
        },
        {
          keys: [alt, "Q"],
          action: t("shortcuts.actions.support") || "Support Center",
        },
      ],
    },
    {
      title: t("shortcuts.categories.actions") || "Action & Management",
      description:
        t("shortcuts.descriptions.actions") ||
        "Speed up your data entry and operations",
      icon: Zap,
      items: [
        {
          keys: [alt, "N"],
          action: t("shortcuts.actions.createNew") || "Create New Entry",
        },
        {
          keys: [ctrl, "Enter"],
          action: t("shortcuts.actions.save") || "Save Current Form",
        },
        {
          keys: ["F1"],
          action: t("shortcuts.actions.saveAlt") || "Save (Alternate)",
        },
        {
          keys: [ctrl, "P"],
          action: t("shortcuts.actions.print") || "Print Document / Receipt",
        },
        {
          keys: ["F2"],
          action: t("shortcuts.actions.printAlt") || "Print (Alternate)",
        },
        {
          keys: [alt, "Shift", "D"],
          action: t("shortcuts.actions.download") || "Download PDF/Report",
        },
        {
          keys: [alt, "Shift", "E"],
          action: t("shortcuts.actions.edit") || "Edit Current Selection",
        },
        {
          keys: [ctrl, "Delete"],
          action: t("shortcuts.actions.delete") || "Delete Current Item",
        },
        {
          keys: ["Delete"],
          action: t("shortcuts.actions.deleteAlt") || "Delete (Alternate)",
        },
        {
          keys: ["/"],
          action: t("shortcuts.actions.focusSearch") || "Focus Search Input",
        },
        {
          keys: [alt, "Shift", "F"],
          action: t("shortcuts.actions.toggleSearch") || "Toggle Search Bar",
        },
        {
          keys: ["Shift", "?"],
          action:
            t("shortcuts.actions.toggleHelp") || "Open Support / Help Center",
        },
      ],
    },
    {
      title: t("shortcuts.categories.management") || "Management",
      description:
        t("shortcuts.descriptions.management") ||
        "Navigate management & settings sections",
      icon: Settings2,
      items: [
        {
          keys: [alt, "G"],
          action: t("shortcuts.actions.settings") || "Application Settings",
        },
        {
          keys: [alt, "F"],
          action: t("shortcuts.actions.staff") || "Staff Management",
        },
        {
          keys: [alt, "M"],
          action: t("shortcuts.actions.subscription") || "Subscription",
        },
        {
          keys: [alt, "L"],
          action: t("shortcuts.actions.limits") || "Plan Limits",
        },
        {
          keys: [alt, "\\"],
          action: t("shortcuts.actions.toggleSidebar") || "Toggle Sidebar",
        },
      ],
    },
    {
      title: t("shortcuts.categories.pos") || "POS",
      description:
        t("shortcuts.descriptions.pos") ||
        "Fast billing shortcuts for Point of Sale",
      icon: ShoppingBag,
      items: [
        {
          keys: ["/"],
          action: t("shortcuts.actions.posSearch") || "Focus Product Search",
        },
        {
          keys: [alt, "Shift", "F"],
          action:
            t("shortcuts.actions.posSearchAlt") || "Focus Search (Alternate)",
        },
        {
          keys: [ctrl, "Enter"],
          action: t("shortcuts.actions.posCheckout") || "Checkout / Charge",
        },
        {
          keys: [ctrl, "Delete"],
          action: t("shortcuts.actions.posClearCart") || "Clear Cart",
        },
      ],
    },
    {
      title: t("shortcuts.categories.view") || "View & Control",
      description:
        t("shortcuts.descriptions.view") || "Change layouts and navigate menus",
      icon: MousePointer2,
      items: [
        {
          keys: [alt, "1"],
          action: t("shortcuts.actions.tableView") || "Switch to Table View",
        },
        {
          keys: [alt, "2"],
          action: t("shortcuts.actions.cardView") || "Switch to Card View",
        },
        {
          keys: ["Esc"],
          action: t("shortcuts.actions.close") || "Close Drawer or Modal",
        },
        {
          keys: [alt, "←"],
          action: t("shortcuts.actions.back") || "Navigate Back",
        },
        {
          keys: ["Shift", "Backspace"],
          action: t("shortcuts.actions.globalBack") || "Global Navigate Back",
        },
      ],
    },
  ];
};

export const getFaqs = (t) => [
  {
    q: t("help.faqs.createInvoice.q") || "How do I create a new invoice?",
    a:
      t("help.faqs.createInvoice.a") ||
      "Go to the Invoices page and click 'Add Invoice' or just use the Alt+N shortcut on the Invoices page. Fill in the client details and items, then click save.",
    category: "Sales",
  },
  {
    q: t("help.faqs.multipleStores.q") || "Can I manage multiple stores?",
    a:
      t("help.faqs.multipleStores.a") ||
      "Yes! Use the store switcher in the sidebar (top section) to create and manage multiple business stores from a single account. Each store has its own inventory and customers.",
    category: "Management",
  },
  {
    q: t("help.faqs.exportData.q") || "How do I export my data?",
    a:
      t("help.faqs.exportData.a") ||
      "Most list pages have a 'Download' button or Alt+Shift+D shortcut. You can export data to PDF, Excel, or CSV formats for your accounting needs.",
    category: "Data",
  },
  {
    q: t("help.faqs.lowStock.q") || "How to track low stock?",
    a:
      t("help.faqs.lowStock.a") ||
      "In the 'Stock' management section, you can see products highlighted in red if they fall below your set minimum quantity. You can also generate a low-stock report.",
    category: "Inventory",
  },
  {
    q: t("help.faqs.gstReports.q") || "Where can I find GST reports?",
    a:
      t("help.faqs.gstReports.a") ||
      "Navigate to 'Analytics' > 'GST Analytics'. Here you can view your tax liabilities and download GSTR reports.",
    category: "Reports",
  },
];

export const getQuickStartSteps = (t) => [
  {
    text: t("help.steps.completeProfile") || "Complete your business profile",
    completed: true,
  },
  {
    text: t("help.steps.configureStore") || "Configure your first store",
    completed: true,
  },
  {
    text:
      t("help.steps.addProducts") || "Add your initial products to inventory",
    completed: false,
  },
  {
    text:
      t("help.steps.createInvoice") || "Create your first professional invoice",
    completed: false,
  },
  {
    text: t("help.steps.addUPI") || "Add your UPI ID for payments",
    completed: false,
  },
];

export const getRelatedLinks = (t) => [
  {
    title: t("help.links.pos") || "POS Terminal",
    href: "/dashboard/pos",
    icon: "Calculator",
    desc: "Fast retail billing",
  },
  {
    title: t("help.links.inventory") || "Inventory",
    href: "/dashboard/products",
    icon: "Package",
    desc: "Manage stock & products",
  },
  {
    title: t("help.links.analytics") || "Analytics",
    href: "/dashboard/analytics/revenue",
    icon: "BarChart3",
    desc: "Track business growth",
  },
  {
    title: t("help.links.settings") || "Settings",
    href: "/dashboard/settings",
    icon: "Settings",
    desc: "Configure preferences",
  },
];
