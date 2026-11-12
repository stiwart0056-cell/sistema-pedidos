import { useState, useEffect, useCallback, useRef } from "react";
import type { Order, OrderStatus } from "@/types";
import { supabase } from "@/lib/supabase";
import { playBeep } from "@/utils/audio";

const STORAGE_KEY = "mr-toasted-orders";

function loadLocal(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocal(orders: Order[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

function mapItem(row: any) {
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

function mapOrder(row: any, items: any[]): Order {
  return {
    id: row.id,
    items,
    total: row.total,
    discount: row.discount ?? undefined,
    couponCode: row.coupon_code ?? undefined,
    deliveryFee: row.delivery_fee ?? undefined,
    deliveryZoneId: row.delivery_zone_id ?? undefined,
    finalTotal: row.final_total ?? row.total,
    createdAt: row.created_at,
    status: row.status,
    type: row.type,
    paymentMethod: row.payment_method ?? undefined,
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

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>(loadLocal);
  const [online, setOnline] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const refreshOrders = useCallback(async () => {
    try {
      const { data: ordersData, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error || !ordersData) {
        setOnline(false);
        return;
      }

      const orderIds = ordersData.map((o: any) => o.id);
      let itemsMap = new Map<string, any[]>();

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

      const mapped = ordersData.map((o: any) =>
        mapOrder(o, itemsMap.get(o.id) || [])
      );
      setOrders(mapped);
      saveLocal(mapped);
      setOnline(true);
    } catch (e) {
      console.error("[useOrders] refresh failed:", e);
      setOnline(false);
    }
  }, []);

  useEffect(() => {
    // Initial load
    refreshOrders();

    // Setup Supabase Realtime
    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          console.log("[Realtime] orders change:", payload.eventType, payload);
          refreshOrders();
          // Play beep on new order
          if (payload.eventType === "INSERT") {
            playBeep();
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "order_items" },
        () => {
          refreshOrders();
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [refreshOrders]);

  const addOrder = useCallback(
    async (order: Order) => {
      const updated = [order, ...orders];
      setOrders(updated);
      saveLocal(updated);

      if (!online) return;

      try {
        const fullPayload = {
          status: order.status,
          type: order.type,
          table_id: order.tableId ?? null,
          table_number: order.tableNumber ?? null,
          customer_name: order.customer?.name ?? null,
          customer_phone: order.customer?.phone ?? null,
          customer_address: order.customer?.address ?? null,
          customer_notes: order.customer?.notes ?? null,
          total: order.total,
          discount: order.discount ?? null,
          coupon_code: order.couponCode ?? null,
          delivery_fee: order.deliveryFee ?? null,
          delivery_zone_id: order.deliveryZoneId ?? null,
          final_total: order.finalTotal ?? order.total,
          tax: 0,
          payment_method: order.paymentMethod ?? "cash",
        };

        let orderRow: any = null;

        // Intento 1: insert completo con todos los campos
        const first = await supabase
          .from("orders")
          .insert(fullPayload)
          .select()
          .single();

        if (first.error) {
          console.error(
            "[useOrders] insert completo falló, reintentando con payload mínimo:",
            first.error.message
          );
          // Intento 2: solo columnas base (por si faltan columnas opcionales en el schema)
          const minimal: any = {
            status: order.status,
            type: order.type,
            total: order.total,
            tax: 0,
            payment_method: order.paymentMethod ?? "cash",
          };
          if (order.tableId !== undefined) minimal.table_id = order.tableId;
          if (order.tableNumber !== undefined) minimal.table_number = order.tableNumber;
          if (order.customer?.name) minimal.customer_name = order.customer.name;
          if (order.customer?.phone) minimal.customer_phone = order.customer.phone;
          if (order.customer?.address) minimal.customer_address = order.customer.address;
          if (order.customer?.notes) minimal.customer_notes = order.customer.notes;

          const second = await supabase
            .from("orders")
            .insert(minimal)
            .select()
            .single();

          if (second.error) {
            console.error("[useOrders] insert mínimo también falló:", second.error.message);
            return;
          }
          orderRow = second.data;
        } else {
          orderRow = first.data;
        }

        if (!orderRow) return;

        const itemsPayload = order.items.map((it) => ({
          order_id: orderRow.id,
          menu_item_id: it.id,
          name: it.name,
          description: it.description ?? null,
          variant: it.variant ?? null,
          price: it.price,
          quantity: it.quantity,
        }));

        await supabase.from("order_items").insert(itemsPayload);
      } catch (e) {
        console.error("[useOrders] addOrder failed:", e);
      }
    },
    [orders, online]
  );

  const updateStatus = useCallback(
    async (orderId: string, status: OrderStatus) => {
      if (!online) {
        // Offline: solo actualizar local
        const updated = orders.map((o) =>
          o.id === orderId ? { ...o, status } : o
        );
        setOrders(updated);
        saveLocal(updated);
        return;
      }

      try {
        // 1. Primero actualizar en Supabase
        const { error } = await supabase
          .from("orders")
          .update({ status, updated_at: new Date().toISOString() })
          .eq("id", orderId);

        if (error) throw error;

        // 2. Luego actualizar estado local (después de confirmar Supabase)
        const updated = orders.map((o) =>
          o.id === orderId ? { ...o, status } : o
        );
        setOrders(updated);
        saveLocal(updated);
      } catch (e) {
        console.error("[useOrders] updateStatus failed:", e);
        // Revertir el cambio local si falló
        setOrders(orders);
        saveLocal(orders);
      }
    },
    [orders, online]
  );

  const deleteOrder = useCallback(
    async (orderId: string) => {
      const updated = orders.filter((o) => o.id !== orderId);
      setOrders(updated);
      saveLocal(updated);

      if (!online) return;
      try {
        await supabase.from("orders").delete().eq("id", orderId);
      } catch (e) {
        console.error("[useOrders] deleteOrder failed:", e);
      }
    },
    [orders, online]
  );

  const cancelOrder = useCallback(
    async (orderId: string) => {
      if (!online) {
        const updated = orders.map((o) =>
          o.id === orderId ? { ...o, status: "cancelled" as OrderStatus } : o
        );
        setOrders(updated);
        saveLocal(updated);
        return;
      }

      try {
        const { error } = await supabase
          .from("orders")
          .update({ status: "cancelled", updated_at: new Date().toISOString() })
          .eq("id", orderId);

        if (error) throw error;

        const updated = orders.map((o) =>
          o.id === orderId ? { ...o, status: "cancelled" as OrderStatus } : o
        );
        setOrders(updated);
        saveLocal(updated);
      } catch (e) {
        console.error("[useOrders] cancelOrder failed:", e);
        setOrders(orders);
        saveLocal(orders);
      }
    },
    [orders, online]
  );

  return { orders, refresh: refreshOrders, addOrder, updateStatus, deleteOrder, cancelOrder };
}
