import type { Capabilities } from "@/data/ports/capability/index.js";
import { AnchorFileExporter } from "./AnchorFileExporter.js";
import { DomAppLifecycle } from "./DomAppLifecycle.js";
import { HistoryDeepLink } from "./HistoryDeepLink.js";
import { LocalStorageKeyValueStore } from "./LocalStorageKeyValueStore.js";
import { NavigatorNetworkStatus } from "./NavigatorNetworkStatus.js";
import { WindowLinkOpener } from "./WindowLinkOpener.js";

type CapabilityAdapterFactoryMap = {
  [K in keyof Capabilities]: ReadonlyArray<{
    name: string;
    make(): Capabilities[K];
  }>;
};

export const capabilityAdapterFactories: CapabilityAdapterFactoryMap = {
  appLifecycle: [{ name: "dom-visibility", make: () => new DomAppLifecycle() }],
  deepLink: [{ name: "history-api", make: () => new HistoryDeepLink() }],
  fileExporter: [{ name: "anchor-download", make: () => new AnchorFileExporter() }],
  keyValueStore: [{ name: "local-storage", make: () => new LocalStorageKeyValueStore() }],
  linkOpener: [{ name: "window-open", make: () => new WindowLinkOpener() }],
  networkStatus: [{ name: "navigator-online", make: () => new NavigatorNetworkStatus() }],
};

function requiredFactory<K extends keyof Capabilities>(port: K) {
  const factory = capabilityAdapterFactories[port][0];

  if (!factory) {
    throw new Error(`No adapter factories are registered for capability port "${port}".`);
  }

  return factory;
}

export function createWebCapabilities(): Capabilities {
  return {
    appLifecycle: requiredFactory("appLifecycle").make(),
    deepLink: requiredFactory("deepLink").make(),
    fileExporter: requiredFactory("fileExporter").make(),
    keyValueStore: requiredFactory("keyValueStore").make(),
    linkOpener: requiredFactory("linkOpener").make(),
    networkStatus: requiredFactory("networkStatus").make(),
  };
}

export const webCapabilities: Capabilities = createWebCapabilities();
