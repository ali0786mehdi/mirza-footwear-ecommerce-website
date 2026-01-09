import React, { createContext, useState, useEffect } from 'react';

// 1. Create the Context
export const CartContext = createContext();

// 2. Create the Provider
export const CartProvider = ({ children }) => {
  // Try to load cart from LocalStorage, otherwise start empty []
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cartItems');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Function to Add Item
  const addToCart = (product, qty) => {
    setCartItems((prevItems) => {
      // Check if item already exists
      const existItem = prevItems.find((x) => x._id === product._id);

      if (existItem) {
        // If exists, just update the quantity
        return prevItems.map((x) =>
          x._id === existItem._id ? { ...product, qty: Number(qty) } : x
        );
      } else {
        // If new, add it to the list
        return [...prevItems, { ...product, qty: Number(qty) }];
      }
    });
  };

  // Function to Remove Item
  const removeFromCart = (id) => {
    setCartItems((prevItems) => prevItems.filter((x) => x._id !== id));
  };

  // Whenever cart changes, save to LocalStorage (so data stays on refresh)
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};