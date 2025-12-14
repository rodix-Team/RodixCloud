'use client';

import styled from 'styled-components';
import { useParams, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { addItem } from '../../../redux/slices/cartSlice';
import ReviewsSection from '../../components/ReviewsSection';

// -----------------
// STYLED COMPONENTS
// -----------------
const PageWrapper = styled.div`
  min-height: 100vh;
  background: #fafafa;
  padding-bottom: 4rem;
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 3rem 2rem;

  @media (max-width: 768px) {
    padding: 2rem 1rem;
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  margin-bottom: 4rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

// Image Gallery Section
const GallerySection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MainImageContainer = styled.div`
  position: relative;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.08);
  overflow: hidden;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
    
    &:hover {
      transform: scale(1.05);
    }
  }
`;

const StockBadge = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: ${({ $inStock }) => $inStock ? '#10b981' : '#ef4444'};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-weight: bold;
  font-size: 0.9rem;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
`;

const Thumbnails = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const Thumbnail = styled.div`
  background: white;
  border-radius: 12px;
  padding: 0.75rem;
  cursor: pointer;
  border: 3px solid ${({ $active }) => $active ? '#F4A300' : 'transparent'};
  transition: all 0.3s;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    border-color: ${({ $active }) => $active ? '#F4A300' : '#ddd'};
    transform: translateY(-2px);
  }

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

// Product Info Section
const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const CategoryBadge = styled.span`
  background: rgba(244, 163, 0, 0.1);
  color: #d17834;
  padding: 0.5rem 1.2rem;
  border-radius: 50px;
  font-weight: bold;
  width: fit-content;
  font-size: 0.9rem;
`;

const ProductTitle = styled.h1`
  font-size: 3rem;
  font-weight: 900;
  line-height: 1.2;
  color: #222;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const RatingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  .stars {
    color: #FFD700;
    font-size: 1.2rem;
  }
  
  .count {
    color: #666;
    font-size: 0.95rem;
  }
`;

const PriceSection = styled.div`
  background: linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%);
  padding: 2rem;
  border-radius: 16px;
  border: 2px solid rgba(244, 163, 0, 0.2);
`;

const PriceTag = styled.div`
  font-size: 3rem;
  font-weight: 900;
  color: #F4A300;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`;

const PriceLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

// Size Selector
const SizeSelector = styled.div`
  h3 {
    font-size: 1.1rem;
    color: #333;
    margin-bottom: 1rem;
    font-weight: 600;
  }
`;

const SizeOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
`;

const SizeOption = styled.button`
  background: ${({ $active }) => $active ? '#F4A300' : 'white'};
  color: ${({ $active }) => $active ? 'white' : '#333'};
  border: 2px solid ${({ $active }) => $active ? '#F4A300' : '#ddd'};
  padding: 1rem;
  border-radius: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;

  &:hover {
    border-color: #F4A300;
    transform: translateY(-2px);
  }

  .weight {
    font-size: 1.1rem;
  }
  
  .price {
    font-size: 0.85rem;
    opacity: 0.8;
  }
`;

// Quantity Selector
const QuantitySelector = styled.div`
  h3 {
    font-size: 1.1rem;
    color: #333;
    margin-bottom: 1rem;
    font-weight: 600;
  }
`;

const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  border: 2px solid #eee;
  width: fit-content;

  button {
    background: #F4A300;
    color: white;
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    font-size: 1.5rem;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &:hover {
      background: #d17834;
      transform: scale(1.1);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  span {
    font-size: 1.5rem;
    font-weight: bold;
    min-width: 40px;
    text-align: center;
  }
`;

// Action Buttons
const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const AddToCartBtn = styled.button`
  flex: 1;
  background: linear-gradient(135deg, #F4A300 0%, #FFB82E 100%);
  color: white;
  border: none;
  padding: 1.2rem 2rem;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 6px 20px rgba(244, 163, 0, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(244, 163, 0, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const BuyNowBtn = styled(AddToCartBtn)`
  background: linear-gradient(135deg, #2c3e50 0%, #000 100%);
  box-shadow: 0 6px 20px rgba(0,0,0,0.2);

  &:hover {
    box-shadow: 0 8px 25px rgba(0,0,0,0.3);
  }
`;

// Product Tabs
const TabsContainer = styled.div`
  margin-top: 4rem;
`;

const TabsHeader = styled.div`
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid #eee;
  margin-bottom: 2rem;
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 4px;
  }
`;

const Tab = styled.button`
  background: ${({ $active }) => $active ? '#F4A300' : 'transparent'};
  color: ${({ $active }) => $active ? 'white' : '#666'};
  border: none;
  padding: 1rem 2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 8px 8px 0 0;
  white-space: nowrap;
  font-size: 1rem;

  &:hover {
    background: ${({ $active }) => $active ? '#F4A300' : '#f5f5f5'};
  }
`;

const TabContent = styled(motion.div)`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  min-height: 300px;
`;

const SpecGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SpecItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;

  .label {
    font-weight: 600;
    color: #666;
  }

  .value {
    font-weight: bold;
    color: #333;
  }
`;

