import { configureStore } from '@reduxjs/toolkit';
import profileSlice from './slices/profileSlice';
import productsSlice from './slices/productsSlice';
import customersSlice from './slices/customersSlice';
import suppliersSlice from './slices/suppliersSlice';

export const store = configureStore({
  reducer: {
    profile: profileSlice,
    products: productsSlice,
    customers: customersSlice,
    suppliers: suppliersSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});
