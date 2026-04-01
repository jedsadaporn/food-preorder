import { createClient } from "@supabase/supabase-js";

// ใช้ Service Role Key สำหรับ API Routes (bypass RLS)
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
