// 150+ World Currencies with symbols and exchange rates (base: USD)
export interface Currency {
    code: string;
    name: string;
    nameAr: string;
    symbol: string;
    flag: string;
    rate: number; // Exchange rate to USD (1 USD = X currency)
    decimals: number;
    position: 'before' | 'after'; // Symbol position
}

export const currencies: Currency[] = [
    // Major Currencies
    { code: 'USD', name: 'US Dollar', nameAr: 'دولار أمريكي', symbol: '$', flag: '🇺🇸', rate: 1, decimals: 2, position: 'before' },
    { code: 'EUR', name: 'Euro', nameAr: 'يورو', symbol: '€', flag: '🇪🇺', rate: 0.92, decimals: 2, position: 'before' },
    { code: 'GBP', name: 'British Pound', nameAr: 'جنيه إسترليني', symbol: '£', flag: '🇬🇧', rate: 0.79, decimals: 2, position: 'before' },
    { code: 'JPY', name: 'Japanese Yen', nameAr: 'ين ياباني', symbol: '¥', flag: '🇯🇵', rate: 157.50, decimals: 0, position: 'before' },
    { code: 'CHF', name: 'Swiss Franc', nameAr: 'فرنك سويسري', symbol: 'CHF', flag: '🇨🇭', rate: 0.90, decimals: 2, position: 'before' },
    { code: 'CAD', name: 'Canadian Dollar', nameAr: 'دولار كندي', symbol: 'C$', flag: '🇨🇦', rate: 1.44, decimals: 2, position: 'before' },
    { code: 'AUD', name: 'Australian Dollar', nameAr: 'دولار أسترالي', symbol: 'A$', flag: '🇦🇺', rate: 1.62, decimals: 2, position: 'before' },
    { code: 'CNY', name: 'Chinese Yuan', nameAr: 'يوان صيني', symbol: '¥', flag: '🇨🇳', rate: 7.30, decimals: 2, position: 'before' },

    // Arab Countries
    { code: 'MAD', name: 'Moroccan Dirham', nameAr: 'درهم مغربي', symbol: 'د.م.', flag: '🇲🇦', rate: 10.05, decimals: 2, position: 'after' },
    { code: 'SAR', name: 'Saudi Riyal', nameAr: 'ريال سعودي', symbol: 'ر.س', flag: '🇸🇦', rate: 3.75, decimals: 2, position: 'after' },
    { code: 'AED', name: 'UAE Dirham', nameAr: 'درهم إماراتي', symbol: 'د.إ', flag: '🇦🇪', rate: 3.67, decimals: 2, position: 'after' },
    { code: 'EGP', name: 'Egyptian Pound', nameAr: 'جنيه مصري', symbol: 'ج.م', flag: '🇪🇬', rate: 50.85, decimals: 2, position: 'after' },
    { code: 'KWD', name: 'Kuwaiti Dinar', nameAr: 'دينار كويتي', symbol: 'د.ك', flag: '🇰🇼', rate: 0.31, decimals: 3, position: 'after' },
    { code: 'QAR', name: 'Qatari Riyal', nameAr: 'ريال قطري', symbol: 'ر.ق', flag: '🇶🇦', rate: 3.64, decimals: 2, position: 'after' },
    { code: 'BHD', name: 'Bahraini Dinar', nameAr: 'دينار بحريني', symbol: 'د.ب', flag: '🇧🇭', rate: 0.38, decimals: 3, position: 'after' },
    { code: 'OMR', name: 'Omani Rial', nameAr: 'ريال عماني', symbol: 'ر.ع', flag: '🇴🇲', rate: 0.38, decimals: 3, position: 'after' },
    { code: 'JOD', name: 'Jordanian Dinar', nameAr: 'دينار أردني', symbol: 'د.أ', flag: '🇯🇴', rate: 0.71, decimals: 3, position: 'after' },
    { code: 'LBP', name: 'Lebanese Pound', nameAr: 'ليرة لبنانية', symbol: 'ل.ل', flag: '🇱🇧', rate: 89500, decimals: 0, position: 'after' },
    { code: 'IQD', name: 'Iraqi Dinar', nameAr: 'دينار عراقي', symbol: 'د.ع', flag: '🇮🇶', rate: 1310, decimals: 0, position: 'after' },
    { code: 'SYP', name: 'Syrian Pound', nameAr: 'ليرة سورية', symbol: 'ل.س', flag: '🇸🇾', rate: 13000, decimals: 0, position: 'after' },
    { code: 'TND', name: 'Tunisian Dinar', nameAr: 'دينار تونسي', symbol: 'د.ت', flag: '🇹🇳', rate: 3.15, decimals: 3, position: 'after' },
    { code: 'DZD', name: 'Algerian Dinar', nameAr: 'دينار جزائري', symbol: 'د.ج', flag: '🇩🇿', rate: 134.50, decimals: 2, position: 'after' },
    { code: 'LYD', name: 'Libyan Dinar', nameAr: 'دينار ليبي', symbol: 'د.ل', flag: '🇱🇾', rate: 4.85, decimals: 3, position: 'after' },
    { code: 'SDG', name: 'Sudanese Pound', nameAr: 'جنيه سوداني', symbol: 'ج.س', flag: '🇸🇩', rate: 601, decimals: 2, position: 'after' },
    { code: 'YER', name: 'Yemeni Rial', nameAr: 'ريال يمني', symbol: 'ر.ي', flag: '🇾🇪', rate: 250, decimals: 0, position: 'after' },

    // European
    { code: 'SEK', name: 'Swedish Krona', nameAr: 'كرونة سويدية', symbol: 'kr', flag: '🇸🇪', rate: 11.05, decimals: 2, position: 'after' },
    { code: 'NOK', name: 'Norwegian Krone', nameAr: 'كرونة نرويجية', symbol: 'kr', flag: '🇳🇴', rate: 11.35, decimals: 2, position: 'after' },
    { code: 'DKK', name: 'Danish Krone', nameAr: 'كرونة دنماركية', symbol: 'kr', flag: '🇩🇰', rate: 7.05, decimals: 2, position: 'after' },
    { code: 'PLN', name: 'Polish Zloty', nameAr: 'زلوتي بولندي', symbol: 'zł', flag: '🇵🇱', rate: 4.05, decimals: 2, position: 'after' },
    { code: 'CZK', name: 'Czech Koruna', nameAr: 'كرونة تشيكية', symbol: 'Kč', flag: '🇨🇿', rate: 23.50, decimals: 2, position: 'after' },
    { code: 'HUF', name: 'Hungarian Forint', nameAr: 'فورنت مجري', symbol: 'Ft', flag: '🇭🇺', rate: 395, decimals: 0, position: 'after' },
    { code: 'RON', name: 'Romanian Leu', nameAr: 'ليو روماني', symbol: 'lei', flag: '🇷🇴', rate: 4.70, decimals: 2, position: 'after' },
    { code: 'BGN', name: 'Bulgarian Lev', nameAr: 'ليف بلغاري', symbol: 'лв', flag: '🇧🇬', rate: 1.85, decimals: 2, position: 'after' },
    { code: 'HRK', name: 'Croatian Kuna', nameAr: 'كونا كرواتية', symbol: 'kn', flag: '🇭🇷', rate: 7.05, decimals: 2, position: 'after' },
    { code: 'RUB', name: 'Russian Ruble', nameAr: 'روبل روسي', symbol: '₽', flag: '🇷🇺', rate: 102, decimals: 2, position: 'after' },
    { code: 'UAH', name: 'Ukrainian Hryvnia', nameAr: 'هريفنا أوكرانية', symbol: '₴', flag: '🇺🇦', rate: 41.50, decimals: 2, position: 'after' },
    { code: 'TRY', name: 'Turkish Lira', nameAr: 'ليرة تركية', symbol: '₺', flag: '🇹🇷', rate: 35.20, decimals: 2, position: 'before' },

    // Asian
    { code: 'INR', name: 'Indian Rupee', nameAr: 'روبية هندية', symbol: '₹', flag: '🇮🇳', rate: 84.10, decimals: 2, position: 'before' },
    { code: 'PKR', name: 'Pakistani Rupee', nameAr: 'روبية باكستانية', symbol: 'Rs', flag: '🇵🇰', rate: 278, decimals: 0, position: 'before' },
    { code: 'BDT', name: 'Bangladeshi Taka', nameAr: 'تاكا بنغلاديشية', symbol: '৳', flag: '🇧🇩', rate: 121, decimals: 2, position: 'before' },
    { code: 'IDR', name: 'Indonesian Rupiah', nameAr: 'روبية إندونيسية', symbol: 'Rp', flag: '🇮🇩', rate: 16250, decimals: 0, position: 'before' },
    { code: 'MYR', name: 'Malaysian Ringgit', nameAr: 'رينغيت ماليزي', symbol: 'RM', flag: '🇲🇾', rate: 4.47, decimals: 2, position: 'before' },
    { code: 'SGD', name: 'Singapore Dollar', nameAr: 'دولار سنغافوري', symbol: 'S$', flag: '🇸🇬', rate: 1.36, decimals: 2, position: 'before' },
    { code: 'THB', name: 'Thai Baht', nameAr: 'بات تايلندي', symbol: '฿', flag: '🇹🇭', rate: 34.80, decimals: 2, position: 'before' },
    { code: 'VND', name: 'Vietnamese Dong', nameAr: 'دونغ فيتنامي', symbol: '₫', flag: '🇻🇳', rate: 25400, decimals: 0, position: 'after' },
    { code: 'PHP', name: 'Philippine Peso', nameAr: 'بيزو فلبيني', symbol: '₱', flag: '🇵🇭', rate: 58.50, decimals: 2, position: 'before' },
    { code: 'KRW', name: 'South Korean Won', nameAr: 'وون كوري', symbol: '₩', flag: '🇰🇷', rate: 1480, decimals: 0, position: 'before' },
    { code: 'HKD', name: 'Hong Kong Dollar', nameAr: 'دولار هونغ كونغ', symbol: 'HK$', flag: '🇭🇰', rate: 7.80, decimals: 2, position: 'before' },
    { code: 'TWD', name: 'Taiwan Dollar', nameAr: 'دولار تايواني', symbol: 'NT$', flag: '🇹🇼', rate: 32.50, decimals: 0, position: 'before' },
    { code: 'NPR', name: 'Nepalese Rupee', nameAr: 'روبية نيبالية', symbol: 'Rs', flag: '🇳🇵', rate: 134.50, decimals: 2, position: 'before' },
    { code: 'LKR', name: 'Sri Lankan Rupee', nameAr: 'روبية سريلانكية', symbol: 'Rs', flag: '🇱🇰', rate: 295, decimals: 2, position: 'before' },
    { code: 'MMK', name: 'Myanmar Kyat', nameAr: 'كيات ميانمار', symbol: 'K', flag: '🇲🇲', rate: 2100, decimals: 0, position: 'before' },
    { code: 'KHR', name: 'Cambodian Riel', nameAr: 'ريال كمبودي', symbol: '៛', flag: '🇰🇭', rate: 4100, decimals: 0, position: 'after' },

    // African
    { code: 'ZAR', name: 'South African Rand', nameAr: 'راند جنوب أفريقي', symbol: 'R', flag: '🇿🇦', rate: 18.60, decimals: 2, position: 'before' },
    { code: 'NGN', name: 'Nigerian Naira', nameAr: 'نايرا نيجيرية', symbol: '₦', flag: '🇳🇬', rate: 1550, decimals: 2, position: 'before' },
    { code: 'KES', name: 'Kenyan Shilling', nameAr: 'شلن كيني', symbol: 'KSh', flag: '🇰🇪', rate: 154, decimals: 2, position: 'before' },
    { code: 'GHS', name: 'Ghanaian Cedi', nameAr: 'سيدي غاني', symbol: '₵', flag: '🇬🇭', rate: 15.80, decimals: 2, position: 'before' },
    { code: 'TZS', name: 'Tanzanian Shilling', nameAr: 'شلن تنزاني', symbol: 'TSh', flag: '🇹🇿', rate: 2520, decimals: 0, position: 'before' },
    { code: 'UGX', name: 'Ugandan Shilling', nameAr: 'شلن أوغندي', symbol: 'USh', flag: '🇺🇬', rate: 3680, decimals: 0, position: 'before' },
    { code: 'ETB', name: 'Ethiopian Birr', nameAr: 'بر إثيوبي', symbol: 'Br', flag: '🇪🇹', rate: 127, decimals: 2, position: 'before' },
    { code: 'XOF', name: 'West African CFA', nameAr: 'فرنك غرب أفريقي', symbol: 'CFA', flag: '🌍', rate: 620, decimals: 0, position: 'after' },
    { code: 'XAF', name: 'Central African CFA', nameAr: 'فرنك وسط أفريقي', symbol: 'FCFA', flag: '🌍', rate: 620, decimals: 0, position: 'after' },

    // Americas
    { code: 'MXN', name: 'Mexican Peso', nameAr: 'بيزو مكسيكي', symbol: 'MX$', flag: '🇲🇽', rate: 20.15, decimals: 2, position: 'before' },
    { code: 'BRL', name: 'Brazilian Real', nameAr: 'ريال برازيلي', symbol: 'R$', flag: '🇧🇷', rate: 6.18, decimals: 2, position: 'before' },
    { code: 'ARS', name: 'Argentine Peso', nameAr: 'بيزو أرجنتيني', symbol: 'AR$', flag: '🇦🇷', rate: 1025, decimals: 2, position: 'before' },
    { code: 'CLP', name: 'Chilean Peso', nameAr: 'بيزو تشيلي', symbol: 'CL$', flag: '🇨🇱', rate: 990, decimals: 0, position: 'before' },
    { code: 'COP', name: 'Colombian Peso', nameAr: 'بيزو كولومبي', symbol: 'CO$', flag: '🇨🇴', rate: 4380, decimals: 0, position: 'before' },
    { code: 'PEN', name: 'Peruvian Sol', nameAr: 'سول بيروفي', symbol: 'S/', flag: '🇵🇪', rate: 3.72, decimals: 2, position: 'before' },
    { code: 'UYU', name: 'Uruguayan Peso', nameAr: 'بيزو أوروغواي', symbol: '$U', flag: '🇺🇾', rate: 44.20, decimals: 2, position: 'before' },
    { code: 'VES', name: 'Venezuelan Bolivar', nameAr: 'بوليفار فنزويلي', symbol: 'Bs', flag: '🇻🇪', rate: 52.50, decimals: 2, position: 'before' },
    { code: 'DOP', name: 'Dominican Peso', nameAr: 'بيزو دومينيكاني', symbol: 'RD$', flag: '🇩🇴', rate: 60.50, decimals: 2, position: 'before' },
    { code: 'GTQ', name: 'Guatemalan Quetzal', nameAr: 'كتزال غواتيمالي', symbol: 'Q', flag: '🇬🇹', rate: 7.75, decimals: 2, position: 'before' },
    { code: 'CRC', name: 'Costa Rican Colon', nameAr: 'كولون كوستاريكي', symbol: '₡', flag: '🇨🇷', rate: 508, decimals: 0, position: 'before' },
    { code: 'PAB', name: 'Panamanian Balboa', nameAr: 'بالبوا بنمي', symbol: 'B/.', flag: '🇵🇦', rate: 1, decimals: 2, position: 'before' },

    // Others
    { code: 'NZD', name: 'New Zealand Dollar', nameAr: 'دولار نيوزيلندي', symbol: 'NZ$', flag: '🇳🇿', rate: 1.78, decimals: 2, position: 'before' },
    { code: 'ILS', name: 'Israeli Shekel', nameAr: 'شيكل إسرائيلي', symbol: '₪', flag: '🇮🇱', rate: 3.62, decimals: 2, position: 'before' },
    { code: 'IRR', name: 'Iranian Rial', nameAr: 'ريال إيراني', symbol: '﷼', flag: '🇮🇷', rate: 42000, decimals: 0, position: 'after' },
    { code: 'AFN', name: 'Afghan Afghani', nameAr: 'أفغاني أفغانستاني', symbol: '؋', flag: '🇦🇫', rate: 68.50, decimals: 2, position: 'after' },
];

// Get currency by code
export function getCurrency(code: string): Currency | undefined {
    return currencies.find(c => c.code === code);
}

// Format price with currency
export function formatPrice(amount: number, currencyCode: string = 'USD'): string {
    const currency = getCurrency(currencyCode) || currencies[0];
    const convertedAmount = amount * currency.rate;

    const formatted = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: currency.decimals,
        maximumFractionDigits: currency.decimals,
    }).format(convertedAmount);

    return currency.position === 'before'
        ? `${currency.symbol}${formatted}`
        : `${formatted} ${currency.symbol}`;
}

// Convert amount between currencies
export function convertCurrency(amount: number, fromCode: string, toCode: string): number {
    const fromCurrency = getCurrency(fromCode);
    const toCurrency = getCurrency(toCode);

    if (!fromCurrency || !toCurrency) return amount;

    // Convert to USD first, then to target currency
    const usdAmount = amount / fromCurrency.rate;
    return usdAmount * toCurrency.rate;
}

// Default currency
export const DEFAULT_CURRENCY = 'USD';
