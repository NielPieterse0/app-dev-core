import type { Item } from "@/domain/Item.js";

export interface ItemRepository {
  list(): Promise<Item[]>;
  add(item: Item): Promise<void>;
  remove(id: string): Promise<void>;
}
