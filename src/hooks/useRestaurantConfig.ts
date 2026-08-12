import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

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

const STORAGE_KEY = "mr-toasted-restaurant";
const CONFIG_ID = "00000000-0000-0000-0000-000000000001";

function loadLocal(): RestaurantConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_CONFIG;
}

function saveLocal(cfg: RestaurantConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
}

export function useRestaurantConfig() {
  const [config, setConfig] = useState<RestaurantConfig>(loadLocal);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from("restaurant_config")
          .select("*")
          .eq("id", CONFIG_ID)
          .single();
        if (data) {
          const mapped = {
            name: data.name || DEFAULT_CONFIG.name,
            phone: data.phone || DEFAULT_CONFIG.phone,
            address: data.address || DEFAULT_CONFIG.address,
            logo: data.logo || undefined,
            slogan: data.slogan || undefined,
          };
          setConfig(mapped);
          saveLocal(mapped);
        }
      } catch (e) {
        console.error("[useRestaurantConfig] load failed:", e);
      }
    })();
  }, []);

  const updateConfig = useCallback(async (changes: Partial<RestaurantConfig>) => {
    const updated = { ...config, ...changes };
    setConfig(updated);
    saveLocal(updated);

    try {
      await supabase
        .from("restaurant_config")
        .upsert({ id: CONFIG_ID, ...changes, updated_at: new Date().toISOString() });
    } catch (e) {
      console.error("[useRestaurantConfig] save failed:", e);
    }
  }, [config]);

  return { config, updateConfig };
}
