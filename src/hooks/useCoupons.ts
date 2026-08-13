import { useState, useEffect, useCallback } from "react";
import type { Coupon } from "@/types";

const STORAGE_KEY = "mr-toasted-coupons";

function loadLocal(): Coupon[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveLocal(coupons: Coupon[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(coupons));
}

export function useCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>(loadLocal);

  useEffect(() => {
    saveLocal(coupons);
  }, [coupons]);

  const addCoupon = useCallback((coupon: Omit<Coupon, "id" | "usesCount">) => {
    const newCoupon: Coupon = {
      ...coupon,
      id: `coupon-${Date.now()}`,
      usesCount: 0,
    };
    setCoupons((prev) => [...prev, newCoupon]);
  }, []);

  const updateCoupon = useCallback((id: string, changes: Partial<Coupon>) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...changes } : c))
    );
  }, []);

  const deleteCoupon = useCallback((id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const validateCoupon = useCallback(
    (code: string, orderTotal: number): { valid: boolean; discount: number; message?: string } => {
      const coupon = coupons.find(
        (c) => c.code.toLowerCase() === code.toLowerCase() && c.isActive
      );

      if (!coupon) {
        return { valid: false, discount: 0, message: "Cupón no válido" };
      }

      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        return { valid: false, discount: 0, message: "Cupón expirado" };
      }

      if (coupon.maxUses !== undefined && coupon.usesCount >= coupon.maxUses) {
        return { valid: false, discount: 0, message: "Cupón agotado" };
      }

      if (coupon.minOrderAmount !== undefined && orderTotal < coupon.minOrderAmount) {
        return {
          valid: false,
          discount: 0,
          message: `Mínimo RD$ ${coupon.minOrderAmount.toLocaleString()} para usar este cupón`,
        };
      }

      const discount =
        coupon.discountType === "percentage"
          ? Math.round(orderTotal * (coupon.discountValue / 100))
          : coupon.discountValue;

      return { valid: true, discount, message: `Descuento: RD$ ${discount.toLocaleString()}` };
    },
    [coupons]
  );

  const incrementUses = useCallback((code: string) => {
    setCoupons((prev) =>
      prev.map((c) =>
        c.code.toLowerCase() === code.toLowerCase()
          ? { ...c, usesCount: c.usesCount + 1 }
          : c
      )
    );
  }, []);

  return { coupons, addCoupon, updateCoupon, deleteCoupon, validateCoupon, incrementUses };
}
