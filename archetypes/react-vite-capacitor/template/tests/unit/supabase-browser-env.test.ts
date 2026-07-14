import { describe, expect, it } from "vitest";
import {
  parseSupabaseEnv,
  requireSupabaseEnv,
} from "@/platform/web/adapters/SupabaseBrowserEnv.js";

describe("parseSupabaseEnv", () => {
  it("returns parsed env for a valid URL and publishable key", () => {
    const env = parseSupabaseEnv({
      VITE_SUPABASE_URL: "https://example.supabase.co",
      VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example_key",
    });

    expect(env.VITE_SUPABASE_URL).toBe("https://example.supabase.co");
    expect(env.VITE_SUPABASE_PUBLISHABLE_KEY).toBe("sb_publishable_example_key");
  });
});

describe("requireSupabaseEnv", () => {
  it("throws a readable error when the URL is missing", () => {
    expect(() =>
      requireSupabaseEnv({
        VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example_key",
      })
    ).toThrow(/VITE_SUPABASE_URL/);
  });

  it("throws a readable error when the publishable key is missing", () => {
    expect(() =>
      requireSupabaseEnv({
        VITE_SUPABASE_URL: "https://example.supabase.co",
      })
    ).toThrow(/VITE_SUPABASE_PUBLISHABLE_KEY/);
  });

  it("rejects backend-only key shapes in browser env", () => {
    expect(() =>
      requireSupabaseEnv({
        VITE_SUPABASE_URL: "https://example.supabase.co",
        VITE_SUPABASE_PUBLISHABLE_KEY: "sb_secret_backend_only_key",
      })
    ).toThrow(/publishable key/i);
  });
});
