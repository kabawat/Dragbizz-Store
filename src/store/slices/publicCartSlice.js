import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    items: [],
    isOpen: false,
};

const publicCartSlice = createSlice({
    name: "publicCart",
    initialState,
    reducers: {
        setCartOpen: (state, action) => {
            state.isOpen = action.payload;
        },
        addToCart: (state, action) => {
            const { product, quantity = 1 } = action.payload;
            const existingItem = state.items.find((item) => item._id === product._id);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                state.items.push({ ...product, quantity });
            }
        },
        updateCartQuantity: (state, action) => {
            const { productId, quantity } = action.payload;
            if (quantity <= 0) {
                state.items = state.items.filter((item) => item._id !== productId);
            } else {
                const item = state.items.find((item) => item._id === productId);
                if (item) {
                    item.quantity = quantity;
                }
            }
        },
        clearCart: (state) => {
            state.items = [];
            state.isOpen = false;
        },
    },
});

export const { setCartOpen, addToCart, updateCartQuantity, clearCart } = publicCartSlice.actions;
export default publicCartSlice.reducer;
