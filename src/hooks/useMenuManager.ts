import { useState, useEffect, useCallback } from "react";
import type { MenuItem, MenuVariant } from "@/types";
import { supabase } from "@/lib/supabase";

const STORAGE_KEY = "mr-toasted-menu";

function loadLocal(): MenuItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveLocal(items: MenuItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function mapRow(row: any): MenuItem {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    price: row.price ?? undefined,
    variants: Array.isArray(row.variants) ? row.variants : undefined,
    category: row.category,
    image: row.image ?? undefined,
  };
}

export function useMenuManager() {
  const [items, setItems] = useState<MenuItem[]>(loadLocal);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from("menu_items")
          .select("*")
          .order("created_at", { ascending: true });
        if (data) {
          const mapped = data.map(mapRow);
          setItems(mapped);
          saveLocal(mapped);
        }
      } catch (e) {
        console.error("[useMenuManager] load failed:", e);
      }
    })();
  }, []);

  const addItem = useCallback(async (item: Omit<MenuItem, "id">) => {
    const newItem: MenuItem = { ...item, id: `local-${Date.now()}` };
    const updated = [...items, newItem];
    setItems(updated);
    saveLocal(updated);

    try {
      const { data } = await supabase
        .from("menu_items")
        .insert({
          name: item.name,
          description: item.description ?? "",
          price: item.price ?? null,
          category: item.category,
          image: item.image ?? null,
          variants: item.variants ?? [],
          is_available: true,
          is_featured: false,
        })
        .select()
        .single();
      if (data) {
        setItems((prev) =>
          prev.map((i) => (i.id === newItem.id ? mapRow(data) : i))
        );
        saveLocal(items.map((i) => (i.id === newItem.id ? mapRow(data) : i)));
      }
    } catch (e) {
      console.error("[useMenuManager] add failed:", e);
    }
  }, [items]);

  const updateItem = useCallback(async (id: string, changes: Partial<MenuItem>) => {
    const updated = items.map((i) => (i.id === id ? { ...i, ...changes } : i));
    setItems(updated);
    saveLocal(updated);

    try {
      const payload: any = {};
      if (changes.name !== undefined) payload.name = changes.name;
      if (changes.description !== undefined) payload.description = changes.description;
      if (changes.price !== undefined) payload.price = changes.price ?? null;
      if (changes.category !== undefined) payload.category = changes.category;
      if (changes.image !== undefined) payload.image = changes.image ?? null;
      if (changes.variants !== undefined) payload.variants = changes.variants ?? [];
      await supabase.from("menu_items").update(payload).eq("id", id);
    } catch (e) {
      console.error("[useMenuManager] update failed:", e);
    }
  }, [items]);

  const deleteItem = useCallback(async (id: string) => {
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    saveLocal(updated);

    try {
      await supabase.from("menu_items").delete().eq("id", id);
    } catch (e) {
      console.error("[useMenuManager] delete failed:", e);
    }
  }, [items]);

  const addVariant = useCallback(async (itemId: string, variant: MenuVariant) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    const updatedVariants = [...(item.variants || []), variant];
    const updated = items.map((i) =>
      i.id === itemId ? { ...i, variants: updatedVariants } : i
    );
    setItems(updated);
    saveLocal(updated);

    try {
      await supabase.from("menu_items").update({ variants: updatedVariants }).eq("id", itemId);
    } catch (e) {
      console.error("[useMenuManager] addVariant failed:", e);
    }
  }, [items]);

  const removeVariant = useCallback(async (itemId: string, variantName: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    const updatedVariants = item.variants?.filter((v) => v.name !== variantName) ?? [];
    const updated = items.map((i) =>
      i.id === itemId ? { ...i, variants: updatedVariants } : i
    );
    setItems(updated);
    saveLocal(updated);

    try {
      await supabase.from("menu_items").update({ variants: updatedVariants }).eq("id", itemId);
    } catch (e) {
      console.error("[useMenuManager] removeVariant failed:", e);
    }
  }, [items]);

  return {
    items,
    addItem,
    updateItem,
    deleteItem,
    addVariant,
    removeVariant,
  };
}
