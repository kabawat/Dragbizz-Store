import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { supplierService } from "@/service";
import { handleError } from "@/utils/responseHandler/error";

const initialState = {
    suppliers: [],
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

export const getSuppliers = createAsyncThunk(
    "suppliers/getSuppliers",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await supplierService.getSuppliers(params);
            return response.data;
        } catch (error) {
            const result = handleError(error);
            return rejectWithValue(result.message);
        }
    },
    {
        condition: (params, { getState }) => {
            const { isLoading, isFetchingMore } = getState().suppliers;
            if (params?.isFreshLoad && isLoading) return false;
            if (!params?.isFreshLoad && isFetchingMore) return false;
            return true;
        },
    }
);



const suppliersSlice = createSlice({
    name: "suppliers",
    initialState,
    reducers: {
        setViewMode: (state, action) => {
            state.viewMode = action.payload;
        },

        // Get-Only Redux strategy: Native local mutations
        removeSupplier: (state, action) => {
            const supplierId = action.payload;
            state.suppliers = state.suppliers.filter((s) => (s.id || s._id) !== supplierId);
            if (state.pagination.total > 0) state.pagination.total -= 1;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getSuppliers.pending, (state, action) => {
                const isFreshLoad = action.meta?.arg?.isFreshLoad ?? true;
                if (isFreshLoad) state.isLoading = true;
                else state.isFetchingMore = true;
                state.error = null;
            })
            .addCase(getSuppliers.fulfilled, (state, action) => {
                const isFreshLoad = action.meta?.arg?.isFreshLoad ?? true;
                if (isFreshLoad) state.isLoading = false;
                else state.isFetchingMore = false;
                state.error = null;

                const { data, pagination } = action.payload;

                const raw = Array.isArray(data) ? data : (data?.data ?? data ?? []);
                const normalize = (s) => ({ ...s, id: s.id || s._id });

                if (isFreshLoad) {
                    state.suppliers = raw.map(normalize);
                } else {
                    const existingIds = new Set(state.suppliers.map((s) => s.id));
                    const incoming = raw.map(normalize).filter((s) => !existingIds.has(s.id));
                    state.suppliers = [...state.suppliers, ...incoming];
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
            .addCase(getSuppliers.rejected, (state, action) => {
                const isFreshLoad = action.meta?.arg?.isFreshLoad ?? true;
                if (isFreshLoad) state.isLoading = false;
                else state.isFetchingMore = false;
                state.error = action.payload?.message || "Failed to fetch suppliers";
            });
    },
});

export const {
    setViewMode,
    removeSupplier,
} = suppliersSlice.actions;

export default suppliersSlice.reducer;
