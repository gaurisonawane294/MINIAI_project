import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cartItems');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (err) {
      console.error('[CartContext] Error loading cart from localStorage:', err);
      return [];
    }
  });

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } catch (err) {
      console.error('[CartContext] Error saving cart to localStorage:', err);
    }
  }, [cartItems]);

  /**
   * Add a product to the cart with Stock Guard enforcement
   * @param {Object} product - Product object with _id, name, price, stock, image
   * @param {number} quantity - Quantity to add (default 1)
   * @returns {Object} result - { success: boolean, message: string }
   */
  const addToCart = (product, quantity = 1) => {
    const qtyToAdd = Math.max(1, parseInt(quantity, 10) || 1);
    const availableStock = typeof product.stock === 'number' ? product.stock : 999;

    if (availableStock <= 0) {
      return {
        success: false,
        message: `"${product.name}" is currently out of stock.`,
      };
    }

    let message = `Added "${product.name}" to cart.`;
    let isClamped = false;

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item._id === product._id || item.product === product._id
      );

      if (existingIndex > -1) {
        const existingItem = prevItems[existingIndex];
        const newQuantity = existingItem.quantity + qtyToAdd;

        // Stock Guard check: Clamp to available stock
        if (newQuantity > availableStock) {
          isClamped = true;
          message = `Only ${availableStock} units of "${product.name}" available in stock. Cart updated to maximum available.`;
          const updated = [...prevItems];
          updated[existingIndex] = {
            ...existingItem,
            stock: availableStock,
            quantity: availableStock,
          };
          return updated;
        }

        const updated = [...prevItems];
        updated[existingIndex] = {
          ...existingItem,
          stock: availableStock,
          quantity: newQuantity,
        };
        return updated;
      } else {
        // Adding new item with stock check
        const initialQty = Math.min(qtyToAdd, availableStock);
        if (qtyToAdd > availableStock) {
          isClamped = true;
          message = `Only ${availableStock} units of "${product.name}" available in stock. Added maximum available.`;
        }

        return [
          ...prevItems,
          {
            _id: product._id,
            product: product._id,
            name: product.name,
            price: Number(product.price),
            image: product.image,
            stock: availableStock,
            quantity: initialQty,
          },
        ];
      }
    });

    return {
      success: true,
      message,
      isClamped,
    };
  };

  /**
   * Update quantity of an existing item in the cart with stock clamping
   * @param {string} productId - Product ID
   * @param {number} newQuantity - Target quantity
   */
  const updateQuantity = (productId, newQuantity) => {
    let result = { success: true };

    setCartItems((prevItems) => {
      return prevItems.map((item) => {
        if (item._id === productId || item.product === productId) {
          const maxStock = typeof item.stock === 'number' ? item.stock : 999;
          const parsed = parseInt(newQuantity, 10);

          if (isNaN(parsed) || parsed < 1) {
            return { ...item, quantity: 1 };
          }

          if (parsed > maxStock) {
            result = {
              success: false,
              message: `Cannot exceed available stock of ${maxStock} units for "${item.name}".`,
            };
            return { ...item, quantity: maxStock };
          }

          return { ...item, quantity: parsed };
        }
        return item;
      });
    });

    return result;
  };

  /**
   * Remove an item completely from the cart
   * @param {string} productId - Product ID
   */
  const removeFromCart = (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item._id !== productId && item.product !== productId)
    );
  };

  /**
   * Clear all items from the cart
   */
  const clearCart = () => {
    setCartItems([]);
    try {
      localStorage.removeItem('cartItems');
    } catch (err) {
      console.error('[CartContext] Error clearing localStorage:', err);
    }
  };

  // Derived calculations
  const totalItems = cartItems.reduce((acc, item) => acc + (item.quantity || 0), 0);
  const cartTotal =
    Math.round(
      cartItems.reduce((acc, item) => acc + (Number(item.price) || 0) * (item.quantity || 0), 0) *
        100
    ) / 100;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItems,
        cartTotal,
        totalAmount: cartTotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
