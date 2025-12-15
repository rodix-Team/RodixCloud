'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../contexts/AuthContext';
import { loadCartFromFirestore, syncCartToFirestore, selectCartItems, selectTotalItemsCount } from '../redux/slices/cartSlice';

export function useCartSync() {
    const dispatch = useDispatch();
    const { currentUser } = useAuth();
    const cartItems = useSelector(selectCartItems);
    const totalItemsCount = useSelector(selectTotalItemsCount);

    // Load cart from Firestore on login
    useEffect(() => {
        if (currentUser?.uid) {
            dispatch(loadCartFromFirestore(currentUser.uid));
        }
    }, [currentUser?.uid, dispatch]);

    // Sync cart to Firestore on cart changes
    useEffect(() => {
        if (currentUser?.uid && cartItems.length >= 0) {
            const timeoutId = setTimeout(() => {
                dispatch(syncCartToFirestore({
                    userId: currentUser.uid,
                    items: cartItems,
                    totalItemsCount
                }));
            }, 1000); // Debounce for 1 second

            return () => clearTimeout(timeoutId);
        }
    }, [cartItems, totalItemsCount, currentUser?.uid, dispatch]);
}
