import type { Capabilities } from "@/data/ports/capability/index.js";
import type { ItemRepository } from "@/data/ports/ItemRepository.js";
import { LocalItemRepository } from "./local/LocalItemRepository.js";

export type ItemRepositoryAdapterFactory = {
  name: string;
  make(capabilities: Pick<Capabilities, "keyValueStore">): ItemRepository;
};

export const itemRepositoryAdapterFactories: readonly ItemRepositoryAdapterFactory[] = [
  {
    name: "local-storage",
    make: (capabilities) => new LocalItemRepository(capabilities.keyValueStore),
  },
];

export function createDefaultItemRepository(
  capabilities: Pick<Capabilities, "keyValueStore">
): ItemRepository {
  const defaultFactory = itemRepositoryAdapterFactories[0];

  if (!defaultFactory) {
    throw new Error("No ItemRepository adapter factories are registered.");
  }

  return defaultFactory.make(capabilities);
}
