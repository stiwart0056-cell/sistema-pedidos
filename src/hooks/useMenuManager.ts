import { useState, useEffect, useCallback } from "react";
import { menuItems as defaultMenu } from "@/data/menu";
import type { MenuItem, MenuVariant } from "@/types";
import { StorageService } from "@/lib/storage";
import { STORAGE_KEYS } from "@/lib/constants";

function loadMenu(): MenuItem[] {
  return StorageService.get<MenuItem[]>(
    STORAGE_KEYS.menu,
    JSON.parse(JSON.stringify(defaultMenu))
  );
}

export function useMenuManager() {
  const [items, setItems] = useState<MenuItem[]>(loadMenu);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.menu) setItems(loadMenu());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const addItem = useCallback((item: Omit<MenuItem, "id">) => {
    const id = `custom-${Date.now()}`;
    const newItem: MenuItem = { ...item, id };
    setItems((prev) => {
      const updated = [...prev, newItem];
      StorageService.set(STORAGE_KEYS.menu, updated);
      return updated;
    });
  }, []);

  const updateItem = useCallback((id: string, changes: Partial<MenuItem>) => {
    setItems((prev) => {
      const updated = prev.map((i) => (i.id === id ? { ...i, ...changes } : i));
      StorageService.set(STORAGE_KEYS.menu, updated);
      return updated;
    });
  }, []);

  const deleteItem = useCallback((id: string) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      StorageService.set(STORAGE_KEYS.menu, updated);
      return updated;
    });
  }, []);

  const addVariant = useCallback((itemId: string, variant: MenuVariant) => {
    setItems((prev) => {
      const updated = prev.map((i) =>
        i.id === itemId
          ? { ...i, variants: [...(i.variants || []), variant] }
          : i
      );
      StorageService.set(STORAGE_KEYS.menu, updated);
      return updated;
    });
  }, []);

  const removeVariant = useCallback((itemId: string, variantName: string) => {
    setItems((prev) => {
      const updated = prev.map((i) =>
        i.id === itemId
          ? { ...i, variants: i.variants?.filter((v) => v.name !== variantName) }
          : i
      );
      StorageService.set(STORAGE_KEYS.menu, updated);
      return updated;
    });
  }, []);

  return {
    items,
    addItem,
    updateItem,
    deleteItem,
    addVariant,
    removeVariant,
  };
}
