import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // Passamos as variáveis de ambiente para criar o cliente
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