const FAQItem = styled.div`
  margin-bottom: 1.5rem;
  
  h4 {
    color: #F4A300;
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
  }
  
  p {
    color: #666;
    line-height: 1.8;
  }
`;

// Related Products
const RelatedSection = styled.div`
  margin-top: 4rem;
  padding-top: 3rem;
  border-top: 2px solid #f0f0f0;
`;

const RelatedTitle = styled.h2`
  font-size: 2rem;
  color: #222;
  margin-bottom: 2rem;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1.6rem;
  }
`;

const RelatedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const RelatedCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  cursor: pointer;

  &:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

const RelatedImage = styled.div`
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  background: #f5f5f5;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
  }

  &:hover img {
    transform: scale(1.1);
  }
`;

const RelatedInfo = styled.div`
  padding: 1.25rem;
`;

const RelatedName = styled.h4`
  margin: 0 0 0.75rem 0;
  color: #222;
  font-size: 1.05rem;
  cursor: pointer;
  transition: color 0.3s;

  &:hover {
    color: #F4A300;
  }
`;

const RelatedPrice = styled.div`
  font-size: 1.3rem;
  font-weight: bold;
  color: #F4A300;
  margin-bottom: 1rem;
`;

const RelatedButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #F4A300, #FFB82E);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.95rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(244, 163, 0, 0.3);
  }
