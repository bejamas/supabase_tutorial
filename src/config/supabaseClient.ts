import { createClient } from "@supabase/supabase-js";

console.log(import.meta);

const supabaseClient = createClient(import.meta.env.VITE_SUPABASE_URL!, import.meta.env.VITE_SUPABASE_ANON_KEY!);

export default supabaseClient;