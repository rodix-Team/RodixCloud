'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../contexts/AuthContext';
import { loadAddressesFromFirestore, syncAddressesToFirestore, selectAllAddresses } from '../redux/slices/addressesSlice';

export function useAddressesSync() {
    const dispatch = useDispatch();
    const { currentUser } = useAuth();
    const addresses = useSelector(selectAllAddresses);

    // Load addresses from Firestore on login
    useEffect(() => {
        if (currentUser?.uid) {
            dispatch(loadAddressesFromFirestore(currentUser.uid));
        }
    }, [currentUser?.uid, dispatch]);

    // Sync addresses to Firestore on changes
    useEffect(() => {
        if (currentUser?.uid && addresses.length >= 0) {
            const timeoutId = setTimeout(() => {
                dispatch(syncAddressesToFirestore({
                    userId: currentUser.uid,
                    addresses
                }));
            }, 1000); // Debounce for 1 second

            return () => clearTimeout(timeoutId);
        }
    }, [addresses, currentUser?.uid, dispatch]);
}
