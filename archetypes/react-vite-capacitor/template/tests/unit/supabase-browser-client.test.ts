import { beforeEach, describe, expect, it, vi } from "vitest";
import type { KeyValueStore } from "@/data/ports/capability/KeyValueStore.js";
import {
  createSupabaseBrowserClient,
  createSupabaseStorage,
} from "@/platform/web/adapters/SupabaseBrowserClient.js";

const { createClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(() => ({ auth: {} })),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: createClientMock,
}));

function makeKeyValueStore(): KeyValueStore {
  return {
    get: vi.fn(async () => null),
    set: vi.fn(async () => undefined),
    remove: vi.fn(async () => undefined),
    clear: vi.fn(async () => undefined),
  };
}

describe("createSupabaseStorage", () => {
  it("routes persistence through the KeyValueStore port", async () => {
    const keyValueStore = makeKeyValueStore();
    const storage = createSupabaseStorage(keyValueStore);

    await storage.getItem("session");
    await storage.setItem("session", "value");
    await storage.removeItem("session");

    expect(keyValueStore.get).toHaveBeenCalledWith("session");
    expect(keyValueStore.set).toHaveBeenCalledWith("session", "value");
    expect(keyValueStore.remove).toHaveBeenCalledWith("session");
  });
});

describe("createSupabaseBrowserClient", () => {
  beforeEach(() => {
    createClientMock.mockClear();
  });

  it("uses PKCE auth without URL session detection and supplies custom storage", () => {
    const keyValueStore = makeKeyValueStore();

    createSupabaseBrowserClient(
      {
        VITE_SUPABASE_URL: "https://example.supabase.co",
        VITE_SUPABASE_PUBLISHABLE_KEY: "publishable-key",
      },
      keyValueStore
    );

    expect(createClientMock).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "publishable-key",
      expect.objectContaining({
        auth: expect.objectContaining({
          flowType: "pkce",
          detectSessionInUrl: false,
          storage: expect.objectContaining({
            getItem: expect.any(Function),
            setItem: expect.any(Function),
            removeItem: expect.any(Function),
          }),
        }),
      })
    );
  });
});
