import { Navigation2, Zap, MousePointer2, Settings2 } from "lucide-react";

export const getShortcutCategories = (t) => [
    {
        title: t("shortcuts.categories.navigation") || "Global Navigation",
        description: t("shortcuts.descriptions.navigation") || "Jump to any section from anywhere",
        icon: Navigation2,
        items: [
            { keys: ["Alt", "H"], action: t("shortcuts.actions.home") || "Home / Dashboard" },
            { keys: ["Alt", "D"], action: t("shortcuts.actions.dashboard") || "Dashboard (Sidebar)" },
            { keys: ["Alt", "C"], action: t("shortcuts.actions.customers") || "Customers List" },
            { keys: ["Alt", "I"], action: t("shortcuts.actions.invoices") || "Invoices Management" },
            { keys: ["Alt", "P"], action: t("shortcuts.actions.products") || "Products / Inventory" },
            { keys: ["Alt", "E"], action: t("shortcuts.actions.expenses") || "Expense Tracker" },
            { keys: ["Alt", "S"], action: t("shortcuts.actions.stock") || "Stock Management" },
            { keys: ["Alt", "A"], action: t("shortcuts.actions.analytics") || "Business Analytics" },
            { keys: ["Alt", "K"], action: t("shortcuts.actions.pos") || "POS" },
            { keys: ["Alt", "O"], action: t("shortcuts.actions.salesOrders") || "Sales Orders" },
            { keys: ["Alt", "U"], action: t("shortcuts.actions.suppliers") || "Suppliers Directory" },
            { keys: ["Alt", "Shift", "O"], action: t("shortcuts.actions.purchaseOrders") || "Purchase Orders" },
            { keys: ["Alt", "B"], action: t("shortcuts.actions.bills") || "Bills Management" },
            { keys: ["Alt", "Y"], action: t("shortcuts.actions.payments") || "Payments History" },
            { keys: ["Alt", "Q"], action: t("shortcuts.actions.support") || "Support Center" },
        ]
    },
    {
        title: t("shortcuts.categories.actions") || "Action & Management",
        description: t("shortcuts.descriptions.actions") || "Speed up your data entry and operations",
        icon: Zap,
        items: [
            { keys: ["Shift", "N"], action: t("shortcuts.actions.createNew") || "Create New Entry" },
            { keys: ["Ctrl", "S"], action: t("shortcuts.actions.save") || "Save Current Form" },
            { keys: ["F1"], action: t("shortcuts.actions.saveAlt") || "Save (Alternate)" },
            { keys: ["Ctrl", "P"], action: t("shortcuts.actions.print") || "Print Document / Receipt" },
            { keys: ["F2"], action: t("shortcuts.actions.printAlt") || "Print (Alternate)" },
            { keys: ["Ctrl", "D"], action: t("shortcuts.actions.download") || "Download PDF/Report" },
            { keys: ["Ctrl", "E"], action: t("shortcuts.actions.edit") || "Edit Current Selection" },
            { keys: ["Ctrl", "Delete"], action: t("shortcuts.actions.delete") || "Delete Current Item" },
            { keys: ["Delete"], action: t("shortcuts.actions.deleteAlt") || "Delete (Alternate)" },
            { keys: ["/"], action: t("shortcuts.actions.focusSearch") || "Focus Search Input" },
            { keys: ["Ctrl", "K"], action: t("shortcuts.actions.toggleSearch") || "Toggle Search Bar" },
            { keys: ["Shift", "?"], action: t("shortcuts.actions.toggleHelp") || "Open Support / Help Center" },
        ]
    },
    {
        title: t("shortcuts.categories.management") || "Management",
        description: t("shortcuts.descriptions.management") || "Navigate management & settings sections",
        icon: Settings2,
        items: [
            { keys: ["Alt", "G"], action: t("shortcuts.actions.settings") || "Application Settings" },
            { keys: ["Alt", ","], action: t("shortcuts.actions.settingsSidebar") || "Settings (Sidebar)" },
            { keys: ["Alt", "F"], action: t("shortcuts.actions.staff") || "Staff Management" },
            { keys: ["Alt", "M"], action: t("shortcuts.actions.subscription") || "Subscription" },
            { keys: ["Alt", "L"], action: t("shortcuts.actions.limits") || "Plan Limits" },
            { keys: ["Alt", "\\"], action: t("shortcuts.actions.toggleSidebar") || "Toggle Sidebar" },
        ]
    },
    {
        title: t("shortcuts.categories.view") || "View & Control",
        description: t("shortcuts.descriptions.view") || "Change layouts and navigate menus",
        icon: MousePointer2,
        items: [
            { keys: ["Alt", "1"], action: t("shortcuts.actions.tableView") || "Switch to Table View" },
            { keys: ["Alt", "2"], action: t("shortcuts.actions.cardView") || "Switch to Card View" },
            { keys: ["Alt", "V"], action: t("shortcuts.actions.voiceAI") || "Trigger Voice AI Assistant" },
            { keys: ["Esc"], action: t("shortcuts.actions.close") || "Close Drawer or Modal" },
            { keys: ["Ctrl", "Esc"], action: t("shortcuts.actions.back") || "Navigate Back" },
            { keys: ["Shift", "Backspace"], action: t("shortcuts.actions.globalBack") || "Global Navigate Back" },
        ]
    }
];

export const getFaqs = (t) => [
    {
        q: t("help.faqs.createInvoice.q") || "How do I create a new invoice?",
        a: t("help.faqs.createInvoice.a") || "Go to the Invoices page and click 'Add Invoice' or just use the Shift+N shortcut from anywhere. Fill in the client details and items, then click save."
    },
    {
        q: t("help.faqs.multipleStores.q") || "Can I manage multiple stores?",
        a: t("help.faqs.multipleStores.a") || "Yes! Use the store switcher in the sidebar to create and manage multiple business stores from a single account."
    },
    {
        q: t("help.faqs.voiceAI.q") || "How does Voice AI work?",
        a: t("help.faqs.voiceAI.a") || "Click on the microphone icon in Customer or Product pages (or use Alt+V). Speak the details naturally, and our AI will automatically fill the form fields for you."
    },
    {
        q: t("help.faqs.exportData.q") || "How do I export my data?",
        a: t("help.faqs.exportData.a") || "Most list pages have a 'Download' button or Ctrl+D shortcut. You can export data to PDF or CSV based on the page."
    }
];

export const getQuickStartSteps = (t) => [
    t("help.steps.completeProfile") || "Complete your business profile",
    t("help.steps.configureStore") || "Configure your first store",
    t("help.steps.addProducts") || "Add your initial products to inventory",
    t("help.steps.createInvoice") || "Create your first professional invoice"
];
