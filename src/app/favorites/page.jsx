'use client';

import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { selectWishlistItems, removeFromWishlist } from '../../redux/slices/wishlistSlice';
import { selectAllProducts } from '../../redux/slices/productsSlice';
import { addItem } from '../../redux/slices/cartSlice';
import toast from 'react-hot-toast';

// -----------------
// STYLED COMPONENTS
// -----------------
const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #FFF8E1 0%, #f9f9f9 100%);
  padding: 3rem 1rem;

  @media (max-width: 768px) {
    padding: 2rem 1rem;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #222;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;

  .heart {
    color: #ff4757;
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
`;

// Products Grid
const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const ProductCard = styled(motion.div)`
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  position: relative;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  background: #f5f5f5;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
  }

  &:hover img {
    transform: scale(1.05);
  }
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
  z-index: 10;

  &:hover {
    background: #ff4757;
    transform: scale(1.1) rotate(180deg);
  }
`;

const CardContent = styled.div`
  padding: 1.5rem;
`;

const ProductName = styled.h3`
  font-size: 1.2rem;
  color: #222;
  margin: 0 0 0.5rem 0;
  cursor: pointer;
  transition: color 0.3s;

  &:hover {
    color: #F4A300;
  }
`;

const ProductCategory = styled.div`
  color: #999;
  font-size: 0.85rem;
  margin-bottom: 1rem;
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Price = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #F4A300;
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #FFD700;
  font-size: 0.9rem;
`;

const AddToCartButton = styled.button`
  width: 100%;
  padding: 0.9rem;
  background: linear-gradient(135deg, #F4A300 0%, #FFB82E 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(244, 163, 0, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(244, 163, 0, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

// Empty State
const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);

  .icon {
    font-size: 6rem;
    margin-bottom: 1.5rem;
    opacity: 0.5;
  }

  h2 {
    color: #222;
    font-size: 1.8rem;
    margin-bottom: 0.75rem;
  }

  p {
    color: #666;
    font-size: 1.1rem;
    margin-bottom: 2rem;
    line-height: 1.6;
  }
`;

const BrowseButton = styled.button`
  background: linear-gradient(135deg, #F4A300 0%, #FFB82E 100%);
  color: white;
  border: none;
  padding: 1.1rem 2.5rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 6px 20px rgba(244, 163, 0, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(244, 163, 0, 0.4);
  }
`;

// -----------------
// MAIN COMPONENT
// -----------------
export default function FavoritesPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const wishlistIds = useSelector(selectWishlistItems);
  const allProducts = useSelector(selectAllProducts);

  // Filter products in wishlist
  const favoriteProducts = allProducts.filter(product =>
    wishlistIds.includes(product.id)
  );

  const handleRemove = (productId, productName) => {
    dispatch(removeFromWishlist(productId));
    toast.success(`🗑️ تم حذف ${productName} من المفضلة`);
  };

  const handleAddToCart = (product) => {
    dispatch(addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: 1
    }));
    toast.success(`✅ تم إضافة ${product.name} للعربة`);
  };

  const handleProductClick = (productId) => {
    router.push(`/products/${productId}`);
  };

  if (favoriteProducts.length === 0) {
    return (
      <PageWrapper>
        <Container>
          <Header>
            <Title>
              <span className="heart">❤️</span>
              قائمة المفضلة
            </Title>
          </Header>
          <EmptyState>
            <div className="icon">💔</div>
            <h2>لا توجد منتجات في المفضلة</h2>
            <p>
              ابدأ بإضافة منتجاتك المفضلة لتسهيل الوصول إليها لاحقاً
              <br />
              اضغط على أيقونة القلب ❤️ بجانب أي منتج لإضافته
            </p>
            <BrowseButton onClick={() => router.push('/products')}>
              🛍️ تصفح المنتجات
            </BrowseButton>
          </EmptyState>
        </Container>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Container>
        <Header>
          <Title>
            <span className="heart">❤️</span>
            قائمة المفضلة
          </Title>
          <Subtitle>لديك {favoriteProducts.length} منتج مفضل</Subtitle>
        </Header>

        <ProductsGrid>
          <AnimatePresence>
            {favoriteProducts.map((product) => (
              <ProductCard
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <ImageContainer onClick={() => handleProductClick(product.id)}>
                  <img src={product.imageUrl} alt={product.name} />
                  <RemoveButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(product.id, product.name);
                    }}
                  >
                    ✕
                  </RemoveButton>
                </ImageContainer>

                <CardContent>
                  <ProductName onClick={() => handleProductClick(product.id)}>
                    {product.name}
                  </ProductName>

                  <ProductCategory>{product.category}</ProductCategory>

                  <PriceRow>
                    <Price>{product.price} د.م</Price>
                    <Rating>
                      {'★'.repeat(Math.round(product.rating))}
                      <span style={{ color: '#666', marginRight: '0.25rem' }}>
                        ({product.rating})
                      </span>
                    </Rating>
                  </PriceRow>

                  <AddToCartButton onClick={() => handleAddToCart(product)}>
                    🛒 إضافة للعربة
                  </AddToCartButton>
                </CardContent>
              </ProductCard>
            ))}
          </AnimatePresence>
        </ProductsGrid>
      </Container>
    </PageWrapper>
  );
}
