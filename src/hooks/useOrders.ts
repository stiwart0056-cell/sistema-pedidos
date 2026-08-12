import { useState, useEffect, useCallback } from "react";
import type { Order, OrderStatus, CartItem } from "@/types";
import { supabase } from "@/lib/supabase";

function mapOrder(row: any, items: CartItem[]): Order {
  return {
    id: row.id,
    items,
    total: row.total,
    createdAt: row.created_at,
    status: row.status as OrderStatus,
    type: row.type as Order["type"],
    tableId: row.table_id ?? undefined,
    tableNumber: row.table_number ?? undefined,
    customer:
      row.customer_name || row.customer_phone
        ? {
            name: row.customer_name || "",
            phone: row.customer_phone || "",
            address: row.customer_address ?? undefined,
            notes: row.customer_notes ?? undefined,
          }
        : undefined,
  };
}

function mapItem(row: any): CartItem {
  return {
    cartId: row.id,
    id: row.menu_item_id || row.id,
    name: row.name,
    description: row.description ?? undefined,
    variant: row.variant ?? undefined,
    price: row.price,
    quantity: row.quantity,
  };
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Load orders with their items
  const refreshOrders = useCallback(async () => {
    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (ordersError) {
      console.error("[useOrders] load error:", ordersError);
      // fallback localStorage
      const raw = localStorage.getItem("mr-toasted-orders");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setOrders(parsed);
        } catch {}
      }
      setLoading(false);
      return;
    }

    if (!ordersData) {
      setLoading(false);
      return;
    }

    const orderIds = ordersData.map((o) => o.id);
    let itemsMap = new Map<string, CartItem[]>();

    if (orderIds.length > 0) {
      const { data: itemsData } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", orderIds);

      if (itemsData) {
        for (const it of itemsData) {
          const arr = itemsMap.get(it.order_id) || [];
          arr.push(mapItem(it));
          itemsMap.set(it.order_id, arr);
        }
      }
    }

    const mapped = ordersData.map((o) => mapOrder(o, itemsMap.get(o.id) || []));
    setOrders(mapped);
    setLoading(false);
  }, []);

  useEffect(() => {
    let mounted = true;
    refreshOrders().then(() => {
      if (!mounted) return;
    });

    const channel = supabase
      .channel("orders_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          if (mounted) refreshOrders();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "order_items" },
        () => {
          if (mounted) refreshOrders();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [refreshOrders]);

  const addOrder = useCallback(
    async (order: Order) => {
      // Insert order
      const { data: orderRow, error: orderError } = await supabase
        .from("orders")
        .insert({
          status: order.status,
          type: order.type,
          table_id: order.tableId ?? null,
          table_number: order.tableNumber ?? null,
          customer_name: order.customer?.name ?? null,
          customer_phone: order.customer?.phone ?? null,
          customer_address: order.customer?.address ?? null,
          customer_notes: order.customer?.notes ?? null,
          total: order.total,
          tax: 0,
          payment_method: "cash",
        })
        .select()
        .single();

      if (orderError || !orderRow) {
        console.error("[useOrders] insert error:", orderError);
        // fallback: save to localStorage for later sync
        const raw = localStorage.getItem("mr-toasted-orders");
        const existing = raw ? JSON.parse(raw) : [];
        localStorage.setItem(
          "mr-toasted-orders",
          JSON.stringify([order, ...existing])
        );
        setOrders((prev) => [order, ...prev]);
        return;
      }

      // Insert order items
      const itemsPayload = order.items.map((it) => ({
        order_id: orderRow.id,
        menu_item_id: it.id,
        name: it.name,
        description: it.description ?? null,
        variant: it.variant ?? null,
        price: it.price,
        quantity: it.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(itemsPayload);

      if (itemsError) {
        console.error("[useOrders] items insert error:", itemsError);
      }

      await refreshOrders();
    },
    [refreshOrders]
  );

  const updateStatus = useCallback(
    async (orderId: string, status: OrderStatus) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );

      const { error } = await supabase
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", orderId);

      if (error) {
        console.error("[useOrders] updateStatus error:", error);
        await refreshOrders();
      }
    },
    [refreshOrders]
  );

  const deleteOrder = useCallback(
    async (orderId: string) => {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));

      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", orderId);

      if (error) {
        console.error("[useOrders] delete error:", error);
        await refreshOrders();
      }
    },
    [refreshOrders]
  );

  return { orders, loading, refresh: refreshOrders, addOrder, updateStatus, deleteOrder };
}
