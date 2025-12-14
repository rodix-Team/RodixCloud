'use client';

import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { selectCartItems, clearCart } from '../../redux/slices/cartSlice';
import { addOrder } from '../../redux/slices/ordersSlice';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm';
import PayPalPayment from '../components/PayPalPayment';
import CMIPayment from '../components/CMIPayment';

// Initialize Stripe outside component
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// -----------------
// STYLED COMPONENTS
// -----------------
const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #FFF8E1 0%, #f9f9f9 100%);
  padding: 3rem 1rem;

  @media (max-width: 768px) {
    padding: 2rem 1rem;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  text-align: center;
  font-size: 2.5rem;
  color: #222;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 2rem;
  }
`;

// Progress Stepper
const StepperContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 3rem;
  gap: 1rem;

  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`;

const Step = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
  max-width: 150px;

  @media (max-width: 768px) {
    max-width: 100px;
  }
`;

const StepIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${({ $active, $completed }) =>
    $completed ? '#10b981' : $active ? '#F4A300' : '#ddd'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  z-index: 2;
  transition: all 0.3s;
  box-shadow: ${({ $active }) =>
    $active ? '0 4px 15px rgba(244, 163, 0, 0.4)' : 'none'};

  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }
`;

const StepLabel = styled.div`
  margin-top: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ $active }) => ($active ? '#F4A300' : '#666')};
  text-align: center;

  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;

const StepLine = styled.div`
  position: absolute;
  top: 30px;
  left: 50%;
  width: 100%;
  height: 3px;
  background: ${({ $completed }) => ($completed ? '#10b981' : '#ddd')};
  z-index: 1;
  transition: background 0.3s;

  @media (max-width: 768px) {
    top: 25px;
  }
`;

// Main Content
const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 2rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const FormSection = styled(motion.div)`
  background: white;
  padding: 2.5rem;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #222;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: ${({ $columns }) => $columns || '1fr'};
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
  font-weight: 600;
  color: #333;
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
    border-color: #F4A300;
    background: white;
    box-shadow: 0 0 0 3px rgba(244, 163, 0, 0.1);
  }
`;

const Select = styled.select`
  padding: 0.9rem 1rem;
  border: 2px solid #eee;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s;
  background: #fafafa;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #F4A300;
    background: white;
    box-shadow: 0 0 0 3px rgba(244, 163, 0, 0.1);
  }
`;

// Payment Method
const PaymentMethods = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PaymentOption = styled.label`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  border: 3px solid ${({ $selected }) => ($selected ? '#F4A300' : '#eee')};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  background: ${({ $selected }) => ($selected ? 'rgba(244, 163, 0, 0.05)' : 'white')};

  &:hover {
    border-color: #F4A300;
  }

  input {
    width: 22px;
    height: 22px;
    cursor: pointer;
  }

  .icon {
    font-size: 1.8rem;
  }

  .info {
    flex: 1;

    h4 {
      margin: 0 0 0.25rem 0;
      color: #222;
      font-size: 1.1rem;
    }

    p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }
  }
`;

// Order Summary
const SummaryCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  height: fit-content;
  position: sticky;
  top: 2rem;

  @media (max-width: 900px) {
    position: static;
  }
`;

const SummaryTitle = styled.h3`
  font-size: 1.3rem;
  color: #222;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
`;

const ProductItem = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f5f5f5;

  img {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 8px;
  }

  .info {
    flex: 1;

    h4 {
      margin: 0 0 0.25rem 0;
      font-size: 0.95rem;
      color: #333;
    }

    p {
      margin: 0;
      color: #666;
      font-size: 0.85rem;
    }
  }

  .price {
    font-weight: bold;
    color: #F4A300;
  }
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  color: #666;
  font-size: 0.95rem;

  &.total {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 2px solid #f0f0f0;
    font-size: 1.3rem;
    font-weight: bold;
    color: #222;
  }
`;

// Action Buttons
const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;

  @media (max-width: 768px) {
    flex-direction: column-reverse;
  }
`;

