'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const LoginContainer = styled.div`
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #FFF8E1 0%, #FFF 100%);

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const LoginCard = styled.div`
  background-color: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  max-width: 450px;
  width: 100%;
  border: 1px solid rgba(244, 163, 0, 0.1);

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
    border-radius: 16px;
  }
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;

  @media (max-width: 768px) {
    font-size: 1.6rem;
    margin-bottom: 1.5rem;
  }
`;

const SocialButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const SocialButton = styled.button`
  width: 100%;
  padding: 0.9rem;
  background: ${({ $bgColor }) => $bgColor || 'white'};
  color: ${({ $textColor }) => $textColor || '#333'};
  border: ${({ $border }) => $border || '1px solid #ddd'};
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    padding: 0.85rem;
    font-size: 0.95rem;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;

  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid #ddd;
  }

  &::before {
    margin-left: 0.5rem;
  }

  &::after {
    margin-right: 0.5rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 600;
  font-size: 0.95rem;
`;

const Input = styled.input`
  padding: 0.9rem 1rem;
  border: 2px solid #eee;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s;
  background: #fafafa;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    background: white;
    box-shadow: 0 0 0 3px rgba(244, 163, 0, 0.1);
  }

  @media (max-width: 768px) {
    padding: 0.85rem;
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, #FFB82E 100%);
  color: white;
  border: none;
  padding: 1.1rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(244, 163, 0, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(244, 163, 0, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    padding: 1rem;
    font-size: 1.05rem;
  }
`;

const LinkText = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 1rem;
  font-size: 0.95rem;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const Link = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  text-decoration: none;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;

export default function LoginPage() {
  const router = useRouter();
  const { login, signInWithGoogle, signInWithFacebook } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success('✅ تم تسجيل الدخول بواسطة Google!');
      router.push('/profile');
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast.error('❌ فشل تسجيل الدخول بـ Google');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setLoading(true);
    try {
      await signInWithFacebook();
      toast.success('✅ تم تسجيل الدخول بواسطة Facebook!');
      router.push('/profile');
    } catch (error) {
      console.error('Facebook sign-in error:', error);
      if (error.code === 'auth/account-exists-with-different-credential') {
        toast.error('البريد الإلكتروني مستخدم بطريقة تسجيل أخرى');
      } else {
        toast.error('❌ فشل تسجيل الدخول بـ Facebook');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error('الرجاء ملء جميع الحقول');
      return;
    }

    setLoading(true);

    try {
      await login(formData.email, formData.password);
      toast.success('✅ تم تسجيل الدخول بنجاح!');
      router.push('/profile');
    } catch (error) {
      console.error('Login error:', error);

      if (error.code === 'auth/user-not-found') {
        toast.error('البريد الإلكتروني غير مسجل');
      } else if (error.code === 'auth/wrong-password') {
        toast.error('كلمة المرور غير صحيحة');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('البريد الإلكتروني غير صحيح');
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('محاولات كثيرة. حاول بعد قليل');
      } else {
        toast.error('حدث خطأ. حاول مرة أخرى');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Title>تسجيل الدخول</Title>

        {/* Social Sign-In Buttons */}
        <SocialButtonsContainer>
          <SocialButton onClick={handleGoogleSignIn} disabled={loading} type="button">
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
              <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" />
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
            </svg>
            {loading ? 'جاري التحميل...' : 'Google'}
          </SocialButton>

          <SocialButton
            $bgColor="#1877F2"
            $textColor="white"
            $border="none"
            onClick={handleFacebookSignIn}
            disabled={loading}
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            {loading ? 'جاري التحميل...' : 'Facebook'}
          </SocialButton>
        </SocialButtonsContainer>

        <Divider>أو</Divider>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>البريد الإلكتروني</Label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>كلمة المرور</Label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </FormGroup>

          <Button type="submit" disabled={loading}>
            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </Button>
        </Form>

        <LinkText>
          نسيت كلمة المرور؟{' '}
          <Link onClick={() => router.push('/reset-password')}>
            إعادة تعيين
          </Link>
        </LinkText>

        <LinkText>
          ليس لديك حساب؟{' '}
          <Link onClick={() => router.push('/register')}>
            سجل الآن
          </Link>
        </LinkText>
      </LoginCard>
    </LoginContainer>
  );
}
