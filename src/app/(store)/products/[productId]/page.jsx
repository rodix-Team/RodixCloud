'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import styled from 'styled-components';
import Link from 'next/link';
import { http, getFullImageUrl } from '@/lib/http';
import { useDispatch } from 'react-redux';
import { addItem } from '@/redux/slices/cartSlice';
import { ShoppingCart, Package, Loader2, Minus, Plus, ArrowRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme?.colors?.backgroundLight || '#FAFAFA'};
`;

const Breadcrumb = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme?.colors?.textSecondary || '#666'};
  font-size: 0.875rem;
  
  a {
    color: ${({ theme }) => theme?.colors?.primary || '#F4A300'};
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
`;

const ProductLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const ImageSection = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: ${({ theme }) => theme?.shadows?.sm || '0 2px 4px rgba(0,0,0,0.08)'};
`;

const MainImage = styled.div`
  aspect-ratio: 1;
  background: #f5f5f5;
  cursor: zoom-in;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  &:hover img {
    transform: scale(1.02);
  }
`;

const ThumbnailsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  overflow-x: auto;
  
  /* Hide scrollbar but keep functionality */
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem;
    gap: 0.375rem;
  }
`;

const Thumbnail = styled.button`
  width: 70px;
  height: 70px;
  border-radius: 8px;
  overflow: hidden;
  border: 3px solid ${({ $active }) => $active ? '#F4A300' : 'transparent'};
  opacity: ${({ $active }) => $active ? 1 : 0.6};
  transition: all 0.2s ease;
  flex-shrink: 0;
  padding: 0;
  cursor: pointer;
  background: #f5f5f5;
  
  &:hover {
    opacity: 1;
    border-color: ${({ $active }) => $active ? '#F4A300' : '#ddd'};
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  @media (max-width: 768px) {
    width: 55px;
    height: 55px;
    border-width: 2px;
  }
`;

const InfoSection = styled.div``;

const ProductTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme?.colors?.textPrimary || '#2C2C2C'};
  margin-bottom: 1rem;
`;

const ProductPrice = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme?.colors?.primary || '#F4A300'};
  margin-bottom: 1rem;
`;

const StockStatus = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
  background: ${({ $inStock }) => $inStock ? '#e8f5e9' : '#ffebee'};
  color: ${({ $inStock }) => $inStock ? '#2e7d32' : '#c62828'};
`;

const Description = styled.div`
  color: ${({ theme }) => theme?.colors?.textSecondary || '#666'};
  line-height: 1.8;
  margin-bottom: 2rem;
  
  h3 {
    color: ${({ theme }) => theme?.colors?.textPrimary || '#2C2C2C'};
    margin-bottom: 0.5rem;
  }
`;

const QuantitySelector = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const QuantityLabel = styled.span`
  font-weight: 500;
  color: ${({ theme }) => theme?.colors?.textPrimary || '#2C2C2C'};
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
`;

const QuantityButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme?.colors?.backgroundDark || '#F5F5F5'};
  border: none;
  transition: background 0.2s;
  
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme?.colors?.primary || '#F4A300'};
    color: white;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const QuantityValue = styled.span`
  width: 60px;
  text-align: center;
  font-weight: 600;
  font-size: 1.125rem;
`;

const AddToCartButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: ${({ theme }) => theme?.colors?.primary || '#F4A300'};
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 600;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme?.colors?.primaryDark || '#D68910'};
    transform: translateY(-2px);
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const Features = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  color: ${({ theme }) => theme?.colors?.textSecondary || '#666'};
  
  svg {
    color: ${({ theme }) => theme?.colors?.success || '#4CAF50'};
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
`;

// Styled component for variations
const VariationsSection = styled.div`
  margin-bottom: 1.5rem;
`;

const VariationLabel = styled.div`
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: ${({ theme }) => theme?.colors?.textPrimary || '#2C2C2C'};
`;

const VariationOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const VariationButton = styled.button`
  padding: 0.75rem 1.25rem;
  border: 2px solid ${({ $selected, theme }) =>
    $selected ? (theme?.colors?.primary || '#F4A300') : '#ddd'};
  background: ${({ $selected, theme }) =>
    $selected ? (theme?.colors?.primaryLight || '#FFF5E6') : 'white'};
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: ${({ theme }) => theme?.colors?.primary || '#F4A300'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    text-decoration: line-through;
  }
`;

// Helper functions
const isVariableProduct = (product) => {
  // Backend uses 'variants' not 'variations'
  return product?.type === 'variable' || (product?.variants && product.variants.length > 0);
};

const getProductPrice = (product, selectedVariation) => {
  if (selectedVariation) {
    return `${selectedVariation.price} درهم`;
  }

  if (product.price && parseFloat(product.price) > 0) {
    return `${product.price} درهم`;
  }

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

export default function ProductDetailsPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await http.get(`/products/${productId}`);
        const productData = res.data.data || res.data;
        console.log('📦 Product Data:', productData);
        console.log('📦 Variants:', productData?.variants);
        console.log('📦 Product Type:', productData?.type);
        setProduct(productData);
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  // Get current stock based on product type
  const getCurrentStock = () => {
    if (isVariableProduct(product) && selectedVariation) {
      return selectedVariation.stock || 0;
    }
    return product?.stock || 0;
  };

  // Check if can add to cart
  const canAddToCart = () => {
    if (isVariableProduct(product)) {
      return selectedVariation && getCurrentStock() > 0;
    }
    return getCurrentStock() > 0;
  };

  const handleAddToCart = () => {
    if (isVariableProduct(product) && !selectedVariation) {
      toast.error('❌ يرجى اختيار الخيار المناسب');
      return;
    }

    const price = selectedVariation ? selectedVariation.price : product.price;
    const variationName = selectedVariation
      ? ` (${selectedVariation.name || selectedVariation.sku})`
      : '';

    for (let i = 0; i < quantity; i++) {
      dispatch(addItem({
        id: selectedVariation ? `${product.id}-${selectedVariation.id}` : product.id,
        name: product.name + variationName,
        price: price,
        image_url: product.image_url,
        variation_id: selectedVariation?.id,
      }));
    }
    toast.success(`✅ تم إضافة ${quantity} ${product.name}${variationName} للسلة!`);
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <Loader2 size={40} className="animate-spin" style={{ color: '#F4A300' }} />
        </LoadingContainer>
      </PageContainer>
    );
  }

  if (!product) {
    return (
      <PageContainer>
        <Container>
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <Package size={64} style={{ color: '#ccc', marginBottom: '1rem' }} />
            <h2>المنتج غير موجود</h2>
            <Link href="/products" style={{ color: '#F4A300' }}>العودة للمنتجات</Link>
          </div>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Breadcrumb>
        <Link href="/">الرئيسية</Link>
        <span>/</span>
        <Link href="/products">المنتجات</Link>
        <span>/</span>
        <span>{product.name}</span>
      </Breadcrumb>

      <Container>
        <ProductLayout>
          <ImageSection>
            <MainImage>
              {(() => {
                // Get all images: primary + gallery images
                const allImages = [];
                if (product.image_url) allImages.push(product.image_url);
                if (product.images && Array.isArray(product.images)) {
                  product.images.forEach(img => {
                    const url = typeof img === 'string' ? img : img.url || img.image_url;
                    if (url && !allImages.includes(url)) allImages.push(url);
                  });
                }

                const currentImage = selectedImage || allImages[0];

                return currentImage ? (
                  <img src={getFullImageUrl(currentImage)} alt={product.name} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Package size={80} color="#ccc" />
                  </div>
                );
              })()}
            </MainImage>

            {/* Thumbnails - Show if multiple images */}
            {(() => {
              const allImages = [];
              if (product.image_url) allImages.push(product.image_url);
              if (product.images && Array.isArray(product.images)) {
                product.images.forEach(img => {
                  const url = typeof img === 'string' ? img : img.url || img.image_url;
                  if (url && !allImages.includes(url)) allImages.push(url);
                });
              }

              if (allImages.length > 1) {
                return (
                  <ThumbnailsContainer>
                    {allImages.map((imgUrl, index) => (
                      <Thumbnail
                        key={index}
                        $active={(selectedImage || allImages[0]) === imgUrl}
                        onClick={() => setSelectedImage(imgUrl)}
                      >
                        <img src={getFullImageUrl(imgUrl)} alt={`${product.name} - ${index + 1}`} />
                      </Thumbnail>
                    ))}
                  </ThumbnailsContainer>
                );
              }
              return null;
            })()}
          </ImageSection>

          <InfoSection>
            <ProductTitle>{product.name}</ProductTitle>
            <ProductPrice>{getProductPrice(product, selectedVariation)}</ProductPrice>

            <StockStatus $inStock={getCurrentStock() > 0}>
              {isVariableProduct(product) ? (
                selectedVariation ? (
                  getCurrentStock() > 0 ? (
                    <>
                      <Check size={16} />
                      متوفر ({getCurrentStock()} قطعة)
                    </>
                  ) : (
                    'غير متوفر'
                  )
                ) : (
                  'اختر الخيار المناسب'
                )
              ) : (
                getCurrentStock() > 0 ? (
                  <>
                    <Check size={16} />
                    متوفر في المخزون ({getCurrentStock()} قطعة)
                  </>
                ) : (
                  'غير متوفر حالياً'
                )
              )}
            </StockStatus>

            {/* Variants Selection - Backend uses 'variants' not 'variations' */}
            {isVariableProduct(product) && product.variants && product.variants.length > 0 && (
              <VariationsSection>
                <VariationLabel>اختر الخيار:</VariationLabel>
                <VariationOptions>
                  {product.variants.map((variant) => (
                    <VariationButton
                      key={variant.id}
                      $selected={selectedVariation?.id === variant.id}
                      onClick={() => setSelectedVariation(variant)}
                      disabled={variant.stock <= 0}
                    >
                      {variant.name || variant.sku} - {variant.price} درهم
                      {variant.stock <= 0 && ' (نفذ)'}
                    </VariationButton>
                  ))}
                </VariationOptions>
              </VariationsSection>
            )}

            {product.description && (
              <Description>
                <h3>وصف المنتج</h3>
                <p>{product.description}</p>
              </Description>
            )}

            <QuantitySelector>
              <QuantityLabel>الكمية:</QuantityLabel>
              <QuantityControls>
                <QuantityButton
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus size={18} />
                </QuantityButton>
                <QuantityValue>{quantity}</QuantityValue>
                <QuantityButton
                  onClick={() => setQuantity(q => Math.min(getCurrentStock(), q + 1))}
                  disabled={quantity >= getCurrentStock() || getCurrentStock() <= 0}
                >
                  <Plus size={18} />
                </QuantityButton>
              </QuantityControls>
            </QuantitySelector>

            <AddToCartButton
              onClick={handleAddToCart}
              disabled={!canAddToCart()}
            >
              <ShoppingCart size={22} />
              {isVariableProduct(product)
                ? (selectedVariation
                  ? (getCurrentStock() > 0 ? 'أضف إلى السلة' : 'غير متوفر')
                  : 'اختر الخيار أولاً')
                : (getCurrentStock() > 0 ? 'أضف إلى السلة' : 'غير متوفر')}
            </AddToCartButton>

            <Features>
              <FeatureItem>
                <Check size={18} />
                عسل طبيعي 100%
              </FeatureItem>
              <FeatureItem>
                <Check size={18} />
                شحن سريع لجميع المدن
              </FeatureItem>
              <FeatureItem>
                <Check size={18} />
                ضمان جودة المنتج
              </FeatureItem>
              <FeatureItem>
                <Check size={18} />
                إرجاع خلال 14 يوم
              </FeatureItem>
            </Features>
          </InfoSection>
        </ProductLayout>
      </Container>
    </PageContainer >
  );
}
