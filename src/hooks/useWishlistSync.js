'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../contexts/AuthContext';
import { loadWishlistFromFirestore, syncWishlistToFirestore, selectWishlistItems } from '../redux/slices/wishlistSlice';

export function useWishlistSync() {
    const dispatch = useDispatch();
    const { currentUser } = useAuth();
    const wishlistItems = useSelector(selectWishlistItems);

    // Load wishlist from Firestore on login
    useEffect(() => {
        if (currentUser?.uid) {
            dispatch(loadWishlistFromFirestore(currentUser.uid));
        }
    }, [currentUser?.uid, dispatch]);

    // Sync wishlist to Firestore on changes
    useEffect(() => {
        if (currentUser?.uid && wishlistItems.length >= 0) {
            const timeoutId = setTimeout(() => {
                dispatch(syncWishlistToFirestore({
                    userId: currentUser.uid,
                    items: wishlistItems
                }));
            }, 1000); // Debounce for 1 second

            return () => clearTimeout(timeoutId);
        }
    }, [wishlistItems, currentUser?.uid, dispatch]);
}
