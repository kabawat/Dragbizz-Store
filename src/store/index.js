import { configureStore } from "@reduxjs/toolkit";
import accountsSlice from "./slices/accountsSlice";
import analyticsSlice from "./slices/analyticsSlice";
import billsSlice from "./slices/billsSlice";
import customersSlice from "./slices/customersSlice";
import expensesSlice from "./slices/expensesSlice";
import invoicesSlice from "./slices/invoicesSlice";
import paymentsSlice from "./slices/paymentsSlice";
import productsSlice from "./slices/productsSlice";
import profileSlice from "./slices/profileSlice";
import purchaseOrdersSlice from "./slices/purchaseOrdersSlice";
import suppliersSlice from "./slices/suppliersSlice";

import publicCartSlice from "./slices/publicCartSlice";

export const store = configureStore({
  reducer: {
    profile: profileSlice,
    products: productsSlice,
    customers: customersSlice,
    suppliers: suppliersSlice,
    bills: billsSlice,
    payments: paymentsSlice,
    accounts: accountsSlice,
    invoices: invoicesSlice,
    purchaseOrders: purchaseOrdersSlice,
    expenses: expensesSlice,
    analytics: analyticsSlice,
    publicCart: publicCartSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});
