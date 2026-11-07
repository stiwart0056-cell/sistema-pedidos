import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    "[Supabase] Faltan variables de entorno. " +
    "Crea un archivo .env.local con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY"
  );
}

// Si faltan las variables, usamos un placeholder para NO romper la app en blanco.
// La app arranca en modo offline (datos locales) hasta que se configuren.
export const supabase = createClient(
  SUPABASE_URL || "https://placeholder.supabase.co",
  SUPABASE_ANON_KEY || "placeholder-anon-key"
);
