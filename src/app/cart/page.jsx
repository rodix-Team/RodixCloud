'use client';

import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { selectCartItems, selectTotalItemsCount, addItem, decrementItem, removeItem } from '../../redux/slices/cartSlice';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// -----------------
// ANIMATIONS
// -----------------
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

// -----------------
// STYLED COMPONENTS
// -----------------
const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  padding-bottom: 4rem;
  background: radial-gradient(circle at center, #f9f9f9 0%, #f0f0f0 100%);
`;

const Header = styled.div`
  background: transparent;
  color: #333;
  padding: 3rem 2rem;
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  position: relative;
  z-index: 2;
  font-weight: 900;
  
  span { color: #F4A300; }
`;

const LayoutGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: ${({ $isEmpty }) => $isEmpty ? '1fr' : '1fr 350px'};
  gap: 2rem;
  place-items: ${({ $isEmpty }) => $isEmpty ? 'center' : 'start'};

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const ItemsList = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const CartItemCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  border: 1px solid rgba(0,0,0,0.02);
  position: relative;
  overflow: hidden;

  @media (max-width: 600px) {
    padding: 1rem 0.8rem;
    gap: 0.8rem;
    font-size: 0.9rem;
    align-items: flex-start; // Text top aligned
  }
`;

const ItemImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 12px;
  background: #f5f5f5;

  @media (max-width: 600px) {
    width: 70px;
    height: 70px;
  }
`;

const ItemInfo = styled.div`
  flex: 1;

  h3 {
    font-size: 1.2rem;
    color: #333;
    margin-bottom: 0.25rem;
    
    @media (max-width: 600px) {
      font-size: 1rem;
    }
  }

  p {
    color: #888;
    font-size: 0.9rem;
    
    @media (max-width: 600px) {
      font-size: 0.8rem;
    }
  }
`;

const QuantityWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #f8f9fa;
  padding: 0.5rem 1rem;
  border-radius: 50px;

  @media (max-width: 600px) {
    gap: 0.5rem;
    padding: 0.3rem 0.8rem;
  }
`;

const QtyBtn = styled.button`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  cursor: pointer;
  font-weight: bold;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
  }

  @media (max-width: 600px) {
    width: 24px;
    height: 24px;
    font-size: 1rem;
  }
`;

const PriceTag = styled.div`
  font-size: 1.3rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
  text-align: right;
  min-width: 80px;

  @media (max-width: 600px) {
    font-size: 1rem;
    min-width: auto;
  }
`;

const RemoveBtn = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem; // Tighter position
  background: rgba(255,255,255,0.8);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  color: #ccc;
  cursor: pointer;
  font-size: 1rem;
  transition: color 0.3s;
  z-index: 5;

  &:hover {
    color: #ff4757;
    background: white;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  }
`;

const SummaryCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.05);
  position: sticky;
  top: 100px;
  height: fit-content;

  h2 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #eee;
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
    position: static;
    
    h2 {
      font-size: 1.3rem;
    }
  }
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  color: #666;
  font-size: 1.05rem;

  &.total {
    color: #333;
    font-weight: 900;
    font-size: 1.4rem;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 2px dashed #eee;
  }
`;

const CheckoutBtn = styled.button`
  width: 100%;
  padding: 1.2rem;
  background: linear-gradient(135deg, #2c3e50 0%, #000 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  margin-top: 2rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 30px rgba(0,0,0,0.3);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  
  .icon {
    font-size: 5rem;
    display: block;
    margin-bottom: 1rem;
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
  }

  h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #333;
  }

  p {
    color: #777;
    margin-bottom: 2rem;
  }
`;

const ReturnBtn = styled(Link)`
  display: inline-block;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 1rem 2.5rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: bold;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;

export default function CartPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const totalCount = useSelector(selectTotalItemsCount);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 500 ? 0 : 30; // Free shipping over 500
  const total = subtotal > 0 ? subtotal + shipping : 0;

  return (
    <PageWrapper>
      <Header>
        <Title>عربة <span>التسوق</span></Title>
      </Header>

      <LayoutGrid $isEmpty={cartItems.length === 0}>
        <ItemsList variants={containerVariants} initial="hidden" animate="visible">
          {cartItems.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {cartItems.map((item) => (
                <CartItemCard
                  key={item.id}
                  variants={itemVariants}
                  layout
                  exit={{ opacity: 0, x: -100 }}
                >
                  <RemoveBtn onClick={() => dispatch(removeItem(item.id))}>✕</RemoveBtn>

                  <ItemImage src={item.imageUrl} alt={item.name} />

                  <ItemInfo>
                    <h3>{item.name}</h3>
                    <p>{item.price} درهم / الوحدة</p>
                  </ItemInfo>

                  <QuantityWrapper>
                    <QtyBtn onClick={() => dispatch(decrementItem(item.id))}>-</QtyBtn>
                    <span>{item.quantity}</span>
                    <QtyBtn onClick={() => dispatch(addItem({ id: item.id }))}>+</QtyBtn>
                  </QuantityWrapper>

                  <PriceTag>
                    {(item.price * item.quantity).toFixed(0)} درهم
                  </PriceTag>
                </CartItemCard>
              ))}
            </AnimatePresence>
          ) : (
            <EmptyState>
              <span className="icon">🐻</span>
              <h2>سلتك فارغة!</h2>
              <p>الدبدوب حزين حيث مازال ما شريتي والو.</p>
              <ReturnBtn href="/products">تصفح العسل 🍯</ReturnBtn>
            </EmptyState>
          )}
        </ItemsList>

        {/* Summary Panel */}
        {cartItems.length > 0 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <SummaryCard>
              <h2>ملخص الطلب</h2>
              <SummaryRow>
                <span>عدد المنتجات</span>
                <span>{totalCount}</span>
              </SummaryRow>
              <SummaryRow>
                <span>المجموع الفرعي</span>
                <span>{subtotal.toFixed(2)} د.م</span>
              </SummaryRow>
              <SummaryRow>
                <span>الشحن</span>
                <span>{shipping === 0 ? <span style={{ color: 'green' }}>مجاني</span> : `${shipping} د.م`}</span>
              </SummaryRow>
              <SummaryRow className="total">
                <span>المجموع الكلي</span>
                <span>{total.toFixed(2)} د.م</span>
              </SummaryRow>

              <CheckoutBtn onClick={() => router.push('/checkout')}>
                تأكيد الطلب 💳
              </CheckoutBtn>

              <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#999', textAlign: 'center' }}>
                🔒 دفع آمن 100% | ضمان الرضا
              </p>
            </SummaryCard>
          </motion.div>
        )}
      </LayoutGrid>
    </PageWrapper>
  );
}