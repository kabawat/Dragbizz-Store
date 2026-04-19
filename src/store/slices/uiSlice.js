import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isSidebarCollapsed: false,
    expandedMenus: {
        sales: true,
        inventory: true,
        purchase: true,
        analytics: true,
    },
    header: {
        title: "",
        description: "",
    },
};


const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        setSidebarCollapsed: (state, action) => {
            state.isSidebarCollapsed = action.payload;
        },
        toggleSidebar: (state) => {
            state.isSidebarCollapsed = !state.isSidebarCollapsed;
        },
        // Toggle a single menu open/close
        toggleExpandedMenu: (state, action) => {
            const key = action.payload;
            state.expandedMenus[key] = !state.expandedMenus[key];
        },
        // Force-open a menu (used for auto-expand on active route)
        expandMenu: (state, action) => {
            const key = action.payload;
            if (!state.expandedMenus[key]) {
                state.expandedMenus[key] = true;
            }
        },
        setHeader: (state, action) => {
            state.header = {
                title: action.payload.title || "",
                description: action.payload.description || "",
            };
        },
    },
});

export const {
    setSidebarCollapsed,
    toggleSidebar,
    toggleExpandedMenu,
    expandMenu,
    setHeader
} = uiSlice.actions;

export default uiSlice.reducer;
