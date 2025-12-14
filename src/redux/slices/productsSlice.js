import { createSlice } from '@reduxjs/toolkit';

// 🍯 قائمة المنتجات الكاملة - 12 منتج متنوع من العسل المغربي الطبيعي
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "عسل الزعتر الجبلي",
    price: 150,
    unit: "درهم",
    weight: "500 جرام",
    category: "عسل جبلي",
    description: "أفضل عسل زعتر من جبال سوس ماسة، نكهة قوية وجودة عالية. غني بمضادات الأكسدة ومفيد للجهاز التنفسي.",
    imageUrl: "/images/honey_thyme.jpg",
    images: ["/images/honey_thyme.jpg", "/images/honey_thyme.jpg", "/images/honey_thyme.jpg"],
    inStock: true,
    rating: 4.8,
    reviews: 127,
  },
  {
    id: 2,
    name: "عسل الأوكالبتوس الطبيعي",
    price: 120,
    unit: "درهم",
    weight: "500 جرام",
    category: "عسل طبي",
    description: "عسل الأوكالبتوس الطبيعي، ممتاز للجهاز التنفسي والسعال. يساعد في تخفيف أعراض البرد والإنفلونزا.",
    imageUrl: "/images/honey_eucalyptus.jpg",
    images: ["/images/honey_eucalyptus.jpg", "/images/honey_eucalyptus.jpg"],
    inStock: true,
    rating: 4.6,
    reviews: 89,
  },
  {
    id: 3,
    name: "عسل الليمون الفاخر",
    price: 165,
    unit: "درهم",
    weight: "500 جرام",
    category: "عسل حمضيات",
    description: "مذاق حامضي خفيف ولذيذ، عسل الحمضيات الطبيعي. غني بفيتامين C ومنعش للجسم.",
    imageUrl: "/images/honey_lemon.jpg",
    images: ["/images/honey_lemon.jpg", "/images/honey_lemon.jpg", "/images/honey_lemon.jpg"],
    inStock: true,
    rating: 4.7,
    reviews: 104,
  },
  {
    id: 4,
    name: "عسل السدر الملكي",
    price: 280,
    unit: "درهم",
    weight: "500 جرام",
    category: "عسل فاخر",
    description: "عسل السدر الأصلي، من أجود وأغلى أنواع العسل. يعزز المناعة ومفيد للصحة العامة.",
    imageUrl: "/images/sidr.jpg",
    images: ["/images/sidr.jpg", "/images/sidr.jpg", "/images/sidr.jpg", "/images/sidr.jpg"],
    inStock: true,
    rating: 5.0,
    reviews: 215,
  },
  {
    id: 5,
    name: "عسل الزهور البرية",
    price: 135,
    unit: "درهم",
    weight: "500 جرام",
    category: "عسل طبيعي",
    description: "عسل متعدد الأزهار من المراعي الطبيعية، طعم متوازن ولذيذ. مثالي للاستخدام اليومي.",
    imageUrl: "/images/bzahur.jpg",
    images: ["/images/bzahur.jpg", "/images/bzahur.jpg"],
    inStock: true,
    rating: 4.5,
    reviews: 156,
  },
  {
    id: 6,
    name: "عسل الأكاسيا النقي",
    price: 145,
    unit: "درهم",
    weight: "500 جرام",
    category: "عسل طبيعي",
    description: "عسل الأكاسيا الصافي، لون فاتح وطعم رقيق. لا يتبلور بسهولة ومناسب للأطفال.",
    imageUrl: "/images/honey_acacia.jpg",
    images: ["/images/honey_acacia.jpg", "/images/honey_acacia.jpg", "/images/honey_acacia.jpg"],
    inStock: true,
    rating: 4.7,
    reviews: 98,
  },
  {
    id: 7,
    name: "عسل الخزامى العطري",
    price: 170,
    unit: "درهم",
    weight: "500 جرام",
    category: "عسل عطري",
    description: "عسل الخزامى برائحة عطرية مميزة، يساعد على الاسترخاء والنوم الهادئ.",
    imageUrl: "/images/organic.jpg",
    images: ["/images/organic.jpg", "/images/organic.jpg"],
    inStock: true,
    rating: 4.6,
    reviews: 73,
  },
  {
    id: 8,
    name: "عسل الكستناء الداكن",
    price: 155,
    unit: "درهم",
    weight: "500 جرام",
    category: "عسل جبلي",
    description: "عسل الكستناء بنكهة قوية ولون داكن، غني بالمعادن ومضادات الأكسدة.",
    imageUrl: "/images/zahur.jpg",
    images: ["/images/zahur.jpg", "/images/zahur.jpg", "/images/zahur.jpg"],
    inStock: false,
    rating: 4.4,
    reviews: 62,
  },
  {
    id: 9,
    name: "عسل البرتقال المنعش",
    price: 140,
    unit: "درهم",
    weight: "500 جرام",
    category: "عسل حمضيات",
    description: "عسل زهر البرتقال برائحة منعشة وطعم رائع، مثالي للإفطار والمشروبات.",
    imageUrl: "/images/honey_lemon.jpg",
    images: ["/images/honey_lemon.jpg", "/images/honey_lemon.jpg"],
    inStock: true,
    rating: 4.8,
    reviews: 142,
  },
  {
    id: 10,
    name: "عسل الغابة السوداء",
    price: 190,
    unit: "درهم",
    weight: "500 جرام",
    category: "عسل فاخر",
    description: "عسل نادر من الغابات الجبلية، لون داكن وطعم غني. يحتوي على نسبة عالية من المعادن.",
    imageUrl: "/images/organic.jpg",
    images: ["/images/organic.jpg", "/images/organic.jpg", "/images/organic.jpg"],
    inStock: true,
    rating: 4.9,
    reviews: 87,
  },
  {
    id: 11,
    name: "عسل الحبة السوداء",
    price: 175,
    unit: "درهم",
    weight: "500 جرام",
    category: "عسل طبي",
    description: "عسل ممزوج بالحبة السوداء، فوائد صحية مضاعفة. يقوي المناعة ومفيد للجهاز الهضمي.",
    imageUrl: "/images/bzahur.jpg",
    images: ["/images/bzahur.jpg", "/images/bzahur.jpg"],
    inStock: true,
    rating: 4.7,
    reviews: 119,
  },
  {
    id: 12,
    name: "عسل الجينسنغ الملكي",
    price: 250,
    unit: "درهم",
    weight: "500 جرام",
    category: "عسل فاخر",
    description: "عسل ممزوج بالجينسنغ الكوري، يعزز الطاقة والنشاط. منتج فاخر للصحة والعافية.",
    imageUrl: "/images/sidr.jpg",
    images: ["/images/sidr.jpg", "/images/sidr.jpg", "/images/sidr.jpg"],
    inStock: true,
    rating: 4.9,
    reviews: 94,
  },
];

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: MOCK_PRODUCTS,
    filters: {
      searchQuery: '',
      priceRange: { min: 0, max: 1000 },
      selectedCategories: [],
      sortBy: 'default', // 'default', 'price-asc', 'price-desc', 'rating', 'newest'
    },
  },
  reducers: {
    setSearchQuery: (state, action) => {
      state.filters.searchQuery = action.payload;
    },
    setPriceRange: (state, action) => {
      state.filters.priceRange = action.payload;
    },
    toggleCategory: (state, action) => {
      const category = action.payload;
      const index = state.filters.selectedCategories.indexOf(category);
      if (index > -1) {
        state.filters.selectedCategories.splice(index, 1);
      } else {
        state.filters.selectedCategories.push(category);
      }
    },
    setSortBy: (state, action) => {
      state.filters.sortBy = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {
        searchQuery: '',
        priceRange: { min: 0, max: 1000 },
        selectedCategories: [],
        sortBy: 'default',
      };
    },
  },
});

