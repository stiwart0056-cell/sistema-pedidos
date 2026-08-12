import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

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

const CONFIG_ID = "00000000-0000-0000-0000-000000000001";

function mapRowToConfig(
  row: Database["public"]["Tables"]["restaurant_config"]["Row"] | null
): RestaurantConfig {
  if (!row) return DEFAULT_CONFIG;
  return {
    name: row.name || DEFAULT_CONFIG.name,
    phone: row.phone || DEFAULT_CONFIG.phone,
    address: row.address || DEFAULT_CONFIG.address,
    logo: row.logo || undefined,
    slogan: row.slogan || undefined,
  };
}

export function useRestaurantConfig() {
  const [config, setConfig] = useState<RestaurantConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  // Load initial config
  useEffect(() => {
    let mounted = true;
    supabase
      .from("restaurant_config")
      .select("*")
      .eq("id", CONFIG_ID)
      .single()
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          console.error("[useRestaurantConfig] load error:", error);
          // fallback to localStorage
          const raw = localStorage.getItem("mr-toasted-restaurant");
          if (raw) {
            try {
              setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(raw) });
            } catch {}
          }
        } else {
          setConfig(mapRowToConfig(data));
        }
        setLoading(false);
      });

    // Realtime subscription
    const channel = supabase
      .channel("restaurant_config_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "restaurant_config",
          filter: `id=eq.${CONFIG_ID}`,
        },
        (payload) => {
          if (payload.new) {
            setConfig(mapRowToConfig(payload.new as any));
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const updateConfig = useCallback(async (changes: Partial<RestaurantConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...changes };
      // Optimistic update
      return updated;
    });

    const { error } = await supabase
      .from("restaurant_config")
      .upsert({
        id: CONFIG_ID,
        ...changes,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error("[useRestaurantConfig] update error:", error);
      // Revert: read from server again
      const { data } = await supabase
        .from("restaurant_config")
        .select("*")
        .eq("id", CONFIG_ID)
        .single();
      setConfig(mapRowToConfig(data));
    }
  }, []);

  return { config, updateConfig, loading };
}
