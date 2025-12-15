'use client';

import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getRecentlyViewed } from '../../lib/recommendations';

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

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  }
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

export default function RecentlyViewed() {
    const router = useRouter();
    const allProducts = useSelector((state) => state.products.items);
    const [recentProducts, setRecentProducts] = useState([]);

    useEffect(() => {
        const products = getRecentlyViewed(allProducts);
        setRecentProducts(products);
    }, [allProducts]);

    if (recentProducts.length === 0) return null;

    return (
        <Section>
            <Title>
                <span>👁️</span>
                <span>شفتي مؤخراً</span>
            </Title>
            <Grid>
                {recentProducts.map((product) => (
                    <ProductCard
                        key={product.id}
                        onClick={() => router.push(`/products/${product.id}`)}
                    >
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
