'use client';

import styled from 'styled-components';

const StarsContainer = styled.div`
  display: inline-flex;
  gap: 0.2rem;
  align-items: center;
`;

const Star = styled.span`
  color: ${({ $filled }) => $filled ? '#F4A300' : '#ddd'};
  font-size: ${({ $size }) => $size || '1.2rem'};
  transition: color 0.2s;
  cursor: ${({ $interactive }) => $interactive ? 'pointer' : 'default'};
  
  &:hover {
    ${({ $interactive, $filled }) => $interactive && !$filled && `
      color: #FFB82E;
    `}
  }
`;

export default function StarRating({
    rating = 0,
    maxStars = 5,
    size,
    interactive = false,
    onChange
}) {
    const handleClick = (index) => {
        if (interactive && onChange) {
            onChange(index + 1);
        }
    };

    return (
        <StarsContainer>
            {[...Array(maxStars)].map((_, index) => (
                <Star
                    key={index}
                    $filled={index < rating}
                    $size={size}
                    $interactive={interactive}
                    onClick={() => handleClick(index)}
                >
                    ★
                </Star>
            ))}
        </StarsContainer>
    );
}
