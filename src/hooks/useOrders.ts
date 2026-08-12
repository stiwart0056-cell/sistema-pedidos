import { useState, useEffect, useCallback } from "react";
import type { Order } from "@/types";
import { StorageService } from "@/lib/storage";
import { STORAGE_KEYS } from "@/lib/constants";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>(() =>
    StorageService.get<Order[]>(STORAGE_KEYS.orders, [])
  );

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.orders) {
        setOrders(StorageService.get<Order[]>(STORAGE_KEYS.orders, []));
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const refresh = useCallback(() => {
    setOrders(StorageService.get<Order[]>(STORAGE_KEYS.orders, []));
  }, []);

  const addOrder = useCallback((order: Order) => {
    setOrders((prev) => {
      const updated = [order, ...prev];
      StorageService.set(STORAGE_KEYS.orders, updated);
      return updated;
    });
  }, []);

  const updateStatus = useCallback(
    (orderId: string, status: Order["status"]) => {
      setOrders((prev) => {
        const updated = prev.map((o) =>
          o.id === orderId ? { ...o, status } : o
        );
        StorageService.set(STORAGE_KEYS.orders, updated);
        return updated;
      });
    },
    []
  );

  const deleteOrder = useCallback((orderId: string) => {
    setOrders((prev) => {
      const updated = prev.filter((o) => o.id !== orderId);
      StorageService.set(STORAGE_KEYS.orders, updated);
      return updated;
    });
  }, []);

  return { orders, refresh, addOrder, updateStatus, deleteOrder };
}
