// 20+ World Languages with RTL support
export interface Language {
    code: string;
    name: string;
    nativeName: string;
    flag: string;
    dir: 'ltr' | 'rtl';
}

export const languages: Language[] = [
    // Major Languages
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', dir: 'ltr' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', dir: 'ltr' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', dir: 'ltr' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', dir: 'ltr' },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', dir: 'ltr' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', dir: 'ltr' },
    { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', dir: 'ltr' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', dir: 'ltr' },
    { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', dir: 'ltr' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' },
    { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', dir: 'ltr' },
    { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾', dir: 'ltr' },
    { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', dir: 'ltr' },
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', dir: 'ltr' },
    { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', dir: 'ltr' },
    { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦', dir: 'ltr' },

    // RTL Languages
    { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷', dir: 'rtl' },
    { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', dir: 'rtl' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', dir: 'rtl' },
];

// Get language by code
export function getLanguage(code: string): Language | undefined {
    return languages.find(l => l.code === code);
}

// Default language
export const DEFAULT_LANGUAGE = 'en';

// Translations
export const translations: Record<string, Record<string, string>> = {
    en: {
        // Navigation
        'nav.home': 'Home',
        'nav.products': 'Products',
        'nav.categories': 'Categories',
        'nav.cart': 'Cart',
        'nav.account': 'Account',
        'nav.login': 'Login',
        'nav.logout': 'Logout',
        'nav.register': 'Register',

        // Common
        'common.search': 'Search',
        'common.add_to_cart': 'Add to Cart',
        'common.buy_now': 'Buy Now',
        'common.price': 'Price',
        'common.quantity': 'Quantity',
        'common.total': 'Total',
        'common.subtotal': 'Subtotal',
        'common.shipping': 'Shipping',
        'common.checkout': 'Checkout',
        'common.continue_shopping': 'Continue Shopping',
        'common.view_all': 'View All',
        'common.loading': 'Loading...',
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.delete': 'Delete',
        'common.edit': 'Edit',
        'common.close': 'Close',

        // Product
        'product.description': 'Description',
        'product.reviews': 'Reviews',
        'product.in_stock': 'In Stock',
        'product.out_of_stock': 'Out of Stock',
        'product.add_review': 'Add Review',
        'product.related_products': 'Related Products',

        // Cart
        'cart.empty': 'Your cart is empty',
        'cart.items': 'items',
        'cart.remove': 'Remove',
        'cart.update': 'Update',

        // Checkout
        'checkout.shipping_info': 'Shipping Information',
        'checkout.payment_method': 'Payment Method',
        'checkout.order_summary': 'Order Summary',
        'checkout.place_order': 'Place Order',
        'checkout.full_name': 'Full Name',
        'checkout.email': 'Email',
        'checkout.phone': 'Phone',
        'checkout.address': 'Address',
        'checkout.city': 'City',
        'checkout.country': 'Country',

        // Footer
        'footer.about': 'About Us',
        'footer.contact': 'Contact',
        'footer.privacy': 'Privacy Policy',
        'footer.terms': 'Terms of Service',
        'footer.copyright': 'All rights reserved',
    },
    ar: {
        // Navigation
        'nav.home': 'الرئيسية',
        'nav.products': 'المنتجات',
        'nav.categories': 'التصنيفات',
        'nav.cart': 'السلة',
        'nav.account': 'حسابي',
        'nav.login': 'تسجيل الدخول',
        'nav.logout': 'تسجيل الخروج',
        'nav.register': 'إنشاء حساب',

        // Common
        'common.search': 'بحث',
        'common.add_to_cart': 'أضف للسلة',
        'common.buy_now': 'اشترِ الآن',
        'common.price': 'السعر',
        'common.quantity': 'الكمية',
        'common.total': 'المجموع',
        'common.subtotal': 'المجموع الفرعي',
        'common.shipping': 'الشحن',
        'common.checkout': 'إتمام الشراء',
        'common.continue_shopping': 'متابعة التسوق',
        'common.view_all': 'عرض الكل',
        'common.loading': 'جاري التحميل...',
        'common.save': 'حفظ',
        'common.cancel': 'إلغاء',
        'common.delete': 'حذف',
        'common.edit': 'تعديل',
        'common.close': 'إغلاق',

        // Product
        'product.description': 'الوصف',
        'product.reviews': 'التقييمات',
        'product.in_stock': 'متوفر',
        'product.out_of_stock': 'غير متوفر',
        'product.add_review': 'أضف تقييم',
        'product.related_products': 'منتجات مشابهة',

        // Cart
        'cart.empty': 'سلتك فارغة',
        'cart.items': 'منتجات',
        'cart.remove': 'إزالة',
        'cart.update': 'تحديث',

        // Checkout
        'checkout.shipping_info': 'معلومات الشحن',
        'checkout.payment_method': 'طريقة الدفع',
        'checkout.order_summary': 'ملخص الطلب',
        'checkout.place_order': 'إتمام الطلب',
        'checkout.full_name': 'الاسم الكامل',
        'checkout.email': 'البريد الإلكتروني',
        'checkout.phone': 'الهاتف',
        'checkout.address': 'العنوان',
        'checkout.city': 'المدينة',
        'checkout.country': 'الدولة',

        // Footer
        'footer.about': 'من نحن',
        'footer.contact': 'اتصل بنا',
        'footer.privacy': 'سياسة الخصوصية',
        'footer.terms': 'الشروط والأحكام',
        'footer.copyright': 'جميع الحقوق محفوظة',
    },
    fr: {
        // Navigation
        'nav.home': 'Accueil',
        'nav.products': 'Produits',
        'nav.categories': 'Catégories',
        'nav.cart': 'Panier',
        'nav.account': 'Mon compte',
        'nav.login': 'Connexion',
        'nav.logout': 'Déconnexion',
        'nav.register': 'Inscription',

        // Common
        'common.search': 'Rechercher',
        'common.add_to_cart': 'Ajouter au panier',
        'common.buy_now': 'Acheter maintenant',
        'common.price': 'Prix',
        'common.quantity': 'Quantité',
        'common.total': 'Total',
        'common.subtotal': 'Sous-total',
        'common.shipping': 'Livraison',
        'common.checkout': 'Commander',
        'common.continue_shopping': 'Continuer les achats',
        'common.view_all': 'Voir tout',
        'common.loading': 'Chargement...',
        'common.save': 'Enregistrer',
        'common.cancel': 'Annuler',
        'common.delete': 'Supprimer',
        'common.edit': 'Modifier',
        'common.close': 'Fermer',

        // Product
        'product.description': 'Description',
        'product.reviews': 'Avis',
        'product.in_stock': 'En stock',
        'product.out_of_stock': 'Rupture de stock',
        'product.add_review': 'Ajouter un avis',
        'product.related_products': 'Produits similaires',

        // Cart
        'cart.empty': 'Votre panier est vide',
        'cart.items': 'articles',
        'cart.remove': 'Supprimer',
        'cart.update': 'Mettre à jour',

        // Checkout
        'checkout.shipping_info': 'Informations de livraison',
        'checkout.payment_method': 'Mode de paiement',
        'checkout.order_summary': 'Récapitulatif',
        'checkout.place_order': 'Passer la commande',
        'checkout.full_name': 'Nom complet',
        'checkout.email': 'Email',
        'checkout.phone': 'Téléphone',
        'checkout.address': 'Adresse',
        'checkout.city': 'Ville',
        'checkout.country': 'Pays',

        // Footer
        'footer.about': 'À propos',
        'footer.contact': 'Contact',
        'footer.privacy': 'Politique de confidentialité',
        'footer.terms': 'Conditions générales',
        'footer.copyright': 'Tous droits réservés',
    },
};

// Get translation
export function t(key: string, lang: string = 'en'): string {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
}
