"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_CURRENCY, Currency, getCurrency, formatPrice as formatPriceUtil } from '@/lib/currencies';
import { DEFAULT_LANGUAGE, Language, getLanguage, t as translate } from '@/lib/languages';

// Types
interface LocaleState {
    // Currency
    currencyCode: string;
    setCurrency: (code: string) => void;
    formatPrice: (amount: number) => string;
    getCurrencyInfo: () => Currency | undefined;

    // Language
    languageCode: string;
    setLanguage: (code: string) => void;
    t: (key: string) => string;
    getLanguageInfo: () => Language | undefined;
    getDirection: () => 'ltr' | 'rtl';
}

/**
 * Store for managing currency and language preferences
 * Persisted to localStorage under "rodix-locale"
 */
export const useLocaleStore = create<LocaleState>()(
    persist(
        (set, get) => ({
            // Currency
            currencyCode: DEFAULT_CURRENCY,
            setCurrency: (code: string) => set({ currencyCode: code }),
            formatPrice: (amount: number) => formatPriceUtil(amount, get().currencyCode),
            getCurrencyInfo: () => getCurrency(get().currencyCode),

            // Language
            languageCode: DEFAULT_LANGUAGE,
            setLanguage: (code: string) => {
                set({ languageCode: code });
                // Update document direction
                if (typeof document !== 'undefined') {
                    const lang = getLanguage(code);
                    document.documentElement.dir = lang?.dir || 'ltr';
                    document.documentElement.lang = code;
                }
            },
            t: (key: string) => translate(key, get().languageCode),
            getLanguageInfo: () => getLanguage(get().languageCode),
            getDirection: () => getLanguage(get().languageCode)?.dir || 'ltr',
        }),
        {
            name: 'rodix-locale',
            partialize: (state) => ({
                currencyCode: state.currencyCode,
                languageCode: state.languageCode,
            }),
        }
    )
);

// Hook to initialize direction on mount
export function useInitLocale() {
    const { languageCode } = useLocaleStore();

    if (typeof window !== 'undefined') {
        const lang = getLanguage(languageCode);
        document.documentElement.dir = lang?.dir || 'ltr';
        document.documentElement.lang = languageCode;
    }
}
