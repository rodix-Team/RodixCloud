'use client'; 

import styled from 'styled-components';
import Image from 'next/image';
import { useCart } from '../../context/CartContext';

// 1. الـ Styling ديال الصفحة
const Container = styled.div`
  max-width: 1000px;
  margin: 3rem auto;
  padding: 0 1.5rem;
  display: grid;
  grid-template-columns: 1fr 1fr; /* عمود للصورة وعمود للتفاصيل */
  gap: 3rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr; /* عمود واحد في الشاشات الصغيرة */
  }
`;

const ImagePlaceholder = styled.div`
  background-color: #f5f5f5;
  border-radius: 8px;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DetailsSection = styled.div`
  text-align: right;
`;

const Name = styled.h1`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: 0.5rem;
`;

const PriceTag = styled.div`
  font-size: 3rem;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.primary};
  margin: 1.5rem 0;
`;

const Button = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  padding: 1rem 2rem;
  font-size: 1.25rem;
  font-weight: 700;
  border-radius: 50px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 100%;
  max-width: 300px; 
  margin-top: 2rem;

  &:hover {
    background-color: #d49500;
  }
`;


export default function ProductDetailsView({ product }) {
  // 🚨 استخدام الـ Context 🚨
  const { addToCart } = useCart();
  
  // تغيير دالة الإضافة
  const handleAddToCart = () => {
    addToCart(product, 1); // كنضيفو منتج واحد
    alert(`تم إضافة ${product.name} إلى سلة التسوق!`);
  };

  return (
    <Container>
      {/* العمود الأول: الصورة */}
      <Image 
        src={product.imageUrl} 
        alt={product.name}
        width={500} 
        height={400} 
        style={{ objectFit: 'cover', width: '100%', borderRadius: '8px' }}
      />
      
      {/* 🚨 العمود الثاني: التفاصيل 🚨 */}
      <DetailsSection>
        
        {/* 1. اسم المنتج */}
        <Name>{product.name}</Name> 
        
        {/* 2. الوزن والتفاصيل */}
        <p style={{ color: '#666', fontSize: '1.1rem', borderBottom: '1px solid #ccc', paddingBottom: '1rem' }}>
          {product.weight} - {product.details}
        </p>

        {/* 3. السعر */}
        <PriceTag>
          {product.price} {product.unit}
        </PriceTag>

        {/* 4. الوصف الكامل */}
        <p style={{ lineHeight: 1.8, marginBottom: '2rem' }}>
          **الوصف:** {product.description}
        </p>
        
        <Button onClick={handleAddToCart}>
          أضف إلى سلة الشراء 🛒
        </Button>
      </DetailsSection>
    </Container>
  );
}