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

export function useCategories() {
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);

  // Load initial categories
  useEffect(() => {
    let mounted = true;
    supabase
      .from("categories")
      .select("name")
      .order("sort_order", { ascending: true })
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          console.error("[useCategories] load error:", error);
          // fallback to localStorage
          const raw = localStorage.getItem("mr-toasted-categories");
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setCategories(parsed);
              }
            } catch {}
          }
        } else if (data && data.length > 0) {
          setCategories(data.map((c) => c.name));
        }
        setLoading(false);
      });

    // Realtime
    const channel = supabase
      .channel("categories_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "categories" },
        () => {
          // Refresh list on any change
          supabase
            .from("categories")
            .select("name")
            .order("sort_order", { ascending: true })
            .then(({ data }) => {
              if (data && data.length > 0) setCategories(data.map((c) => c.name));
            });
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const addCategory = useCallback(async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    // Optimistic
    setCategories((prev) => {
      if (prev.includes(trimmed)) return prev;
      return [...prev, trimmed];
    });

    const { error } = await supabase
      .from("categories")
      .insert({ name: trimmed, sort_order: 999 })
      .select()
      .single();

    if (error) {
      console.error("[useCategories] add error:", error);
      // refresh from server
      const { data } = await supabase
        .from("categories")
        .select("name")
        .order("sort_order", { ascending: true });
      if (data) setCategories(data.map((c) => c.name));
    }
  }, []);

  const removeCategory = useCallback(async (name: string) => {
    setCategories((prev) => prev.filter((c) => c !== name));

    const { error } = await supabase.from("categories").delete().eq("name", name);
    if (error) {
      console.error("[useCategories] remove error:", error);
      const { data } = await supabase
        .from("categories")
        .select("name")
        .order("sort_order", { ascending: true });
      if (data) setCategories(data.map((c) => c.name));
    }
  }, []);

  const reorderCategories = useCallback(async (newOrder: string[]) => {
    setCategories(newOrder);
    // Update sort_order for each
    const updates = newOrder.map((name, idx) =>
      supabase.from("categories").update({ sort_order: idx }).eq("name", name)
    );
    await Promise.all(updates);
  }, []);

  return { categories, addCategory, removeCategory, reorderCategories, loading };
}
