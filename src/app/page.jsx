'use client';

import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { addItem } from '../redux/slices/cartSlice';
import PersonalizedSection from './components/PersonalizedSection';
import RecentlyViewed from './components/RecentlyViewed';
import TrendingProducts from './components/TrendingProducts';
import { PageTransition, FadeIn, SlideUp, StaggerContainer, StaggerItem } from './components/Animations';

const selectAllProducts = (state) => state.products.items;

const HeroSection = styled.section`
  background: url('/images/honey_background.jpg') center/cover no-repeat;
  height: 450px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  text-align: center;
  margin-bottom: 3rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
  padding: 2rem;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
  }

  @media (max-width: 768px) {
    height: 350px;
    margin-bottom: 2rem;
    border-radius: 8px;
    padding: 1rem;
  }
`;

const HeroTitle = styled.h2`
  font-size: 3.5rem;
  font-weight: 900;
  margin: 0;
  z-index: 10;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);

  @media (max-width: 768px) {
    font-size: 2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.6rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.5rem;
  margin-top: 10px;
  z-index: 10;
  max-width: 90%;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }

  @media (max-width: 480px) {
    font-size: 0.95rem;
  }
`;

const ShopNowButton = styled.button`
  background-color: ${({ theme }) => theme.colors.secondary};
  color: white;
  border: none;
  padding: 1rem 2.5rem;
  font-size: 1.2rem;
  margin-top: 25px;
  border-radius: 30px;
  cursor: pointer;
  z-index: 10;
  transition: background-color 0.3s, transform 0.1s;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);

  &:hover {
    background-color: #d17834;
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    padding: 0.9rem 2rem;
    font-size: 1.1rem;
  }
`;

const HomePageContainer = styled.div`
  padding: 2rem;
  min-height: 80vh;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const MainTitle = styled.h1`
  text-align: center;
  font-size: 2.5rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 2.5rem;

  @media (max-width: 768px) {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-top: 1.5rem;
  }
`;

const ProductCard = styled.div`
  border: 1px solid #eee;
  border-radius: 12px;
  overflow: hidden;
  text-align: center;
  padding-bottom: 1rem;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  background-color: white;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 768px) {
    &:hover {
      transform: translateY(-3px);
    }
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 220px;
  object-fit: cover;
  margin-bottom: 1rem;
  display: block;
  border-bottom: 1px solid #eee;

  @media (max-width: 768px) {
    height: 180px;
  }
`;

const ProductName = styled.h3`
  font-size: 1.4rem;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0.5rem 0;
  padding: 0 1rem;

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const ProductPrice = styled.p`
  font-size: 1.2rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.secondary};
  margin-top: 0.5rem;
  margin-bottom: 0;
`;

const AddToCartCardButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 0.6rem 1.5rem;
  font-size: 1rem;
  border-radius: 20px;
  cursor: pointer;
  margin-top: 0.8rem;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #d17834;
  }

  @media (max-width: 768px) {
    padding: 0.7rem 1.8rem;
    font-size: 1.05rem;
    margin-top: 1rem;
  }
`;

const FeaturesSectionContainer = styled.section`
  margin-top: 5rem;
  margin-bottom: 5rem;
  text-align: center;

  @media (max-width: 768px) {
    margin-top: 3rem;
    margin-bottom: 3rem;
  }
`;

const FeaturesTitle = styled(MainTitle)`
  margin-bottom: 3rem;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const FeatureCard = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  }
`;

const FeatureIcon = styled.div`
  font-size: 3rem;
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: 1rem;
`;

const FeatureName = styled.h4`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 0.8rem;
`;

const FeatureDescription = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
`;

const TestimonialsSectionContainer = styled.section`
  margin-top: 5rem;
  margin-bottom: 5rem;
  text-align: center;

  @media (max-width: 768px) {
    margin-top: 3rem;
    margin-bottom: 3rem;
  }
`;

const TestimonialsTitle = styled(MainTitle)`
  margin-bottom: 3rem;
`;

const TestimonialsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const TestimonialCard = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s, box-shadow 0.3s;
  text-align: center;
  position: relative;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  }

  &::before {
    content: "❝";
    font-size: 4rem;
    color: ${({ theme }) => theme.colors.primary};
    position: absolute;
    top: 10px;
    left: 20px;
    opacity: 0.1;
    z-index: 0;
  }
