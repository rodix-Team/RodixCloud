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
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const OrderIdSkeleton = styled(SkeletonBase)`
  height: 24px;
  width: 120px;
`;

const StatusSkeleton = styled(SkeletonBase)`
  height: 32px;
  width: 100px;
  border-radius: 16px;
`;

const DateSkeleton = styled(SkeletonBase)`
  height: 16px;
  width: 150px;
  margin-bottom: 1rem;
`;

const ItemSkeleton = styled(SkeletonBase)`
  height: 20px;
  width: ${({ $width }) => $width || '100%'};
  margin-bottom: 0.5rem;
`;

const TotalSkeleton = styled(SkeletonBase)`
  height: 28px;
  width: 120px;
  margin-top: 1rem;
`;

export default function OrderCardSkeleton() {
    return (
        <Card>
            <Header>
                <OrderIdSkeleton />
                <StatusSkeleton />
            </Header>
            <DateSkeleton />
            <ItemSkeleton $width="80%" />
            <ItemSkeleton $width="60%" />
            <TotalSkeleton />
        </Card>
    );
}
