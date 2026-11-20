import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_KEY;

if (!url || !key) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_KEY. Copy .env.example to .env.local and fill it in.",
  );
}

const supabase = createClient(url, key, {
  auth: { persistSession: false },
});

export default supabase;
