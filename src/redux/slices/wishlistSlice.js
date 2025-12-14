import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

// Load wishlist from Firestore
export const loadWishlistFromFirestore = createAsyncThunk(
    'wishlist/loadFromFirestore',
    async (userId) => {
        if (!userId) return { items: [] };

        const wishlistRef = doc(db, 'wishlists', userId);
        const wishlistSnap = await getDoc(wishlistRef);

        if (wishlistSnap.exists()) {
            return wishlistSnap.data();
        }
        return { items: [] };
    }
);

// Sync wishlist to Firestore
export const syncWishlistToFirestore = createAsyncThunk(
    'wishlist/syncToFirestore',
    async ({ userId, items }) => {
        if (!userId) return;

        const wishlistRef = doc(db, 'wishlists', userId);
        await setDoc(wishlistRef, {
            items,
            updatedAt: new Date().toISOString()
        });
    }
);

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState: {
        items: [], // قائمة IDs المنتجات المفضلة
        loading: false,
    },
    reducers: {
        addToWishlist: (state, action) => {
            const productId = action.payload;
            if (!state.items.includes(productId)) {
                state.items.push(productId);
            }
        },

        removeFromWishlist: (state, action) => {
            const productId = action.payload;
            state.items = state.items.filter(id => id !== productId);
        },

        toggleWishlist: (state, action) => {
            const productId = action.payload;
            if (state.items.includes(productId)) {
                state.items = state.items.filter(id => id !== productId);
            } else {
                state.items.push(productId);
            }
        },

        setWishlist: (state, action) => {
            state.items = action.payload.items || [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadWishlistFromFirestore.pending, (state) => {
                state.loading = true;
            })
            .addCase(loadWishlistFromFirestore.fulfilled, (state, action) => {
                state.items = action.payload.items || [];
                state.loading = false;
            })
            .addCase(loadWishlistFromFirestore.rejected, (state) => {
                state.loading = false;
            });
    },
});

export const { addToWishlist, removeFromWishlist, toggleWishlist, setWishlist } = wishlistSlice.actions;

// Selectors
export const selectWishlistItems = (state) => state.wishlist.items;
export const selectIsInWishlist = (productId) => (state) =>
    state.wishlist.items.includes(productId);

export default wishlistSlice.reducer;
