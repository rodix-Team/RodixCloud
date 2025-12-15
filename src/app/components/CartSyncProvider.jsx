'use client';

import { useCartSync } from '../../hooks/useCartSync';
import { useWishlistSync } from '../../hooks/useWishlistSync';
import { useAddressesSync } from '../../hooks/useAddressesSync';

export default function CartSyncProvider({ children }) {
    useCartSync();
    useWishlistSync();
    useAddressesSync();
    return <>{children}</>;
}
