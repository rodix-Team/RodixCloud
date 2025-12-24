"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { http } from '@/lib/http';
import { formatPrice as formatPriceUtil, getCurrency } from '@/lib/currencies';

interface StoreSettings {
    store_name: string;
    store_email: string;
    store_phone: string;
    store_address: string;
    store_currency: string;
    store_language: string;
    store_timezone: string;
    tax_rate: number;
    logo_url: string;
    free_shipping_min: number;
}

interface SettingsContextType {
    settings: StoreSettings;
    loading: boolean;
    formatPrice: (amount: number) => string;
    getCurrencySymbol: () => string;
    refetch: () => Promise<void>;
}

const defaultSettings: StoreSettings = {
    store_name: 'Rodix Store',
    store_email: '',
    store_phone: '',
    store_address: '',
    store_currency: 'USD',
    store_language: 'en',
    store_timezone: 'UTC',
    tax_rate: 0,
    logo_url: '',
    free_shipping_min: 200,
};

const SettingsContext = createContext<SettingsContextType>({
    settings: defaultSettings,
    loading: true,
    formatPrice: (amount) => `$${amount.toFixed(2)}`,
    getCurrencySymbol: () => '$',
    refetch: async () => { },
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const response = await http.get('/settings');
            if (response.data?.data) {
                setSettings(prev => ({ ...prev, ...response.data.data }));
            } else if (response.data) {
                setSettings(prev => ({ ...prev, ...response.data }));
            }
        } catch (error) {
            console.log('Settings API not available, using defaults');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const formatPrice = (amount: number): string => {
        return formatPriceUtil(amount, settings.store_currency);
    };

    const getCurrencySymbol = (): string => {
        const currency = getCurrency(settings.store_currency);
        return currency?.symbol || '$';
    };

    return (
        <SettingsContext.Provider value={{
            settings,
            loading,
            formatPrice,
            getCurrencySymbol,
            refetch: fetchSettings
        }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}

export { SettingsContext };
