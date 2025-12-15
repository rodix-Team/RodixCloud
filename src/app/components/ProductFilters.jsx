'use client';

import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import {
    selectFilters,
    selectAllCategories,
    setSearchQuery,
    setPriceRange,
    toggleCategory,
    setSortBy,
    clearFilters
} from '../../redux/slices/productsSlice';

const FiltersContainer = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 100px;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    position: static;
    margin-bottom: 2rem;
  }
`;

const FilterSection = styled.div`
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
`;

const FilterTitle = styled.h3`
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 1.1rem;
  margin-bottom: 1rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const PriceInputs = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
`;

const PriceInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const CategoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const CategoryItem = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background 0.2s;

  &:hover {
    background: #f5f5f5;
  }

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  span {
    font-size: 0.95rem;
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const SortSelect = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  background: white;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ClearButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: #f5f5f5;
  border: none;
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: #e0e0e0;
  }
`;

export default function ProductFilters() {
    const dispatch = useDispatch();
    const filters = useSelector(selectFilters);
    const categories = useSelector(selectAllCategories);

    const handleSearchChange = (e) => {
        dispatch(setSearchQuery(e.target.value));
    };

    const handlePriceChange = (type, value) => {
        const newRange = {
            ...filters.priceRange,
            [type]: Number(value) || 0
        };
        dispatch(setPriceRange(newRange));
    };

    const handleCategoryToggle = (category) => {
        dispatch(toggleCategory(category));
    };

    const handleSortChange = (e) => {
        dispatch(setSortBy(e.target.value));
    };

    const handleClearFilters = () => {
        dispatch(clearFilters());
    };

    return (
        <FiltersContainer>
            {/* Search */}
            <FilterSection>
                <FilterTitle>🔍 البحث</FilterTitle>
                <SearchInput
                    type="text"
                    placeholder="ابحث عن منتج..."
                    value={filters.searchQuery}
                    onChange={handleSearchChange}
                />
            </FilterSection>

            {/* Price Range */}
            <FilterSection>
                <FilterTitle>💰 السعر</FilterTitle>
                <PriceInputs>
                    <div>
                        <label style={{ fontSize: '0.85rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>
                            من
                        </label>
                        <PriceInput
                            type="number"
                            placeholder="0"
                            value={filters.priceRange.min}
                            onChange={(e) => handlePriceChange('min', e.target.value)}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.85rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>
                            إلى
                        </label>
                        <PriceInput
                            type="number"
                            placeholder="1000"
                            value={filters.priceRange.max}
                            onChange={(e) => handlePriceChange('max', e.target.value)}
                        />
                    </div>
                </PriceInputs>
            </FilterSection>

            {/* Categories */}
            <FilterSection>
                <FilterTitle>📂 الفئات</FilterTitle>
                <CategoryList>
                    {categories.map(category => (
                        <CategoryItem key={category}>
                            <input
                                type="checkbox"
                                checked={filters.selectedCategories.includes(category)}
                                onChange={() => handleCategoryToggle(category)}
                            />
                            <span>{category}</span>
                        </CategoryItem>
                    ))}
                </CategoryList>
            </FilterSection>

            {/* Sort */}
            <FilterSection>
                <FilterTitle>🔄 الترتيب</FilterTitle>
                <SortSelect value={filters.sortBy} onChange={handleSortChange}>
                    <option value="default">الافتراضي</option>
                    <option value="price-asc">السعر: من الأقل للأعلى</option>
                    <option value="price-desc">السعر: من الأعلى للأقل</option>
                    <option value="rating">الأعلى تقييماً</option>
                    <option value="newest">الأحدث</option>
                </SortSelect>
            </FilterSection>

            {/* Clear Filters */}
            <ClearButton onClick={handleClearFilters}>
                🗑️ مسح الفلاتر
            </ClearButton>
        </FiltersContainer>
    );
}
