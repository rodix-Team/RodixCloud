'use client'; 

import styled from 'styled-components';
import Image from 'next/image'; // لاستخدام صور بطريقة احترافية
import Link from 'next/link';

// 1. الـ Styling ديال الكارت
const Card = styled(Link)`
  display: block;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }
`;

// 2. الـ Styling ديال محتوى الكارت
const CardContent = styled.div`
  padding: 1.5rem;
  text-align: right;
`;

const Name = styled.h3`
  font-size: 1.4rem;
  color: ${({ theme }) => theme.colors.dark};
  margin-bottom: 0.5rem;
  font-weight: 700;
`;

const PriceTag = styled.div`
  font-size: 1.8rem;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.primary};
  margin-top: 1rem;
`;

const Unit = styled.span`
  font-size: 1rem;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.secondary};
  margin-right: 5px;
`;

export default function ProductCard({ product }) {
  return (
    <Card href={`/products/${product.id}`}>
      {/* 🚨 هذا هو التعديل باش تظهر الصورة 🚨 */}
      <Image
        src={product.imageUrl} // المسار ديال الصورة من البيانات ديال المنتج
        alt={product.name}
        width={300} // عرض الصورة
        height={250} // طول الصورة (خاص تكون ثابتة باش الكروت يجيو مقادين)
        style={{ objectFit: 'cover', width: '100%' }} // باش الصورة تغطي المساحة
      />
      
      <CardContent>
        <Name>{product.name}</Name>
        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>{product.weight}</p>
        <PriceTag>
          {product.price}
          <Unit>{product.unit}</Unit>
        </PriceTag>
      </CardContent>
    </Card>
  );
}