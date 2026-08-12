import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://xkohsrjgvfkkuuwelnll.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Y-k4Hk5KB29m1BSCNw-owQ_eOyHycL4";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
