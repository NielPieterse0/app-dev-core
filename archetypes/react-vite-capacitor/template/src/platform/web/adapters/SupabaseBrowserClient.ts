import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { KeyValueStore } from "@/data/ports/capability/KeyValueStore.js";
import { LocalStorageKeyValueStore } from "./LocalStorageKeyValueStore.js";
import { requireSupabaseEnv } from "./SupabaseBrowserEnv.js";

let supabaseClient: SupabaseClient | undefined;

type SupabaseEnv = {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_PUBLISHABLE_KEY: string;
};

export function createSupabaseStorage(keyValueStore: KeyValueStore) {
  return {
    getItem(key: string) {
      return keyValueStore.get(key);
    },
    setItem(key: string, value: string) {
      return keyValueStore.set(key, value);
    },
    removeItem(key: string) {
      return keyValueStore.remove(key);
    },
  };
}

export function createSupabaseBrowserClient(
  configuredEnv: SupabaseEnv,
  keyValueStore: KeyValueStore = new LocalStorageKeyValueStore()
) {
  return createClient(
    configuredEnv.VITE_SUPABASE_URL,
    configuredEnv.VITE_SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        flowType: "pkce",
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storage: createSupabaseStorage(keyValueStore),
      },
    }
  );
}

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createSupabaseBrowserClient(
      requireSupabaseEnv(import.meta.env as Record<string, string | undefined>)
    );
  }

  return supabaseClient;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, property, receiver) {
    const client = getSupabaseClient();
    const value = Reflect.get(client as object, property, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
