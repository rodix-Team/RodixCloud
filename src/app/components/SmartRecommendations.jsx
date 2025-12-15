'use client';

import { useSelector } from 'react-redux';
import styled from 'styled-components';
import Link from 'next/link';
import { getProductRecommendations, getCustomersAlsoBought } from '../../lib/recommendations';

const RecommendationsSection = styled.section`
  margin: 3rem 0;
  padding: 2rem;
  background: #f9f9f9;
  border-radius: 12px;
`;

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const ProductCard = styled(Link)`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 16px rgba(244, 163, 0, 0.3);
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const ProductInfo = styled.div`
  padding: 1rem;
`;

const ProductName = styled.h3`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const ProductPrice = styled.p`
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const ProductRating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: #666;
  font-size: 0.9rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #999;
`;

export default function SmartRecommendations({ currentProduct, type = 'similar' }) {
    const allProducts = useSelector((state) => state.products.items);

    if (!currentProduct || !allProducts.length) {
        return null;
    }

    let recommendations = [];
    let title = '';
    let icon = '';

    if (type === 'similar') {
        recommendations = getProductRecommendations(currentProduct, allProducts, 4);
        title = 'منتجات مشابهة';
        icon = '🎯';
    } else if (type === 'also-bought') {
        recommendations = getCustomersAlsoBought(currentProduct.id, allProducts, 4);
        title = 'الزبائن اشتراو كذلك';
        icon = '🛒';
    }

    if (!recommendations.length) {
        return null;
    }

    return (
        <RecommendationsSection>
            <SectionTitle>
                <span>{icon}</span>
                {title}
            </SectionTitle>

            <ProductsGrid>
                {recommendations.map((product) => (
                    <ProductCard key={product.id} href={`/products/${product.id}`}>
                        <ProductImage
                            src={product.imageUrl}
                            alt={product.name}
                            loading="lazy"
                        />
                        <ProductInfo>
                            <ProductName>{product.name}</ProductName>
                            <ProductPrice>{product.price} {product.unit}</ProductPrice>
                            <ProductRating>
                                <span>⭐</span>
                                <span>{product.rating}/5</span>
                                <span>({product.reviews} تقييم)</span>
                            </ProductRating>
                        </ProductInfo>
                    </ProductCard>
                ))}
            </ProductsGrid>
        </RecommendationsSection>
    );
}
