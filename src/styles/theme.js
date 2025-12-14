// 🎨 نظام تصميم احترافي متكامل لمتجر العسل

// ====================================
// 1. نظام الألوان الاحترافي
// ====================================
const colors = {
  // الألوان الأساسية - Primary Colors
  primary: '#F4A300',        // ذهبي عسلي مشرق
  primaryDark: '#D68910',    // ذهبي داكن
  primaryLight: '#FFB82E',   // ذهبي فاتح

  // الألوان الثانوية - Secondary Colors
  secondary: '#8B4513',      // بني طبيعي
  secondaryDark: '#6B3410',  // بني داكن
  secondaryLight: '#A0522D', // بني فاتح

  // ألوان طبيعية إضافية
  honey: '#FDB813',          // لون العسل الطبيعي
  amber: '#FFBF00',          // كهرماني
  cream: '#FFF8DC',          // كريمي

  // ألوان النصوص
  textPrimary: '#2C2C2C',    // نص رئيسي
  textSecondary: '#666666',  // نص ثانوي
  textLight: '#999999',      // نص فاتح

  // ألوان الخلفيات
  background: '#FFFFFF',     // خلفية بيضاء
  backgroundLight: '#FAFAFA', // خلفية فاتحة جداً
  backgroundDark: '#F5F5F5', // خلفية رمادية فاتحة

  // ألوان الحالة - Status Colors
  success: '#4CAF50',        // نجاح (أخضر)
  error: '#F44336',          // خطأ (أحمر)
  warning: '#FF9800',        // تحذير (برتقالي)
  info: '#2196F3',           // معلومات (أزرق)

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

// ====================================
// 2. التدرجات اللونية - Gradients
// ====================================
const gradients = {
  primary: 'linear-gradient(135deg, #F4A300 0%, #FFB82E 100%)',
  secondary: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
  honey: 'linear-gradient(135deg, #FDB813 0%, #FFBF00 100%)',
  warm: 'linear-gradient(135deg, #F4A300 0%, #FF6B35 100%)',
  sunset: 'linear-gradient(135deg, #FFB82E 0%, #FF6B35 50%, #8B4513 100%)',
  gold: 'linear-gradient(135deg, #FFD700 0%, #F4A300 50%, #D68910 100%)',
  overlay: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)',
};

// ====================================
// 3. الظلال - Shadows
// ====================================
const shadows = {
  none: 'none',
  xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
  sm: '0 2px 4px rgba(0, 0, 0, 0.08)',
  md: '0 4px 8px rgba(0, 0, 0, 0.12)',
  lg: '0 8px 16px rgba(0, 0, 0, 0.15)',
  xl: '0 12px 24px rgba(0, 0, 0, 0.18)',
  '2xl': '0 16px 32px rgba(0, 0, 0, 0.2)',

  // ظلال ملونة
  primaryGlow: '0 4px 20px rgba(244, 163, 0, 0.3)',
  secondaryGlow: '0 4px 20px rgba(139, 69, 19, 0.3)',

  // ظلال داخلية
  inset: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
};

// ====================================
// 4. المسافات - Spacing
// ====================================
const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
  '4xl': '6rem',    // 96px
  '5xl': '8rem',    // 128px
};

// ====================================
// 5. الخطوط - Fonts
// ====================================
const fonts = {
  // خطوط عربية احترافية
  primary: '"Cairo", "Tajawal", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  secondary: '"Tajawal", "Cairo", sans-serif',
  heading: '"Cairo", "Tajawal", serif',

  // أحجام الخطوط
  sizes: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
  },

  // أوزان الخطوط
  weights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
};

// ====================================
// 6. نقاط التوقف - Breakpoints
// ====================================
const breakpoints = {
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// ====================================
// 7. الحدود - Borders
// ====================================
const borders = {
  radius: {
    none: '0',
    sm: '0.25rem',    // 4px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
    full: '9999px',   // دائري كامل
  },

  width: {
    none: '0',
    thin: '1px',
    medium: '2px',
    thick: '4px',
  },
};

// ====================================
// 8. الانتقالات والحركات - Transitions
// ====================================
const transitions = {
  fast: '150ms ease-in-out',
  base: '250ms ease-in-out',
  slow: '350ms ease-in-out',
  slower: '500ms ease-in-out',

  // أنواع الانتقالات
  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
};

// ====================================
// 9. الأنيميشنز - Animations
// ====================================
const animations = {
  fadeIn: 'fadeIn 0.5s ease-in-out',
  fadeOut: 'fadeOut 0.5s ease-in-out',
  slideUp: 'slideUp 0.5s ease-out',
  slideDown: 'slideDown 0.5s ease-out',
  scaleUp: 'scaleUp 0.3s ease-out',
  bounce: 'bounce 1s infinite',
  pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
};

// ====================================
// 10. Z-Index - الطبقات
// ====================================
const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};

// ====================================
// التصدير النهائي
// ====================================
export const theme = {
  colors,
  gradients,
  shadows,
  spacing,
  fonts,
  breakpoints,
  borders,
  transitions,
  animations,
  zIndex,
};