// src/store/slices/authSlice.js
// This slice is currently unused; auth/profile state is managed in `profileSlice`.
// Kept as a placeholder in case we want a separate auth slice in future.
import { createSlice } from '@reduxjs/toolkit';

const initialState = {};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
});

export default authSlice.reducer;
