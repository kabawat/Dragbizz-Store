// src/store/slices/productsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productService } from '@/service/retailer';

// Async thunk for getting products
export const getProducts = createAsyncThunk(
  'products/getProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const result = await productService.getProducts(params);
      if (!result.success) {
        return rejectWithValue({
          message: result.message || 'Failed to fetch products'
        });
      }
      
      return {
        success: true,
        data: result.data,
        message: 'Products fetched successfully'
      };
    } catch (error) {
      return rejectWithValue({
        message: 'Failed to fetch products. Please try again.'
      });
    }
  }
);

// Async thunk for deleting a product
export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async ({ productId, storeId }, { rejectWithValue }) => {
    try {
      const result = await productService.deleteProduct(productId, storeId);
      if (!result.success) {
        return rejectWithValue({
          message: result.message || 'Failed to delete product'
        });
      }
      
      return {
        success: true,
        productId: productId,
        message: 'Product deleted successfully'
      };
    } catch (error) {
      return rejectWithValue({
        message: 'Failed to delete product. Please try again.'
      });
    }
  }
);

const initialState = {
  // Products data
  products: [],
  selectedProducts: [],
  
  // Pagination
  pagination: {
    hasNextPage: false,
    nextCursor: null,
    limit: 20,
    total: 0
  },
  
  // Loading states
  isLoading: false,
  
  // Error handling
  error: null,
  
  
  // View settings
  viewMode: 'table', // 'table' or 'card'
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    // Set selected products
    setSelectedProducts: (state, action) => {
      state.selectedProducts = action.payload;
    },
    
    // Toggle product selection
    toggleProductSelection: (state, action) => {
      const productId = action.payload;
      const index = state.selectedProducts.indexOf(productId);
      
      if (index > -1) {
        state.selectedProducts.splice(index, 1);
      } else {
        state.selectedProducts.push(productId);
      }
    },
    
    // Select all products
    selectAllProducts: (state) => {
      state.selectedProducts = state.products.map(product => product.id);
    },
    
    // Deselect all products
    deselectAllProducts: (state) => {
      state.selectedProducts = [];
    },
    
    
    // Set view mode
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    
    // Add more products (for infinite scroll)
    addMoreProducts: (state, action) => {
      state.products = [...state.products, ...action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      // Get products
      .addCase(getProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        
        const { data, pagination } = action.payload;
        
        // Update products data
        if (data?.data) {
          state.products = data.data;
        } else if (data) {
          state.products = data;
        }
        
        // Update pagination - check both response.pagination and data.meta.pagination
        if (pagination) {
          state.pagination = {
            hasNextPage: pagination.hasNextPage || false,
            nextCursor: pagination.nextCursor || null,
            limit: pagination.limit || 20,
            total: pagination.total || 0
          };
        } else if (data?.meta?.pagination) {
          state.pagination = {
            hasNextPage: data.meta.pagination.hasNextPage || false,
            nextCursor: data.meta.pagination.nextCursor || null,
            limit: data.meta.pagination.limit || 20,
            total: data.meta.pagination.total || 0
          };
        }
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch products';
      })
      
      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        
        // Remove product from the list
        const productId = action.payload.productId;
        state.products = state.products.filter(product => product.id !== productId);
        
        // Remove from selected products if it was selected
        state.selectedProducts = state.selectedProducts.filter(id => id !== productId);
        
        // Update total count
        if (state.pagination.total > 0) {
          state.pagination.total -= 1;
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to delete product';
      });
  },
});

export const {
  setSelectedProducts,
  toggleProductSelection,
  selectAllProducts,
  deselectAllProducts,
  setViewMode,
  addMoreProducts
} = productsSlice.actions;

export { getProducts, deleteProduct };

export default productsSlice.reducer;
