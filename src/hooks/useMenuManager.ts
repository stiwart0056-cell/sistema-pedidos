import { useState, useEffect, useCallback } from "react";
import type { MenuItem, MenuVariant } from "@/types";
import { supabase } from "@/lib/supabase";

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
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase
      .from("menu_items")
      .select("*")
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          console.error("[useMenuManager] load error:", error);
          // fallback: seed from old localStorage or default
          const raw = localStorage.getItem("mr-toasted-menu");
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) setItems(parsed);
            } catch {}
          }
        } else if (data) {
          setItems(data.map(mapRow));
        }
        setLoading(false);
      });

    const channel = supabase
      .channel("menu_items_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "menu_items" },
        () => {
          supabase
            .from("menu_items")
            .select("*")
            .order("created_at", { ascending: true })
            .then(({ data }) => {
              if (data) setItems(data.map(mapRow));
            });
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const addItem = useCallback(async (item: Omit<MenuItem, "id">) => {
    const payload = {
      name: item.name,
      description: item.description ?? "",
      price: item.price ?? null,
      category: item.category,
      image: item.image ?? null,
      variants: item.variants ?? [],
      is_available: true,
      is_featured: false,
    };

    const tempId = `temp-${Date.now()}`;
    setItems((prev) => [...prev, { ...item, id: tempId }]);

    const { data, error } = await supabase
      .from("menu_items")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("[useMenuManager] add error:", error);
      const { data: refreshed } = await supabase
        .from("menu_items")
        .select("*")
        .order("created_at", { ascending: true });
      if (refreshed) setItems(refreshed.map(mapRow));
    } else if (data) {
      setItems((prev) =>
        prev.map((i) => (i.id === tempId ? mapRow(data) : i))
      );
    }
  }, []);

  const updateItem = useCallback(async (id: string, changes: Partial<MenuItem>) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...changes } : i))
    );

    const payload: any = {};
    if (changes.name !== undefined) payload.name = changes.name;
    if (changes.description !== undefined) payload.description = changes.description;
    if (changes.price !== undefined) payload.price = changes.price ?? null;
    if (changes.category !== undefined) payload.category = changes.category;
    if (changes.image !== undefined) payload.image = changes.image ?? null;
    if (changes.variants !== undefined) payload.variants = changes.variants ?? [];

    const { error } = await supabase
      .from("menu_items")
      .update(payload)
      .eq("id", id);

    if (error) {
      console.error("[useMenuManager] update error:", error);
      const { data } = await supabase
        .from("menu_items")
        .select("*")
        .order("created_at", { ascending: true });
      if (data) setItems(data.map(mapRow));
    }
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));

    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) {
      console.error("[useMenuManager] delete error:", error);
      const { data } = await supabase
        .from("menu_items")
        .select("*")
        .order("created_at", { ascending: true });
      if (data) setItems(data.map(mapRow));
    }
  }, []);

  const addVariant = useCallback(async (itemId: string, variant: MenuVariant) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    const updatedVariants = [...(item.variants || []), variant];

    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId ? { ...i, variants: updatedVariants } : i
      )
    );

    const { error } = await supabase
      .from("menu_items")
      .update({ variants: updatedVariants })
      .eq("id", itemId);

    if (error) {
      console.error("[useMenuManager] addVariant error:", error);
      const { data } = await supabase
        .from("menu_items")
        .select("*")
        .order("created_at", { ascending: true });
      if (data) setItems(data.map(mapRow));
    }
  }, [items]);

  const removeVariant = useCallback(async (itemId: string, variantName: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    const updatedVariants = item.variants?.filter((v) => v.name !== variantName) ?? [];

    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId ? { ...i, variants: updatedVariants } : i
      )
    );

    const { error } = await supabase
      .from("menu_items")
      .update({ variants: updatedVariants })
      .eq("id", itemId);

    if (error) {
      console.error("[useMenuManager] removeVariant error:", error);
      const { data } = await supabase
        .from("menu_items")
        .select("*")
        .order("created_at", { ascending: true });
      if (data) setItems(data.map(mapRow));
    }
  }, [items]);

  return {
    items,
    addItem,
    updateItem,
    deleteItem,
    addVariant,
    removeVariant,
    loading,
  };
}
