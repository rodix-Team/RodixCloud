'use client';

import styled from 'styled-components';
import StarRating from './StarRating';

const ListContainer = styled.div`
  margin-top: 2rem;
`;

const ReviewCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
`;

const UserInfo = styled.div``;

const UserName = styled.div`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 0.25rem;
`;

const ReviewDate = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ReviewTitle = styled.h4`
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0.5rem 0;
`;

const ReviewComment = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
  margin: 0.5rem 0;
`;

const VerifiedBadge = styled.span`
  background: #10b981;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-right: 0.5rem;
`;

const HelpfulButton = styled.button`
  background: none;
  border: 1px solid #ddd;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: all 0.3s;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export default function ReviewsList({ reviews = [] }) {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-MA');
    };

    if (reviews.length === 0) {
        return (
            <EmptyState>
                <p>لا توجد تقييمات بعد</p>
                <p>كن أول من يقيم هذا المنتج!</p>
            </EmptyState>
        );
    }

    return (
        <ListContainer>
            {reviews.map((review) => (
                <ReviewCard key={review.id}>
                    <ReviewHeader>
                        <UserInfo>
                            <UserName>
                                {review.userName}
                                {review.verified && <VerifiedBadge>✓ مشترٍ موثق</VerifiedBadge>}
                            </UserName>
                            <ReviewDate>{formatDate(review.date)}</ReviewDate>
                        </UserInfo>
                        <StarRating rating={review.rating} />
                    </ReviewHeader>

                    <ReviewTitle>{review.title}</ReviewTitle>
                    <ReviewComment>{review.comment}</ReviewComment>

                    <HelpfulButton>
                        👍 مفيد ({review.helpful})
                    </HelpfulButton>
                </ReviewCard>
            ))}
        </ListContainer>
    );
}
