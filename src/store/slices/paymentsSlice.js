import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { paymentService } from "@/service/retailer";

// Helper function to calculate payment statistics
const calculatePaymentStats = (payments) => {
  if (!payments || payments.length === 0) {
    return {
      totalPayments: 0,
      pendingPayments: 0,
      approvedPayments: 0,
      totalAmount: 0,
    };
  }

  const stats = payments.reduce(
    (acc, payment) => {
      acc.totalPayments += 1;
      acc.totalAmount += payment.amount || 0;

      switch (payment.status?.toLowerCase()) {
        case "pending":
          acc.pendingPayments += 1;
          break;
        case "approved":
          acc.approvedPayments += 1;
          break;
        default:
          break;
      }

      return acc;
    },
    {
      totalPayments: 0,
      pendingPayments: 0,
      approvedPayments: 0,
      totalAmount: 0,
    }
  );

  return stats;
};

// Async thunk for getting payments
export const getPayments = createAsyncThunk(
  "payments/getPayments",
  async (params = {}, { rejectWithValue }) => {
    try {
      const result = await paymentService.getPayments(params);
      if (!result.success) {
        return rejectWithValue({
          message: result.message || "Failed to fetch payments",
        });
      }

      return {
        success: true,
        data: result.data,
        message: "Payments fetched successfully",
      };
    } catch (_error) {
      return rejectWithValue({
        message: "Failed to fetch payments. Please try again.",
      });
    }
  }
);

// Async thunk for updating a payment
export const updatePayment = createAsyncThunk(
  "payments/updatePayment",
  async ({ paymentId, paymentData, storeId }, { rejectWithValue }) => {
    try {
      const result = await paymentService.updatePayment(
        paymentId,
        paymentData,
        storeId
      );
      if (!result.success) {
        return rejectWithValue({
          message: result.message || "Failed to update payment",
        });
      }

      return {
        success: true,
        data: result.data,
        paymentId: paymentId,
        message: "Payment updated successfully",
      };
    } catch (_error) {
      return rejectWithValue({
        message: "Failed to update payment. Please try again.",
      });
    }
  }
);

// Async thunk for deleting a payment
export const deletePayment = createAsyncThunk(
  "payments/deletePayment",
  async ({ paymentId, storeId }, { rejectWithValue }) => {
    try {
      const result = await paymentService.deletePayment(paymentId, storeId);
      if (!result.success) {
        return rejectWithValue({
          message: result.message || "Failed to delete payment",
        });
      }

      return {
        success: true,
        paymentId: paymentId,
        message: "Payment deleted successfully",
      };
    } catch (_error) {
      return rejectWithValue({
        message: "Failed to delete payment. Please try again.",
      });
    }
  }
);

const initialState = {
  // Payments data
  payments: [],

  // Pagination
  pagination: {
    hasNextPage: false,
    nextCursor: null,
    limit: 20,
    total: 0,
  },

  // Statistics
  stats: {
    totalPayments: 0,
    pendingPayments: 0,
    approvedPayments: 0,
    totalAmount: 0,
  },

  // Loading states
  isLoading: false,
  isUpdating: false,
  isDeleting: false,

  // Error handling
  error: null,
};

const paymentsSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get payments
      .addCase(getPayments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPayments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;

        const { data } = action.payload;

        // Update payments data
        if (data?.data) {
          state.payments = data.data;
        } else if (data) {
          state.payments = data;
        }

        // Calculate and update stats based on payments data
        state.stats = calculatePaymentStats(state.payments);

        // Update pagination
        if (data?.meta?.pagination) {
          state.pagination = {
            hasNextPage: data.meta.pagination.hasNextPage || false,
            nextCursor: data.meta.pagination.nextCursor || null,
            limit: data.meta.pagination.limit || 20,
            total: data.meta.pagination.total || 0,
          };
        }
      })
      .addCase(getPayments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to fetch payments";
      })

      // Update payment
      .addCase(updatePayment.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updatePayment.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.error = null;

        // Update payment in the list
        const paymentId = action.payload.paymentId;
        const index = state.payments.findIndex(
          (payment) => payment.id === paymentId
        );

        if (index !== -1 && action.payload.data) {
          state.payments[index] = {
            ...state.payments[index],
            ...action.payload.data,
          };
        }

        // Recalculate stats after updating payment
        state.stats = calculatePaymentStats(state.payments);
      })
      .addCase(updatePayment.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload?.message || "Failed to update payment";
      })

      // Delete payment
      .addCase(deletePayment.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deletePayment.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.error = null;

        // Remove payment from the list
        const paymentId = action.payload.paymentId;
        state.payments = state.payments.filter(
          (payment) => payment.id !== paymentId
        );

        // Recalculate stats after deleting payment
        state.stats = calculatePaymentStats(state.payments);

        // Update total count
        if (state.pagination.total > 0) {
          state.pagination.total -= 1;
        }
      })
      .addCase(deletePayment.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload?.message || "Failed to delete payment";
      });
  },
});

export const { clearError } = paymentsSlice.actions;

export { getPayments, updatePayment, deletePayment };

export default paymentsSlice.reducer;
