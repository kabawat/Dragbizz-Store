import { configureStore } from "@reduxjs/toolkit";
import accountsSlice from "./slices/accountsSlice";
import analyticsSlice from "./slices/analyticsSlice";
import billsSlice from "./slices/billsSlice";
import customerSlice from "./slices/customers/customerSlice";
import expensesSlice from "./slices/expensesSlice";
import gstSlice from "./slices/gstSlice";
import invoicesSlice from "./slices/invoicesSlice";
import paymentsSlice from "./slices/paymentsSlice";
import productsSlice from "./slices/productsSlice";
import profileSlice from "./slices/profileSlice";
import purchaseOrdersSlice from "./slices/purchaseOrdersSlice";
import storeUpiSlice from "./slices/storeUpiSlice";
import suppliersSlice from "./slices/suppliersSlice";
import signaturesSlice from "./slices/signaturesSlice";
import themeSlice from "./slices/themeSlice";
import suggestionsSlice from "./slices/suggestionsSlice";
import notificationsSlice from "./slices/notificationsSlice";
import uiSlice from "./slices/uiSlice";

import publicCartSlice from "./slices/publicCartSlice";
import notificationSettingsSlice from "./slices/notificationSettingsSlice";

export const store = configureStore({
  reducer: {
    profile: profileSlice,
    storeUpi: storeUpiSlice,
    notifications: notificationsSlice,
    notificationSettings: notificationSettingsSlice,
    products: productsSlice,
    customers: customerSlice,
    suppliers: suppliersSlice,
    bills: billsSlice,
    payments: paymentsSlice,
    accounts: accountsSlice,
    invoices: invoicesSlice,
    purchaseOrders: purchaseOrdersSlice,
    expenses: expensesSlice,
    gst: gstSlice,
    analytics: analyticsSlice,
    publicCart: publicCartSlice,
    signatures: signaturesSlice,
    theme: themeSlice,
    suggestions: suggestionsSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

