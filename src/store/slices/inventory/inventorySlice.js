import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import inventoryService from "@/service/retailer/inventory.service";
import { handleSuccess } from "@/utils/responseHandler/success";
import { handleError } from "@/utils/responseHandler/error";

const initialState = {
    inventories: [],
    pagination: {
        hasNextPage: false,
        nextCursor: null,
        limit: 20,
        total: 0,
    },
    isLoading: false,
    isFetchingMore: false,
    error: null,
    viewMode: "table",
};

export const getInventories = createAsyncThunk(
    "inventory/getInventories",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await inventoryService.getInventories(params);
            return handleSuccess(response);
        } catch (error) {
            const result = handleError(error);
            return rejectWithValue(result.message);
        }
    },
    {
        condition: (params, { getState }) => {
            const { isLoading, isFetchingMore } = getState().inventory;
            if (params?.isFreshLoad && isLoading) return false;
            if (!params?.isFreshLoad && isFetchingMore) return false;
            return true;
        },
    }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const inventorySlice = createSlice({
    name: "inventory",
    initialState,
    reducers: {
        setViewMode: (state, action) => {
            state.viewMode = action.payload;
        },
        // Remove inventory from state
        removeInventoryLocal: (state, action) => {
            const inventoryId = action.payload;
            state.inventories = state.inventories.filter((i) => (i.id || i._id) !== inventoryId);
            if (state.pagination.total > 0) state.pagination.total -= 1;
        },
        resetInventoryState: (state) => {
            state.inventories = [];
            state.pagination = initialState.pagination;
        }
    },
    extraReducers: (builder) => {
        builder
            // ── getInventories ──
            .addCase(getInventories.pending, (state, action) => {
                const isFreshLoad = action.meta?.arg?.isFreshLoad ?? true;
                if (isFreshLoad) state.isLoading = true;
                else state.isFetchingMore = true;
                state.error = null;
            })
            .addCase(getInventories.fulfilled, (state, action) => {
                const isFreshLoad = action.meta?.arg?.isFreshLoad ?? true;
                if (isFreshLoad) state.isLoading = false;
                else state.isFetchingMore = false;
                state.error = null;

                const { data, pagination } = action.payload;
                // Normalize inventory data
                const raw = Array.isArray(data) ? data : (data?.data ?? data?.inventories ?? data ?? []);
                const normalize = (i) => ({ ...i, id: i.id || i._id });

                if (isFreshLoad) {
                    state.inventories = raw.map(normalize);
                } else {
                    const existingIds = new Set(state.inventories.map((i) => i.id));
                    const incoming = raw.map(normalize).filter((i) => !existingIds.has(i.id));
                    state.inventories = [...state.inventories, ...incoming];
                }

                // Update pagination
                const pg = pagination || data?.meta?.pagination;
                if (pg) {
                    state.pagination = {
                        hasNextPage: pg.hasNextPage || pg.hasNext || false,
                        nextCursor: pg.nextCursor || null,
                        limit: pg.limit || 20,
                        total: pg.total ?? (isFreshLoad ? raw.length : state.pagination.total + raw.length),
                    };
                }
            })
            .addCase(getInventories.rejected, (state, action) => {
                const isFreshLoad = action.meta?.arg?.isFreshLoad ?? true;
                if (isFreshLoad) state.isLoading = false;
                else state.isFetchingMore = false;
                state.error = action.payload?.message || "Failed to fetch inventories";
            });
    },
});

export const { setViewMode, removeInventoryLocal, resetInventoryState } = inventorySlice.actions;

export default inventorySlice.reducer;
