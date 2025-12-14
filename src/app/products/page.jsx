'use client';

import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  addItem
} from '../../redux/slices/cartSlice';
import {
  selectFilteredProducts,
  setSearchQuery,
  toggleCategory,
  clearFilters
} from '../../redux/slices/productsSlice';

// -----------------
// ANIMATIONS
// -----------------
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

// -----------------
// STYLED COMPONENTS
// -----------------
const PageContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
`;

const HeroSection = styled.div`
  height: 40vh;
  min-height: 300px;
  background: radial-gradient(circle at center, #2a2a2a 0%, #000000 100%);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: url('/images/custom_honey_bg.jpg') center/cover;
    opacity: 0.4;
  }

  @media (max-width: 768px) {
    height: 30vh;
    min-height: 200px;
    padding: 1.5rem 1rem;
  }
`;

const HeroTitle = styled(motion.h1)`
  font-size: 3.5rem;
  font-weight: 900;
  color: white;
  z-index: 2;
  margin-bottom: 0.5rem;
  text-shadow: 0 10px 30px rgba(0,0,0,0.5);

  span {
    color: #FFD700;
  }

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const HeroSubtitle = styled(motion.p)`
  color: #ddd;
  font-size: 1.2rem;
  z-index: 2;
  max-width: 600px;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const FilterSection = styled.div`
  position: sticky;
  top: 80px; // Adjust based on header height
  z-index: 50;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem 0;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FilterContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    padding: 0 1rem;
  }
`;

const TabsWrapper = styled.div`
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 5px;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
  -webkit-overflow-scrolling: touch;
`;

const Tab = styled.button`
  background: ${({ $active, theme }) => $active ? theme.colors.primary : '#f5f5f5'};
  color: ${({ $active }) => $active ? 'white' : '#666'};
  padding: 0.6rem 1.2rem;
  border-radius: 20px;
  border: none;
  font-weight: bold;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: ${({ $active }) => $active ? '0 4px 12px rgba(244, 163, 0, 0.3)' : 'none'};

  &:hover {
    background: ${({ $active, theme }) => $active ? theme.colors.primary : '#e0e0e0'};
    transform: translateY(-2px);
  }
`;

const SearchBar = styled.div`
  position: relative;
  min-width: 300px;

  input {
    width: 100%;
    padding: 0.8rem 1rem 0.8rem 2.5rem;
    border-radius: 25px;
    border: 2px solid #eee;
    background: #f8f9fa;
    transition: all 0.3s;

    &:focus {
      outline: none;
      background: white;
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: 0 0 0 3px rgba(244, 163, 0, 0.1);
    }
  }

  span {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #aaa;
  }
`;

const ProductsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  padding: 3rem 2rem;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 2rem 1rem;
    gap: 1rem;
    grid-template-columns: repeat(auto-fill, minmax(100%, 1fr));
  }
`;

const ProductCard = styled(motion.div)`
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  position: relative;
  transition: all 0.4s ease;
  cursor: pointer;
  border: 1px solid rgba(0,0,0,0.02);

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    
    .image-zoom {
      transform: scale(1.1);
    }
    
    .add-btn {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ImageWrapper = styled.div`
  height: 250px;
  overflow: hidden;
  position: relative;
  background: #f0f0f0;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
`;

const CardOverlay = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 10;
`;

const Badge = styled.span`
  background: rgba(255,255,255,0.9);
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  color: #333;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  backdrop-filter: blur(5px);
`;

const HeartBtn = styled.button`
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  transition: transform 0.2s;
  color: #ff4757;

  &:hover {
    transform: scale(1.1);
  }
`;

const Content = styled.div`
  padding: 1.5rem;
`;

const Category = styled.span`
  color: #F4A300;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: bold;
`;

const Name = styled.h3`
  font-size: 1.2rem;
  margin: 0.5rem 0;
  color: #222;
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
`;

const Price = styled.div`
  font-size: 1.3rem;
  font-weight: bold;
  color: #333;
`;

const AddBtn = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
  
  &:hover {
    background: #d17834;
    transform: scale(1.05);
  }
`;

// -----------------
// PAGE COMPONENT
// -----------------

// Static Categories (Could be derived from products too)
const TABS = [
  'الكل',
  'عسل جبلي',
  'عسل فاخر',
  'عسل طبي',
  'عسل حمضيات',
  'عسل طبيعي'
];

export default function ProductsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const filteredProducts = useSelector(selectFilteredProducts);
  const [activeTab, setActiveTab] = useState('الكل');

  // Handle Tab Click
  const handleTabClick = (category) => {
    setActiveTab(category);
    dispatch(clearFilters()); // Clear previous
    if (category !== 'الكل') {
      dispatch(toggleCategory(category));
    }
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    dispatch(addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl
    }));
    toast.success(`تمت إضافة ${product.name} إلى السلة 🛒`);
  };

  return (
    <PageContainer>
      <HeroSection>
        <HeroTitle initial="hidden" animate="visible" variants={fadeInUp}>
          مجموعتنا <span>الذهبية</span>
        </HeroTitle>
        <HeroSubtitle initial="hidden" animate="visible" variants={fadeInUp}>
          اكتشف أرقى أنواع العسل الطبيعي، من قلب جبال الأطلس إلى مائدتك.
        </HeroSubtitle>
      </HeroSection>

      <FilterSection>
        <FilterContainer>
          <TabsWrapper>
            {TABS.map((tab) => (
              <Tab
                key={tab}
                $active={activeTab === tab}
                onClick={() => handleTabClick(tab)}
              >
                {tab}
              </Tab>
            ))}
          </TabsWrapper>

          <SearchBar>
            <span>🔍</span>
            <input
              type="text"
              placeholder="ابحث عن منتج..."
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            />
          </SearchBar>
        </FilterContainer>
      </FilterSection>

      <ProductsGrid layout>
        <AnimatePresence>
          {filteredProducts.map((product) => (
            <ProductCard
              layout
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => router.push(`/products/${product.id}`)}
            >
              <ImageWrapper>
                <CardOverlay>
                  <Badge>{product.category}</Badge>
                  {/* <HeartBtn onClick={(e) => e.stopPropagation()}>♥</HeartBtn> */}
                </CardOverlay>
                <ProductImage
                  src={product.imageUrl}
                  alt={product.name}
                  className="image-zoom"
                />
              </ImageWrapper>

              <Content>
                {/* <Category>{product.category}</Category> */}
                <Name>{product.name}</Name>
                <div style={{ display: 'flex', gap: '5px', color: '#FFD700', fontSize: '0.9rem' }}>
                  {'★'.repeat(Math.round(product.rating))}
                  <span style={{ color: '#ccc' }}>({product.reviews})</span>
                </div>

                <PriceRow>
                  <Price>{product.price} درهم</Price>
                  <AddBtn
                    className="add-btn"
                    onClick={(e) => handleAddToCart(e, product)}
                  >
                    + إضافة
                  </AddBtn>
                </PriceRow>
              </Content>
            </ProductCard>
          ))}
        </AnimatePresence>
      </ProductsGrid>

      {filteredProducts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>
          <h3>😔 لا توجد منتجات مطابقة</h3>
          <p>جرب البحث عن شيء آخر.</p>
        </div>
      )}
    </PageContainer>
  );
}