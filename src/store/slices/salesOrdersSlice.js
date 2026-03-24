import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import salesOrderService from "@/service/retailer/salesOrder.service";
import { handleSuccess } from "@/utils/responseHandler/success";
import { handleError } from "@/utils/responseHandler/error";
const { API_CONFIG } = require("@/config");

const initialState = {
    list: [],
    stats: { total: 0, pending: 0, completed: 0 },
    isLoading: false,
    isFetchingMore: false,
    error: null,
    pagination: { hasNextPage: false, nextCursor: null, total: 0, limit: 20 },
    viewMode: "table",
};

export const getSalesOrders = createAsyncThunk(
    "salesOrders/getSalesOrders",
    async (params, { rejectWithValue }) => {
        try {
            const response = await salesOrderService.getSalesOrders(params);
            return handleSuccess(response); // Standard global payload formatter!
        } catch (error) {
            const result = handleError(error);
            return rejectWithValue(result.message);
        }
    },
    {
        condition: (params, { getState }) => {
            const { isLoading, isFetchingMore } = getState().salesOrders;
            if (params?.isFreshLoad && isLoading) return false;
            if (!params?.isFreshLoad && isFetchingMore) return false;
            return true;
        },
    }
);

const salesOrdersSlice = createSlice({
    name: "salesOrders",
    initialState,
    reducers: {
        setViewMode: (state, action) => {
            state.viewMode = action.payload;
        },
        removeSalesOrder: (state, action) => {
            state.list = state.list.filter((so) => (so.id || so._id) !== action.payload);
            if (state.pagination.total > 0) state.pagination.total -= 1;
        },
        updateSalesOrder: (state, action) => {
            const payloadId = action.payload.id || action.payload._id;
            const index = state.list.findIndex((so) => (so.id || so._id) === payloadId);
            if (index !== -1) {
                state.list[index] = { ...state.list[index], ...action.payload, id: payloadId };
            }
        },
        addSalesOrder: (state, action) => {
            const newSO = { ...action.payload, id: action.payload.id || action.payload._id };
            state.list.unshift(newSO);
            state.pagination.total += 1;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getSalesOrders.pending, (state, action) => {
                const isFreshLoad = action.meta?.arg?.isFreshLoad ?? false;
                if (isFreshLoad) state.isLoading = true;
                else state.isFetchingMore = true;
                state.error = null;
            })
            .addCase(getSalesOrders.fulfilled, (state, action) => {
                const isFreshLoad = action.meta?.arg?.isFreshLoad ?? false;
                if (isFreshLoad) state.isLoading = false;
                else state.isFetchingMore = false;
                state.error = null;

                const { data, pagination } = action.payload;

                // Extract stats securely if available
                const payloadData = action.payload || {};
                if (payloadData.data && payloadData.data.stats) {
                    state.stats = payloadData.data.stats;
                } else if (payloadData.stats) {
                    state.stats = payloadData.stats;
                }

                const raw = Array.isArray(data) ? data : (data?.data ?? data ?? []);
                const normalize = (so) => ({ ...so, id: so.id || so._id });

                if (isFreshLoad) {
                    state.list = raw.map(normalize);
                } else {
                    const existingIds = new Set(state.list.map((so) => so.id));
                    const newSOs = raw.map(normalize).filter((so) => !existingIds.has(so.id));
                    state.list = [...state.list, ...newSOs];
                }

                const pg = pagination || data?.meta?.pagination;
                if (pg) {
                    state.pagination = {
                        hasNextPage: pg.hasNextPage || false,
                        nextCursor: pg.nextCursor || null,
                        limit: pg.limit || 20,
                        total: pg.total ?? (isFreshLoad ? raw.length : state.pagination.total + raw.length),
                    };
                }
            })
            .addCase(getSalesOrders.rejected, (state, action) => {
                const isFreshLoad = action.meta?.arg?.isFreshLoad ?? false;
                if (isFreshLoad) state.isLoading = false;
                else state.isFetchingMore = false;
                state.error = action.payload;
            });
    },
});

export const { setViewMode, removeSalesOrder, updateSalesOrder, addSalesOrder } = salesOrdersSlice.actions;
export default salesOrdersSlice.reducer;
