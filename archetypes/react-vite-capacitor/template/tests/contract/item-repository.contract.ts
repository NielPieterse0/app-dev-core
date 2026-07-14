import { beforeEach, describe, expect, it } from "vitest";
import { LocalItemRepository } from "@/data/adapters/local/LocalItemRepository.js";
import type { ItemRepository } from "@/data/ports/ItemRepository.js";
import { LocalStorageKeyValueStore } from "@/platform/web/adapters/LocalStorageKeyValueStore.js";

const adapters: { name: string; make: () => ItemRepository }[] = [
  {
    name: "local",
    make: () => new LocalItemRepository(new LocalStorageKeyValueStore()),
  },
];

describe.each(adapters)("ItemRepository contract - %s", ({ make }) => {
  let repository: ItemRepository;

  beforeEach(() => {
    localStorage.clear();
    repository = make();
  });

  it("starts empty", async () => {
    expect(await repository.list()).toEqual([]);
  });

  it("adds and lists an item", async () => {
    await repository.add({
      id: "1",
      title: "First",
      createdAt: "2026-01-01T00:00:00Z",
    });

    expect(await repository.list()).toHaveLength(1);
  });

  it("removes an item", async () => {
    await repository.add({
      id: "1",
      title: "First",
      createdAt: "2026-01-01T00:00:00Z",
    });

    await repository.remove("1");

    expect(await repository.list()).toEqual([]);
  });
});