`;

const TestimonialText = styled.p`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.textPrimary};
  line-height: 1.8;
  margin-bottom: 1.5rem;
  font-style: italic;
  position: relative;
  z-index: 1;
`;

const TestimonialAuthor = styled.p`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 1.1rem;
  margin-top: 1rem;
`;

export default function Home() {
  const router = useRouter();
  const dispatch = useDispatch();
  const products = useSelector(selectAllProducts);

  const handleShopNow = () => {
    router.push('/products');
  };

  const handleProductClick = (id) => {
    router.push(`/products/${id}`);
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    dispatch(addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    }));
    toast.success(`✅ تم إضافة ${product.name} للعربة!`);
  };

  const features = [
    { icon: '🌿', name: 'عسل طبيعي 100%', description: 'نضمن لكم عسلاً نقياً وخالياً من أي إضافات أو مواد حافظة.' },
    { icon: '✨', name: 'جودة عالية', description: 'ننتقي أجود أنواع العسل من خلايا النحل في جبال سوس ماسة.' },
    { icon: '🚚', name: 'توصيل سريع', description: 'استمتع بخدمة توصيل سريعة وموثوقة لجميع أنحاء المغرب.' },
    { icon: '📞', name: 'دعم العملاء', description: 'فريق دعم العملاء لدينا جاهز للإجابة على استفساراتكم ومساعدتكم.' },
  ];

  const testimonials = [
    {
      text: 'أفضل عسل ذقته على الإطلاق! طعم رائع وجودة لا مثيل لها. أنصح به بشدة.',
      author: 'أحمد',
    },
    {
      text: 'خدمة ممتازة وتوصيل سريع. العسل وصلني طازجاً ومغلفاً بعناية فائقة.',
      author: 'فاطمة',
    },
    {
      text: 'عسل طبيعي وصحي، فرق كبير عن المنتجات الأخرى في السوق. سأطلب مرة أخرى بالتأكيد.',
      author: 'يوسف',
    },
  ];

  return (
    <HomePageContainer>
      <HeroSection>
        <HeroTitle>عسل تارودانت الذهبي</HeroTitle>
        <HeroSubtitle>أجود أنواع العسل الحر المغربي مباشرة من جبال سوس ماسة</HeroSubtitle>
        <ShopNowButton onClick={handleShopNow}>تسوق الآن</ShopNowButton>
      </HeroSection>

      <MainTitle>🍯 بعض من منتجاتنا المميزة 🍯</MainTitle>

      <ProductGrid>
        {products.slice(0, 3).map((product) => (
          <ProductCard key={product.id} onClick={() => handleProductClick(product.id)}>
            <ProductImage src={product.imageUrl} alt={product.name} />
            <ProductName>{product.name}</ProductName>
            <ProductPrice>{product.price} {product.unit}</ProductPrice>
            <AddToCartCardButton onClick={(e) => handleAddToCart(e, product)}>
              🛒 أضف للعربة
            </AddToCartCardButton>
          </ProductCard>
        ))}
      </ProductGrid>

      <TrendingProducts />
      <PersonalizedSection />
      <RecentlyViewed />

      <FeaturesSectionContainer>
        <FeaturesTitle>لماذا تختار عسل تارودانت؟</FeaturesTitle>
        <FeaturesGrid>
          {features.map((feature, index) => (
            <FeatureCard key={index}>
              <FeatureIcon>{feature.icon}</FeatureIcon>
              <FeatureName>{feature.name}</FeatureName>
              <FeatureDescription>{feature.description}</FeatureDescription>
            </FeatureCard>
          ))}
        </FeaturesGrid>
      </FeaturesSectionContainer>

      <TestimonialsSectionContainer>
        <TestimonialsTitle>ماذا يقول عملاؤنا؟</TestimonialsTitle>
        <TestimonialsGrid>
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index}>
              <TestimonialText>{testimonial.text}</TestimonialText>
              <TestimonialAuthor>- {testimonial.author}</TestimonialAuthor>
            </TestimonialCard>
          ))}
        </TestimonialsGrid>
      </TestimonialsSectionContainer>
    </HomePageContainer>
  );
}
