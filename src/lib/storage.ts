import { z } from "zod";
import type { MenuItem, Order, Table } from "@/types";

const menuItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number().optional(),
  variants: z.array(z.object({ name: z.string(), price: z.number() })).optional(),
  category: z.string(),
  image: z.string().optional(),
});

const orderSchema = z.object({
  id: z.string(),
  items: z.array(
    z.object({
      cartId: z.string(),
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      variant: z.string().optional(),
      price: z.number(),
      quantity: z.number(),
    })
  ),
  total: z.number(),
  createdAt: z.string(),
  status: z.enum(["pending", "preparing", "ready", "delivered"]),
  type: z.enum(["pickup", "delivery", "dine-in"]),
  tableId: z.string().optional(),
  tableNumber: z.number().optional(),
  customer: z
    .object({
      name: z.string(),
      phone: z.string(),
      address: z.string().optional(),
      notes: z.string().optional(),
    })
    .optional(),
});

const tableSchema = z.object({
  id: z.string(),
  number: z.number(),
  capacity: z.number(),
  status: z.enum(["free", "occupied"]),
});

const restaurantConfigSchema = z.object({
  name: z.string(),
  phone: z.string(),
  address: z.string(),
  logo: z.string().optional(),
  slogan: z.string().optional(),
});

export class StorageService {
  static get<T>(key: string, fallback: T, validator?: (data: unknown) => T | null): T {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      if (validator) {
        const result = validator(parsed);
        return result !== null ? result : fallback;
      }
      return parsed as T;
    } catch {
      return fallback;
    }
  }

  static set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new StorageEvent("storage", { key }));
  }

  static remove(key: string): void {
    localStorage.removeItem(key);
  }
}

export function validateMenuItems(data: unknown): MenuItem[] | null {
  try {
    const result = z.array(menuItemSchema).safeParse(data);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function validateOrders(data: unknown): Order[] | null {
  try {
    const result = z.array(orderSchema).safeParse(data);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function validateTables(data: unknown): Table[] | null {
  try {
    const result = z.array(tableSchema).safeParse(data);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function validateRestaurantConfig(data: unknown): import("@/hooks/useRestaurantConfig").RestaurantConfig | null {
  try {
    const result = restaurantConfigSchema.safeParse(data);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}
