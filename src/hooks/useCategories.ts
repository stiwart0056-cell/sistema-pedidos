import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

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

const STORAGE_KEY = "mr-toasted-categories";

function loadLocal(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_CATEGORIES;
}

function saveLocal(cats: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
}

export function useCategories() {
  const [categories, setCategories] = useState<string[]>(loadLocal);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from("categories")
          .select("name")
          .order("sort_order", { ascending: true });
        if (data && data.length > 0) {
          const names = data.map((c: any) => c.name);
          setCategories(names);
          saveLocal(names);
        }
      } catch (e) {
        console.error("[useCategories] load failed:", e);
      }
    })();
  }, []);

  const addCategory = useCallback(async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || categories.includes(trimmed)) return;
    const updated = [...categories, trimmed];
    setCategories(updated);
    saveLocal(updated);

    try {
      await supabase.from("categories").insert({ name: trimmed, sort_order: 999 });
    } catch (e) {
      console.error("[useCategories] add failed:", e);
    }
  }, [categories]);

  const removeCategory = useCallback(async (name: string) => {
    const updated = categories.filter((c) => c !== name);
    setCategories(updated);
    saveLocal(updated);

    try {
      await supabase.from("categories").delete().eq("name", name);
    } catch (e) {
      console.error("[useCategories] remove failed:", e);
    }
  }, [categories]);

  const reorderCategories = useCallback(async (newOrder: string[]) => {
    setCategories(newOrder);
    saveLocal(newOrder);
    try {
      for (let i = 0; i < newOrder.length; i++) {
        await supabase.from("categories").update({ sort_order: i }).eq("name", newOrder[i]);
      }
    } catch (e) {
      console.error("[useCategories] reorder failed:", e);
    }
  }, []);

  return { categories, addCategory, removeCategory, reorderCategories };
}
