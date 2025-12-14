'use client';
import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  /* ====================================
     استيراد الخطوط العربية من Google Fonts
     ==================================== */
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Tajawal:wght@300;400;500;700;800;900&display=swap');

  /* ====================================
     إعادة تعيين أساسية
     ==================================== */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  /* ====================================
     تنسيقات الجسم الرئيسية
     ==================================== */
  html {
    scroll-behavior: smooth;
    font-size: 16px;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: ${({ theme }) => theme.fonts.primary};
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.textPrimary};
    direction: rtl;
    text-align: right;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }

  /* ====================================
     تنسيقات النصوص
     ==================================== */
  h1, h2, h3, h4, h5, h6 {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-weight: ${({ theme }) => theme.fonts.weights.bold};
    line-height: 1.2;
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  h1 {
    font-size: ${({ theme }) => theme.fonts.sizes['5xl']};
    font-weight: ${({ theme }) => theme.fonts.weights.black};
  }

  h2 {
    font-size: ${({ theme }) => theme.fonts.sizes['4xl']};
  }

  h3 {
    font-size: ${({ theme }) => theme.fonts.sizes['3xl']};
  }

  p {
    margin-bottom: 1rem;
    line-height: 1.8;
  }

  /* ====================================
     تنسيقات الروابط
     ==================================== */
  a {
    text-decoration: none;
    color: inherit;
    transition: ${({ theme }) => theme.transitions.base};
    
    &:hover {
      color: ${({ theme }) => theme.colors.primary};
    }
  }

  /* ====================================
     تنسيقات الأزرار
     ==================================== */
  button {
    font-family: ${({ theme }) => theme.fonts.primary};
    cursor: pointer;
    border: none;
    outline: none;
    transition: ${({ theme }) => theme.transitions.base};
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  /* ====================================
     تنسيقات الصور
     ==================================== */
  img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  /* ====================================
     تنسيقات القوائم
     ==================================== */
  ul, ol {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  /* ====================================
     شريط التمرير المخصص
     ==================================== */
  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.backgroundLight};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.primary};
    border-radius: ${({ theme }) => theme.borders.radius.full};
    
    &:hover {
      background: ${({ theme }) => theme.colors.primaryDark};
    }
  }

  /* ====================================
     الأنيميشنز - Keyframes
     ==================================== */
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  @keyframes slideUp {
    from {
      transform: translateY(30px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideDown {
    from {
      transform: translateY(-30px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes scaleUp {
    from {
      transform: scale(0.9);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }

  /* ====================================
     تنسيقات الاستجابة للشاشات الصغيرة
     ==================================== */
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    html {
      font-size: 14px;
    }

    h1 {
      font-size: ${({ theme }) => theme.fonts.sizes['3xl']};
    }

    h2 {
      font-size: ${({ theme }) => theme.fonts.sizes['2xl']};
    }

    h3 {
      font-size: ${({ theme }) => theme.fonts.sizes.xl};
    }

    input, select, textarea {
      font-size: 16px !important;
    }
  }

  /* ====================================
     تنسيقات الطباعة
     ==================================== */
  @media print {
    body {
      background: white;
      color: black;
    }
  }

  /* ====================================
     تنسيقات إضافية للتحسين
     ==================================== */
  ::selection {
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
  }

  :focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

export default GlobalStyles;