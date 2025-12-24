'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { selectCartItems, selectCartTotalPrice, clearCart } from '@/redux/slices/cartSlice';
import { http, getFullImageUrl } from '@/lib/http';
import { Package, CreditCard, Truck, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
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
`;

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
`;

const CheckoutLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 768px) {
    grid-template-columns: 3fr 2fr;
  }
`;

const FormSection = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme?.shadows?.sm || '0 2px 4px rgba(0,0,0,0.08)'};
  padding: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme?.colors?.textPrimary || '#2C2C2C'};
  
  svg {
    color: ${({ theme }) => theme?.colors?.primary || '#F4A300'};
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.25rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: ${({ theme }) => theme?.colors?.textPrimary || '#2C2C2C'};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme?.colors?.primary || '#F4A300'};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme?.colors?.primary || '#F4A300'};
  }
`;

const OrderSummary = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme?.shadows?.sm || '0 2px 4px rgba(0,0,0,0.08)'};
  padding: 1.5rem;
  height: fit-content;
`;

const OrderItems = styled.div`
  margin-bottom: 1.5rem;
  max-height: 300px;
  overflow-y: auto;
`;

const OrderItem = styled.div`
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ItemImage = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 6px;
  overflow: hidden;
  background: #f5f5f5;
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ItemInfo = styled.div`
  flex: 1;
  
  h4 {
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 0.25rem;
  }
  
  p {
    font-size: 0.75rem;
    color: ${({ theme }) => theme?.colors?.textSecondary || '#666'};
  }
`;

const ItemPrice = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme?.colors?.primary || '#F4A300'};
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
    border-top: 2px solid #eee;
    
    span:last-child {
      color: ${({ theme }) => theme?.colors?.primary || '#F4A300'};
    }
  }
`;

const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 1rem;
  margin-top: 1.5rem;
  background: ${({ theme }) => theme?.colors?.success || '#4CAF50'};
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 600;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    filter: brightness(0.95);
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const SuccessModal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const SuccessCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  max-width: 400px;
  width: 100%;
`;

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  background: ${({ theme }) => theme?.colors?.success || '#4CAF50'}20;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  
  svg {
    color: ${({ theme }) => theme?.colors?.success || '#4CAF50'};
  }
`;

const SuccessTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme?.colors?.textPrimary || '#2C2C2C'};
`;

const OrderNumber = styled.p`
  color: ${({ theme }) => theme?.colors?.textSecondary || '#666'};
  margin-bottom: 1.5rem;
`;

const HomeButton = styled.button`
  padding: 1rem 2rem;
  background: ${({ theme }) => theme?.colors?.primary || '#F4A300'};
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    filter: brightness(0.95);
  }
`;

export default function CheckoutPage() {
  const router = useRouter();
  const items = useSelector(selectCartItems);
  const totalPrice = useSelector(selectCartTotalPrice);
  const dispatch = useDispatch();
  const { formatPrice } = useLocaleStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const shipping = totalPrice > 200 ? 0 : 30;
  const finalTotal = totalPrice + shipping;

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.phone) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        guest_email: formData.email,
        shipping_address: formData.address,
        total_price: finalTotal,
        items: items.map(item => {
          // Extract the actual product_id (handle "38-5" format for variants)
          const itemId = String(item.id);
          const productId = itemId.includes('-')
            ? parseInt(itemId.split('-')[0])
            : parseInt(itemId);

          return {
            product_id: productId,
            quantity: item.quantity,
            // Include variant_id if present
            ...(item.variation_id && { variant_id: item.variation_id }),
          };
        }),
      };

      const res = await http.post('/guest/orders', orderData);
      setOrderNumber(res.data.order_id ? `ORD-${res.data.order_id}` : `ORD-${Date.now()}`);
      setOrderComplete(true);
      dispatch(clearCart());
      toast.success('تم إرسال طلبك بنجاح!');
    } catch (err) {
      console.error('Order failed:', err);
      if (err?.response?.status === 422) {
        const errors = err?.response?.data?.errors;
        if (errors) {
          const errorMsg = Object.values(errors).flat().join('\n');
          toast.error(`خطأ في البيانات:\n${errorMsg}`);
        } else {
          toast.error('خطأ في البيانات المدخلة');
        }
      } else if (err?.response?.status === 404) {
        toast.error('خدمة الطلب غير متوفرة حالياً');
      } else {
        toast.error('حدث خطأ أثناء إرسال الطلب');
      }
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !orderComplete) {
    router.push('/cart');
    return null;
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>إتمام الطلب</PageTitle>
      </PageHeader>

      <Container>
        <form onSubmit={handleSubmit}>
          <CheckoutLayout>
            <div>
              <FormSection>
                <SectionTitle>
                  <Truck size={24} />
                  معلومات الشحن
                </SectionTitle>

                <FormGroup>
                  <Label>الاسم الكامل</Label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="أدخل اسمك الكامل"
                  />
                </FormGroup>

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
                  <Label>رقم الهاتف *</Label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+212 6XX XXX XXX"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>عنوان الشحن</Label>
                  <TextArea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="المدينة، الحي، الشارع، رقم المنزل..."
                  />
                </FormGroup>
              </FormSection>
            </div>

            <OrderSummary>
              <SectionTitle>
                <Package size={24} />
                ملخص الطلب
              </SectionTitle>

              <OrderItems>
                {items.map((item) => (
                  <OrderItem key={item.id}>
                    <ItemImage>
                      {item.image_url ? (
                        <img src={getFullImageUrl(item.image_url)} alt={item.name} />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                          <Package size={20} color="#ccc" />
                        </div>
                      )}
                    </ItemImage>
                    <ItemInfo>
                      <h4>{item.name}</h4>
                      <p>الكمية: {item.quantity}</p>
                    </ItemInfo>
                    <ItemPrice>{formatPrice(parseFloat(item.price) * item.quantity)}</ItemPrice>
                  </OrderItem>
                ))}
              </OrderItems>

              <SummaryRow>
                <span>المجموع الفرعي</span>
                <span>{formatPrice(totalPrice)}</span>
              </SummaryRow>
              <SummaryRow>
                <span>الشحن</span>
                <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </SummaryRow>
              <SummaryRow className="total">
                <span>الإجمالي</span>
                <span>{formatPrice(finalTotal)}</span>
              </SummaryRow>

              <SubmitButton type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    تأكيد الطلب
                  </>
                )}
              </SubmitButton>
            </OrderSummary>
          </CheckoutLayout>
        </form>
      </Container>

      {orderComplete && (
        <SuccessModal>
          <SuccessCard>
            <SuccessIcon>
              <Check size={40} />
            </SuccessIcon>
            <SuccessTitle>شكراً لطلبك!</SuccessTitle>
            <OrderNumber>رقم الطلب: {orderNumber}</OrderNumber>
            <p style={{ marginBottom: '1.5rem', color: '#666' }}>
              سنتواصل معك قريباً لتأكيد الطلب والتوصيل
            </p>
            <HomeButton onClick={() => router.push('/')}>
              العودة للرئيسية
            </HomeButton>
          </SuccessCard>
        </SuccessModal>
      )}
    </PageContainer>
  );
}
