'use client';

import styled from 'styled-components';
import Link from 'next/link';

const Container = styled.div`
  max-width: 600px;
  margin: 4rem auto;
  padding: 3rem 2rem;
  text-align: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const ErrorIcon = styled.div`
  font-size: 5rem;
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  color: #ef4444;
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const Message = styled.p`
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const ReasonBox = styled.div`
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 2rem 0;
  color: #c00;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
  flex-wrap: wrap;
`;

const Button = styled(Link)`
  padding: 0.75rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-block;

  &.primary {
    background: #F4A300;
    color: white;

    &:hover {
      background: #d49500;
      transform: translateY(-2px);
    }
  }

  &.secondary {
    background: #f0f0f0;
    color: #333;

    &:hover {
      background: #e0e0e0;
    }
  }
`;

const HelpSection = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
  font-size: 0.95rem;
  color: #666;
`;

export default function PaymentCancelPage() {
    return (
        <Container>
            <ErrorIcon>❌</ErrorIcon>
            <Title>فشل الدفع</Title>
            <Message>
                عذراً، لم نتمكن من إتمام عملية الدفع.
                <br />
                لم يتم خصم أي مبلغ من حسابك.
            </Message>

            <ReasonBox>
                <strong>الأسباب المحتملة:</strong>
                <ul style={{ textAlign: 'right', marginTop: '1rem', lineHeight: '1.8' }}>
                    <li>رصيد غير كافٍ في البطاقة</li>
                    <li>بيانات البطاقة غير صحيحة</li>
                    <li>البطاقة منتهية الصلاحية</li>
                    <li>تم رفض العملية من البنك</li>
                    <li>إلغاء العملية من طرفك</li>
                </ul>
            </ReasonBox>

            <Message style={{ fontSize: '1rem' }}>
                يمكنك المحاولة مرة أخرى أو اختيار طريقة دفع مختلفة.
            </Message>

            <ButtonGroup>
                <Button href="/checkout" className="primary">
                    إعادة المحاولة
                </Button>
                <Button href="/cart" className="secondary">
                    العودة للعربة
                </Button>
            </ButtonGroup>

            <HelpSection>
                <p>
                    <strong>تحتاج مساعدة؟</strong>
                    <br />
                    تواصل معنا عبر الواتساب: <a href="https://wa.me/212600000000" style={{ color: '#F4A300' }}>+212 6xx xxxx xx</a>
                    <br />
                    أو عبر البريد: <a href="mailto:contact@honeytaroudant.ma" style={{ color: '#F4A300' }}>contact@honeytaroudant.ma</a>
                </p>
            </HelpSection>
        </Container>
    );
}
