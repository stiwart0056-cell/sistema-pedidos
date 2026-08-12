import { useEffect, useRef, useState } from "react";
import type { Order } from "@/types";
import { useOrders } from "@/hooks/useOrders";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Volume2, VolumeX, Home, MapPin, User, Printer } from "lucide-react";
import { playBeep } from "@/utils/audio";
import { statusConfig } from "@/lib/constants";
import { OrderReceipt } from "@/components/OrderReceipt";

function OrderCard({
  order,
  onUpdate,
}: {
  order: Order;
  onUpdate: (id: string, s: Order["status"]) => void;
}) {
  const config = statusConfig[order.status];
  const StatusIcon = config.icon;

  const typeIcon =
    order.type === "delivery" ? (
      <MapPin className="h-3 w-3" />
    ) : order.type === "dine-in" ? (
      <User className="h-3 w-3" />
    ) : (
      <Home className="h-3 w-3" />
    );

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-bold">{order.id}</h3>
            <Badge className={`flex items-center gap-1 rounded-full ${config.color}`}>
              <StatusIcon className="h-3 w-3" />
              {config.label}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {new Date(order.createdAt).toLocaleTimeString()}
          </p>
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            {typeIcon}
            {order.type === "delivery" && order.customer
              ? `Delivery - ${order.customer.name}`
              : order.type === "dine-in" && order.tableNumber
              ? `Mesa ${order.tableNumber}`
              : "Recoger en local"}
          </div>
        </div>
        <div className="text-right">
          <p className="font-display text-xl font-bold text-primary">
            RD$ {order.total.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mb-3 space-y-1 text-sm">
        {order.items.map((item) => (
          <div key={item.cartId} className="flex justify-between">
            <span>
              {item.quantity}x {item.name}
              {item.variant && <span className="text-muted-foreground"> ({item.variant})</span>}
            </span>
          </div>
        ))}
      </div>

      {order.customer?.notes && (
        <p className="mb-2 rounded-lg bg-yellow-50 px-2 py-1 text-xs text-yellow-700">
          📝 {order.customer.notes}
        </p>
      )}

      <div className="flex items-center gap-2">
        {config.next && (
          <Button
            className="w-full rounded-lg"
            onClick={() => onUpdate(order.id, config.next!)}
          >
            {order.status === "pending" && "Iniciar preparación"}
            {order.status === "preparing" && "Marcar como listo"}
            {order.status === "ready" && "Entregar pedido"}
          </Button>
        )}
        <OrderReceipt
          order={order}
          trigger={
            <Button size="sm" variant="outline" className="gap-1 rounded-full shrink-0">
              <Printer className="h-3.5 w-3.5" />
              Ticket
            </Button>
          }
        />
      </div>
    </div>
  );
}

export function KitchenPage() {
  const { orders, updateStatus, refresh } = useOrders();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const prevCount = useRef(orders.filter((o) => o.status === "pending").length);

  useEffect(() => {
    const interval = setInterval(() => refresh(), 2000);
    return () => clearInterval(interval);
  }, [refresh]);

  useEffect(() => {
    const pending = orders.filter((o) => o.status === "pending").length;
    if (soundEnabled && pending > prevCount.current) {
      playBeep();
    }
    prevCount.current = pending;
  }, [orders, soundEnabled]);

  const pending = orders.filter((o) => o.status === "pending");
  const preparing = orders.filter((o) => o.status === "preparing");
  const ready = orders.filter((o) => o.status === "ready");
  const delivered = orders.filter((o) => o.status === "delivered").slice(0, 10);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-primary">
          👨‍🍳 Cocina Mr. Toasted
        </h1>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-full"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            {soundEnabled ? "Sonido ON" : "Sonido OFF"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {/* Pending */}
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-yellow-100 px-4 py-2">
            <span className="font-display font-bold text-yellow-800">Pendientes</span>
            <Badge className="bg-yellow-200 text-yellow-800">{pending.length}</Badge>
          </div>
          <div className="space-y-3">
            {pending.map((o) => (
              <OrderCard key={o.id} order={o} onUpdate={updateStatus} />
            ))}
          </div>
        </div>

        {/* Preparing */}
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-blue-100 px-4 py-2">
            <span className="font-display font-bold text-blue-800">Preparando</span>
            <Badge className="bg-blue-200 text-blue-800">{preparing.length}</Badge>
          </div>
          <div className="space-y-3">
            {preparing.map((o) => (
              <OrderCard key={o.id} order={o} onUpdate={updateStatus} />
            ))}
          </div>
        </div>

        {/* Ready */}
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-green-100 px-4 py-2">
            <span className="font-display font-bold text-green-800">Listos</span>
            <Badge className="bg-green-200 text-green-800">{ready.length}</Badge>
          </div>
          <div className="space-y-3">
            {ready.map((o) => (
              <OrderCard key={o.id} order={o} onUpdate={updateStatus} />
            ))}
          </div>
        </div>

        {/* Delivered */}
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-gray-100 px-4 py-2">
            <span className="font-display font-bold text-gray-800">Entregados</span>
            <Badge className="bg-gray-200 text-gray-800">{delivered.length}</Badge>
          </div>
          <div className="space-y-3">
            {delivered.map((o) => (
              <OrderCard key={o.id} order={o} onUpdate={updateStatus} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
