'use client';

import styled from 'styled-components';
import Link from 'next/link';

// -----------------
// STYLED COMPONENTS
// -----------------

const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80vh;
  text-align: center;
  padding: 0 1.5rem;
`;

const ErrorCode = styled.h1`
  font-size: 8rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 0;
  font-weight: 900;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 5rem;
  }
`;

const ErrorTitle = styled.h2`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.secondary};
  margin-top: 0;
  margin-bottom: 1.5rem;
`;

const BackLink = styled(Link)`
  display: inline-block;
  background-color: ${({ theme }) => theme.colors.secondary};
  color: white;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 50px;
  transition: background-color 0.3s ease;
  text-decoration: none;

  &:hover {
    background-color: #333; 
  }
`;

// -----------------
// COMPONENT
// -----------------

export default function NotFound() {
  return (
    <NotFoundContainer>
      <ErrorCode>404</ErrorCode>
      <ErrorTitle>الصفحة لي كتقلب عليها ما لقيناهاش 🔍</ErrorTitle>
      <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '2rem' }}>
        يبدو أن الرابط لي دخلتيه خاطئ.
      </p>
      <BackLink href="/">
        ⬅️ رجوع للصفحة الرئيسية
      </BackLink>
    </NotFoundContainer>
  );
}