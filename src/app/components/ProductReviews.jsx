'use client';

import styled from 'styled-components';
import { useState } from 'react';

const ReviewsContainer = styled.div`
  margin-top: 3rem;
`;

const Title = styled.h3`
  font-size: 1.8rem;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 1.5rem;
`;

const RatingSummary = styled.div`
  background-color: ${({ theme }) => theme.colors.backgroundLight};
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const AverageRating = styled.div`
  text-align: center;
`;

const RatingNumber = styled.div`
  font-size: 3rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
`;

const Stars = styled.div`
  font-size: 1.5rem;
  color: #ffc107;
`;

const ReviewCount = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 0.5rem;
`;

const ReviewsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ReviewCard = styled.div`
  background-color: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ReviewerName = styled.div`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const ReviewDate = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
`;

const ReviewRating = styled.div`
  color: #ffc107;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
`;

const ReviewText = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
`;

const AddReviewButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
  transition: background-color 0.3s;

  &:hover {
    background-color: #d17834;
  }
`;

export default function ProductReviews({ productId, rating, reviewCount }) {
    const [reviews] = useState([
        {
            id: 1,
            userName: 'أحمد محمد',
            rating: 5,
            comment: 'عسل ممتاز وجودة عالية! أنصح به بشدة.',
            date: '2025-11-15'
        },
        {
            id: 2,
            userName: 'فاطمة الزهراء',
            rating: 4,
            comment: 'جيد جداً، لكن السعر مرتفع قليلاً.',
            date: '2025-11-10'
        },
        {
            id: 3,
            userName: 'يوسف العلوي',
            rating: 5,
            comment: 'أفضل عسل جربته! طعم رائع وطبيعي 100%',
            date: '2025-11-05'
        },
    ]);

    const renderStars = (rating) => {
        return '⭐'.repeat(Math.floor(rating));
    };

    return (
        <ReviewsContainer>
            <Title>التقييمات والمراجعات</Title>

            <RatingSummary>
                <AverageRating>
                    <RatingNumber>{rating}</RatingNumber>
                    <Stars>{renderStars(rating)}</Stars>
                    <ReviewCount>{reviewCount} تقييم</ReviewCount>
                </AverageRating>
            </RatingSummary>

            <ReviewsList>
                {reviews.map((review) => (
                    <ReviewCard key={review.id}>
                        <ReviewHeader>
                            <ReviewerName>{review.userName}</ReviewerName>
                            <ReviewDate>{review.date}</ReviewDate>
                        </ReviewHeader>
                        <ReviewRating>{renderStars(review.rating)}</ReviewRating>
                        <ReviewText>{review.comment}</ReviewText>
                    </ReviewCard>
                ))}
            </ReviewsList>

            <AddReviewButton onClick={() => alert('ميزة إضافة تقييم قريباً!')}>
                أضف تقييمك
            </AddReviewButton>
        </ReviewsContainer>
    );
}
