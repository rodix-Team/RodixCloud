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
  align-items: start;
  margin-bottom: 1rem;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const NameSkeleton = styled(SkeletonBase)`
  height: 20px;
  width: 150px;
  margin-bottom: 0.5rem;
`;

const DateSkeleton = styled(SkeletonBase)`
  height: 16px;
  width: 100px;
`;

const RatingSkeleton = styled(SkeletonBase)`
  height: 20px;
  width: 120px;
`;

const TitleSkeleton = styled(SkeletonBase)`
  height: 24px;
  width: 60%;
  margin-bottom: 0.75rem;
`;

const CommentSkeleton = styled(SkeletonBase)`
  height: 16px;
  width: ${({ $width }) => $width || '100%'};
  margin-bottom: 0.5rem;
`;

export default function ReviewSkeleton() {
    return (
        <Card>
            <Header>
                <UserInfo>
                    <NameSkeleton />
                    <DateSkeleton />
                </UserInfo>
                <RatingSkeleton />
            </Header>
            <TitleSkeleton />
            <CommentSkeleton $width="100%" />
            <CommentSkeleton $width="90%" />
            <CommentSkeleton $width="70%" />
        </Card>
    );
}
