import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { customerService } from "@/service";
import { handleSuccess } from "@/utils/responseHandler/success";
import { handleError } from "@/utils/responseHandler/error";

const initialState = {
    customers: [],
    isLoading: false,
    isFetchingMore: false,
    error: null,
    pagination: {
        hasNextPage: false,
        nextCursor: null,
        total: 0,
    },
    viewMode: "table", // 'table' | 'card'
};

export const getCustomers = createAsyncThunk(
    "customer/getCustomers",
    async (params, { rejectWithValue }) => {
        try {
            const response = await customerService.getCustomers(params);
            return handleSuccess(response);
        } catch (error) {
            const result = handleError(error);
            return rejectWithValue(result.message);
        }
    },
    {
        condition: (params, { getState }) => {
            const { isLoading, isFetchingMore } = getState().customers;
            if (params?.isFreshLoad && isLoading) return false;
            if (!params?.isFreshLoad && isFetchingMore) return false;
            return true;
        },
    }
);

const customerSlice = createSlice({
    name: "customer",
    initialState,
    reducers: {
        setViewMode: (state, action) => {
            state.viewMode = action.payload;
        },
        removeCustomer: (state, action) => {
            state.customers = state.customers.filter((c) => c.id !== action.payload);
        },
        updateCustomer: (state, action) => {
            const index = state.customers.findIndex((c) => c.id === (action.payload.id || action.payload._id));
            if (index !== -1) {
                state.customers[index] = { ...state.customers[index], ...action.payload, id: action.payload.id || action.payload._id };
            }
        },
        addCustomer: (state, action) => {
            const newCustomer = { ...action.payload, id: action.payload.id || action.payload._id };
            state.customers.unshift(newCustomer);
            state.pagination.total += 1;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getCustomers.pending, (state, action) => {
                const isFreshLoad = action.meta && action.meta.arg && action.meta.arg.isFreshLoad !== undefined ? action.meta.arg.isFreshLoad : false;
                if (isFreshLoad) {
                    state.isLoading = true;
                } else {
                    state.isFetchingMore = true;
                }
                state.error = null;
            })
            .addCase(getCustomers.fulfilled, (state, action) => {
                const isFreshLoad = action.meta && action.meta.arg && action.meta.arg.isFreshLoad !== undefined ? action.meta.arg.isFreshLoad : false;
                if (isFreshLoad) {
                    state.isLoading = false;
                } else {
                    state.isFetchingMore = false;
                }
                state.error = null;

                const { data = [], pagination } = action.payload;

                // Normalize _id → id at ingestion so all components safely use c.id
                const normalize = (c) => ({ ...c, id: c.id || c._id });

                if (isFreshLoad) {
                    state.customers = data.map(normalize);
                } else {
                    const existingIds = new Set(state.customers.map((c) => c.id));
                    const newCustomers = data.map(normalize).filter((c) => !existingIds.has(c.id));
                    state.customers = [...state.customers, ...newCustomers];
                }

                state.pagination = {
                    hasNextPage: pagination && pagination.hasNextPage ? true : false,
                    nextCursor: pagination && pagination.nextCursor ? pagination.nextCursor : null,
                    total: pagination && pagination.total !== undefined ? pagination.total : (isFreshLoad ? data.length : state.pagination.total + data.length),
                };
            })
            .addCase(getCustomers.rejected, (state, action) => {
                const isFreshLoad = action.meta && action.meta.arg && action.meta.arg.isFreshLoad !== undefined ? action.meta.arg.isFreshLoad : false;
                if (isFreshLoad) {
                    state.isLoading = false;
                } else {
                    state.isFetchingMore = false;
                }
                state.error = action.payload;
            });
    },
});

export const { setViewMode, removeCustomer, updateCustomer, addCustomer } = customerSlice.actions;

export default customerSlice.reducer;
