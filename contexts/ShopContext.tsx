import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { ShopProduct } from '../types/shop';

export type ShopCartItem = {
  id: string;
  name: string;
  description: string;
  size: string;
  priceCOP: number;
  priceBoomCoins: number;
  quantity: number;
  image: string;
  product: ShopProduct;
};

export type ShopFeedbackKind = 'favorite-added' | 'favorite-removed' | 'cart-added' | 'cart-updated';

export type ShopFeedback = {
  id: number;
  message: string;
  kind: ShopFeedbackKind;
};

export type ShopContextValue = {
  favorites: ShopProduct[];
  favoriteCount: number;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (product: ShopProduct) => void;
  cartItems: ShopCartItem[];
  cartCount: number;
  addToCart: (product: ShopProduct, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateCartItemQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  feedback: ShopFeedback | null;
  dismissFeedback: () => void;
};

const ShopContext = createContext<ShopContextValue | undefined>(undefined);

export const ShopProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [favoriteMap, setFavoriteMap] = useState<Record<string, ShopProduct>>({});
  const [cartMap, setCartMap] = useState<Record<string, ShopCartItem>>({});
  const [feedback, setFeedback] = useState<ShopFeedback | null>(null);

  const pushFeedback = useCallback((message: string, kind: ShopFeedbackKind) => {
    setFeedback({ id: Date.now(), message, kind });
  }, []);

  const toggleFavorite = useCallback((product: ShopProduct) => {
    setFavoriteMap((prev) => {
      if (prev[product.id]) {
        const { [product.id]: _removed, ...rest } = prev;
        pushFeedback(`${product.name} se elimino de favoritos`, 'favorite-removed');
        return rest;
      }
      pushFeedback(`${product.name} se agrego a favoritos`, 'favorite-added');
      return { ...prev, [product.id]: product };
    });
  }, [pushFeedback]);

  const isFavorite = useCallback((id: string) => Boolean(favoriteMap[id]), [favoriteMap]);

  const favorites = useMemo(() => Object.values(favoriteMap), [favoriteMap]);

  const addToCart = useCallback((product: ShopProduct, quantity = 1) => {
    const quantityToAdd = Math.max(1, Math.floor(quantity));
    setCartMap((prev) => {
      const existing = prev[product.id];
      if (existing) {
        const newQuantity = existing.quantity + quantityToAdd;
        pushFeedback(`${product.name} ahora tiene ${newQuantity} en el carrito`, 'cart-updated');
        return {
          ...prev,
          [product.id]: { ...existing, quantity: newQuantity },
        };
      }

      const size = product.availableSizes?.[0] ?? 'One Size';
      const priceCOP = Math.round(product.price * 1000);
      const priceBoomCoins = parseFloat((product.price / 2).toFixed(2));

      const message = quantityToAdd > 1
        ? `${product.name} (${quantityToAdd} uds.) se agrego al carrito`
        : `${product.name} se agrego al carrito`;
      pushFeedback(message, 'cart-added');
      return {
        ...prev,
        [product.id]: {
          id: product.id,
          name: product.name,
          description: product.description ?? product.brand ?? '',
          size,
          priceCOP,
          priceBoomCoins,
          quantity: quantityToAdd,
          image: product.image,
          product,
        },
      };
    });
  }, [pushFeedback]);

  const removeFromCart = useCallback((id: string) => {
    setCartMap((prev) => {
      if (!prev[id]) {
        return prev;
      }
      const { [id]: _removed, ...rest } = prev;
      return rest;
    });
  }, []);

  const updateCartItemQuantity = useCallback((id: string, quantity: number) => {
    setCartMap((prev) => {
      const current = prev[id];
      if (!current) {
        return prev;
      }

      if (quantity <= 0) {
        const { [id]: _removed, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [id]: { ...current, quantity },
      };
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartMap({});
  }, []);

  const cartItems = useMemo(() => Object.values(cartMap), [cartMap]);

  const dismissFeedback = useCallback(() => setFeedback(null), []);


  const cartCount = useMemo(() => cartItems.reduce((total, item) => total + item.quantity, 0), [cartItems]);

  const favoriteCount = favorites.length;

  const value = useMemo<ShopContextValue>(
    () => ({
      favorites,
      favoriteCount,
      isFavorite,
      toggleFavorite,
      cartItems,
      cartCount,
      addToCart,
      removeFromCart,
      updateCartItemQuantity,
      clearCart,
      feedback,
      dismissFeedback,
    }),
    [favorites, favoriteCount, isFavorite, cartItems, cartCount, addToCart, removeFromCart, updateCartItemQuantity, clearCart, feedback, dismissFeedback]
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export const useShop = (): ShopContextValue => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
