'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import StarRating from './StarRating';
import ReviewsList from './ReviewsList';
import ReviewForm from './ReviewForm';
import toast from 'react-hot-toast';

const Section = styled.section`
  margin: 3rem 0;
`;

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 2rem;
`;

const OverviewCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const RatingOverview = styled.div`
  text-align: center;
`;

const AverageRating = styled.div`
  font-size: 3rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 0.5rem;
`;

const TotalReviews = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 0.5rem;
`;

const RatingDistribution = styled.div``;

const RatingBar = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
`;

const BarLabel = styled.span`
  min-width: 60px;
  font-size: 0.9rem;
`;

const BarContainer = styled.div`
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
`;

const BarFill = styled.div`
  height: 100%;
  background: ${({ theme }) => theme.colors.primary};
  width: ${({ $percentage }) => $percentage}%;
  transition: width 0.3s;
`;

const BarCount = styled.span`
  min-width: 40px;
  text-align: right;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export default function ReviewsSection({ productId }) {
    const [reviews, setReviews] = useState([]);

    // Load reviews from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(`reviews_${productId}`);
        if (stored) {
            setReviews(JSON.parse(stored));
        }
    }, [productId]);

    // Save reviews to localStorage
    const saveReviews = (newReviews) => {
        localStorage.setItem(`reviews_${productId}`, JSON.stringify(newReviews));
        setReviews(newReviews);
    };

    const handleSubmitReview = (review) => {
        const updated = [review, ...reviews];
        saveReviews(updated);
        toast.success('✅ تم إضافة تقييمك بنجاح!');
    };

    // Calculate statistics
    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => r.rating === star).length,
        percentage: reviews.length > 0
            ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100
            : 0
    }));

    return (
        <Section>
            <SectionTitle>تقييمات المنتج</SectionTitle>

            <OverviewCard>
                <RatingOverview>
                    <AverageRating>{averageRating}</AverageRating>
                    <StarRating rating={Math.round(averageRating)} size="1.5rem" />
                    <TotalReviews>({reviews.length} تقييم)</TotalReviews>
                </RatingOverview>

                <RatingDistribution>
                    {ratingCounts.map(({ star, count, percentage }) => (
                        <RatingBar key={star}>
                            <BarLabel>{star} نجوم</BarLabel>
                            <BarContainer>
                                <BarFill $percentage={percentage} />
                            </BarContainer>
                            <BarCount>{count}</BarCount>
                        </RatingBar>
                    ))}
                </RatingDistribution>
            </OverviewCard>

            <ReviewForm productId={productId} onSubmit={handleSubmitReview} />
            <ReviewsList reviews={reviews} />
        </Section>
    );
}
