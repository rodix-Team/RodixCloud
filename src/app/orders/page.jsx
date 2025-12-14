'use client';

import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { selectUserOrders } from '../../redux/slices/ordersSlice';
import { useAuth } from '../../contexts/AuthContext';

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

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #222;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
`;

// Filter Tabs
const FilterTabs = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 4px;
  }
`;

const FilterTab = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 50px;
  background: ${({ $active }) => ($active ? '#F4A300' : 'white')};
  color: ${({ $active }) => ($active ? 'white' : '#666')};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
  box-shadow: ${({ $active }) =>
    $active ? '0 4px 15px rgba(244, 163, 0, 0.3)' : '0 2px 8px rgba(0,0,0,0.05)'};

  &:hover {
    transform: translateY(-2px);
    background: ${({ $active }) => ($active ? '#F4A300' : '#f5f5f5')};
  }
`;

// Orders List
const OrdersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const OrderCard = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    border-color: #F4A300;
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f5f5f5;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
`;

const OrderMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const OrderId = styled.h3`
  color: #222;
  margin: 0;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  .icon {
    color: #F4A300;
  }

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const OrderDate = styled.span`
  color: #999;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatusBadge = styled.span`
  padding: 0.6rem 1.2rem;
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: bold;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: ${({ $status }) => {
    switch ($status) {
      case 'delivered':
        return 'linear-gradient(135deg, #10b981, #059669)';
      case 'shipped':
      case 'out_for_delivery':
        return 'linear-gradient(135deg, #3b82f6, #2563eb)';
      case 'processing':
      case 'preparing':
        return 'linear-gradient(135deg, #f59e0b, #d97706)';
      default:
        return 'linear-gradient(135deg, #6b7280, #4b5563)';
    }
  }};
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const OrderBody = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2rem;
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const OrderItems = styled.div`
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding: 0.5rem 0;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 4px;
  }
`;

const ItemThumbnail = styled.div`
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #f0f0f0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ItemsCount = styled.div`
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(135deg, #F4A300, #FFB82E);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
  box-shadow: 0 4px 12px rgba(244, 163, 0, 0.3);
`;

const OrderInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;

  @media (max-width: 768px) {
    align-items: flex-start;
  }
`;

const TotalLabel = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const TotalPrice = styled.div`
  color: #F4A300;
  font-size: 1.8rem;
  font-weight: 900;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

// Empty State
const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);

  .icon {
    font-size: 5rem;
    margin-bottom: 1rem;
  }

  h2 {
    color: #222;
    margin-bottom: 0.5rem;
  }

  p {
    color: #666;
    margin-bottom: 2rem;
  }
`;

const ShopButton = styled.button`
  background: linear-gradient(135deg, #F4A300 0%, #FFB82E 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 6px 20px rgba(244, 163, 0, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(244, 163, 0, 0.4);
  }
`;

// -----------------
// HELPER DATA
// -----------------
const statusLabels = {
  placed: { text: 'تم الطلب', icon: '📦' },
  processing: { text: 'قيد المعالجة', icon: '⚙️' },
  preparing: { text: 'قيد التحضير', icon: '📋' },
  shipped: { text: 'تم الشحن', icon: '🚚' },
  out_for_delivery: { text: 'في الطريق', icon: '🛵' },
  delivered: { text: 'تم التسليم', icon: '✅' }
};

// -----------------
// MAIN COMPONENT
// -----------------
export default function OrdersPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const allOrders = useSelector(selectUserOrders(currentUser?.uid)) || [];
  const [filter, setFilter] = useState('all');

  // Filter orders
  const filteredOrders = filter === 'all'
    ? allOrders
    : allOrders.filter(order => order.status === filter);

  const handleOrderClick = (orderId) => {
    router.push(`/orders/${orderId}`);
  };

  const filters = [
    { id: 'all', label: 'الكل', count: allOrders.length },
    { id: 'processing', label: 'قيد المعالجة', count: allOrders.filter(o => o.status === 'processing').length },
    { id: 'shipped', label: 'قيد الشحن', count: allOrders.filter(o => o.status === 'shipped' || o.status === 'out_for_delivery').length },
    { id: 'delivered', label: 'مكتمل', count: allOrders.filter(o => o.status === 'delivered').length }
  ];

  if (allOrders.length === 0) {
    return (
      <PageWrapper>
        <Container>
          <Header>
            <Title>طلباتي 📦</Title>
          </Header>
          <EmptyState>
            <div className="icon">🛒</div>
            <h2>لا توجد طلبات بعد</h2>
            <p>ابدأ التسوق واستمتع بأفضل أنواع العسل الطبيعي</p>
            <ShopButton onClick={() => router.push('/products')}>
              تصفح المنتجات
            </ShopButton>
          </EmptyState>
        </Container>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Container>
        <Header>
          <Title>طلباتي 📦</Title>
          <Subtitle>لديك {allOrders.length} طلب</Subtitle>
        </Header>

        {/* Filter Tabs */}
        <FilterTabs>
          {filters.map((f) => (
            <FilterTab
              key={f.id}
              $active={filter === f.id}
              onClick={() => setFilter(f.id)}
            >
              {f.label} {f.count > 0 && `(${f.count})`}
            </FilterTab>
          ))}
        </FilterTabs>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <EmptyState>
            <div className="icon">🔍</div>
            <h2>لا توجد طلبات في هذه الفئة</h2>
            <p>جرب فلتر آخر</p>
          </EmptyState>
        ) : (
          <OrdersList>
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                onClick={() => handleOrderClick(order.id)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <OrderHeader>
                  <OrderMeta>
                    <OrderId>
                      <span className="icon">🧾</span>
                      طلب #{order.id}
                    </OrderId>
                    <OrderDate>
                      📅 {order.date}
                    </OrderDate>
                  </OrderMeta>

                  <StatusBadge $status={order.status}>
                    <span>{statusLabels[order.status]?.icon || '📦'}</span>
                    <span>{statusLabels[order.status]?.text || 'غير معروف'}</span>
                  </StatusBadge>
                </OrderHeader>

                <OrderBody>
                  <OrderItems>
                    {order.items.slice(0, 4).map((item, idx) => (
                      <ItemThumbnail key={idx}>
                        <img src={item.imageUrl} alt={item.name} />
                      </ItemThumbnail>
                    ))}
                    {order.items.length > 4 && (
                      <ItemsCount>
                        +{order.items.length - 4}
                      </ItemsCount>
                    )}
                  </OrderItems>

                  <OrderInfo>
                    <TotalLabel>المجموع الكلي</TotalLabel>
                    <TotalPrice>{order.total} د.م</TotalPrice>
                  </OrderInfo>
                </OrderBody>
              </OrderCard>
            ))}
          </OrdersList>
        )}
      </Container>
    </PageWrapper>
  );
}
