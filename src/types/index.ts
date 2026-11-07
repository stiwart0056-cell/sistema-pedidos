export interface MenuVariant {
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price?: number;
  variants?: MenuVariant[];
  category: string;
  image?: string;
  stock?: number;
  isAvailable?: boolean;
}

export interface CartItem {
  cartId: string;
  id: string;
  name: string;
  description?: string;
  variant?: string;
  price: number;
  quantity: number;
}

export type OrderType = "pickup" | "delivery" | "dine-in";

export interface CustomerInfo {
  name: string;
  phone: string;
  address?: string;
  notes?: string;
}

export type OrderStatus = "pending" | "preparing" | "ready" | "delivered" | "cancelled";

export type PaymentMethod = "cash" | "card" | "transfer";

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  discount?: number;
  couponCode?: string;
  deliveryFee?: number;
  deliveryZoneId?: string;
  finalTotal: number;
  createdAt: string;
  status: OrderStatus;
  type: OrderType;
  paymentMethod?: PaymentMethod;
  tableId?: string;
  tableNumber?: number;
  customer?: CustomerInfo;
}

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: "free" | "occupied";
}

export interface Coupon {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount?: number;
  maxUses?: number;
  usesCount: number;
  expiresAt?: string;
  isActive: boolean;
}

export interface DeliveryZone {
  id: string;
  name: string;
  fee: number;
  minOrderAmount?: number;
  isActive: boolean;
}

export interface CashClosing {
  id: string;
  /** Fecha del cierre (YYYY-MM-DD) */
  closingDate: string;
  /** Efectivo con el que se abrió la caja */
  openingCash: number;
  /** Ventas en efectivo del día */
  cashSales: number;
  /** Ventas con tarjeta del día */
  cardSales: number;
  /** Ventas por transferencia del día */
  transferSales: number;
  /** Total vendido (todos los métodos) */
  totalSales: number;
  ordersCount: number;
  /** Lo que DEBE haber en caja: apertura + ventas en efectivo */
  expectedCash: number;
  /** Lo que se contó físicamente */
  countedCash: number;
  /** countedCash - expectedCash */
  difference: number;
  notes?: string;
  createdAt: string;
}