const Button = styled.button`
  flex: 1;
  padding: 1.1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  border: none;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const BackButton = styled(Button)`
  background: #f5f5f5;
  color: #333;

  &:hover {
    background: #e0e0e0;
  }
`;

const NextButton = styled(Button)`
  background: linear-gradient(135deg, #F4A300 0%, #FFB82E 100%);
  color: white;
  box-shadow: 0 6px 20px rgba(244, 163, 0, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(244, 163, 0, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

// -----------------
// MAIN COMPONENT
// -----------------
export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { currentUser } = useAuth();
  const cartItems = useSelector(selectCartItems);

  const [currentStep, setCurrentStep] = useState(1);
  const [clientSecret, setClientSecret] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: currentUser?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'cash',
    notes: ''
  });

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 500 ? 0 : 30;
  const total = subtotal + shipping;

  // Fetch PaymentIntent when Stripe is selected
  useEffect(() => {
    if (formData.paymentMethod === 'card' && total > 0) {
      fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total, currency: 'mad' }),
      })
        .then((res) => res.json())
        .then((data) => setClientSecret(data.clientSecret));
    }
  }, [formData.paymentMethod, total]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateStep = () => {
    if (currentStep === 1) {
      return formData.fullName && formData.phone && formData.email;
    }
    if (currentStep === 2) {
      return formData.address && formData.city;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) {
      toast.error('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleStripeSuccess = async (paymentIntentId) => {
    const order = {
      id: Date.now().toString(),
      userId: currentUser?.uid,
      items: cartItems,
      total,
      shippingAddress: {
        name: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode
      },
      paymentMethod: 'card',
      paymentId: paymentIntentId,
      notes: formData.notes,
      status: 'placed',
      date: new Date().toLocaleDateString('ar-MA')
    };

    dispatch(addOrder(order));
    dispatch(clearCart());

    toast.success('✅ تم الدفع بنجاح!');
    router.push(`/orders/${order.id}`);
  };

  const handleSubmit = async () => {
    if (cartItems.length === 0) {
      toast.error('العربة فارغة!');
      return;
    }

    // Since Stripe handles its own submission via CheckoutForm, 
    // this main submit button is only for Cash/Other methods

    // ... existing handleSubmit code ...

    const order = {
      id: Date.now().toString(),
      userId: currentUser?.uid,
      items: cartItems,
      total,
      shippingAddress: {
        name: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode
      },
      paymentMethod: formData.paymentMethod,
      notes: formData.notes,
      status: 'placed',
      date: new Date().toLocaleDateString('ar-MA')
    };

    dispatch(addOrder(order));
    dispatch(clearCart());

    toast.success('✅ تم تأكيد الطلب بنجاح!');
    router.push(`/orders/${order.id}`);
  };

  if (cartItems.length === 0) {
    return (
      <PageWrapper>
        <Container>
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <h2>🛒 العربة فارغة</h2>
            <p>أضف بعض المنتجات للمتابعة</p>
            <NextButton onClick={() => router.push('/products')} style={{ marginTop: '2rem', maxWidth: '300px', margin: '2rem auto 0' }}>
              تصفح المنتجات
            </NextButton>
          </div>
        </Container>
      </PageWrapper>
    );
  }

  const steps = [
    { number: 1, label: 'المعلومات الشخصية', icon: '👤' },
    { number: 2, label: 'عنوان التوصيل', icon: '📍' },
    { number: 3, label: 'الدفع', icon: '💳' }
  ];

  return (
    <PageWrapper>
      <Container>
        <Title>إتمام الطلب 🛍️</Title>

        {/* Progress Stepper */}
        <StepperContainer>
          {steps.map((step, index) => (
            <Step key={step.number}>
              {index > 0 && <StepLine $completed={currentStep > step.number} />}
              <StepIcon $active={currentStep === step.number} $completed={currentStep > step.number}>
                {currentStep > step.number ? '✓' : step.icon}
              </StepIcon>
              <StepLabel $active={currentStep === step.number}>{step.label}</StepLabel>
            </Step>
          ))}
        </StepperContainer>

        {/* Main Content */}
        <ContentGrid>
          {/* Form Section */}
          <AnimatePresence mode="wait">
            <FormSection
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Step 1: Personal Info */}
              {currentStep === 1 && (
                <>
                  <SectionTitle>👤 المعلومات الشخصية</SectionTitle>
                  <Form>
                    <FormGroup>
                      <Label>الاسم الكامل *</Label>
                      <Input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="أدخل اسمك الكامل"
                        required
                      />
                    </FormGroup>

                    <FormRow $columns="1fr 1fr">
                      <FormGroup>
                        <Label>البريد الإلكتروني *</Label>
                        <Input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
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
                          onChange={handleInputChange}
                          placeholder="0612345678"
                          required
                        />
                      </FormGroup>
                    </FormRow>
                  </Form>
                </>
              )}

              {/* Step 2: Shipping Address */}
              {currentStep === 2 && (
                <>
                  <SectionTitle>📍 عنوان التوصيل</SectionTitle>
                  <Form>
                    <FormGroup>
                      <Label>العنوان الكامل *</Label>
                      <Input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="رقم الشارع، الحي..."
                        required
                      />
                    </FormGroup>

                    <FormRow $columns="2fr 1fr">
                      <FormGroup>
                        <Label>المدينة *</Label>
                        <Select name="city" value={formData.city} onChange={handleInputChange} required>
                          <option value="">اختر المدينة</option>
                          <option value="الدار البيضاء">الدار البيضاء</option>
                          <option value="الرباط">الرباط</option>
                          <option value="مراكش">مراكش</option>
                          <option value="فاس">فاس</option>
                          <option value="طنجة">طنجة</option>
                          <option value="أكادير">أكادير</option>
                          <option value="تارودانت">تارودانت</option>
                        </Select>
                      </FormGroup>

                      <FormGroup>
                        <Label>الرمز البريدي</Label>
                        <Input
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          placeholder="80000"
                        />
                      </FormGroup>
                    </FormRow>

                    <FormGroup>
                      <Label>ملاحظات (اختياري)</Label>
                      <Input
                        type="text"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="مثلاً: اتصل قبل التوصيل"
                      />
                    </FormGroup>
                  </Form>
                </>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <>
                  <SectionTitle>💳 طريقة الدفع</SectionTitle>
                  <PaymentMethods>
                    {/* Visa/Mastercard */}
                    <PaymentOption $selected={formData.paymentMethod === 'card'}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={formData.paymentMethod === 'card'}
                        onChange={handleInputChange}
                      />
                      <span className="icon">💳</span>
                      <div className="info">
                        <h4>بطاقة بنكية</h4>
                        <p>Visa, Mastercard - دفع آمن ومشفر</p>
                      </div>
                      <div className="badges">
                        <span style={{ fontSize: '1.5rem' }}>💳</span>
                      </div>
                    </PaymentOption>

                    {/* PayPal */}
                    <PaymentOption $selected={formData.paymentMethod === 'paypal'}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="paypal"
                        checked={formData.paymentMethod === 'paypal'}
                        onChange={handleInputChange}
                      />
                      <span className="icon" style={{ color: '#0070ba' }}>PP</span>
                      <div className="info">
                        <h4>PayPal</h4>
                        <p>الدفع الإلكتروني العالمي الآمن</p>
                      </div>
                    </PaymentOption>

                    {/* Apple Pay */}
                    <PaymentOption $selected={formData.paymentMethod === 'applepay'}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="applepay"
                        checked={formData.paymentMethod === 'applepay'}
                        onChange={handleInputChange}
                      />
                      <span className="icon"></span>
                      <div className="info">
                        <h4>Apple Pay</h4>
                        <p>دفع سريع وآمن لمستخدمي Apple</p>
                      </div>
                    </PaymentOption>

                    {/* CMI (Moroccan) */}
                    <PaymentOption $selected={formData.paymentMethod === 'cmi'}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cmi"
                        checked={formData.paymentMethod === 'cmi'}
                        onChange={handleInputChange}
                      />
                      <span className="icon">🇲🇦</span>
                      <div className="info">
                        <h4>CMI - البنوك المغربية</h4>
                        <p>الدفع عبر البنوك المحلية</p>
                      </div>
                    </PaymentOption>

                    {/* Cash on Delivery - Last Option */}
                    <PaymentOption $selected={formData.paymentMethod === 'cash'}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={formData.paymentMethod === 'cash'}
                        onChange={handleInputChange}
                      />
                      <span className="icon">💵</span>
                      <div className="info">
                        <h4>الدفع عند الاستلام</h4>
                        <p>ادفع نقداً عند استلام طلبك</p>
                      </div>
                    </PaymentOption>
                  </PaymentMethods>

                  {/* Show Stripe Form only if Card is selected */}
                  {formData.paymentMethod === 'card' && clientSecret && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ marginTop: '2rem', padding: '1rem', background: '#f9f9f9', borderRadius: '12px' }}
                    >
                      <Elements options={{ clientSecret, appearance: { theme: 'stripe' } }} stripe={stripePromise}>
                        <CheckoutForm amount={total} onSuccess={handleStripeSuccess} />
                      </Elements>
                    </motion.div>
                  )}

                  {/* Show PayPal Buttons if PayPal is selected */}
                  {formData.paymentMethod === 'paypal' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ marginTop: '2rem' }}
                    >
                      <PayPalPayment amount={total} onSuccess={(id) => handleStripeSuccess(id)} />
                    </motion.div>
                  )}

                  {/* Show CMI Payment if CMI is selected */}
                  {formData.paymentMethod === 'cmi' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ marginTop: '2rem' }}
                    >
                      <CMIPayment amount={total} onSuccess={(id) => handleStripeSuccess(id)} />
                    </motion.div>
                  )}
                </>
              )}

              {/* Navigation Buttons */}
              <AnimatePresence>
                <FormSection
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <ButtonGroup>
                    {currentStep > 1 && (
                      <BackButton type="button" onClick={handleBack}>
                        ← السابق
                      </BackButton>
                    )}

                    {currentStep < 3 ? (
                      <NextButton type="button" onClick={handleNext}>
                        التالي →
                      </NextButton>
                    ) : (
                      // Hide main submit button if any integrated payment is active
                      !['card', 'paypal', 'cmi'].includes(formData.paymentMethod) && (
                        <NextButton type="button" onClick={handleSubmit}>
                          تأكيد الطلب ✓
                        </NextButton>
                      )
                    )}
                  </ButtonGroup>
                </FormSection>
              </AnimatePresence>
            </FormSection>
          </AnimatePresence>

          {/* Order Summary */}
          <SummaryCard>
            <SummaryTitle>ملخص الطلب</SummaryTitle>

            {cartItems.map((item) => (
              <ProductItem key={item.id}>
                <img src={item.imageUrl} alt={item.name} />
                <div className="info">
                  <h4>{item.name}</h4>
                  <p>الكمية: {item.quantity}</p>
                </div>
                <div className="price">{item.price * item.quantity} د.م</div>
              </ProductItem>
            ))}

            <SummaryRow>
              <span>المجموع الفرعي:</span>
              <span>{subtotal} د.م</span>
            </SummaryRow>

            <SummaryRow>
              <span>التوصيل:</span>
              <span>{shipping === 0 ? 'مجاني 🎉' : `${shipping} د.م`}</span>
            </SummaryRow>

            <SummaryRow className="total">
              <span>المجموع الكلي:</span>
              <span>{total} د.م</span>
            </SummaryRow>
          </SummaryCard>
        </ContentGrid>
      </Container>
    </PageWrapper>
  );
}