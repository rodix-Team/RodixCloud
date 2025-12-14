import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

// Load cart from Firestore
export const loadCartFromFirestore = createAsyncThunk(
  'cart/loadFromFirestore',
  async (userId) => {
    if (!userId) return { items: [], totalItemsCount: 0 };

    const cartRef = doc(db, 'carts', userId);
    const cartSnap = await getDoc(cartRef);

    if (cartSnap.exists()) {
      return cartSnap.data();
    }
    return { items: [], totalItemsCount: 0 };
  }
);

// Sync cart to Firestore
export const syncCartToFirestore = createAsyncThunk(
  'cart/syncToFirestore',
  async ({ userId, items, totalItemsCount }) => {
    if (!userId) return;

    const cartRef = doc(db, 'carts', userId);
    await setDoc(cartRef, {
      items,
      totalItemsCount,
      updatedAt: new Date().toISOString()
    });
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    totalItemsCount: 0,
    loading: false,
  },
  reducers: {
    // 1. إضافة المنتج
    addItem: (state, action) => {
      const { id, name, price, imageUrl } = action.payload;
      const existingItem = state.items.find(item => item.id === id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ id, name, price, imageUrl, quantity: 1 });
      }

      state.totalItemsCount = state.items.reduce((total, item) => total + item.quantity, 0);
    },

    // 2. إنقاص الكمية
    decrementItem: (state, action) => {
      const id = action.payload;
      const existingItem = state.items.find(item => item.id === id);

      if (existingItem) {
        existingItem.quantity -= 1;

        if (existingItem.quantity === 0) {
          state.items = state.items.filter(item => item.id !== id);
        }
      }

      state.totalItemsCount = state.items.reduce((total, item) => total + item.quantity, 0);
    },

    // 3. حذف المنتج نهائياً
    removeItem: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter(item => item.id !== id);

      state.totalItemsCount = state.items.reduce((total, item) => total + item.quantity, 0);
    },

    // 4. تفريغ العربة بالكامل
    clearCart: (state) => {
      state.items = [];
      state.totalItemsCount = 0;
    },

    // 5. Load cart from Firestore (manual)
    setCart: (state, action) => {
      state.items = action.payload.items || [];
      state.totalItemsCount = action.payload.totalItemsCount || 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCartFromFirestore.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadCartFromFirestore.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
        state.totalItemsCount = action.payload.totalItemsCount || 0;
        state.loading = false;
      })
      .addCase(loadCartFromFirestore.rejected, (state) => {
        state.loading = false;
      });
  },
});

// تصدير الـ Actions
export const { addItem, decrementItem, removeItem, clearCart, setCart } = cartSlice.actions;

// Selectors
export const selectTotalItemsCount = (state) => state.cart.totalItemsCount;
export const selectCartItems = (state) => state.cart.items;

export default cartSlice.reducer;