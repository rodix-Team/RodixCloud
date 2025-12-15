'use client';

import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { getPersonalizedRecommendations, getViewedProducts } from '../../lib/recommendations';

const Section = styled.section`
  margin: 2rem 0;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(244, 163, 0, 0.05) 0%, rgba(255, 184, 46, 0.05) 100%);
  border-radius: 16px;
  border: 2px solid rgba(244, 163, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 0.95rem;
  margin-top: 0.3rem;
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 8px 24px rgba(244, 163, 0, 0.25);
  }
`;

const Badge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  z-index: 1;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
`;

const ProductInfo = styled.div`
  padding: 1rem;
`;

const ProductName = styled.h3`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 1rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  line-height: 1.3;
`;

const ProductPrice = styled.p`
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const ProductRating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: #666;
  font-size: 0.85rem;
`;

export default function PersonalizedSection() {
    const allProducts = useSelector((state) => state.products.items);
    const cartItems = useSelector((state) => state.cart.items);
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        if (!allProducts.length) return;

        const viewedIds = getViewedProducts();
        const personalized = getPersonalizedRecommendations(
            viewedIds,
            cartItems,
            allProducts,
            6
        );

        setRecommendations(personalized);
    }, [allProducts, cartItems]);

    if (!recommendations.length) {
        return null;
    }

    return (
        <Section>
            <Header>
                <div>
                    <Title>
                        <span>✨</span>
                        مقترحات خاصة بك
                    </Title>
                    <Subtitle>بناءً على اهتماماتك وتصفحك</Subtitle>
                </div>
            </Header>

            <ProductsGrid>
                {recommendations.map((product, index) => (
                    <ProductCard key={product.id} href={`/products/${product.id}`}>
                        {index === 0 && <Badge>الأكثر ملاءمة</Badge>}
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
                            </ProductRating>
                        </ProductInfo>
                    </ProductCard>
                ))}
            </ProductsGrid>
        </Section>
    );
}
