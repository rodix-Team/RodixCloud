'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export default function ProtectedRoute({ children }) {
    const { currentUser, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !currentUser) {
            router.push('/login');
        }
    }, [currentUser, loading, router]);

    if (loading) {
        return <LoadingContainer>جاري التحميل...</LoadingContainer>;
    }

    if (!currentUser) {
        return null;
    }

    return children;
}
