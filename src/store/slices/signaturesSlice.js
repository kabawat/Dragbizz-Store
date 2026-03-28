import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { signatureService } from "@/service";
import { handleSuccess } from "@/utils/responseHandler/success";
import { handleError } from "@/utils/responseHandler/error";

// Define async thunk for fetching signatures
export const fetchSignatures = createAsyncThunk(
    "signatures/fetchSignatures",
    async (params, { rejectWithValue }) => {
        try {
            const response = await signatureService.getSignatures(params);
            return handleSuccess(response);
        } catch (error) {
            return rejectWithValue(handleError(error).message);
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
                state.items = action.payload.data || [];
                state.lastFetched = Date.now();
            })
            .addCase(fetchSignatures.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })


    },
});

export const { clearSignatures, addSignature, removeSignature } = signaturesSlice.actions;

export default signaturesSlice.reducer;
