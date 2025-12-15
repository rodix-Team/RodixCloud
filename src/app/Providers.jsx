// 🚨 هاد السطر ضروري هنا باش يخدم Context ديال Styled Components 🚨
'use client'; 

import { ThemeProvider } from "styled-components";
import StyledComponentsRegistry from '../../lib/StyledComponentsRegistry';
import { theme } from "../styles/theme";
import { CartProvider } from "./context/CartContext";

// هاد الـ Component غادي يجمع كلشي لي كيحتاج 'use client'
export default function Providers({ children }) {
  return (
    <StyledComponentsRegistry>
      <ThemeProvider theme={theme}>
        {/* 🚨 هنا كنديرو الـ Provider لي غادي يخلي العربة تخدم في جميع الصفحات 🚨 */}
        <CartProvider>
          {children}
        </CartProvider>
      </ThemeProvider>
    </StyledComponentsRegistry>
  );
}