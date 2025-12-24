'use client';

import styled from 'styled-components';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { selectCartItems, selectCartTotalPrice, updateQuantity, removeItem, clearCart } from '@/redux/slices/cartSlice';
import { getFullImageUrl } from '@/lib/http';
import { ShoppingCart, Trash2, Minus, Plus, Package, ArrowRight, ArrowLeft } from 'lucide-react';
import { useLocaleStore } from '@/store/locale-store';

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme?.colors?.backgroundLight || '#FAFAFA'};
`;

const PageHeader = styled.div`
  background: ${({ theme }) => theme?.gradients?.primary || 'linear-gradient(135deg, #F4A300 0%, #FFB82E 100%)'};
  padding: 2rem 1.5rem;
  text-align: center;
  color: white;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
`;

const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
`;

const CartLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 1024px) {
    grid-template-columns: 2fr 1fr;
  }
`;

const CartItems = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme?.shadows?.sm || '0 2px 4px rgba(0,0,0,0.08)'};
  overflow: hidden;
`;

const CartItem = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ItemImage = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ItemDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ItemName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme?.colors?.textPrimary || '#2C2C2C'};
  margin-bottom: 0.5rem;
`;

const ItemPrice = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: ${({ theme }) => theme?.colors?.primary || '#F4A300'};
`;

const ItemControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: auto;
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
`;

const QuantityButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme?.colors?.backgroundDark || '#F5F5F5'};
  border: none;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme?.colors?.primary || '#F4A300'};
    color: white;
  }
`;

const QuantityValue = styled.span`
  width: 40px;
  text-align: center;
  font-weight: 600;
`;

const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  background: none;
  border: none;
  color: ${({ theme }) => theme?.colors?.error || '#F44336'};
  font-size: 0.875rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const CartSummary = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme?.shadows?.sm || '0 2px 4px rgba(0,0,0,0.08)'};
  padding: 1.5rem;
  height: fit-content;
  position: sticky;
  top: 100px;
`;

const SummaryTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  color: ${({ theme }) => theme?.colors?.textSecondary || '#666'};
  
  &.total {
    font-size: 1.25rem;
    font-weight: 700;
    color: ${({ theme }) => theme?.colors?.textPrimary || '#2C2C2C'};
    padding-top: 1rem;
    margin-top: 0.5rem;
    border-top: 1px solid #eee;
    
    span:last-child {
      color: ${({ theme }) => theme?.colors?.primary || '#F4A300'};
    }
  }
`;

const CheckoutButton = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 1rem;
  margin-top: 1.5rem;
  background: ${({ theme }) => theme?.colors?.primary || '#F4A300'};
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 600;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme?.colors?.primaryDark || '#D68910'};
  }
`;

const ContinueShopping = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 1rem;
  margin-top: 0.75rem;
  background: transparent;
  color: ${({ theme }) => theme?.colors?.primary || '#F4A300'};
  border: 2px solid ${({ theme }) => theme?.colors?.primary || '#F4A300'};
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme?.colors?.primary || '#F4A300'};
    color: white;
  }
`;

const EmptyCart = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  
  svg {
    color: #ccc;
    margin-bottom: 1rem;
  }
  
  h2 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: ${({ theme }) => theme?.colors?.textPrimary || '#2C2C2C'};
  }
  
  p {
    color: ${({ theme }) => theme?.colors?.textSecondary || '#666'};
    margin-bottom: 1.5rem;
  }
`;

const ShopNowButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: ${({ theme }) => theme?.colors?.primary || '#F4A300'};
  color: white;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme?.colors?.primaryDark || '#D68910'};
  }
`;

export default function CartPage() {
  const items = useSelector(selectCartItems);
  const totalPrice = useSelector(selectCartTotalPrice);
  const dispatch = useDispatch();
  const { formatPrice, t } = useLocaleStore();

  const shipping = totalPrice > 200 ? 0 : 30;
  const finalTotal = totalPrice + shipping;

  if (items.length === 0) {
    return (
      <PageContainer>
        <PageHeader>
          <PageTitle>
            <ShoppingCart size={28} />
            سلة التسوق
          </PageTitle>
        </PageHeader>
        <Container>
          <EmptyCart>
            <ShoppingCart size={64} />
            <h2>سلتك فارغة!</h2>
            <p>لم تضف أي منتجات بعد. تصفح منتجاتنا وأضف ما يعجبك.</p>
            <ShopNowButton href="/products">
              تسوق الآن
              <ArrowLeft size={18} />
            </ShopNowButton>
          </EmptyCart>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>
          <ShoppingCart size={28} />
          سلة التسوق ({items.length})
        </PageTitle>
      </PageHeader>

      <Container>
        <CartLayout>
          <CartItems>
            {items.map((item) => (
              <CartItem key={item.id}>
                <ItemImage>
                  {item.image_url ? (
                    <img src={getFullImageUrl(item.image_url)} alt={item.name} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <Package size={32} color="#ccc" />
                    </div>
                  )}
                </ItemImage>
                <ItemDetails>
                  <ItemName>{item.name}</ItemName>
                  <ItemPrice>{formatPrice(item.price)}</ItemPrice>
                  <ItemControls>
                    <QuantityControls>
                      <QuantityButton onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}>
                        <Minus size={16} />
                      </QuantityButton>
                      <QuantityValue>{item.quantity}</QuantityValue>
                      <QuantityButton onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}>
                        <Plus size={16} />
                      </QuantityButton>
                    </QuantityControls>
                    <RemoveButton onClick={() => dispatch(removeItem(item.id))}>
                      <Trash2 size={16} />
                      حذف
                    </RemoveButton>
                  </ItemControls>
                </ItemDetails>
              </CartItem>
            ))}
          </CartItems>

          <CartSummary>
            <SummaryTitle>ملخص الطلب</SummaryTitle>
            <SummaryRow>
              <span>المجموع الفرعي</span>
              <span>{formatPrice(totalPrice)}</span>
            </SummaryRow>
            <SummaryRow>
              <span>الشحن</span>
              <span>{shipping === 0 ? t('common.free') || 'Free' : formatPrice(shipping)}</span>
            </SummaryRow>
            {shipping > 0 && (
              <SummaryRow style={{ fontSize: '0.875rem', color: '#4CAF50' }}>
                <span>🎁 شحن مجاني للطلبات فوق 200 درهم</span>
              </SummaryRow>
            )}
            <SummaryRow className="total">
              <span>الإجمالي</span>
              <span>{formatPrice(finalTotal)}</span>
            </SummaryRow>
            <CheckoutButton href="/checkout">
              إتمام الطلب
              <ArrowLeft size={18} />
            </CheckoutButton>
            <ContinueShopping href="/products">
              <ArrowRight size={18} />
              متابعة التسوق
            </ContinueShopping>
          </CartSummary>
        </CartLayout>
      </Container>
    </PageContainer>
  );
}
