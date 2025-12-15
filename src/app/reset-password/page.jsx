'use client';

import styled from 'styled-components';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const ResetContainer = styled.div`
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const ResetCard = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 3rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  max-width: 450px;
  width: 100%;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
  margin-bottom: 1rem;
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  margin-bottom: 2rem;
  font-size: 0.95rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 600;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Button = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #d17834;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const LinkText = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 1rem;
`;

const Link = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    opacity: 0.8;
  }
`;

const SuccessMessage = styled.div`
  background-color: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 1rem;
`;

export default function ResetPasswordPage() {
    const router = useRouter();
    const { resetPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            toast.error('الرجاء إدخال البريد الإلكتروني');
            return;
        }

        setLoading(true);

        try {
            await resetPassword(email);
            setEmailSent(true);
            toast.success('✅ تم إرسال رابط إعادة تعيين كلمة المرور!');
        } catch (error) {
            console.error('Reset password error:', error);

            if (error.code === 'auth/user-not-found') {
                toast.error('البريد الإلكتروني غير مسجل');
            } else if (error.code === 'auth/invalid-email') {
                toast.error('البريد الإلكتروني غير صحيح');
            } else {
                toast.error('حدث خطأ. حاول مرة أخرى');
            }
        } finally {
            setLoading(false);
        }
    };

    if (emailSent) {
        return (
            <ResetContainer>
                <ResetCard>
                    <Title>✅ تم الإرسال!</Title>
                    <SuccessMessage>
                        تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.
                        <br /><br />
                        الرجاء التحقق من بريدك الإلكتروني واتباع التعليمات.
                    </SuccessMessage>

                    <LinkText>
                        <Link onClick={() => router.push('/login')}>
                            العودة لتسجيل الدخول
                        </Link>
                    </LinkText>
                </ResetCard>
            </ResetContainer>
        );
    }

    return (
        <ResetContainer>
            <ResetCard>
                <Title>نسيت كلمة المرور؟</Title>
                <Description>
                    أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور
                </Description>

                <Form onSubmit={handleSubmit}>
                    <FormGroup>
                        <Label>البريد الإلكتروني *</Label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@email.com"
                            required
                        />
                    </FormGroup>

                    <Button type="submit" disabled={loading}>
                        {loading ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين'}
                    </Button>
                </Form>

                <LinkText>
                    تذكرت كلمة المرور؟{' '}
                    <Link onClick={() => router.push('/login')}>
                        تسجيل الدخول
                    </Link>
                </LinkText>
            </ResetCard>
        </ResetContainer>
    );
}
