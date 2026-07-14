import type { Item } from "@/domain/Item.js";
import type { ItemRepository } from "@/data/ports/ItemRepository.js";
import type { KeyValueStore } from "@/data/ports/capability/KeyValueStore.js";

const storageKey = "items:v1";

export class LocalItemRepository implements ItemRepository {
  constructor(private readonly keyValueStore: KeyValueStore) {}

  async list(): Promise<Item[]> {
    const rawItems = await this.keyValueStore.get(storageKey);
    return rawItems ? (JSON.parse(rawItems) as Item[]) : [];
  }

  async add(item: Item): Promise<void> {
    const items = await this.list();
    await this.keyValueStore.set(storageKey, JSON.stringify([...items, item]));
  }

  async remove(id: string): Promise<void> {
    const items = await this.list();
    await this.keyValueStore.set(
      storageKey,
      JSON.stringify(items.filter((item) => item.id !== id))
    );
  }
}
