import { configureStore } from '@reduxjs/toolkit';
import profileSlice from './slices/profileSlice';
import productsSlice from './slices/productsSlice';
import customersSlice from './slices/customersSlice';
import suppliersSlice from './slices/suppliersSlice';
import billsSlice from './slices/billsSlice';
import paymentsSlice from './slices/paymentsSlice';
import accountsSlice from './slices/accountsSlice';
import invoicesSlice from './slices/invoicesSlice';

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
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});
