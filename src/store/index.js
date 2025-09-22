import { configureStore } from '@reduxjs/toolkit';
import profileSlice from './slices/profileSlice';
import productsSlice from './slices/productsSlice';

export const store = configureStore({
  reducer: {
    profile: profileSlice,
    products: productsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});
