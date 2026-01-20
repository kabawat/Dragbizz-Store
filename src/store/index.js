import { configureStore } from "@reduxjs/toolkit";
import profileSlice from "./slices/profileSlice";
import productsSlice from "./slices/productsSlice";
import customersSlice from "./slices/customersSlice";
import suppliersSlice from "./slices/suppliersSlice";
import billsSlice from "./slices/billsSlice";
import paymentsSlice from "./slices/paymentsSlice";
import accountsSlice from "./slices/accountsSlice";
import invoicesSlice from "./slices/invoicesSlice";
import purchaseOrdersSlice from "./slices/purchaseOrdersSlice";
import expensesSlice from "./slices/expensesSlice";
import analyticsSlice from "./slices/analyticsSlice";

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
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});
