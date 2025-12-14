// 🚨 هذا هو الجزء لي فيه الـ Styling ديال الصفحة، خاص يكون 'use client' 🚨
'use client'; 

import styled from 'styled-components';
import ProductCard from '../components/ProductCard'; 
// هنا كنستوردو غير الـ Components لي كيحتاجو Client Side

// الـ Styling ديال الصفحة
const ProductsContainer = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1.5rem;
`;

const Title = styled.h2`
  text-align: center;
  font-size: 2.5rem;
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: 2rem;
  font-weight: 900;
  border-bottom: 3px solid ${({ theme }) => theme.colors.primary};
  display: inline-block;
  padding-bottom: 5px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

export default function ProductsView({ products }) {
  return (
    <ProductsContainer>
      <div style={{ textAlign: 'center' }}>
         <Title>🍯 منتجات عسل تارودانت الحرة 🥇</Title>
      </div>
     
      <Grid>
        {products.map(product => (
          // ProductCard راه هو Client Component (فيه 'use client')
          <ProductCard key={product.id} product={product} /> 
        ))}
      </Grid>
    </ProductsContainer>
  );
}