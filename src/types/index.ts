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
