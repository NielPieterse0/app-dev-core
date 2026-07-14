import { useEffect, useState } from "react";
import { validateItem, type Item } from "@/domain/Item.js";
import type { ItemRepository } from "@/data/ports/ItemRepository.js";

export type ItemsRepository = ItemRepository;

export function useItems(repository: ItemsRepository) {
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void repository.list().then((loadedItems) => {
      if (active) {
        setItems(loadedItems);
      }
    });

    return () => {
      active = false;
    };
  }, [repository]);

  async function add(title: string) {
    const problem = validateItem({ title });
    if (problem) {
      setError(problem);
      return;
    }

    const item: Item = {
      id: globalThis.crypto.randomUUID(),
      title,
      createdAt: new Date().toISOString(),
    };

    await repository.add(item);
    setItems(await repository.list());
    setError(null);
  }

  async function remove(id: string) {
    await repository.remove(id);
    setItems(await repository.list());
  }

  return { items, error, add, remove };
}
