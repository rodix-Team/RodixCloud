'use client';

import styled from 'styled-components';

const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`;

const Star = styled.span`
  color: ${({ $filled }) => $filled ? '#FFD700' : '#ddd'};
  font-size: ${({ $size }) => $size || '1rem'};
`;

export default function StarRating({ rating = 0, maxStars = 5, size = '1rem' }) {
    return (
        <RatingContainer>
            {[...Array(maxStars)].map((_, index) => (
                <Star key={index} $filled={index < rating} $size={size}>
                    ★
                </Star>
            ))}
        </RatingContainer>
    );
}
