'use client';

import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { selectUserOrders } from '../../redux/slices/ordersSlice';

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

const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

// Profile Card
const ProfileCard = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  text-align: center;
  height: fit-content;

  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

const AvatarContainer = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 1.5rem;
`;

const Avatar = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #F4A300, #FFB82E);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: white;
  font-weight: bold;
  box-shadow: 0 8px 20px rgba(244, 163, 0, 0.3);
  border: 4px solid white;
`;

const UploadButton = styled.button`
  position: absolute;
  bottom: 0;
  right: 0;
  background: white;
  border: 3px solid #F4A300;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1.2rem;

  &:hover {
    background: #F4A300;
    transform: scale(1.1);
  }
`;

const UserName = styled.h2`
  color: #222;
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
`;

const UserEmail = styled.p`
  color: #666;
  margin: 0 0 1.5rem 0;
  font-size: 0.95rem;
`;

const BadgeRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const Badge = styled.span`
  background: ${({ $type }) =>
    $type === 'verified' ? '#10b981' : '#3b82f6'};
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 0.9rem;
  border: 2px solid #F4A300;
  background: ${({ $primary }) =>
    $primary ? 'linear-gradient(135deg, #F4A300, #FFB82E)' : 'white'};
  color: ${({ $primary }) => ($primary ? 'white' : '#F4A300')};
  border-radius: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 0.75rem;
  font-size: 1rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(244, 163, 0, 0.3);
  }
`;

// Stats Section
const StatsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled(motion.div)`
  background: white;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-4px);
    border-color: #F4A300;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
`;

const StatIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 900;
  color: #222;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 0.95rem;
`;

// Quick Actions
const QuickActions = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

const SectionTitle = styled.h3`
  color: #222;
  margin: 0 0 1.5rem 0;
  font-size: 1.3rem;
`;

const ActionsList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ActionItem = styled.button`
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  border: 2px solid #f0f0f0;
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
  text-align: right;
  display: flex;
  align-items: center;
  gap: 1rem;

  &:hover {
    border-color: #F4A300;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(244, 163, 0, 0.15);
  }

  .icon {
    font-size: 2rem;
    flex-shrink: 0;
  }

  .content {
    flex: 1;

    h4 {
      margin: 0 0 0.25rem 0;
      color: #222;
      font-size: 1.05rem;
    }

    p {
      margin: 0;
      color: #666;
      font-size: 0.85rem;
    }
  }
`;

// Recent Activity
const RecentActivity = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ActivityItem = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;

  .icon {
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .content {
    flex: 1;

    h4 {
      margin: 0 0 0.25rem 0;
      color: #222;
      font-size: 0.95rem;
    }

    p {
      margin: 0;
      color: #999;
      font-size: 0.8rem;
    }
  }
`;

// -----------------
// MAIN COMPONENT
// -----------------
export default function ProfilePage() {
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const orders = useSelector(selectUserOrders(currentUser?.uid)) || [];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const stats = [
    {
      icon: '📦',
      value: orders.length,
      label: 'إجمالي الطلبات',
      onClick: () => router.push('/orders')
    },
    {
      icon: '✅',
      value: orders.filter(o => o.status === 'delivered').length,
      label: 'طلبات مكتملة',
      onClick: () => router.push('/orders')
    },
    {
      icon: '🚚',
      value: orders.filter(o => ['shipped', 'out_for_delivery'].includes(o.status)).length,
      label: 'قيد التوصيل',
      onClick: () => router.push('/orders')
    }
  ];

  const quickActions = [
    { icon: '🛍️', title: 'تصفح المنتجات', desc: 'اكتشف منتجاتنا', path: '/products' },
    { icon: '📍', title: 'عناويني', desc: 'إدارة العناوين', path: '/profile/addresses' },
    { icon: '⭐', title: 'المفضلة', desc: 'منتجاتي المفضلة', path: '/favorites' },
    { icon: '🎁', title: 'عروض خاصة', desc: 'خصومات حصرية', path: '/products' }
  ];

  const recentActivities = [
    { icon: '📦', text: 'طلب جديد #1234', time: 'منذ ساعتين' },
    { icon: '✅', text: 'تم توصيل الطلب #1233', time: 'منذ يومين' },
    { icon: '⭐', text: 'تقييم منتج عسل الزعتر', time: 'منذ 3 أيام' }
  ];

  if (!currentUser) {
    router.push('/login');
    return null;
  }

  const userInitial = currentUser.displayName?.charAt(0).toUpperCase() || currentUser.email?.charAt(0).toUpperCase() || '👤';

  return (
    <PageWrapper>
      <Container>
        <ProfileGrid>
          {/* Profile Card */}
          <ProfileCard
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AvatarContainer>
              <Avatar>{userInitial}</Avatar>
            </AvatarContainer>

            <UserName>{currentUser.displayName || 'مستخدم'}</UserName>
            <UserEmail>{currentUser.email}</UserEmail>

            <BadgeRow>
              {currentUser.emailVerified && (
                <Badge $type="verified">
                  <span>✓</span>
                  <span>موثق</span>
                </Badge>
              )}
              <Badge $type="member">
                <span>👑</span>
                <span>عضو مميز</span>
              </Badge>
            </BadgeRow>

            <ActionButton $primary onClick={() => router.push('/profile/edit')}>
              تعديل الملف الشخصي
            </ActionButton>
            <ActionButton onClick={handleLogout}>
              تسجيل الخروج
            </ActionButton>
          </ProfileCard>

          {/* Stats & Actions */}
          <StatsSection>
            {/* Stats */}
            <StatsGrid>
              {stats.map((stat, idx) => (
                <StatCard
                  key={idx}
                  onClick={stat.onClick}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <StatIcon>{stat.icon}</StatIcon>
                  <StatValue>{stat.value}</StatValue>
                  <StatLabel>{stat.label}</StatLabel>
                </StatCard>
              ))}
            </StatsGrid>

            {/* Quick Actions */}
            <QuickActions>
              <SectionTitle>إجراءات سريعة</SectionTitle>
              <ActionsList>
                {quickActions.map((action, idx) => (
                  <ActionItem key={idx} onClick={() => router.push(action.path)}>
                    <span className="icon">{action.icon}</span>
                    <div className="content">
                      <h4>{action.title}</h4>
                      <p>{action.desc}</p>
                    </div>
                  </ActionItem>
                ))}
              </ActionsList>
            </QuickActions>

            {/* Recent Activity */}
            <RecentActivity>
              <SectionTitle>النشاط الأخير</SectionTitle>
              <ActivityList>
                {recentActivities.map((activity, idx) => (
                  <ActivityItem key={idx}>
                    <span className="icon">{activity.icon}</span>
                    <div className="content">
                      <h4>{activity.text}</h4>
                      <p>{activity.time}</p>
                    </div>
                  </ActivityItem>
                ))}
              </ActivityList>
            </RecentActivity>
          </StatsSection>
        </ProfileGrid>
      </Container>
    </PageWrapper>
  );
}
