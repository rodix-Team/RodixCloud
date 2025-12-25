'use client';

import { ThemeProvider } from 'styled-components';
import { Toaster } from 'react-hot-toast';
import StyledComponentsRegistry from '@/lib/StyledComponentsRegistry';
import ReduxProvider from '@/redux/provider';
import { theme } from '@/styles/theme';
import GlobalStyles from '@/styles/GlobalStyles';
import StoreHeader from './components/StoreHeader';
import StoreFooter from './components/StoreFooter';
import AIChatbot from '@/app/components/AIChatbot';

export default function StoreLayout({ children }) {
    return (
        <ReduxProvider>
            <StyledComponentsRegistry>
                <ThemeProvider theme={theme}>
                    <GlobalStyles />
                    <Toaster
                        position="top-center"
                        toastOptions={{
                            duration: 3000,
                            style: {
                                background: '#363636',
                                color: '#fff',
                                fontSize: '16px',
                                padding: '16px',
                                borderRadius: '8px',
                            },
                        }}
                    />
                    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                        <StoreHeader />
                        <main style={{ flex: 1 }}>{children}</main>
                        <StoreFooter />
                    </div>
                    {/* البوت الذكي */}
                    <AIChatbot />
                </ThemeProvider>
            </StyledComponentsRegistry>
        </ReduxProvider>
    );
}
