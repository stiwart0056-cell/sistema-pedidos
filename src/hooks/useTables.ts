import { useState, useEffect, useCallback } from "react";
import type { Table } from "@/types";
import { supabase } from "@/lib/supabase";

const DEFAULT_TABLES: Table[] = Array.from({ length: 10 }, (_, i) => ({
  id: `table-${i + 1}`,
  number: i + 1,
  capacity: 4,
  status: "free" as const,
}));

const STORAGE_KEY = "mr-toasted-tables";

function loadLocal(): Table[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_TABLES;
}

function saveLocal(tables: Table[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tables));
}

function mapRow(row: any): Table {
  return {
    id: row.id,
    number: row.number,
    capacity: row.capacity ?? 4,
    status: (row.status === "occupied" ? "occupied" : "free") as Table["status"],
  };
}

export function useTables() {
  const [tables, setTables] = useState<Table[]>(loadLocal);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from("tables")
          .select("*")
          .order("number", { ascending: true });
        if (data && data.length > 0) {
          const mapped = data.map(mapRow);
          setTables(mapped);
          saveLocal(mapped);
        }
      } catch (e) {
        console.error("[useTables] load failed:", e);
      }
    })();
  }, []);

  const toggleStatus = useCallback(async (id: string) => {
    const table = tables.find((t) => t.id === id);
    if (!table) return;
    const newStatus = (table.status === "free" ? "occupied" : "free") as Table["status"];
    const updated = tables.map((t) =>
      t.id === id ? { ...t, status: newStatus } : t
    ) as Table[];
    setTables(updated);
    saveLocal(updated);

    try {
      await supabase.from("tables").update({ status: newStatus }).eq("id", id);
    } catch (e) {
      console.error("[useTables] toggle failed:", e);
    }
  }, [tables]);

  const addTable = useCallback(async () => {
    const nextNum = tables.length > 0 ? Math.max(...tables.map((t) => t.number)) + 1 : 1;
    const newTable: Table = {
      id: `local-${Date.now()}`,
      number: nextNum,
      capacity: 4,
      status: "free",
    };
    const updated = [...tables, newTable];
    setTables(updated);
    saveLocal(updated);

    try {
      const { data } = await supabase
        .from("tables")
        .insert({ number: nextNum, capacity: 4, status: "free" })
        .select()
        .single();
      if (data) {
        setTables((prev) =>
          prev.map((t) => (t.id === newTable.id ? mapRow(data) : t))
        );
      }
    } catch (e) {
      console.error("[useTables] add failed:", e);
    }
  }, [tables]);

  const removeTable = useCallback(async (id: string) => {
    const updated = tables.filter((t) => t.id !== id);
    setTables(updated);
    saveLocal(updated);

    try {
      await supabase.from("tables").delete().eq("id", id);
    } catch (e) {
      console.error("[useTables] remove failed:", e);
    }
  }, [tables]);

  return { tables, toggleStatus, addTable, removeTable };
}
