import { useState, useEffect, useCallback } from "react";
import type { Table } from "@/types";
import { supabase } from "@/lib/supabase";

const DEFAULT_TABLES: Table[] = Array.from({ length: 10 }, (_, i) => ({
  id: `table-${i + 1}`,
  number: i + 1,
  capacity: 4,
  status: "free" as const,
}));

function mapRow(row: any): Table {
  return {
    id: row.id,
    number: row.number,
    capacity: row.capacity ?? 4,
    status: row.status === "occupied" ? "occupied" : "free",
  };
}

export function useTables() {
  const [tables, setTables] = useState<Table[]>(DEFAULT_TABLES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase
      .from("tables")
      .select("*")
      .order("number", { ascending: true })
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          console.error("[useTables] load error:", error);
          const raw = localStorage.getItem("mr-toasted-tables");
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed) && parsed.length > 0) setTables(parsed);
            } catch {}
          }
        } else if (data && data.length > 0) {
          setTables(data.map(mapRow));
        }
        setLoading(false);
      });

    const channel = supabase
      .channel("tables_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tables" },
        () => {
          supabase
            .from("tables")
            .select("*")
            .order("number", { ascending: true })
            .then(({ data }) => {
              if (data) setTables(data.map(mapRow));
            });
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const toggleStatus = useCallback(async (id: string) => {
    const table = tables.find((t) => t.id === id);
    if (!table) return;
    const newStatus = table.status === "free" ? "occupied" : "free";

    setTables((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );

    const { error } = await supabase
      .from("tables")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      console.error("[useTables] toggle error:", error);
      const { data } = await supabase
        .from("tables")
        .select("*")
        .order("number", { ascending: true });
      if (data) setTables(data.map(mapRow));
    }
  }, [tables]);

  const addTable = useCallback(async () => {
    const nextNum =
      tables.length > 0 ? Math.max(...tables.map((t) => t.number)) + 1 : 1;
    const newTable = {
      number: nextNum,
      capacity: 4,
      status: "free" as const,
    };

    setTables((prev) => [
      ...prev,
      { id: `temp-${Date.now()}`, ...newTable },
    ]);

    const { data, error } = await supabase
      .from("tables")
      .insert(newTable)
      .select()
      .single();

    if (error) {
      console.error("[useTables] add error:", error);
      const { data: refreshed } = await supabase
        .from("tables")
        .select("*")
        .order("number", { ascending: true });
      if (refreshed) setTables(refreshed.map(mapRow));
    } else if (data) {
      setTables((prev) =>
        prev.map((t) =>
          t.id.startsWith("temp-") && t.number === nextNum ? mapRow(data) : t
        )
      );
    }
  }, [tables]);

  const removeTable = useCallback(async (id: string) => {
    setTables((prev) => prev.filter((t) => t.id !== id));

    const { error } = await supabase.from("tables").delete().eq("id", id);
    if (error) {
      console.error("[useTables] remove error:", error);
      const { data } = await supabase
        .from("tables")
        .select("*")
        .order("number", { ascending: true });
      if (data) setTables(data.map(mapRow));
    }
  }, []);

  return { tables, toggleStatus, addTable, removeTable, loading };
}
