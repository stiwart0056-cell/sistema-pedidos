import { useState, useEffect, useCallback } from "react";
import type { DeliveryZone } from "@/types";

const STORAGE_KEY = "mr-toasted-delivery-zones";

const DEFAULT_ZONES: DeliveryZone[] = [
  { id: "zone-1", name: "Zona Centro", fee: 50, isActive: true },
  { id: "zone-2", name: "Zona Norte", fee: 80, isActive: true },
  { id: "zone-3", name: "Zona Este", fee: 100, isActive: true },
  { id: "zone-4", name: "Zona Oeste", fee: 100, isActive: true },
];

function loadLocal(): DeliveryZone[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_ZONES;
}

function saveLocal(zones: DeliveryZone[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(zones));
}

export function useDeliveryZones() {
  const [zones, setZones] = useState<DeliveryZone[]>(loadLocal);

  useEffect(() => {
    saveLocal(zones);
  }, [zones]);

  const addZone = useCallback((zone: Omit<DeliveryZone, "id">) => {
    const newZone: DeliveryZone = {
      ...zone,
      id: `zone-${Date.now()}`,
    };
    setZones((prev) => [...prev, newZone]);
  }, []);

  const updateZone = useCallback((id: string, changes: Partial<DeliveryZone>) => {
    setZones((prev) =>
      prev.map((z) => (z.id === id ? { ...z, ...changes } : z))
    );
  }, []);

  const deleteZone = useCallback((id: string) => {
    setZones((prev) => prev.filter((z) => z.id !== id));
  }, []);

  const getActiveZones = useCallback(() => {
    return zones.filter((z) => z.isActive);
  }, [zones]);

  return { zones, addZone, updateZone, deleteZone, getActiveZones };
}
