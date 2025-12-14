import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './slices/productsSlice';
// 🚨 استيراد الـ Cart Reducer 🚨
import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';
import ordersReducer from './slices/ordersSlice';
import addressesReducer from './slices/addressesSlice';

export const store = configureStore({
  reducer: {
    products: productsReducer,
    // 🚨 تفعيل Reducer ديال العربة 🚨
    cart: cartReducer,
    wishlist: wishlistReducer,
    orders: ordersReducer,
    addresses: addressesReducer,
  },
});