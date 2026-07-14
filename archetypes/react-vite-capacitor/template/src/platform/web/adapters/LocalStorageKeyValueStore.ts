import type { KeyValueStore } from "@/data/ports/capability/KeyValueStore.js";

export class LocalStorageKeyValueStore implements KeyValueStore {
  async get(key: string) {
    return window.localStorage.getItem(key);
  }

  async set(key: string, value: string) {
    window.localStorage.setItem(key, value);
  }

  async remove(key: string) {
    window.localStorage.removeItem(key);
  }

  async clear() {
    window.localStorage.clear();
  }
}
