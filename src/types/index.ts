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

export type OrderStatus = "pending" | "preparing" | "ready" | "delivered";

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
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
