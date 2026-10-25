"use client";

import { useState, useEffect, useCallback } from "react";
import { ProductItem } from "@/types";
import { mockProducts } from "@/data/mockProducts";
import { triggerHaptic } from "@/lib/utils";

export interface CartItem {
  product: ProductItem;
  quantity: number;
  addedAt: number;
}

const CART_STORAGE_KEY = "shinyen_cart_v1";

// Helper to read cart from localStorage safely
const getStoredCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      // Default initial mock cart item so user can see it right away
      if (mockProducts.length > 0) {
        const initial = [{ product: mockProducts[0], quantity: 1, addedAt: Date.now() }];
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(initial));
        return initial;
      }
      return [];
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to load cart from localStorage", err);
    return [];
  }
};

// Helper to save cart and notify all components
const saveCart = (items: CartItem[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("shinyen:cart-updated"));
  } catch (err) {
    console.error("Failed to save cart to localStorage", err);
  }
};

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Sync state with storage
  const syncCart = useCallback(() => {
    setItems(getStoredCart());
  }, []);

  useEffect(() => {
    syncCart();
    setIsLoaded(true);

    const handleUpdate = () => syncCart();
    window.addEventListener("shinyen:cart-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("shinyen:cart-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [syncCart]);

  // Add product to cart
  const addToCart = useCallback((product: ProductItem) => {
    triggerHaptic(10);
    const current = getStoredCart();
    const existingIndex = current.findIndex((item) => item.product.id === product.id);

    let updated: CartItem[];
    if (existingIndex > -1) {
      // For 1-of-1 thrift pieces, keep quantity at 1, but for other items allow increment
      updated = [...current];
      updated[existingIndex].quantity += 1;
    } else {
      updated = [{ product, quantity: 1, addedAt: Date.now() }, ...current];
    }

    saveCart(updated);
    setItems(updated);
    return true;
  }, []);

  // Remove product from cart
  const removeFromCart = useCallback((productId: string) => {
    triggerHaptic(8);
    const current = getStoredCart();
    const updated = current.filter((item) => item.product.id !== productId);
    saveCart(updated);
    setItems(updated);
  }, []);

  // Update item quantity
  const updateQuantity = useCallback((productId: string, quantity: number) => {
    triggerHaptic(6);
    const current = getStoredCart();
    if (quantity <= 0) {
      const updated = current.filter((item) => item.product.id !== productId);
      saveCart(updated);
      setItems(updated);
      return;
    }

    const updated = current.map((item) => {
      if (item.product.id === productId) {
        return { ...item, quantity };
      }
      return item;
    });

    saveCart(updated);
    setItems(updated);
  }, []);

  // Clear entire cart
  const clearCart = useCallback(() => {
    saveCart([]);
    setItems([]);
  }, []);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return {
    items,
    isLoaded,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };
}
