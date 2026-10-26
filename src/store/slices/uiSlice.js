import { createSlice } from "@reduxjs/toolkit";
import { DEFAULT_EXPANDED_MENUS } from "@/data/constants/sidebarData";

const initialState = {
  isSidebarCollapsed: false,
  expandedMenus: {
    ...DEFAULT_EXPANDED_MENUS,
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
      const current = state.expandedMenus[key] ?? true;
      state.expandedMenus[key] = !current;
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
  setHeader,
} = uiSlice.actions;

export default uiSlice.reducer;
