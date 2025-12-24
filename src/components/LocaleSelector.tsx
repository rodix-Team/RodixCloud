"use client";

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe, DollarSign } from 'lucide-react';
import { useLocaleStore } from '@/store/locale-store';
import { currencies } from '@/lib/currencies';
import { languages } from '@/lib/languages';

// Currency Selector Component
export function CurrencySelector({ compact = false }: { compact?: boolean }) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { currencyCode, setCurrency, getCurrencyInfo } = useLocaleStore();
    const currentCurrency = getCurrencyInfo();

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter currencies
    const filteredCurrencies = currencies.filter(c =>
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.nameAr.includes(search)
    );

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-neutral-800/50 hover:bg-neutral-700/50 rounded-lg transition-colors text-sm"
            >
                <span className="text-lg">{currentCurrency?.flag}</span>
                {!compact && <span className="text-neutral-200">{currencyCode}</span>}
                <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-neutral-900 border border-neutral-700 rounded-xl shadow-xl z-50 overflow-hidden">
                    {/* Search */}
                    <div className="p-3 border-b border-neutral-700">
                        <input
                            type="text"
                            placeholder="Search currency..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                    </div>

                    {/* Currency List */}
                    <div className="max-h-64 overflow-y-auto">
                        {filteredCurrencies.map((currency) => (
                            <button
                                key={currency.code}
                                onClick={() => {
                                    setCurrency(currency.code);
                                    setIsOpen(false);
                                    setSearch('');
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-800 transition-colors ${currencyCode === currency.code ? 'bg-emerald-500/10' : ''
                                    }`}
                            >
                                <span className="text-xl">{currency.flag}</span>
                                <div className="flex-1 text-left">
                                    <p className="text-sm font-medium text-neutral-200">{currency.code}</p>
                                    <p className="text-xs text-neutral-500">{currency.name}</p>
                                </div>
                                <span className="text-sm text-neutral-400">{currency.symbol}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Language Selector Component
export function LanguageSelector({ compact = false }: { compact?: boolean }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { languageCode, setLanguage, getLanguageInfo } = useLocaleStore();
    const currentLanguage = getLanguageInfo();

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-neutral-800/50 hover:bg-neutral-700/50 rounded-lg transition-colors text-sm"
            >
                <span className="text-lg">{currentLanguage?.flag}</span>
                {!compact && <span className="text-neutral-200">{currentLanguage?.nativeName}</span>}
                <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-neutral-900 border border-neutral-700 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="max-h-80 overflow-y-auto">
                        {languages.map((language) => (
                            <button
                                key={language.code}
                                onClick={() => {
                                    setLanguage(language.code);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-800 transition-colors ${languageCode === language.code ? 'bg-emerald-500/10' : ''
                                    }`}
                            >
                                <span className="text-xl">{language.flag}</span>
                                <div className="flex-1 text-left">
                                    <p className="text-sm font-medium text-neutral-200">{language.nativeName}</p>
                                    <p className="text-xs text-neutral-500">{language.name}</p>
                                </div>
                                {language.dir === 'rtl' && (
                                    <span className="text-xs px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded">RTL</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Combined Locale Selector (Currency + Language)
export function LocaleSelector() {
    return (
        <div className="flex items-center gap-2">
            <CurrencySelector />
            <LanguageSelector />
        </div>
    );
}
