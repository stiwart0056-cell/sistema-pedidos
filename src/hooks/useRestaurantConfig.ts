import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface RestaurantConfig {
  name: string;
  phone: string;
  address: string;
  logo?: string;
  slogan?: string;
  rnc?: string;              // Registro Nacional de Contribuyentes
  ncfType?: string;          // 01=Crédito Fiscal, 02=Consumidor Final, etc.
  ncfPrefix?: string;        // Prefijo del NCF (B01, B02, etc.)
  ncfNext?: number;          // Siguiente número de NCF
  taxRate?: number;          // ITBIS (default 0.18)
  showTax?: boolean;         // Mostrar ITBIS separado en ticket
  printerWidth?: 58 | 80;    // Ancho de impresora térmica en mm
}

const DEFAULT_CONFIG: RestaurantConfig = {
  name: "Mr. Toasted",
  phone: "18091234567",
  address: "Av. Principal #123, Santo Domingo, RD",
  slogan: "¡El mejor sabor de la ciudad!",
  taxRate: 0.18,
  showTax: true,
  printerWidth: 58,
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
          const mapped: RestaurantConfig = {
            name: data.name || DEFAULT_CONFIG.name,
            phone: data.phone || DEFAULT_CONFIG.phone,
            address: data.address || DEFAULT_CONFIG.address,
            logo: data.logo || undefined,
            slogan: data.slogan || undefined,
            rnc: data.rnc || undefined,
            ncfType: data.ncf_type || undefined,
            ncfPrefix: data.ncf_prefix || undefined,
            ncfNext: data.ncf_next || undefined,
            taxRate: data.tax_rate ?? DEFAULT_CONFIG.taxRate,
            showTax: data.show_tax ?? DEFAULT_CONFIG.showTax,
            printerWidth: data.printer_width ?? DEFAULT_CONFIG.printerWidth,
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
        .upsert({
          id: CONFIG_ID,
          name: updated.name,
          phone: updated.phone,
          address: updated.address,
          logo: updated.logo,
          slogan: updated.slogan,
          rnc: updated.rnc,
          ncf_type: updated.ncfType,
          ncf_prefix: updated.ncfPrefix,
          ncf_next: updated.ncfNext,
          tax_rate: updated.taxRate,
          show_tax: updated.showTax,
          printer_width: updated.printerWidth,
          updated_at: new Date().toISOString(),
        });
    } catch (e) {
      console.error("[useRestaurantConfig] save failed:", e);
    }
  }, [config]);

  const getNextNCF = useCallback(async (): Promise<string | null> => {
    if (!config.ncfPrefix || config.ncfNext === undefined) return null;
    const next = config.ncfNext;
    const ncf = `${config.ncfPrefix}${String(next).padStart(8, "0")}`;
    await updateConfig({ ncfNext: next + 1 });
    return ncf;
  }, [config, updateConfig]);

  return { config, updateConfig, getNextNCF };
}
