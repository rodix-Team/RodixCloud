'use client'; 

import React, { createContext, useState, useContext, useMemo } from 'react';

// 1. إنشاء الـ Context
export const CartContext = createContext();

// 2. الـ Provider Component (هو اللي كيوفر البيانات لجميع Components)
export const CartProvider = ({ children }) => {
  // الحالة الأساسية للعربة: كتكون خاوية في البداية
  const [cartItems, setCartItems] = useState([]);

  // 3. دالة إضافة منتج للعربة
  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      // واش المنتج كاين ديجا في العربة؟
      const existingItem = prevItems.find(item => item.id === product.id);

      if (existingItem) {
        // إذا كان كاين، كنغيرو الكمية ديالو
        return prevItems.map(item =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // إذا ما كانش كاين، كنزيدوه لأول مرة
        return [...prevItems, { ...product, quantity }];
      }
    });
  };

  // 4. دالة لتغيير الكمية أو حذف منتج
  const updateQuantity = (id, change) => {
    setCartItems(prevItems => {
      // كنحدثو الكمية
      const newItems = prevItems.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + change } : item
      );

      // كنحيدو المنتجات لي الكمية ديالها 0 أو أقل
      return newItems.filter(item => item.quantity > 0);
    });
  };

  // 5. حساب العدد الإجمالي للمنتجات (الترقيم اللي كيبان فوق العربة)
  const totalItemsCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  // 6. البيانات لي غادي تتوفر للـ Components
  const contextValue = useMemo(() => ({
    cartItems,
    addToCart,
    updateQuantity,
    totalItemsCount,
  }), [cartItems, totalItemsCount]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// 7. Hook باش يسهل علينا استخدام الـ Context في أي Component
export const useCart = () => {
  return useContext(CartContext);
};