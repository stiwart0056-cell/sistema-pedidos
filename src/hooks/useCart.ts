import { useState, useEffect, useCallback } from "react";
import type { CartItem } from "@/types";
import { StorageService } from "@/lib/storage";
import { STORAGE_KEYS } from "@/lib/constants";

function generateCartId(id: string, variant?: string) {
  return variant ? `${id}::${variant}` : id;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() =>
    StorageService.get<CartItem[]>(STORAGE_KEYS.cart, [])
  );

  useEffect(() => {
    StorageService.set(STORAGE_KEYS.cart, items);
  }, [items]);

  const addItem = useCallback(
    (params: {
      id: string;
      name: string;
      description?: string;
      variant?: string;
      price: number;
    }) => {
      const cartId = generateCartId(params.id, params.variant);
      setItems((prev) => {
        const existing = prev.find((i) => i.cartId === cartId);
        if (existing) {
          return prev.map((i) =>
            i.cartId === cartId ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        return [
          ...prev,
          {
            cartId,
            id: params.id,
            name: params.name,
            description: params.description,
            variant: params.variant,
            price: params.price,
            quantity: 1,
          },
        ];
      });
    },
    []
  );

  const removeItem = useCallback((cartId: string) => {
    setItems((prev) => prev.filter((i) => i.cartId !== cartId));
  }, []);

  const updateQuantity = useCallback((cartId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.cartId !== cartId));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.cartId === cartId ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  };
}
