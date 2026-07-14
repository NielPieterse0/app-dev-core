import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AppLifecycle } from "@/data/ports/capability/AppLifecycle.js";
import type { DeepLink } from "@/data/ports/capability/DeepLink.js";
import type {
  FileExporter,
  FileExportPayload,
} from "@/data/ports/capability/FileExporter.js";
import type { KeyValueStore } from "@/data/ports/capability/KeyValueStore.js";
import type { LinkOpener } from "@/data/ports/capability/LinkOpener.js";
import type { NetworkStatus } from "@/data/ports/capability/NetworkStatus.js";
import { capabilityAdapterFactories } from "@/platform/web/adapters/index.js";

describe.each<{ name: string; make: () => KeyValueStore }>([
  ...capabilityAdapterFactories.keyValueStore,
])("KeyValueStore contract - %s", ({ make }) => {
  let keyValueStore: KeyValueStore;

  beforeEach(() => {
    localStorage.clear();
    keyValueStore = make();
  });

  it("round-trips a value", async () => {
    await keyValueStore.set("k", "v");
    expect(await keyValueStore.get("k")).toBe("v");
  });

  it("returns null for a missing key", async () => {
    expect(await keyValueStore.get("missing")).toBeNull();
  });
});

describe.each<{ name: string; make: () => NetworkStatus }>([
  ...capabilityAdapterFactories.networkStatus,
])("NetworkStatus contract - %s", ({ make }) => {
  it("reports a boolean online value", () => {
    expect(typeof make().isOnline()).toBe("boolean");
  });

  it("returns an unsubscribe function", () => {
    const unsubscribe = make().onChange(() => {});
    expect(typeof unsubscribe).toBe("function");
    unsubscribe();
  });
});

describe.each<{ name: string; make: () => FileExporter }>([
  ...capabilityAdapterFactories.fileExporter,
])("FileExporter contract - %s", ({ make }) => {
  it("exports without throwing", async () => {
    const originalCreateObjectUrl = URL.createObjectURL;
    const originalRevokeObjectUrl = URL.revokeObjectURL;
    URL.createObjectURL = vi.fn(() => "blob:test-url");
    URL.revokeObjectURL = vi.fn(() => {});
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    const payload: FileExportPayload = {
      content: "hello",
      contentType: "text/plain",
      fileName: "test.txt",
    };

    await expect(make().exportFile(payload)).resolves.toBeUndefined();

    click.mockRestore();
    URL.createObjectURL = originalCreateObjectUrl;
    URL.revokeObjectURL = originalRevokeObjectUrl;
  });
});

describe.each<{ name: string; make: () => AppLifecycle }>([
  ...capabilityAdapterFactories.appLifecycle,
])("AppLifecycle contract - %s", ({ make }) => {
  it("returns unsubscribe functions", () => {
    const lifecycle = make();
    const onResume = lifecycle.onResume(() => {});
    const onPause = lifecycle.onPause(() => {});

    expect(typeof onResume).toBe("function");
    expect(typeof onPause).toBe("function");

    onResume();
    onPause();
  });
});

describe.each<{ name: string; make: () => DeepLink }>([
  ...capabilityAdapterFactories.deepLink,
])("DeepLink contract - %s", ({ make }) => {
  it("reads the current path", () => {
    expect(make().getCurrentPath()).toContain("/");
  });

  it("navigates and notifies listeners", async () => {
    const deepLink = make();
    const callback = vi.fn();
    const unsubscribe = deepLink.onChange(callback);

    await deepLink.navigate("/items");

    expect(deepLink.getCurrentPath()).toContain("/items");
    expect(callback).toHaveBeenCalled();

    unsubscribe();
  });
});

describe.each<{ name: string; make: () => LinkOpener }>([
  ...capabilityAdapterFactories.linkOpener,
])("LinkOpener contract - %s", ({ make }) => {
  it("opens a URL", async () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);

    await expect(make().open("https://example.com")).resolves.toBeUndefined();

    expect(open).toHaveBeenCalledWith(
      "https://example.com",
      "_blank",
      "noopener,noreferrer"
    );

    open.mockRestore();
  });
});
