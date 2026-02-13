import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authService } from "@/service/auth";

export const getNotificationSettings = createAsyncThunk(
    "notificationSettings/get",
    async (_, { rejectWithValue }) => {
        try {
            const response = await authService.getNotificationSettings();
            if (response.success) {
                return response.data.data || response.data;
            }
            return rejectWithValue(response.message);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateNotificationSettings = createAsyncThunk(
    "notificationSettings/update",
    async (settingsData, { rejectWithValue }) => {
        try {
            const response = await authService.updateNotificationSettings(settingsData);
            if (response.success) {
                return response.data.data || response.data;
            }
            return rejectWithValue(response.message);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const resetNotificationSettings = createAsyncThunk(
    "notificationSettings/reset",
    async (_, { rejectWithValue }) => {
        try {
            const response = await authService.resetNotificationSettings();
            if (response.success) {
                return response.data.data || response.data;
            }
            return rejectWithValue(response.message);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    settings: null,
    loading: false,
    error: null,
};

const notificationSettingsSlice = createSlice({
    name: "notificationSettings",
    initialState,
    reducers: {
        clearNotificationSettings: (state) => {
            state.settings = null;
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Get Settings
            .addCase(getNotificationSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getNotificationSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.settings = action.payload;
                state.error = null;
            })
            .addCase(getNotificationSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update Settings
            .addCase(updateNotificationSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateNotificationSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.settings = action.payload;
                state.error = null;
            })
            .addCase(updateNotificationSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Reset Settings
            .addCase(resetNotificationSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(resetNotificationSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.settings = action.payload;
                state.error = null;
            })
            .addCase(resetNotificationSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearNotificationSettings } = notificationSettingsSlice.actions;
export default notificationSettingsSlice.reducer;
