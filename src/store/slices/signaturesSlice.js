import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { signatureService } from "@/service";

// Define async thunk for fetching signatures
export const fetchSignatures = createAsyncThunk(
    "signatures/fetchSignatures",
    async (params, { rejectWithValue }) => {
        try {
            const response = await signatureService.getSignatures(params);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || "Failed to fetch signatures");
        } catch (error) {
            return rejectWithValue(
                error.message || "An error occurred while fetching signatures"
            );
        }
    }
);

// Define async thunk for creating a signature (optional, but good practice)
export const createSignature = createAsyncThunk(
    "signatures/createSignature",
    async (signatureData, { rejectWithValue, dispatch }) => {
        try {
            const response = await signatureService.createSignature(signatureData);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || "Failed to create signature");
        } catch (error) {
            return rejectWithValue(
                error.message || "An error occurred while creating signature"
            );
        }
    }
);

const initialState = {
    items: [],
    loading: false,
    error: null,
    lastFetched: null,
};

const signaturesSlice = createSlice({
    name: "signatures",
    initialState,
    reducers: {
        clearSignatures: (state) => {
            state.items = [];
            state.loading = false;
            state.error = null;
            state.lastFetched = null;
        },
        // Optional: Manually add a signature if not re-fetching
        addSignature: (state, action) => {
            state.items.push(action.payload);
        },
        removeSignature: (state, action) => {
            state.items = state.items.filter(
                (item) => (item.id || item._id) !== action.payload
            );
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Signatures
            .addCase(fetchSignatures.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSignatures.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload || [];
                state.lastFetched = Date.now();
            })
            .addCase(fetchSignatures.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create Signature
            .addCase(createSignature.fulfilled, (state, action) => {
                const exists = state.items.some(
                    (item) => item.id === action.payload.id || item._id === action.payload._id
                );
                if (!exists) {
                    state.items.push(action.payload);
                }
            });
    },
});

export const { clearSignatures, addSignature, removeSignature } = signaturesSlice.actions;

export default signaturesSlice.reducer;
