'use client'; 

import styled from 'styled-components';
import ProductCard from './components/ProductCard'; 
import HeroSection from './components/HeroSection';

// الـ Styling ديال قسم المنتجات المختارة
const SectionContainer = styled.div`
  max-width: 1200px;
  margin: 3rem auto;
  padding: 0 1.5rem;
`;

const SectionTitle = styled.h2`
  text-align: center;
  font-size: 2.2rem;
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: 2rem;
  font-weight: 900;
  position: relative;
  
  &::after {
    content: '';
    display: block;
    width: 80px;
    height: 4px;
    background: ${({ theme }) => theme.colors.primary};
    margin: 10px auto 0;
    border-radius: 2px;
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;


export default function HomeView({ featuredProducts }) {
  return (
    <div>
      {/* 1. البانر الرئيسي (Client Component) */}
      <HeroSection />

      {/* 2. قسم المنتجات المميزة */}
      <SectionContainer>
        <SectionTitle>✨ منتجاتنا الأكثر طلباً ✨</SectionTitle>
        <ProductGrid>
          {featuredProducts.map(product => (
            // الـ ProductCard حتى هو Client Component
            <ProductCard key={product.id} product={product} />
          ))}
        </ProductGrid>
      </SectionContainer>
    </div>
  );
}