`;

// -----------------
// MAIN COMPONENT
// -----------------
export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products.items);

  const product = products.find((p) => p.id === parseInt(params.productId));

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(1); // Default: 500g
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  // Mock images (you can add real ones later)
  const productImages = product ? [
    product.imageUrl,
    product.imageUrl, // Duplicate for demo
    product.imageUrl,
    product.imageUrl,
  ] : [];

  // Size options with dynamic pricing
  const sizeOptions = product ? [
    { id: 0, weight: '250g', multiplier: 0.6 },
    { id: 1, weight: '500g', multiplier: 1 },
    { id: 2, weight: '1kg', multiplier: 1.8 },
  ] : [];

  const currentPrice = product ? Math.round(product.price * sizeOptions[selectedSize].multiplier) : 0;
  const totalPrice = currentPrice * quantity;

  useEffect(() => {
    if (!product) {
      toast.error('المنتج غير موجود');
      router.push('/products');
    }
  }, [product, router]);

  if (!product) {
    return <PageWrapper><Container>جاري التحميل...</Container></PageWrapper>;
  }

  const handleAddToCart = () => {
    dispatch(addItem({
      id: product.id,
      name: `${product.name} - ${sizeOptions[selectedSize].weight}`,
      price: currentPrice,
      imageUrl: product.imageUrl,
      quantity: quantity
    }));
    toast.success(`✅ تمت إضافة ${quantity}x ${product.name} للعربة!`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  return (
    <PageWrapper>
      <Container>
        {/* Product Grid */}
        <ProductGrid>
          {/* Image Gallery */}
          <GallerySection>
            <MainImageContainer>
              <StockBadge $inStock={true}>✓ متوفر</StockBadge>
              <motion.img
                key={selectedImage}
                src={productImages[selectedImage]}
                alt={product.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              />
            </MainImageContainer>

            <Thumbnails>
              {productImages.map((img, idx) => (
                <Thumbnail
                  key={idx}
                  $active={selectedImage === idx}
                  onClick={() => setSelectedImage(idx)}
                >
                  <img src={img} alt={`صورة ${idx + 1}`} />
                </Thumbnail>
              ))}
            </Thumbnails>
          </GallerySection>

          {/* Product Info */}
          <InfoSection>
            <CategoryBadge>{product.category}</CategoryBadge>
            <ProductTitle>{product.name}</ProductTitle>

            <RatingRow>
              <div className="stars">
                {'★'.repeat(Math.round(product.rating))}
                {'☆'.repeat(5 - Math.round(product.rating))}
              </div>
              <div className="count">({product.reviews} تقييم)</div>
            </RatingRow>

            <PriceSection>
              <PriceTag>{totalPrice} درهم</PriceTag>
              <PriceLabel>
                {currentPrice} درهم × {quantity} = {totalPrice} درهم
              </PriceLabel>
            </PriceSection>

            {/* Size Selector */}
            <SizeSelector>
              <h3>اختر الحجم:</h3>
              <SizeOptions>
                {sizeOptions.map((size) => (
                  <SizeOption
                    key={size.id}
                    $active={selectedSize === size.id}
                    onClick={() => setSelectedSize(size.id)}
                  >
                    <div className="weight">{size.weight}</div>
                    <div className="price">{Math.round(product.price * size.multiplier)} د.م</div>
                  </SizeOption>
                ))}
              </SizeOptions>
            </SizeSelector>

            {/* Quantity Selector */}
            <QuantitySelector>
              <h3>الكمية:</h3>
              <QuantityControl>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                  −
                </button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </QuantityControl>
            </QuantitySelector>

            {/* Action Buttons */}
            <ActionButtons>
              <AddToCartBtn onClick={handleAddToCart}>
                🛒 إضافة للعربة
              </AddToCartBtn>
              <BuyNowBtn onClick={handleBuyNow}>
                ⚡ شراء الآن
              </BuyNowBtn>
            </ActionButtons>
          </InfoSection>
        </ProductGrid>

        {/* Product Tabs */}
        <TabsContainer>
          <TabsHeader>
            <Tab $active={activeTab === 'description'} onClick={() => setActiveTab('description')}>
              📝 الوصف
            </Tab>
            <Tab $active={activeTab === 'specs'} onClick={() => setActiveTab('specs')}>
              📊 المواصفات
            </Tab>
            <Tab $active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')}>
              ⭐ التقييمات
            </Tab>
            <Tab $active={activeTab === 'faq'} onClick={() => setActiveTab('faq')}>
              ❓ أسئلة شائعة
            </Tab>
          </TabsHeader>

          <AnimatePresence mode="wait">
            <TabContent
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'description' && (
                <div>
                  <h3 style={{ marginBottom: '1rem', color: '#222' }}>وصف المنتج</h3>
                  <p style={{ lineHeight: '1.8', color: '#666' }}>
                    {product.description || `${product.name} هو منتج عسل طبيعي 100% من أجود أنواع العسل المغربي. يتم جمعه من خلايا النحل في جبال سوس ماسة بطريقة تقليدية تحافظ على جميع فوائده الصحية والغذائية. غني بالفيتامينات والمعادن الطبيعية.`}
                  </p>
                </div>
              )}

              {activeTab === 'specs' && (
                <div>
                  <h3 style={{ marginBottom: '1.5rem', color: '#222' }}>القيمة الغذائية والمواصفات</h3>
                  <SpecGrid>
                    <SpecItem>
                      <span className="label">الطاقة (100g)</span>
                      <span className="value">304 سعرة</span>
                    </SpecItem>
                    <SpecItem>
                      <span className="label">الكربوهيدرات</span>
                      <span className="value">82g</span>
                    </SpecItem>
                    <SpecItem>
                      <span className="label">السكريات</span>
                      <span className="value">80g</span>
                    </SpecItem>
                    <SpecItem>
                      <span className="label">البروتين</span>
                      <span className="value">0.3g</span>
                    </SpecItem>
                    <SpecItem>
                      <span className="label">المصدر</span>
                      <span className="value">جبال سوس ماسة</span>
                    </SpecItem>
                    <SpecItem>
                      <span className="label">الصلاحية</span>
                      <span className="value">سنتين</span>
                    </SpecItem>
                  </SpecGrid>
                </div>
              )}

              {activeTab === 'reviews' && (
                <ReviewsSection productId={product.id} />
              )}

              {activeTab === 'faq' && (
                <div>
                  <h3 style={{ marginBottom: '1.5rem', color: '#222' }}>أسئلة شائعة</h3>
                  <FAQItem>
                    <h4>كيف أعرف أن العسل طبيعي 100%؟</h4>
                    <p>جميع منتجاتنا معتمدة ومختبرة في مختبرات معتمدة. نضمن لك عسلاً نقياً بدون أي إضافات.</p>
                  </FAQItem>
                  <FAQItem>
                    <h4>كيفية حفظ العسل؟</h4>
                    <p>يحفظ في مكان بارد وجاف بعيداً عن أشعة الشمس المباشرة. لا يحتاج للثلاجة.</p>
                  </FAQItem>
                  <FAQItem>
                    <h4>هل العسل آمن للأطفال؟</h4>
                    <p>نعم، ولكن لا ينصح بإعطائه للأطفال أقل من سنة واحدة.</p>
                  </FAQItem>
                </div>
              )}
            </TabContent>
          </AnimatePresence>
        </TabsContainer>

        {/* Related Products */}
        <RelatedSection>
          <RelatedTitle>منتجات قد تعجبك 🍯</RelatedTitle>
          <RelatedGrid>
            {products
              .filter(p => p.id !== product.id && p.category === product.category)
              .slice(0, 4)
              .map((relatedProduct) => (
                <RelatedCard
                  key={relatedProduct.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  whileHover={{ y: -8 }}
                >
                  <RelatedImage onClick={() => router.push(`/products/${relatedProduct.id}`)}>
                    <img src={relatedProduct.imageUrl} alt={relatedProduct.name} />
                  </RelatedImage>
                  <RelatedInfo>
                    <RelatedName onClick={() => router.push(`/products/${relatedProduct.id}`)}>
                      {relatedProduct.name}
                    </RelatedName>
                    <RelatedPrice>{relatedProduct.price} د.م</RelatedPrice>
                    <RelatedButton
                      onClick={() => {
                        dispatch(addItem({
                          id: relatedProduct.id,
                          name: relatedProduct.name,
                          price: relatedProduct.price,
                          imageUrl: relatedProduct.imageUrl,
                          quantity: 1
                        }));
                        toast.success(`✅ تم إضافة ${relatedProduct.name}`);
                      }}
                    >
                      إضافة للعربة
                    </RelatedButton>
                  </RelatedInfo>
                </RelatedCard>
              ))}
          </RelatedGrid>
        </RelatedSection>
      </Container>
    </PageWrapper>
  );
}