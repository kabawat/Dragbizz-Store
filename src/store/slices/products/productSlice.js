import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { productService } from "@/service/retailer";
import { handleSuccess } from "@/utils/responseHandler/success";
import { handleError } from "@/utils/responseHandler/error";

const initialState = {
    products: [],
    pagination: {
        hasNextPage: false,
        nextCursor: null,
        limit: 20,
        total: 0,
    },
    isLoading: false,
    isFetchingMore: false,
    error: null,
    viewMode: "table", // 'table' | 'card'
};

export const getProducts = createAsyncThunk(
    "products/getProducts",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await productService.getProducts(params);
            return handleSuccess(response);
        } catch (error) {
            const result = handleError(error);
            return rejectWithValue(result.message);
        }
    },
    {
        condition: (params, { getState }) => {
            const { isLoading, isFetchingMore } = getState().products;
            if (params?.isFreshLoad && isLoading) return false;
            if (!params?.isFreshLoad && isFetchingMore) return false;
            return true;
        },
    }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const productsSlice = createSlice({
    name: "products",
    initialState,
    reducers: {
        setViewMode: (state, action) => {
            state.viewMode = action.payload;
        },

        // Remove product from state
        removeProduct: (state, action) => {
            const productId = action.payload;
            state.products = state.products.filter((p) => (p.id || p._id) !== productId);
            if (state.pagination.total > 0) state.pagination.total -= 1;
        },

        addMoreProducts: (state, action) => {
            const existingIds = new Set(state.products.map((p) => p.id || p._id));
            const newProducts = action.payload.filter((p) => !existingIds.has(p.id || p._id));
            state.products = [...state.products, ...newProducts];
        },
    },
    extraReducers: (builder) => {
        builder
            // ── getProducts ──
            .addCase(getProducts.pending, (state, action) => {
                const isFreshLoad = action.meta?.arg?.isFreshLoad ?? true;
                if (isFreshLoad) state.isLoading = true;
                else state.isFetchingMore = true;
                state.error = null;
            })
            .addCase(getProducts.fulfilled, (state, action) => {
                const isFreshLoad = action.meta?.arg?.isFreshLoad ?? true;
                if (isFreshLoad) state.isLoading = false;
                else state.isFetchingMore = false;
                state.error = null;

                const { data, pagination } = action.payload;
                console.log("pagination : ", pagination)

                // Normalize product data
                const raw = Array.isArray(data) ? data : (data?.data ?? data ?? []);
                const normalize = (p) => ({ ...p, id: p.id || p._id });

                if (isFreshLoad) {
                    state.products = raw.map(normalize);
                } else {
                    const existingIds = new Set(state.products.map((p) => p.id));
                    const incoming = raw.map(normalize).filter((p) => !existingIds.has(p.id));
                    state.products = [...state.products, ...incoming];
                }

                // Update pagination
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
            .addCase(getProducts.rejected, (state, action) => {
                const isFreshLoad = action.meta?.arg?.isFreshLoad ?? true;
                if (isFreshLoad) state.isLoading = false;
                else state.isFetchingMore = false;
                state.error = action.payload?.message || "Failed to fetch products";
            });
    },
});

export const {
    setViewMode,
    removeProduct,
    addMoreProducts,
} = productsSlice.actions;

export default productsSlice.reducer;
