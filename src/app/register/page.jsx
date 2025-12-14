'use client';

import styled from 'styled-components';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const RegisterContainer = styled.div`
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const RegisterCard = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 3rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
  margin-bottom: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
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
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
  box-sizing: border-box;

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

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    city: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast.error('الرجاء ملء الحقول المطلوبة');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }

    setLoading(true);

    try {
      await register(formData.email, formData.password, formData.name);
      toast.success('✅ تم إنشاء الحساب بنجاح!\n\nتم إرسال رسالة تأكيد إلى بريدك الإلكتروني.');
      router.push('/login');
    } catch (error) {
      console.error('Registration error:', error);

      if (error.code === 'auth/email-already-in-use') {
        toast.error('البريد الإلكتروني مستخدم بالفعل');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('البريد الإلكتروني غير صحيح');
      } else if (error.code === 'auth/weak-password') {
        toast.error('كلمة المرور ضعيفة جداً');
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
    <RegisterContainer>
      <RegisterCard>
        <Title>إنشاء حساب جديد</Title>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>الاسم الكامل *</Label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="أحمد محمد"
              required
            />
          </FormGroup>

          <FormRow>
            <FormGroup>
              <Label>البريد الإلكتروني *</Label>
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
              <Label>رقم الهاتف</Label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0612345678"
              />
            </FormGroup>
          </FormRow>

          <FormGroup>
            <Label>كلمة المرور *</Label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>العنوان</Label>
            <Input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="حي السلام، شارع 10"
            />
          </FormGroup>

          <FormGroup>
            <Label>المدينة</Label>
            <Input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="تارودانت"
            />
          </FormGroup>

          <Button type="submit" disabled={loading}>
            {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
          </Button>
        </Form>

        <LinkText>
          لديك حساب بالفعل؟{' '}
          <Link onClick={() => router.push('/login')}>
            تسجيل الدخول
          </Link>
        </LinkText>
      </RegisterCard>
    </RegisterContainer>
  );
}
