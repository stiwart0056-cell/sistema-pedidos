import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Menu, ShoppingCart, X, MapPin, Phone, User, Home, MessageSquare, Tag, Check, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import type { CartItem, OrderType } from "@/types";
import { useTables } from "@/hooks/useTables";
import { useRestaurantConfig } from "@/hooks/useRestaurantConfig";
import { useCoupons } from "@/hooks/useCoupons";
import { useDeliveryZones } from "@/hooks/useDeliveryZones";

interface CartDrawerProps {
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
  onUpdateQuantity: (cartId: string, quantity: number) => void;
  onRemove: (cartId: string) => void;
  onClear: () => void;
  onConfirm: (options: {
    type: OrderType;
    tableId?: string;
    tableNumber?: number;
    customer?: { name: string; phone: string; address?: string; notes?: string };
    discount?: number;
    couponCode?: string;
    deliveryFee?: number;
    deliveryZoneId?: string;
  }) => void;
  defaultTableId?: string;
  defaultTableNumber?: number;
}

export function CartDrawer({
  items,
  totalPrice,
  totalItems,
  onUpdateQuantity,
  onRemove,
  onClear,
  onConfirm,
  defaultTableId,
  defaultTableNumber,
}: CartDrawerProps) {
  const { tables } = useTables();
  const { config } = useRestaurantConfig();
  const { validateCoupon, incrementUses } = useCoupons();
  const { getActiveZones } = useDeliveryZones();
  const [open, setOpen] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>(defaultTableId ? "dine-in" : "pickup");
  const [selectedTable, setSelectedTable] = useState(defaultTableId || "");
  const [selectedZone, setSelectedZone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [showMap, setShowMap] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);

  const activeZones = getActiveZones();
  const deliveryFee = selectedZone ? activeZones.find((z) => z.id === selectedZone)?.fee || 0 : 0;

  useEffect(() => {
    if (defaultTableId) {
      setOrderType("dine-in");
      setSelectedTable(defaultTableId);
    }
  }, [defaultTableId]);

  // Reset coupon when cart changes
  useEffect(() => {
    if (items.length === 0) {
      setAppliedCoupon(null);
      setCouponCode("");
      setSelectedZone("");
    }
  }, [items.length]);

  const freeTables = tables.filter((t) => t.status === "free");

  const subtotal = totalPrice;
  const discount = appliedCoupon?.discount || 0;
  const finalPrice = Math.max(0, subtotal - discount + deliveryFee);

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    const result = validateCoupon(couponCode.trim(), subtotal);
    if (result.valid) {
      setAppliedCoupon({ code: couponCode.trim(), discount: result.discount });
      toast.success(result.message);
    } else {
      toast.error(result.message);
      setAppliedCoupon(null);
    }
  };

  const buildWhatsAppUrl = () => {
    const lines = items.map(
      (i) =>
        `${i.quantity}x ${i.name}${i.variant ? ` (${i.variant})` : ""} - RD$ ${(
          i.price * i.quantity
        ).toLocaleString()}`
    );
    const table = tables.find((t) => t.id === selectedTable);
    const zone = activeZones.find((z) => z.id === selectedZone);
    const typeLabel =
      orderType === "delivery"
        ? "🛵 *Delivery*"
        : orderType === "dine-in"
        ? `🪑 *Mesa ${table?.number || defaultTableNumber}*`
        : "🏠 *Recoger en local*";
    const customerInfo =
      orderType === "delivery"
        ? `\n👤 *Cliente:* ${customerName}\n📞 *Tel:* ${customerPhone}\n📍 *Dirección:* ${customerAddress}`
        : "";
    const zoneText = zone ? `\n📍 *Zona:* ${zone.name} (+RD$ ${zone.fee.toLocaleString()})` : "";
    const notes = customerNotes ? `\n📝 *Nota:* ${customerNotes}` : "";
    const discountText = appliedCoupon
      ? `\n🎟️ *Descuento (${appliedCoupon.code}):* -RD$ ${appliedCoupon.discount.toLocaleString()}`
      : "";
    const text = encodeURIComponent(
      `🍞 *Pedido ${config.name}*\n${typeLabel}${customerInfo}${zoneText}${notes}\n\n${lines.join(
        "\n"
      )}${discountText}\n\n💰 *Total: RD$ ${finalPrice.toLocaleString()}*`
    );
    return `https://wa.me/${config.phone}?text=${text}`;
  };

  const handleConfirm = () => {
    const table = tables.find((t) => t.id === selectedTable);
    onConfirm({
      type: orderType,
      tableId: orderType === "dine-in" ? selectedTable : undefined,
      tableNumber: table?.number || defaultTableNumber,
      customer:
        orderType === "delivery"
          ? {
              name: customerName,
              phone: customerPhone,
              address: customerAddress,
              notes: customerNotes,
            }
          : undefined,
      discount: appliedCoupon?.discount,
      couponCode: appliedCoupon?.code,
      deliveryFee: orderType === "delivery" ? deliveryFee : undefined,
      deliveryZoneId: orderType === "delivery" ? selectedZone : undefined,
    });
    if (appliedCoupon) {
      incrementUses(appliedCoupon.code);
    }
    setOpen(false);
    setAppliedCoupon(null);
    setCouponCode("");
    setSelectedZone("");

    // Toast contextual según tipo de pedido
    if (orderType === "delivery") {
      toast.success("¡Pedido confirmado! Tu delivery está en camino.");
    } else if (orderType === "dine-in") {
      toast.success("¡Pedido confirmado! Pronto te lo llevamos a la mesa.");
    } else {
      toast.success("¡Pedido confirmado! Pasa a retirarlo cuando esté listo.");
    }
  };

  const canConfirm =
    items.length > 0 &&
    (orderType !== "dine-in" || selectedTable !== "") &&
    (orderType !== "delivery" || (customerName && customerPhone && customerAddress && selectedZone));

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-primary px-5 py-3 text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-105 active:scale-95">
          <ShoppingCart className="h-5 w-5" />
          <span className="font-display text-lg font-bold">
            RD$ {finalPrice.toLocaleString()}
          </span>
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white p-0 text-xs font-bold text-primary">
              {totalItems}
            </Badge>
          )}
        </button>
      </SheetTrigger>
      
      {/* SheetContent con altura completa y layout flex */}
      <SheetContent className="flex w-full flex-col h-full p-0 sm:max-w-md">
        {/* Header — siempre visible */}
        <SheetHeader className="space-y-2.5 px-6 py-4 shrink-0 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-display text-2xl text-primary">
              Tu Pedido
            </SheetTitle>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-fit text-xs text-muted-foreground hover:text-destructive"
              onClick={onClear}
            >
              Vaciar carrito
            </Button>
          )}
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground px-6">
            <Menu className="h-16 w-16 opacity-20" />
            <p className="text-lg font-medium">Tu carrito está vacío</p>
            <p className="text-sm">Agrega items del menú para comenzar</p>
          </div>
        ) : (
          <>
            {/* Contenido scrolleable — overflow-y-auto nativo funciona mejor en móviles */}
            <div className="flex-1 overflow-y-auto px-6 min-h-0">
              <div className="space-y-4 py-4">
                {/* Items */}
                {items.map((item) => (
                  <div
                    key={item.cartId}
                    className="flex items-start justify-between gap-3 rounded-xl bg-muted/50 p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-semibold text-foreground truncate">
                        {item.name}
                      </p>
                      {item.variant && (
                        <p className="text-xs text-muted-foreground">
                          {item.variant}
                        </p>
                      )}
                      <p className="mt-1 text-sm font-bold text-primary">
                        RD$ {item.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 rounded-full"
                        onClick={() => onUpdateQuantity(item.cartId, item.quantity - 1)}
                      >
                        -
                      </Button>
                      <span className="w-4 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 rounded-full"
                        onClick={() => onUpdateQuantity(item.cartId, item.quantity + 1)}
                      >
                        +
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full text-muted-foreground hover:text-destructive"
                        onClick={() => onRemove(item.cartId)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Coupon Section */}
                <div className="space-y-2 rounded-xl border bg-white p-4">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Tag className="h-4 w-4" /> Cupón de descuento
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ej: TOASTED20"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                      disabled={!!appliedCoupon}
                      className="uppercase"
                    />
                    {appliedCoupon ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAppliedCoupon(null);
                          setCouponCode("");
                        }}
                      >
                        Quitar
                      </Button>
                    ) : (
                      <Button size="sm" onClick={handleApplyCoupon}>
                        Aplicar
                      </Button>
                    )}
                  </div>
                  {appliedCoupon && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Check className="h-4 w-4" />
                      Cupón "{appliedCoupon.code}" aplicado: -RD$ {appliedCoupon.discount.toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Order Type Selector */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Tipo de pedido</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: "pickup", label: "Recoger", icon: Home },
                      { key: "delivery", label: "Delivery", icon: MapPin },
                      { key: "dine-in", label: "En mesa", icon: User },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => setOrderType(opt.key as OrderType)}
                        className={`flex flex-col items-center gap-1 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors ${
                          orderType === opt.key
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-white text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <opt.icon className="h-4 w-4" />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Delivery Zone Selector */}
                {orderType === "delivery" && activeZones.length > 0 && (
                  <div className="space-y-3 rounded-xl border bg-white p-4">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Truck className="h-4 w-4" /> Zona de delivery *
                    </Label>
                    <div className="space-y-2">
                      {activeZones.map((zone) => (
                        <button
                          key={zone.id}
                          onClick={() => setSelectedZone(zone.id)}
                          className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                            selectedZone === zone.id
                              ? "border-primary bg-primary/5 text-primary font-semibold"
                              : "border-border bg-white text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          <span>{zone.name}</span>
                          <span>+RD$ {zone.fee.toLocaleString()}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Delivery Form */}
                {orderType === "delivery" && (
                  <div className="space-y-3 rounded-xl border bg-white p-4">
                    <Label className="text-sm font-semibold">Datos de entrega</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground shrink-0" />
                        <Input
                          placeholder="Nombre completo *"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                        <Input
                          placeholder="Teléfono *"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                          <Input
                            placeholder="Dirección completa *"
                            value={customerAddress}
                            onChange={(e) => setCustomerAddress(e.target.value)}
                          />
                        </div>
                        {customerAddress && (
                          <div className="pt-1">
                            <button
                              onClick={() => setShowMap(!showMap)}
                              className="text-xs text-primary underline"
                            >
                              {showMap ? "Ocultar mapa" : "Ver en mapa"}
                            </button>
                            {showMap && (
                              <iframe
                                title="map"
                                className="mt-2 h-40 w-full rounded-lg border"
                                src={`https://maps.google.com/maps?q=${encodeURIComponent(
                                  customerAddress
                                )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Table Selector */}
                {orderType === "dine-in" && (
                  <div className="space-y-3 rounded-xl border bg-white p-4">
                    <Label className="text-sm font-semibold">
                      {defaultTableId ? "Mesa asignada" : "Selecciona tu mesa *"}
                    </Label>
                    <div className="grid grid-cols-4 gap-2">
                      {defaultTableId ? (
                        <button className="rounded-lg border border-primary bg-primary px-2 py-2 text-xs font-bold text-primary-foreground">
                          M{defaultTableNumber}
                        </button>
                      ) : freeTables.length === 0 ? (
                        <p className="col-span-4 text-xs text-muted-foreground">
                          No hay mesas disponibles. Pregunta al mesero.
                        </p>
                      ) : (
                        freeTables.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setSelectedTable(t.id)}
                            className={`rounded-lg border px-2 py-2 text-xs font-bold transition-colors ${
                              selectedTable === t.id
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-muted text-foreground hover:bg-muted/80"
                            }`}
                          >
                            M{t.number}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Nota especial</Label>
                  <Input
                    placeholder="Ej: sin cebolla, salsa aparte..."
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                  />
                </div>

                {/* Spacer para que el footer no tape contenido */}
                <div className="h-2" />
              </div>
            </div>

            {/* Footer — siempre visible al fondo, fuera del scroll */}
            <div className="shrink-0 bg-background/95 backdrop-blur px-6 pt-3 pb-6 border-t">
              <Separator className="mb-3" />

              <div className="space-y-1 mb-3">
                {deliveryFee > 0 && (
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Delivery</span>
                    <span>+RD$ {deliveryFee.toLocaleString()}</span>
                  </div>
                )}
                {appliedCoupon && (
                  <div className="flex items-center justify-between text-sm text-green-600">
                    <span>Descuento ({appliedCoupon.code})</span>
                    <span>-RD$ {appliedCoupon.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg font-semibold">Total</span>
                  <span className="font-display text-2xl font-bold text-primary">
                    RD$ {finalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full rounded-full py-6 font-display text-lg font-bold shadow-lg shadow-primary/20"
                  disabled={!canConfirm}
                  onClick={handleConfirm}
                >
                  Confirmar Pedido
                </Button>

                <a
                  href={buildWhatsAppUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex w-full items-center justify-center gap-2 rounded-full border border-green-500 bg-green-50 py-3 font-display font-bold text-green-600 transition-colors ${
                    canConfirm
                      ? "hover:bg-green-100"
                      : "opacity-50 cursor-not-allowed pointer-events-none"
                  }`}
                >
                  <MessageSquare className="h-5 w-5" />
                  Enviar por WhatsApp
                </a>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
