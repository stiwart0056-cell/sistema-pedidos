import type { Order } from "@/types";
import { useOrders } from "@/hooks/useOrders";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, MapPin, Home, User, ExternalLink, Package } from "lucide-react";
import { statusConfig } from "@/lib/constants";
import { OrderReceipt } from "@/components/OrderReceipt";

export function OrdersPage() {
  const { orders, updateStatus, deleteOrder } = useOrders();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-foreground">Pedidos</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border bg-white py-20 text-muted-foreground">
          <Package className="mb-4 h-16 w-16 opacity-20" />
          <p className="text-lg font-medium">No hay pedidos aún</p>
          <p className="text-sm">Los pedidos confirmados aparecerán aquí</p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="space-y-4">
            {orders.map((order) => {
              const config = statusConfig[order.status];
              const StatusIcon = config.icon;
              return (
                <div key={order.id} className="rounded-2xl border bg-white p-5">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-lg font-bold">{order.id}</h3>
                        <Badge className={`flex items-center gap-1 rounded-full ${config.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>

                      {/* Order type badge */}
                      <div className="mt-1 flex items-center gap-1 text-xs">
                        {order.type === "delivery" ? (
                          <Badge variant="outline" className="gap-1 text-purple-600">
                            <MapPin className="h-3 w-3" /> Delivery
                          </Badge>
                        ) : order.type === "dine-in" ? (
                          <Badge variant="outline" className="gap-1 text-orange-600">
                            <User className="h-3 w-3" /> Mesa {order.tableNumber}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 text-teal-600">
                            <Home className="h-3 w-3" /> Pickup
                          </Badge>
                        )}
                      </div>

                      {/* Customer info for delivery */}
                      {order.type === "delivery" && order.customer && (
                        <div className="mt-2 rounded-lg bg-purple-50 p-2 text-xs text-purple-700">
                          <p className="font-semibold">{order.customer.name}</p>
                          <p>📞 {order.customer.phone}</p>
                          <p>📍 {order.customer.address}</p>
                          {order.customer.address && (
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.customer.address)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-1 inline-flex items-center gap-1 text-primary underline"
                            >
                              <ExternalLink className="h-3 w-3" /> Ver mapa
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-display text-xl font-bold text-primary">
                        RD$ {order.total.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.items.reduce((s, i) => s + i.quantity, 0)} items
                      </p>
                    </div>
                  </div>

                  <div className="mb-4 space-y-1.5">
                    {order.items.map((item) => (
                      <div key={item.cartId} className="flex justify-between text-sm">
                        <span>
                          {item.quantity}x {item.name}
                          {item.variant && <span className="text-muted-foreground"> ({item.variant})</span>}
                        </span>
                        <span className="font-medium">RD$ {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {order.customer?.notes && (
                    <p className="mb-3 rounded-lg bg-yellow-50 px-3 py-2 text-xs text-yellow-700">
                      📝 {order.customer.notes}
                    </p>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    {order.status !== "delivered" && order.status !== "cancelled" && (
                      <Button
                        size="sm"
                        className="rounded-full"
                        onClick={() => {
                          const next: Record<Order["status"], Order["status"]> = {
                            pending: "preparing",
                            preparing: "ready",
                            ready: "delivered",
                            delivered: "delivered",
                            cancelled: "cancelled",
                          };
                          updateStatus(order.id, next[order.status]);
                        }}
                      >
                        {order.status === "pending" && "Iniciar preparación"}
                        {order.status === "preparing" && "Marcar listo"}
                        {order.status === "ready" && "Entregar"}
                      </Button>
                    )}
                    <OrderReceipt order={order} />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-full text-muted-foreground hover:text-destructive"
                      onClick={() => deleteOrder(order.id)}
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
