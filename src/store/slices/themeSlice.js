import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    theme: "default",
    variant: "light",
};

const themeSlice = createSlice({
    name: "theme",
    initialState,
    reducers: {
        setTheme: (state, action) => {
            state.theme = action.payload;
        },
        setVariant: (state, action) => {
            state.variant = action.payload;
        },
        toggleVariant: (state) => {
            state.variant = state.variant === "light" ? "dark" : "light";
        },
    },
});

export const { setTheme, setVariant, toggleVariant } = themeSlice.actions;
export default themeSlice.reducer;
