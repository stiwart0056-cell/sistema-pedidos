import { useState, useEffect, useCallback } from "react";
import { StorageService } from "@/lib/storage";
import { STORAGE_KEYS } from "@/lib/constants";

const DEFAULT_CATEGORIES = [
  "Tempranitos",
  "Clásicos",
  "Signature",
  "Burgers",
  "El Rinconcito Mexicano",
  "Jugos",
  "Batidas",
  "Refrescos",
  "Morir Soñando",
];

function loadCategories(): string[] {
  return StorageService.get<string[]>(STORAGE_KEYS.categories, DEFAULT_CATEGORIES);
}

export function useCategories() {
  const [categories, setCategories] = useState<string[]>(loadCategories);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.categories) setCategories(loadCategories());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const addCategory = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCategories((prev) => {
      if (prev.includes(trimmed)) return prev;
      const updated = [...prev, trimmed];
      StorageService.set(STORAGE_KEYS.categories, updated);
      return updated;
    });
  }, []);

  const removeCategory = useCallback((name: string) => {
    setCategories((prev) => {
      const updated = prev.filter((c) => c !== name);
      StorageService.set(STORAGE_KEYS.categories, updated);
      return updated;
    });
  }, []);

  const reorderCategories = useCallback((newOrder: string[]) => {
    StorageService.set(STORAGE_KEYS.categories, newOrder);
    setCategories(newOrder);
  }, []);

  return { categories, addCategory, removeCategory, reorderCategories };
}
