import { Clock, ChefHat, CheckCircle, Package, Home, MapPin, User } from "lucide-react";
import type { OrderStatus } from "@/types";

export const RESTAURANT = {
  name: "Mr. Toasted",
  phone: "18091234567",
  address: "Av. Principal #123, Santo Domingo, RD",
} as const;

export const STORAGE_KEYS = {
  cart: "mr-toasted-cart",
  orders: "mr-toasted-orders",
  menu: "mr-toasted-menu-v2",
  tables: "mr-toasted-tables",
  restaurant: "mr-toasted-config",
  categories: "mr-toasted-categories",
} as const;

export const statusConfig: Record<
  OrderStatus,
  {
    label: string;
    color: string;
    next: OrderStatus | null;
    icon: typeof Clock;
  }
> = {
  pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-700", next: "preparing", icon: Clock },
  preparing: { label: "Preparando", color: "bg-blue-100 text-blue-700", next: "ready", icon: ChefHat },
  ready: { label: "Listo", color: "bg-green-100 text-green-700", next: "delivered", icon: CheckCircle },
  delivered: { label: "Entregado", color: "bg-gray-100 text-gray-700", next: null, icon: Package },
};

export function getOrderTypeIcon(type: string) {
  if (type === "delivery") return MapPin;
  if (type === "dine-in") return User;
  return Home;
}

export function getOrderTypeLabel(type: string) {
  if (type === "delivery") return "Delivery";
  if (type === "dine-in") return "En mesa";
  return "Recoger";
}
