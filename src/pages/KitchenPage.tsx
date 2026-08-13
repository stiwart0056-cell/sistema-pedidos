import { useEffect, useMemo, useRef, useState } from "react";
import type { Order, OrderType } from "@/types";
import { useOrders } from "@/hooks/useOrders";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Volume2,
  VolumeX,
  Home,
  MapPin,
  User,
  Printer,
  XCircle,
  Wifi,
  AlertTriangle,
  Clock,
  RotateCcw,
} from "lucide-react";
import { playBeep } from "@/utils/audio";
import { statusConfig, getOrderTypeLabel } from "@/lib/constants";
import { OrderReceipt } from "@/components/OrderReceipt";

/* ── Timer en vivo ── */
function useElapsed(createdAt: string) {
  const [elapsed, setElapsed] = useState(() => Date.now() - new Date(createdAt).getTime());
  useEffect(() => {
    const id = setInterval(() => setElapsed(Date.now() - new Date(createdAt).getTime()), 1000);
    return () => clearInterval(id);
  }, [createdAt]);
  return elapsed;
}

function formatElapsed(ms: number) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

/* ── Tarjeta de pedido ── */
function OrderCard({
  order,
  onUpdate,
  onCancel,
}: {
  order: Order;
  onUpdate: (id: string, s: Order["status"]) => void;
  onCancel: (id: string) => void;
}) {
  const config = statusConfig[order.status];
  const StatusIcon = config.icon;
  const elapsed = useElapsed(order.createdAt);
  const isUrgent =
    (order.status === "pending" && elapsed > 10 * 60 * 1000) ||
    (order.status === "preparing" && elapsed > 20 * 60 * 1000);

  const typeIcon =
    order.type === "delivery" ? (
      <MapPin className="h-4 w-4" />
    ) : order.type === "dine-in" ? (
      <User className="h-4 w-4" />
    ) : (
      <Home className="h-4 w-4" />
    );

  const nextLabel =
    order.status === "pending"
      ? "Iniciar preparación"
      : order.status === "preparing"
      ? "Marcar como listo"
      : order.status === "ready"
      ? "Entregar pedido"
      : null;

  return (
    <div
      className={`rounded-2xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${
        isUrgent ? "ring-2 ring-red-400" : ""
      }`}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display text-xl font-bold tracking-tight">
              #{order.id.slice(-6).toUpperCase()}
            </h3>
            <Badge className={`flex items-center gap-1 rounded-full text-xs font-semibold ${config.color}`}>
              <StatusIcon className="h-3 w-3" />
              {config.label}
            </Badge>
            {isUrgent && (
              <Badge className="bg-red-500 text-white rounded-full gap-1">
                <AlertTriangle className="h-3 w-3" />
                Urgente
              </Badge>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span className="font-mono font-medium tabular-nums">{formatElapsed(elapsed)}</span>
            <span className="text-xs">
              {new Date(order.createdAt).toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            {typeIcon}
            <span>
              {getOrderTypeLabel(order.type)}
              {order.type === "delivery" && order.customer
                ? ` — ${order.customer.name}`
                : order.type === "dine-in" && order.tableNumber
                ? ` — Mesa ${order.tableNumber}`
                : ""}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="font-display text-2xl font-bold text-primary">
            RD$ {order.finalTotal.toLocaleString()}
          </p>
          {order.discount && order.discount > 0 && (
            <p className="text-xs text-green-600 font-medium">-{order.discount}% cupón</p>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="mb-3 space-y-2 rounded-xl bg-slate-50 p-3 text-sm">
        {order.items.map((item) => (
          <div key={item.cartId} className="flex justify-between gap-2">
            <span className="font-medium">
              <span className="inline-block w-6 text-right font-bold text-primary">{item.quantity}x</span>{" "}
              {item.name}
              {item.variant && (
                <span className="text-muted-foreground font-normal"> — {item.variant}</span>
              )}
            </span>
            <span className="text-muted-foreground font-mono shrink-0">
              RD$ {(item.price * item.quantity).toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Notas */}
      {order.customer?.notes && (
        <div className="mb-3 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
          <span className="font-semibold">📝 Nota:</span> {order.customer.notes}
        </div>
      )}

      {order.customer?.address && order.type === "delivery" && (
        <div className="mb-3 rounded-xl bg-blue-50 border border-blue-200 px-3 py-2 text-sm text-blue-800">
          <span className="font-semibold">📍 Dirección:</span> {order.customer.address}
        </div>
      )}

      {/* Acciones */}
      <div className="flex items-center gap-2">
        {nextLabel && (
          <Button
            className="w-full rounded-xl font-semibold text-base h-12"
            onClick={() => onUpdate(order.id, config.next!)}
          >
            {nextLabel}
          </Button>
        )}
        <OrderReceipt
          order={order}
          trigger={
            <Button
              size="icon"
              variant="outline"
              className="rounded-xl h-12 w-12 shrink-0"
              title="Imprimir ticket"
            >
              <Printer className="h-5 w-5" />
            </Button>
          }
        />
        {(order.status === "pending" || order.status === "preparing") && (
          <Button
            size="icon"
            variant="outline"
            className="rounded-xl h-12 w-12 shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
            title="Cancelar pedido"
            onClick={() => onCancel(order.id)}
          >
            <XCircle className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}

/* ── Columna Kanban ── */
function Column({
  title,
  color,
  count,
  children,
}: {
  title: string;
  color: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div
        className={`flex items-center justify-between rounded-2xl px-4 py-3 mb-3 ${color}`}
      >
        <span className="font-display font-bold text-base">{title}</span>
        <Badge
          className={`bg-white/80 text-foreground font-bold text-sm px-2.5 py-0.5`}
        >
          {count}
        </Badge>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
        {children}
      </div>
    </div>
  );
}

/* ── Página principal ── */
export function KitchenPage() {
  const { orders, updateStatus, cancelOrder, refresh } = useOrders();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filterType, setFilterType] = useState<OrderType | "all">("all");
  const prevPendingRef = useRef(0);

  /* Sonido al llegar nuevo pedido */
  useEffect(() => {
    const pending = orders.filter((o) => o.status === "pending").length;
    if (soundEnabled && pending > prevPendingRef.current) {
      playBeep();
    }
    prevPendingRef.current = pending;
  }, [orders, soundEnabled]);

  /* Filtrar por tipo */
  const filteredOrders = useMemo(() => {
    if (filterType === "all") return orders;
    return orders.filter((o) => o.type === filterType);
  }, [orders, filterType]);

  const pending = filteredOrders.filter((o) => o.status === "pending");
  const preparing = filteredOrders.filter((o) => o.status === "preparing");
  const ready = filteredOrders.filter((o) => o.status === "ready");
  const delivered = filteredOrders.filter((o) => o.status === "delivered").slice(0, 15);
  const cancelled = filteredOrders.filter((o) => o.status === "cancelled").slice(0, 10);

  const urgentCount = orders.filter(
    (o) =>
      (o.status === "pending" && Date.now() - new Date(o.createdAt).getTime() > 10 * 60 * 1000) ||
      (o.status === "preparing" && Date.now() - new Date(o.createdAt).getTime() > 20 * 60 * 1000)
  ).length;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b shadow-sm">
        <div className="max-w-[1920px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-xl">
              👨‍🍳
            </div>
            <div>
              <h1 className="font-display text-xl font-bold leading-tight">Cocina Mr. Toasted</h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Wifi className="h-3 w-3 text-green-500" />
                <span>En tiempo real</span>
                {urgentCount > 0 && (
                  <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0">
                    {urgentCount} urgente{urgentCount > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Filtros */}
            <div className="hidden sm:flex items-center bg-slate-100 rounded-xl p-1 gap-1">
              {([
                { key: "all", label: "Todos" },
                { key: "delivery", label: "Delivery", icon: MapPin },
                { key: "pickup", label: "Recoger", icon: Home },
                { key: "dine-in", label: "Mesa", icon: User },
              ] as const).map((f) => (
                <Button
                  key={f.key}
                  size="sm"
                  variant={filterType === f.key ? "default" : "ghost"}
                  className="rounded-lg text-xs gap-1 h-8"
                  onClick={() => setFilterType(f.key as OrderType | "all")}
                >
                  {f.icon && <f.icon className="h-3 w-3" />}
                  {f.label}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-xl"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              <span className="hidden sm:inline">{soundEnabled ? "Sonido ON" : "Sonido OFF"}</span>
            </Button>

            <Button variant="outline" size="sm" className="gap-2 rounded-xl" onClick={() => refresh()}>
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Actualizar</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile filter */}
      <div className="sm:hidden px-4 pt-3 pb-1">
        <div className="flex items-center bg-white rounded-xl p-1 gap-1 overflow-x-auto">
          {([
            { key: "all", label: "Todos" },
            { key: "delivery", label: "Delivery", icon: MapPin },
            { key: "pickup", label: "Recoger", icon: Home },
            { key: "dine-in", label: "Mesa", icon: User },
          ] as const).map((f) => (
            <Button
              key={f.key}
              size="sm"
              variant={filterType === f.key ? "default" : "ghost"}
              className="rounded-lg text-xs gap-1 h-8 shrink-0"
              onClick={() => setFilterType(f.key as OrderType | "all")}
            >
              {f.icon && <f.icon className="h-3 w-3" />}
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Kanban board */}
      <main className="max-w-[1920px] mx-auto p-4">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
          <Column title="Pendientes" color="bg-yellow-100 text-yellow-800" count={pending.length}>
            {pending.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">Sin pedidos pendientes</div>
            )}
            {pending.map((o) => (
              <OrderCard key={o.id} order={o} onUpdate={updateStatus} onCancel={cancelOrder} />
            ))}
          </Column>

          <Column title="Preparando" color="bg-blue-100 text-blue-800" count={preparing.length}>
            {preparing.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">Sin pedidos en preparación</div>
            )}
            {preparing.map((o) => (
              <OrderCard key={o.id} order={o} onUpdate={updateStatus} onCancel={cancelOrder} />
            ))}
          </Column>

          <Column title="Listos" color="bg-green-100 text-green-800" count={ready.length}>
            {ready.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">Sin pedidos listos</div>
            )}
            {ready.map((o) => (
              <OrderCard key={o.id} order={o} onUpdate={updateStatus} onCancel={cancelOrder} />
            ))}
          </Column>

          <Column title="Entregados" color="bg-gray-100 text-gray-800" count={delivered.length}>
            {delivered.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">Sin pedidos entregados</div>
            )}
            {delivered.map((o) => (
              <OrderCard key={o.id} order={o} onUpdate={updateStatus} onCancel={cancelOrder} />
            ))}
          </Column>

          {/* Cancelados */}
          <div className="hidden 2xl:block">
            <Column title="Cancelados" color="bg-red-50 text-red-800" count={cancelled.length}>
              {cancelled.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">Sin pedidos cancelados</div>
              )}
              {cancelled.map((o) => (
                <OrderCard key={o.id} order={o} onUpdate={updateStatus} onCancel={cancelOrder} />
              ))}
            </Column>
          </div>
        </div>
      </main>
    </div>
  );
}
