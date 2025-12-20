'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { http, getFullImageUrl } from '@/lib/http';
import { useDispatch } from 'react-redux';
import { addItem } from '@/redux/slices/cartSlice';
import { ShoppingCart, Package, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

// ========== Styled Components ==========

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme?.colors?.backgroundLight || '#FAFAFA'};
`;

const HeroSection = styled.section`
  background: ${({ theme }) => theme?.gradients?.gold || 'linear-gradient(135deg, #FFD700 0%, #F4A300 50%, #D68910 100%)'};
  padding: 4rem 1.5rem;
  text-align: center;
  color: white;
  
  @media (min-width: 768px) {
    padding: 6rem 2rem;
  }
`;

const HeroTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
  
  @media (min-width: 768px) {
    font-size: 3rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.125rem;
  opacity: 0.95;
  max-width: 600px;
  margin: 0 auto 2rem;
  
  @media (min-width: 768px) {
    font-size: 1.25rem;
  }
`;

const HeroButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  color: ${({ theme }) => theme?.colors?.primary || '#F4A300'};
  padding: 1rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1.125rem;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.25);
  }
`;

const Section = styled.section`
  max-width: 1280px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 2rem;
  color: ${({ theme }) => theme?.colors?.textPrimary || '#2C2C2C'};
  
  span {
    color: ${({ theme }) => theme?.colors?.primary || '#F4A300'};
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: ${({ theme }) => theme?.shadows?.sm || '0 2px 4px rgba(0,0,0,0.08)'};
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme?.shadows?.lg || '0 8px 16px rgba(0,0,0,0.15)'};
  }
`;

const ProductImage = styled.div`
  aspect-ratio: 1;
  background: #f5f5f5;
  position: relative;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
  }
  
  ${ProductCard}:hover & img {
    transform: scale(1.05);
  }
`;

const ProductInfo = styled.div`
  padding: 1rem;
`;

const ProductName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme?.colors?.textPrimary || '#2C2C2C'};
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProductPrice = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme?.colors?.primary || '#F4A300'};
  margin-bottom: 0.75rem;
`;

const AddToCartButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: ${({ theme }) => theme?.colors?.primary || '#F4A300'};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  transition: background 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme?.colors?.primaryDark || '#D68910'};
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
`;

const FeaturesSection = styled.section`
  background: white;
  padding: 3rem 1.5rem;
`;

const FeaturesGrid = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
`;

const FeatureCard = styled.div`
  text-align: center;
  padding: 2rem;
`;

const FeatureIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const FeatureTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme?.colors?.textPrimary || '#2C2C2C'};
`;

const FeatureDescription = styled.p`
  color: ${({ theme }) => theme?.colors?.textSecondary || '#666'};
  line-height: 1.6;
`;

const ViewAllLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
  color: ${({ theme }) => theme?.colors?.primary || '#F4A300'};
  font-weight: 600;
  font-size: 1.125rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

// ========== Component ==========

// Helper function to get product price display
const getProductPrice = (product) => {
  // If product has a direct price, use it
  if (product.price && parseFloat(product.price) > 0) {
    return `${product.price} درهم`;
  }

  // If product has variants, calculate price range
  // Backend uses 'variants' not 'variations'
  if (product.variants && product.variants.length > 0) {
    const prices = product.variants
      .map(v => parseFloat(v.price))
      .filter(p => !isNaN(p) && p > 0);

    if (prices.length > 0) {
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      if (minPrice === maxPrice) {
        return `${minPrice} درهم`;
      }
      return `${minPrice} - ${maxPrice} درهم`;
    }
  }

  return 'السعر حسب الاختيار';
};

// Check if product is variable type
const isVariableProduct = (product) => {
  return product.type === 'variable' || (product.variants && product.variants.length > 0);
};

export default function StorePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await http.get('/products');
        setProducts(res.data.data || []);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (product) => {
    // If variable product, redirect to product page to select variation
    if (isVariableProduct(product)) {
      toast('🔍 اختر الخيارات من صفحة المنتج', { icon: '📦' });
      return;
    }

    dispatch(addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
    }));
    toast.success(`✅ تم إضافة ${product.name} للسلة!`);
  };

  const features = [
    { icon: '🌿', title: 'عسل طبيعي 100%', description: 'عسل نقي وخالي من أي إضافات أو مواد حافظة' },
    { icon: '✨', title: 'جودة عالية', description: 'ننتقي أجود أنواع العسل من أفضل المناحل' },
    { icon: '🚚', title: 'توصيل سريع', description: 'خدمة توصيل سريعة وموثوقة لجميع المناطق' },
    { icon: '📞', title: 'دعم العملاء', description: 'فريق دعم جاهز للإجابة على استفساراتكم' },
  ];

  return (
    <PageContainer>
      {/* Hero Section */}
      <HeroSection>
        <HeroTitle>🍯 عسل طبيعي فاخر</HeroTitle>
        <HeroSubtitle>
          أجود أنواع العسل الحر مباشرة من المناحل إلى منزلك
        </HeroSubtitle>
        <HeroButton href="/products">
          تسوق الآن
          <ArrowLeft size={20} />
        </HeroButton>
      </HeroSection>

      {/* Featured Products */}
      <Section>
        <SectionTitle>🍯 <span>منتجاتنا المميزة</span> 🍯</SectionTitle>

        {loading ? (
          <LoadingContainer>
            <Loader2 size={40} className="animate-spin" style={{ color: '#F4A300' }} />
          </LoadingContainer>
        ) : (
          <>
            <ProductGrid>
              {products.slice(0, 6).map((product) => (
                <ProductCard key={product.id}>
                  <Link href={`/products/${product.id}`}>
                    <ProductImage>
                      {product.image_url ? (
                        <img src={getFullImageUrl(product.image_url)} alt={product.name} />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                          <Package size={48} color="#ccc" />
                        </div>
                      )}
                    </ProductImage>
                  </Link>
                  <ProductInfo>
                    <ProductName>{product.name}</ProductName>
                    <ProductPrice>{getProductPrice(product)}</ProductPrice>
                    <AddToCartButton onClick={() => handleAddToCart(product)}>
                      <ShoppingCart size={18} />
                      {isVariableProduct(product) ? 'عرض الخيارات' : 'أضف للسلة'}
                    </AddToCartButton>
                  </ProductInfo>
                </ProductCard>
              ))}
            </ProductGrid>

            <ViewAllLink href="/products">
              عرض جميع المنتجات
              <ArrowLeft size={18} />
            </ViewAllLink>
          </>
        )}
      </Section>

      {/* Features */}
      <FeaturesSection>
        <SectionTitle>لماذا تختارنا؟</SectionTitle>
        <FeaturesGrid>
          {features.map((feature, index) => (
            <FeatureCard key={index}>
              <FeatureIcon>{feature.icon}</FeatureIcon>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
            </FeatureCard>
          ))}
        </FeaturesGrid>
      </FeaturesSection>
    </PageContainer>
  );
}
