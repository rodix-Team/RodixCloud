import { Inter } from 'next/font/google';
import StyledComponentsRegistry from '../../lib/StyledComponentsRegistry';
import ReduxProvider from '../redux/provider';
import { AuthProvider } from '../contexts/AuthContext';
import Header from './components/Header';
import EmailVerificationBanner from './components/EmailVerificationBanner';
import CartSyncProvider from './components/CartSyncProvider';
import Footer from './components/Footer';
import AIChatbot from './components/AIChatbot';
import GlobalStyles from '../styles/GlobalStyles';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'متجر العسل الذهبي - تارودانت',
  description: 'أجود أنواع العسل الحر المغربي من منطقة سوس ماسة، توصيل لجميع المدن.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ReduxProvider>
          <AuthProvider>
            <CartSyncProvider>
              <StyledComponentsRegistry>
                <GlobalStyles />
                <Toaster
                  position="top-center"
                  reverseOrder={false}
                  toastOptions={{
                    duration: 3000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                      fontSize: '16px',
                      padding: '16px',
                      borderRadius: '8px',
                    },
                    success: {
                      iconTheme: {
                        primary: '#10b981',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                      },
                    },
                  }}
                />
                <Header />
                <EmailVerificationBanner />
                <main>{children}</main>
                <Footer />
                <AIChatbot />
              </StyledComponentsRegistry>
            </CartSyncProvider>
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}