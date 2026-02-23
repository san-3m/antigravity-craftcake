'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('craftcake_cart');
    if (saved) {
      try { setItems(JSON.parse(saved)); } catch { }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('craftcake_cart', JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id && i.type === (product.type || 'product'));
      if (existing) {
        return prev.map(i =>
          i.id === product.id && i.type === existing.type
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { ...product, type: product.type || 'product', quantity }];
    });
  }, []);

  const removeItem = useCallback((id, type = 'product') => {
    setItems(prev => prev.filter(i => !(i.id === id && i.type === type)));
  }, []);

  const updateQuantity = useCallback((id, quantity, type = 'product') => {
    if (quantity <= 0) {
      removeItem(id, type);
      return;
    }
    setItems(prev => prev.map(i =>
      i.id === id && i.type === type ? { ...i, quantity } : i
    ));
  }, [removeItem]);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, count, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
