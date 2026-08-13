import { useState, useEffect, useCallback } from "react";
import type { MenuItem, MenuVariant } from "@/types";
import { supabase } from "@/lib/supabase";
import { defaultMenuItems } from "@/data/defaultMenu";

const STORAGE_KEY = "mr-toasted-menu";
const SEED_KEY = "mr-toasted-menu-seeded-v2";

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
    stock: row.stock ?? undefined,
    isAvailable: row.is_available ?? true,
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
        if (data && data.length > 0 && localStorage.getItem(SEED_KEY)) {
          const mapped = data.map(mapRow);
          setItems(mapped);
          saveLocal(mapped);
        } else if (!localStorage.getItem(SEED_KEY)) {
          // Force re-seed: clear old items and insert correct menu from PDF
          localStorage.setItem(SEED_KEY, "true");
          localStorage.removeItem(STORAGE_KEY);
          
          // Clear existing items from Supabase
          await supabase.from("menu_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
          
          const seeded: MenuItem[] = [];
          for (const item of defaultMenuItems) {
            const { data: inserted } = await supabase
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
                stock: null,
              })
              .select()
              .single();
            if (inserted) {
              seeded.push(mapRow(inserted));
            }
          }
          setItems(seeded);
          saveLocal(seeded);
        }
      } catch (e) {
        console.error("[useMenuManager] load failed:", e);
        // Fallback: seed from defaults to localStorage if Supabase is down
        if (!localStorage.getItem(SEED_KEY)) {
          localStorage.setItem(SEED_KEY, "true");
          const seeded = defaultMenuItems.map((it, idx) => ({
            ...it,
            id: `seed-${idx}`,
            isAvailable: true,
          }));
          setItems(seeded);
          saveLocal(seeded);
        }
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
          is_available: item.isAvailable ?? true,
          is_featured: false,
          stock: item.stock ?? null,
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
      if (changes.stock !== undefined) payload.stock = changes.stock ?? null;
      if (changes.isAvailable !== undefined) payload.is_available = changes.isAvailable;
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

  // Decrement stock when an order is placed
  const decrementStock = useCallback(async (itemId: string, quantity: number = 1) => {
    const item = items.find((i) => i.id === itemId);
    if (!item || item.stock === undefined || item.stock === null) return;
    
    const newStock = Math.max(0, item.stock - quantity);
    const updated = items.map((i) =>
      i.id === itemId ? { ...i, stock: newStock, isAvailable: newStock > 0 } : i
    );
    setItems(updated);
    saveLocal(updated);

    try {
      await supabase
        .from("menu_items")
        .update({ stock: newStock, is_available: newStock > 0 })
        .eq("id", itemId);
    } catch (e) {
      console.error("[useMenuManager] decrementStock failed:", e);
    }
  }, [items]);

  // Check if item has stock available
  const hasStock = useCallback((itemId: string, quantity: number = 1): boolean => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return false;
    if (item.isAvailable === false) return false;
    if (item.stock === undefined || item.stock === null) return true; // unlimited
    return item.stock >= quantity;
  }, [items]);

  return {
    items,
    addItem,
    updateItem,
    deleteItem,
    addVariant,
    removeVariant,
    decrementStock,
    hasStock,
  };
}
