import { useState, useEffect, useCallback } from "react";
import type { CashClosing } from "@/types";
import { supabase } from "@/lib/supabase";

const STORAGE_KEY = "mr-toasted-cash-closings";

function loadLocal(): CashClosing[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocal(closings: CashClosing[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(closings));
}

function mapRow(row: any): CashClosing {
  return {
    id: row.id,
    closingDate: row.closing_date,
    openingCash: Number(row.opening_cash) || 0,
    cashSales: Number(row.cash_sales) || 0,
    cardSales: Number(row.card_sales) || 0,
    transferSales: Number(row.transfer_sales) || 0,
    totalSales: Number(row.total_sales) || 0,
    ordersCount: row.orders_count || 0,
    expectedCash: Number(row.expected_cash) || 0,
    countedCash: Number(row.counted_cash) || 0,
    difference: Number(row.difference) || 0,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}

export function useCashClosings() {
  const [closings, setClosings] = useState<CashClosing[]>(loadLocal);
  const [online, setOnline] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("cash_closings")
        .select("*")
        .order("closing_date", { ascending: false });
      if (error || !data) {
        setOnline(false);
        return;
      }
      const mapped = data.map(mapRow);
      setClosings(mapped);
      saveLocal(mapped);
      setOnline(true);
    } catch (e) {
      console.error("[useCashClosings] refresh failed:", e);
      setOnline(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addClosing = useCallback(
    async (closing: Omit<CashClosing, "id" | "createdAt">) => {
      // Optimista: actualizar local primero
      const tempId = `local-${Date.now()}`;
      const temp: CashClosing = {
        ...closing,
        id: tempId,
        createdAt: new Date().toISOString(),
      };
      setClosings((prev) => [temp, ...prev]);
      saveLocal([temp, ...closings]);

      try {
        const { data, error } = await supabase
          .from("cash_closings")
          .insert({
            closing_date: closing.closingDate,
            opening_cash: closing.openingCash,
            cash_sales: closing.cashSales,
            card_sales: closing.cardSales,
            transfer_sales: closing.transferSales,
            total_sales: closing.totalSales,
            orders_count: closing.ordersCount,
            expected_cash: closing.expectedCash,
            counted_cash: closing.countedCash,
            difference: closing.difference,
            notes: closing.notes ?? null,
          })
          .select()
          .single();

        if (error || !data) {
          console.error("[useCashClosings] insert failed:", error);
          return;
        }

        // Reemplazar el temporal con el registro real
        const real = mapRow(data);
        setClosings((prev) =>
          prev.map((c) => (c.id === tempId ? real : c))
        );
      } catch (e) {
        console.error("[useCashClosings] addClosing failed:", e);
      }
    },
    [closings]
  );

  return { closings, refresh, addClosing, online };
}
