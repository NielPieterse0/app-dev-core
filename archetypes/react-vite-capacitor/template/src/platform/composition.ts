import type { Capabilities } from "../data/ports/capability/index.js";
import { LocalItemRepository } from "../data/adapters/local/LocalItemRepository.js";
import type { ItemRepository } from "../data/ports/ItemRepository.js";

async function isNativePlatform(): Promise<boolean> {
  try {
    const { Capacitor } = await import("@capacitor/core");
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

let cachedCapabilities: Capabilities | null = null;

export async function getCapabilities(): Promise<Capabilities> {
  if (cachedCapabilities) {
    return cachedCapabilities;
  }

  if (await isNativePlatform()) {
    throw new Error(
      "Native platform detected but src/platform/native/adapters/ is still an empty slot."
    );
  }

  const { webCapabilities } = await import("./web/adapters/index.js");
  cachedCapabilities = webCapabilities;
  return cachedCapabilities;
}

export async function createExampleItemRepository(): Promise<ItemRepository> {
  const capabilities = await getCapabilities();
  return new LocalItemRepository(capabilities.keyValueStore);
}
