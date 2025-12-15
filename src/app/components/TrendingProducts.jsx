'use client';

import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getTrendingProducts } from '../../lib/recommendations';

const Section = styled.section`
  margin: 3rem 0;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  }
`;

const TrendingBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(135deg, #F4A300 0%, #FFB82E 100%);
  color: white;
  padding: 0.3rem 0.6rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
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
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 0.5rem;
`;

const ProductPrice = styled.p`
  font-size: 1rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.secondary};
`;

export default function TrendingProducts() {
    const router = useRouter();
    const allProducts = useSelector((state) => state.products.items);
    const [trending, setTrending] = useState([]);

    useEffect(() => {
        const products = getTrendingProducts(allProducts);
        setTrending(products);
    }, [allProducts]);

    return (
        <Section>
            <Title>
                <span>🔥</span>
                <span>الأكثر طلباً</span>
            </Title>
            <Grid>
                {trending.map((product, index) => (
                    <ProductCard
                        key={product.id}
                        onClick={() => router.push(`/products/${product.id}`)}
                    >
                        {index === 0 && <TrendingBadge>🔥 الأكثر</TrendingBadge>}
                        <ProductImage src={product.imageUrl} alt={product.name} />
                        <ProductInfo>
                            <ProductName>{product.name}</ProductName>
                            <ProductPrice>{product.price} {product.unit}</ProductPrice>
                        </ProductInfo>
                    </ProductCard>
                ))}
            </Grid>
        </Section>
    );
}