export const {
  setSearchQuery,
  setPriceRange,
  toggleCategory,
  setSortBy,
  clearFilters
} = productsSlice.actions;

// Selectors
export const selectAllProducts = (state) => state.products.items;
export const selectFilters = (state) => state.products.filters;

// Get all unique categories
export const selectAllCategories = (state) => {
  const categories = state.products.items.map(product => product.category);
  return [...new Set(categories)];
};

// Filtered and sorted products selector
export const selectFilteredProducts = (state) => {
  const { items, filters } = state.products;
  const { searchQuery, priceRange, selectedCategories, sortBy } = filters;

  let filtered = items;

  // Filter by search query
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
    );
  }

  // Filter by price range
  filtered = filtered.filter(product =>
    product.price >= priceRange.min && product.price <= priceRange.max
  );

  // Filter by categories
  if (selectedCategories.length > 0) {
    filtered = filtered.filter(product =>
      selectedCategories.includes(product.category)
    );
  }

  // Sort products
  const sorted = [...filtered];
  switch (sortBy) {
    case 'price-asc':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      sorted.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      sorted.sort((a, b) => b.rating - a.rating);
      break;
    case 'newest':
      sorted.sort((a, b) => b.id - a.id);
      break;
    default:
      // Keep original order
      break;
  }

  return sorted;
};

export default productsSlice.reducer;
