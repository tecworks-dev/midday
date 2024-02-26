import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { Database } from "../types";

type CreateClientOptions = {
  admin?: boolean;
};

export const createClient = (options: CreateClientOptions) => {
  const cookieStore = cookies();

  const key = options?.admin
    ? process.env.SUPABASE_SERVICE_KEY!
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
      global: {
        headers: {
          // Pass user agent from browser
          "user-agent": headers().get("user-agent") as string,
        },
      },
    }
  );
};
