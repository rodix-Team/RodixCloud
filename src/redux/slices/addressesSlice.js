import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

// Load addresses from Firestore
export const loadAddressesFromFirestore = createAsyncThunk(
    'addresses/loadFromFirestore',
    async (userId) => {
        if (!userId) return { addresses: [] };

        const addressesRef = doc(db, 'addresses', userId);
        const addressesSnap = await getDoc(addressesRef);

        if (addressesSnap.exists()) {
            return addressesSnap.data();
        }
        return { addresses: [] };
    }
);

// Sync addresses to Firestore
export const syncAddressesToFirestore = createAsyncThunk(
    'addresses/syncToFirestore',
    async ({ userId, addresses }) => {
        if (!userId) return;

        const addressesRef = doc(db, 'addresses', userId);
        await setDoc(addressesRef, {
            addresses,
            updatedAt: new Date().toISOString()
        });
    }
);

const addressesSlice = createSlice({
    name: 'addresses',
    initialState: {
        addresses: [],
        loading: false,
    },
    reducers: {
        addAddress: (state, action) => {
            const newAddress = {
                id: Date.now().toString(),
                ...action.payload,
                isDefault: state.addresses.length === 0 // First address is default
            };
            state.addresses.push(newAddress);
        },

        updateAddress: (state, action) => {
            const index = state.addresses.findIndex(addr => addr.id === action.payload.id);
            if (index !== -1) {
                state.addresses[index] = { ...state.addresses[index], ...action.payload };
            }
        },

        deleteAddress: (state, action) => {
            state.addresses = state.addresses.filter(addr => addr.id !== action.payload);

            // If deleted address was default, make first address default
            if (state.addresses.length > 0 && !state.addresses.some(addr => addr.isDefault)) {
                state.addresses[0].isDefault = true;
            }
        },

        setDefaultAddress: (state, action) => {
            state.addresses.forEach(addr => {
                addr.isDefault = addr.id === action.payload;
            });
        },

        setAddresses: (state, action) => {
            state.addresses = action.payload.addresses || [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadAddressesFromFirestore.pending, (state) => {
                state.loading = true;
            })
            .addCase(loadAddressesFromFirestore.fulfilled, (state, action) => {
                state.addresses = action.payload.addresses || [];
                state.loading = false;
            })
            .addCase(loadAddressesFromFirestore.rejected, (state) => {
                state.loading = false;
            });
    },
});

export const {
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    setAddresses
} = addressesSlice.actions;

// Selectors
export const selectAllAddresses = (state) => state.addresses.addresses;
export const selectDefaultAddress = (state) =>
    state.addresses.addresses.find(addr => addr.isDefault);

export default addressesSlice.reducer;
