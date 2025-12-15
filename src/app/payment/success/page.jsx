'use client';

import styled from 'styled-components';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const Container = styled.div`
  max-width: 600px;
  margin: 4rem auto;
  padding: 3rem 2rem;
  text-align: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const SuccessIcon = styled.div`
  font-size: 5rem;
  margin-bottom: 1.5rem;
  animation: bounce 0.6s ease;

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
  }
`;

const Title = styled.h1`
  color: #10b981;
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const Message = styled.p`
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const OrderInfo = styled.div`
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  margin: 2rem 0;
  text-align: right;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }

  strong {
    color: #333;
  }

  span {
    color: #666;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
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

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const method = searchParams.get('method');
    const paymentId = searchParams.get('paymentId');

    return (
        <Container>
            <SuccessIcon>✅</SuccessIcon>
            <Title>تم تأكيد طلبك بنجاح!</Title>
            <Message>
                شكراً لك على طلبك من متجر عسل تارودانت الذهبي.
                <br />
                سنقوم بمعالجة طلبك في أقرب وقت ممكن.
            </Message>

            <OrderInfo>
                <InfoRow>
                    <strong>رقم الطلب:</strong>
                    <span>{orderId || 'ORD-XXXXX'}</span>
                </InfoRow>
                <InfoRow>
                    <strong>طريقة الدفع:</strong>
                    <span>{method === 'cash' ? '💵 الدفع عند الاستلام' : '💳 بطاقة بنكية'}</span>
                </InfoRow>
                {paymentId && (
                    <InfoRow>
                        <strong>معرف الدفع:</strong>
                        <span style={{ fontSize: '0.85rem' }}>{paymentId}</span>
                    </InfoRow>
                )}
                <InfoRow>
                    <strong>الحالة:</strong>
                    <span style={{ color: '#10b981', fontWeight: '600' }}>✓ مؤكد</span>
                </InfoRow>
            </OrderInfo>

            <Message style={{ fontSize: '0.95rem', marginTop: '1.5rem' }}>
                📧 تم إرسال تأكيد الطلب إلى بريدك الإلكتروني.
                <br />
                📦 يمكنك تتبع طلبك من صفحة "طلباتي".
            </Message>

            <ButtonGroup>
                <Button href="/orders" className="primary">
                    عرض طلباتي
                </Button>
                <Button href="/products" className="secondary">
                    متابعة التسوق
                </Button>
            </ButtonGroup>
        </Container>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={<div style={{ textAlign: 'center', padding: '4rem' }}>جاري التحميل...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
