import { beforeEach, describe, expect, it } from "vitest";
import { itemRepositoryAdapterFactories } from "@/data/adapters/index.js";
import type { ItemRepository } from "@/data/ports/ItemRepository.js";
import { createWebCapabilities } from "@/platform/web/adapters/index.js";

const adapters = itemRepositoryAdapterFactories.map((factory) => ({
  name: factory.name,
  make: () => factory.make(createWebCapabilities()),
})) satisfies { name: string; make: () => ItemRepository }[];

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
