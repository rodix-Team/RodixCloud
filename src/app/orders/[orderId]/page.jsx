'use client';

import styled from 'styled-components';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectOrderById } from '../../../redux/slices/ordersSlice';
import OrderTimeline from '../../components/OrderTimeline';
import ProtectedRoute from '../../../components/ProtectedRoute';

const DetailContainer = styled.div`
  padding: 3rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 70vh;
`;

const BackButton = styled.button`
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primary};
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 2rem;
  font-size: 1rem;
  transition: all 0.3s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
  }
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 2rem;
`;

const Section = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
`;

const Label = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Value = styled.span`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: bold;
`;

const ProductsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ProductItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.backgroundLight};
  border-radius: 8px;
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const ProductName = styled.h4`
  margin: 0 0 0.5rem 0;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const ProductQuantity = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
`;

const ProductPrice = styled.span`
  color: ${({ theme }) => theme.colors.secondary};
  font-weight: bold;
  font-size: 1.1rem;
`;

const TotalSection = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid ${({ theme }) => theme.colors.primary};
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 1.3rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
`;

const NotFound = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const order = useSelector(selectOrderById(params.orderId));

  if (!order) {
    return (
      <ProtectedRoute>
        <DetailContainer>
          <NotFound>
            <h2>😔 الطلب غير موجود</h2>
            <p>لم نتمكن من العثور على هذا الطلب</p>
          </NotFound>
        </DetailContainer>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DetailContainer>
        <BackButton onClick={() => router.push('/orders')}>
          ← العودة للطلبات
        </BackButton>

        <Title>تفاصيل الطلب {order.id}</Title>

        <Section>
          <SectionTitle>🕒 تتبع الطلب</SectionTitle>
          <OrderTimeline timeline={order.timeline} />
        </Section>

        <Section>
          <SectionTitle>📦 المنتجات</SectionTitle>
          <ProductsList>
            {order.items.map((item) => (
              <ProductItem key={item.id}>
                <ProductInfo>
                  <ProductName>{item.name}</ProductName>
                  <ProductQuantity>الكمية: {item.quantity}</ProductQuantity>
                </ProductInfo>
                <ProductPrice>{item.price * item.quantity} درهم</ProductPrice>
              </ProductItem>
            ))}
          </ProductsList>

          <TotalSection>
            <TotalRow>
              <span>المجموع الكلي:</span>
              <span>{order.total} درهم</span>
            </TotalRow>
          </TotalSection>
        </Section>

        <Section>
          <SectionTitle>📍 معلومات الشحن</SectionTitle>
          <InfoRow>
            <Label>الاسم:</Label>
            <Value>{order.shippingAddress?.name || order.shippingInfo?.fullName || 'غير محدد'}</Value>
          </InfoRow>
          <InfoRow>
            <Label>الهاتف:</Label>
            <Value>{order.shippingAddress?.phone || order.shippingInfo?.phone || 'غير محدد'}</Value>
          </InfoRow>
          <InfoRow>
            <Label>العنوان:</Label>
            <Value>{order.shippingAddress?.address || order.shippingInfo?.address || 'غير محدد'}</Value>
          </InfoRow>
          <InfoRow>
            <Label>المدينة:</Label>
            <Value>{order.shippingAddress?.city || order.shippingInfo?.city || 'غير محدد'}</Value>
          </InfoRow>
        </Section>
      </DetailContainer>
    </ProtectedRoute>
  );
}
