import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const SkeletonBase = styled.div`
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 1000px 100%;
  animation: ${shimmer} 2s infinite;
  border-radius: ${({ $radius }) => $radius || '4px'};
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ImageSkeleton = styled(SkeletonBase)`
  width: 100%;
  height: 220px;
`;

const Content = styled.div`
  padding: 1rem;
`;

const TitleSkeleton = styled(SkeletonBase)`
  height: 24px;
  width: 70%;
  margin-bottom: 0.75rem;
`;

const CategorySkeleton = styled(SkeletonBase)`
  height: 20px;
  width: 40%;
  margin-bottom: 0.75rem;
  border-radius: 12px;
`;

const PriceSkeleton = styled(SkeletonBase)`
  height: 28px;
  width: 50%;
  margin-bottom: 0.75rem;
`;

const ButtonSkeleton = styled(SkeletonBase)`
  height: 40px;
  width: 100%;
  border-radius: 8px;
`;

export default function ProductCardSkeleton() {
    return (
        <Card>
            <ImageSkeleton />
            <Content>
                <TitleSkeleton />
                <CategorySkeleton />
                <PriceSkeleton />
                <ButtonSkeleton />
            </Content>
        </Card>
    );
}
