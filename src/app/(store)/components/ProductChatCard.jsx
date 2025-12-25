'use client';

import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import StarRating from './StarRating';

const Card = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  margin: 0.5rem 0;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const ProductImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
`;

const ProductInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const ProductName = styled.div`
  font-weight: bold;
  color: #333;
  font-size: 0.95rem;
`;

const ProductPrice = styled.div`
  color: #F4A300;
  font-weight: bold;
  font-size: 1.1rem;
`;

const ProductCategory = styled.div`
  color: #666;
  font-size: 0.85rem;
`;

export default function ProductChatCard({ product, onClick }) {
    const router = useRouter();

    const handleClick = () => {
        if (onClick) {
            onClick(product);
        } else {
            router.push(`/products/${product.id}`);
        }
    };

    return (
        <Card onClick={handleClick}>
            <ProductImage src={product.imageUrl} alt={product.name} />
            <ProductInfo>
                <ProductName>{product.name}</ProductName>
                <ProductCategory>{product.category}</ProductCategory>
                <StarRating rating={product.rating} size="0.9rem" />
                <ProductPrice>{product.price} {product.unit}</ProductPrice>
            </ProductInfo>
        </Card>
    );
}
