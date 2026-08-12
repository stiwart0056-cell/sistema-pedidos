import { useState, useEffect, useCallback } from "react";
import type { Table } from "@/types";
import { StorageService } from "@/lib/storage";
import { STORAGE_KEYS } from "@/lib/constants";

const DEFAULT_TABLES: Table[] = Array.from({ length: 10 }, (_, i) => ({
  id: `table-${i + 1}`,
  number: i + 1,
  capacity: 4,
  status: "free",
}));

function loadTables(): Table[] {
  return StorageService.get<Table[]>(STORAGE_KEYS.tables, JSON.parse(JSON.stringify(DEFAULT_TABLES)));
}

export function useTables() {
  const [tables, setTables] = useState<Table[]>(loadTables);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.tables) setTables(loadTables());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const toggleStatus = useCallback((id: string) => {
    setTables((prev) => {
      const updated = prev.map((t) =>
        t.id === id
          ? ({ ...t, status: t.status === "free" ? "occupied" : "free" } as Table)
          : t
      );
      StorageService.set(STORAGE_KEYS.tables, updated);
      return updated;
    });
  }, []);

  const addTable = useCallback(() => {
    setTables((prev) => {
      const nextNum = prev.length > 0 ? Math.max(...prev.map((t) => t.number)) + 1 : 1;
      const updated: Table[] = [
        ...prev,
        { id: `table-${nextNum}`, number: nextNum, capacity: 4, status: "free" },
      ];
      StorageService.set(STORAGE_KEYS.tables, updated);
      return updated;
    });
  }, []);

  const removeTable = useCallback((id: string) => {
    setTables((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      StorageService.set(STORAGE_KEYS.tables, updated);
      return updated;
    });
  }, []);

  return { tables, toggleStatus, addTable, removeTable };
}
