'use client';

import styled from 'styled-components';

const TimelineContainer = styled.div`
  position: relative;
  padding: 2rem 0;
`;

const TimelineItem = styled.div`
  position: relative;
  padding: 0 0 2rem 3rem;

  &:last-child {
    padding-bottom: 0;
  }

  &::before {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    width: 2px;
    height: 100%;
    background: ${({ $completed }) => $completed ? '#10b981' : '#e5e7eb'};
  }

  &:last-child::before {
    display: none;
  }
`;

const TimelineIcon = styled.div`
  position: absolute;
  right: -10px;
  top: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ $completed, theme }) =>
        $completed ? '#10b981' : theme.colors.backgroundLight};
  border: 3px solid ${({ $completed }) => $completed ? '#10b981' : '#d1d5db'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: white;
  z-index: 1;
`;

const TimelineContent = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const StatusTitle = styled.h4`
  color: ${({ theme, $completed }) =>
        $completed ? theme.colors.primary : theme.colors.textSecondary};
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
`;

const StatusDate = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
  margin: 0;
`;

const STATUS_LABELS = {
    placed: 'تم الطلب',
    processing: 'قيد المعالجة',
    preparing: 'جاري التحضير',
    shipped: 'تم الشحن',
    out_for_delivery: 'في الطريق للتسليم',
    delivered: 'تم التسليم',
    cancelled: 'ملغي'
};

const STATUS_ICONS = {
    placed: '📝',
    processing: '⚙️',
    preparing: '📦',
    shipped: '🚚',
    out_for_delivery: '🛵',
    delivered: '✅',
    cancelled: '❌'
};

export default function OrderTimeline({ timeline }) {
    const formatDate = (dateString) => {
        if (!dateString) return 'في انتظار التحديث';

        const date = new Date(dateString);
        return date.toLocaleString('ar-MA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <TimelineContainer>
            {timeline.map((item, index) => (
                <TimelineItem key={index} $completed={item.completed}>
                    <TimelineIcon $completed={item.completed}>
                        {item.completed && STATUS_ICONS[item.status]}
                    </TimelineIcon>

                    <TimelineContent>
                        <StatusTitle $completed={item.completed}>
                            {STATUS_LABELS[item.status]}
                        </StatusTitle>
                        <StatusDate>
                            {formatDate(item.date)}
                        </StatusDate>
                    </TimelineContent>
                </TimelineItem>
            ))}
        </TimelineContainer>
    );
}
