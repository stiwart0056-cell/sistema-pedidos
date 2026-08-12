import { useState, useEffect, useCallback } from "react";
import { StorageService } from "@/lib/storage";
import { validateRestaurantConfig } from "@/lib/storage";
import { STORAGE_KEYS } from "@/lib/constants";

export interface RestaurantConfig {
  name: string;
  phone: string;
  address: string;
  logo?: string;
  slogan?: string;
}

const DEFAULT_CONFIG: RestaurantConfig = {
  name: "Mr. Toasted",
  phone: "18091234567",
  address: "Av. Principal #123, Santo Domingo, RD",
  slogan: "¡El mejor sabor de la ciudad!",
};

function loadConfig(): RestaurantConfig {
  return StorageService.get<RestaurantConfig>(
    STORAGE_KEYS.restaurant,
    DEFAULT_CONFIG,
    validateRestaurantConfig
  );
}

export function useRestaurantConfig() {
  const [config, setConfig] = useState<RestaurantConfig>(loadConfig);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.restaurant) setConfig(loadConfig());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const updateConfig = useCallback((changes: Partial<RestaurantConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...changes };
      StorageService.set(STORAGE_KEYS.restaurant, updated);
      return updated;
    });
  }, []);

  return { config, updateConfig };
}
