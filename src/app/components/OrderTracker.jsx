'use client';

import styled from 'styled-components';

const TrackerContainer = styled.div`
  padding: 2rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 2rem;
  font-size: 1.8rem;
`;

const Timeline = styled.div`
  position: relative;
  padding: 1rem 0;
`;

const TimelineItem = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 2rem;
  position: relative;

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    right: 1.4rem;
    top: 3rem;
    width: 2px;
    height: calc(100% + 1rem);
    background-color: ${({ $completed }) => $completed ? '#10b981' : '#e5e7eb'};
  }
`;

const IconWrapper = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background-color: ${({ $completed }) => $completed ? '#10b981' : '#e5e7eb'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
  margin-left: 1.5rem;
  z-index: 1;
  transition: all 0.3s;
`;

const Content = styled.div`
  flex: 1;
`;

const StatusTitle = styled.h3`
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
`;

const StatusDate = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  font-size: 0.9rem;
`;

const statusConfig = {
    placed: { icon: '✅', label: 'تم الطلب' },
    processing: { icon: '⏳', label: 'قيد المعالجة' },
    preparing: { icon: '📦', label: 'قيد التحضير' },
    shipped: { icon: '🚚', label: 'تم الشحن' },
    out_for_delivery: { icon: '🏃', label: 'في الطريق' },
    delivered: { icon: '🎉', label: 'تم التسليم' },
};

export default function OrderTracker({ timeline }) {
    const formatDate = (dateString) => {
        if (!dateString) return 'قيد الانتظار';

        const date = new Date(dateString);
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('ar-MA', options);
    };

    return (
        <TrackerContainer>
            <Title>تتبع الطلب</Title>

            <Timeline>
                {timeline.map((item, index) => {
                    const config = statusConfig[item.status];

                    return (
                        <TimelineItem key={index} $completed={item.completed}>
                            <IconWrapper $completed={item.completed}>
                                {config.icon}
                            </IconWrapper>

                            <Content>
                                <StatusTitle>{config.label}</StatusTitle>
                                <StatusDate>{formatDate(item.date)}</StatusDate>
                            </Content>
                        </TimelineItem>
                    );
                })}
            </Timeline>
        </TrackerContainer>
    );
}
