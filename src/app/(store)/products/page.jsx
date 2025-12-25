'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { http, getFullImageUrl } from '@/lib/http';
import { useDispatch } from 'react-redux';
import { addItem } from '@/redux/slices/cartSlice';
import { ShoppingCart, Package, Loader2, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme?.colors?.backgroundLight || '#FAFAFA'};
`;

const PageHeader = styled.div`
  background: ${({ theme }) => theme?.gradients?.primary || 'linear-gradient(135deg, #F4A300 0%, #FFB82E 100%)'};
  padding: 2rem 1.5rem;
  text-align: center;
  color: white;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
`;

const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
`;

const FiltersBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  background: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme?.shadows?.sm || '0 2px 4px rgba(0,0,0,0.08)'};
`;

const SearchInput = styled.div`
  flex: 1;
  min-width: 250px;
  position: relative;
  
  input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    
    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme?.colors?.primary || '#F4A300'};
    }
  }
  
  svg {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
  }
`;

const CategoryFilter = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme?.colors?.primary || '#F4A300'};
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

const ProductBadge = styled.span`
  position: absolute;
  top: 10px;
  left: 10px;
  background: ${({ $type, theme }) =>
    $type === 'new' ? (theme?.colors?.success || '#4CAF50') :
      $type === 'sale' ? (theme?.colors?.error || '#F44336') :
        (theme?.colors?.primary || '#F4A300')};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
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
  margin-bottom: 0.5rem;
`;

const ProductStock = styled.div`
  font-size: 0.875rem;
  color: ${({ $inStock, theme }) => $inStock ? (theme?.colors?.success || '#4CAF50') : (theme?.colors?.error || '#F44336')};
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
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${({ theme }) => theme?.colors?.textSecondary || '#666'};
  
  h3 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
  }
`;

const ResultsCount = styled.div`
  margin-bottom: 1rem;
  color: ${({ theme }) => theme?.colors?.textSecondary || '#666'};
`;

// Helper function to get product price display
const getProductPrice = (product) => {
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

const isVariableProduct = (product) => {
  return product.type === 'variable' || (product.variants && product.variants.length > 0);
};

// Check if product is in stock
const isInStock = (product) => {
  if (isVariableProduct(product)) {
    // Variable product: check if any variation has stock
    if (product.variants && product.variants.length > 0) {
      return product.variants.some(v => v.stock > 0);
    }
    return true; // Assume in stock if no variation data
  }
  return product.stock > 0;
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          http.get('/products'),
          http.get('/categories').catch(() => ({ data: { data: [] } }))
        ]);
        setProducts(productsRes.data.data || []);
        setFilteredProducts(productsRes.data.data || []);
        setCategories(categoriesRes.data.data || []);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let result = products;

    if (searchQuery) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category_id === parseInt(selectedCategory));
    }

    setFilteredProducts(result);
  }, [searchQuery, selectedCategory, products]);

  const handleAddToCart = (product) => {
    // If variable product, show message
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

  if (loading) {
    return (
      <PageContainer>
        <PageHeader>
          <PageTitle>🍯 منتجاتنا</PageTitle>
        </PageHeader>
        <LoadingContainer>
          <Loader2 size={40} className="animate-spin" style={{ color: '#F4A300' }} />
        </LoadingContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>🍯 منتجاتنا</PageTitle>
      </PageHeader>

      <Container>
        <FiltersBar>
          <SearchInput>
            <input
              type="text"
              placeholder="ابحث عن منتج..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={18} />
          </SearchInput>

          <CategoryFilter
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">جميع الفئات</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </CategoryFilter>
        </FiltersBar>

        <ResultsCount>
          عرض {filteredProducts.length} من {products.length} منتج
        </ResultsCount>

        {filteredProducts.length === 0 ? (
          <EmptyMessage>
            <Package size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3>لا توجد منتجات</h3>
            <p>جرب تغيير معايير البحث</p>
          </EmptyMessage>
        ) : (
          <ProductGrid>
            {filteredProducts.map((product) => (
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
                    {product.is_new && <ProductBadge $type="new">جديد</ProductBadge>}
                  </ProductImage>
                </Link>
                <ProductInfo>
                  <ProductName>{product.name}</ProductName>
                  <ProductPrice>{getProductPrice(product)}</ProductPrice>
                  <ProductStock $inStock={isInStock(product)}>
                    {isVariableProduct(product)
                      ? 'متعدد الخيارات'
                      : (product.stock > 0 ? `متوفر (${product.stock})` : 'غير متوفر')}
                  </ProductStock>
                  <AddToCartButton
                    onClick={() => handleAddToCart(product)}
                    disabled={!isVariableProduct(product) && product.stock <= 0}
                  >
                    <ShoppingCart size={18} />
                    {isVariableProduct(product)
                      ? 'عرض الخيارات'
                      : (product.stock > 0 ? 'أضف للسلة' : 'غير متوفر')}
                  </AddToCartButton>
                </ProductInfo>
              </ProductCard>
            ))}
          </ProductGrid>
        )}
      </Container>
    </PageContainer>
  );
}
