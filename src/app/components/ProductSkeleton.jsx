'use client';

import styled from 'styled-components';

const SkeletonContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const SkeletonCard = styled.div`
  border: 1px solid #eee;
  border-radius: 12px;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08);
`;

const SkeletonImage = styled.div`
  width: 100%;
  height: 220px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;

  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

const SkeletonContent = styled.div`
  padding: 1rem;
`;

const SkeletonLine = styled.div`
  height: ${({ $height }) => $height || '16px'};
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
  margin-bottom: ${({ $marginBottom }) => $marginBottom || '12px'};
  width: ${({ $width }) => $width || '100%'};

  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

export default function ProductSkeleton({ count = 12 }) {
    return (
        <SkeletonContainer>
            {Array.from({ length: count }).map((_, index) => (
                <SkeletonCard key={index}>
                    <SkeletonImage />
                    <SkeletonContent>
                        <SkeletonLine $height="20px" $width="80%" $marginBottom="12px" />
                        <SkeletonLine $height="16px" $width="40%" $marginBottom="16px" />
                        <SkeletonLine $height="36px" $width="60%" $marginBottom="0" />
                    </SkeletonContent>
                </SkeletonCard>
            ))}
        </SkeletonContainer>
    );
}
