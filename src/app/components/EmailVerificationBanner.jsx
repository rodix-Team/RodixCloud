'use client';

import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const BannerContainer = styled.div`
  background: linear-gradient(135deg, #FFA726 0%, #FF9800 100%);
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
`;

const Message = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Icon = styled.span`
  font-size: 1.5rem;
`;

const Text = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const Title = styled.strong`
  font-size: 1rem;
`;

const Description = styled.span`
  font-size: 0.9rem;
  opacity: 0.95;
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const Button = styled.button`
  background: white;
  color: #FF9800;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: #f5f5f5;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  opacity: 0.8;
  transition: opacity 0.3s;

  &:hover {
    opacity: 1;
  }
`;

const DISMISS_KEY = 'emailVerificationBannerDismissed';

export default function EmailVerificationBanner() {
    const { currentUser, resendVerification } = useAuth();
    const [isDismissed, setIsDismissed] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Check if banner was dismissed
        const dismissed = localStorage.getItem(DISMISS_KEY);
        if (dismissed === 'true') {
            setIsDismissed(true);
        }
    }, []);

    const handleResend = async () => {
        setLoading(true);
        try {
            await resendVerification();
            toast.success('✅ تم إرسال رابط التفعيل! تحقق من بريدك الإلكتروني');
        } catch (error) {
            console.error('Resend verification error:', error);

            if (error.code === 'auth/too-many-requests') {
                toast.error('تم إرسال الكثير من الطلبات. حاول مرة أخرى لاحقاً');
            } else {
                toast.error('فشل إرسال رابط التفعيل');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDismiss = () => {
        localStorage.setItem(DISMISS_KEY, 'true');
        setIsDismissed(true);
    };

    // Don't show banner if:
    // - User not authenticated
    // - Email already verified
    // - Banner was dismissed
    if (!currentUser || currentUser.emailVerified || isDismissed) {
        return null;
    }

    return (
        <BannerContainer>
            <Message>
                <Icon>📧</Icon>
                <Text>
                    <Title>تفعيل البريد الإلكتروني مطلوب</Title>
                    <Description>
                        الرجاء تفعيل بريدك الإلكتروني للوصول إلى جميع الميزات
                    </Description>
                </Text>
            </Message>

            <Actions>
                <Button onClick={handleResend} disabled={loading}>
                    {loading ? 'جاري الإرسال...' : '📤 إعادة إرسال'}
                </Button>
                <CloseButton onClick={handleDismiss} title="إخفاء">
                    ✕
                </CloseButton>
            </Actions>
        </BannerContainer>
    );
}
