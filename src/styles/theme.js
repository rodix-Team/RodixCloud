// 🎨 نظام تصميم احترافي متكامل لمتجر العسل

const colors = {
    // الألوان الأساسية
    primary: '#F4A300',
    primaryDark: '#D68910',
    primaryLight: '#FFB82E',

    // الألوان الثانوية
    secondary: '#8B4513',
    secondaryDark: '#6B3410',
    secondaryLight: '#A0522D',

    // ألوان طبيعية
    honey: '#FDB813',
    amber: '#FFBF00',
    cream: '#FFF8DC',

    // ألوان النصوص
    textPrimary: '#2C2C2C',
    textSecondary: '#666666',
    textLight: '#999999',

    // ألوان الخلفيات
    background: '#FFFFFF',
    backgroundLight: '#FAFAFA',
    backgroundDark: '#F5F5F5',

    // ألوان الحالة
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
    info: '#2196F3',

    // ألوان إضافية
    white: '#FFFFFF',
    black: '#000000',
    dark: '#1A1A1A',
    light: '#F8F8F8',

    // ألوان شفافة
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
    overlayDark: 'rgba(0, 0, 0, 0.7)',
};

const gradients = {
    primary: 'linear-gradient(135deg, #F4A300 0%, #FFB82E 100%)',
    secondary: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
    honey: 'linear-gradient(135deg, #FDB813 0%, #FFBF00 100%)',
    warm: 'linear-gradient(135deg, #F4A300 0%, #FF6B35 100%)',
    gold: 'linear-gradient(135deg, #FFD700 0%, #F4A300 50%, #D68910 100%)',
};

const shadows = {
    sm: '0 2px 4px rgba(0, 0, 0, 0.08)',
    md: '0 4px 8px rgba(0, 0, 0, 0.12)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.15)',
    xl: '0 12px 24px rgba(0, 0, 0, 0.18)',
    primaryGlow: '0 4px 20px rgba(244, 163, 0, 0.3)',
};

const spacing = {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
};

const fonts = {
    primary: '"Cairo", "Tajawal", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    sizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
    },
    weights: {
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
    },
};

const breakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
};

const borders = {
    radius: {
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        full: '9999px',
    },
};

const transitions = {
    fast: '150ms ease-in-out',
    base: '250ms ease-in-out',
    slow: '350ms ease-in-out',
};

export const theme = {
    colors,
    gradients,
    shadows,
    spacing,
    fonts,
    breakpoints,
    borders,
    transitions,
};
