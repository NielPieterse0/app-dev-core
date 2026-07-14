import type { AppLifecycle } from "./AppLifecycle.js";
import type { DeepLink } from "./DeepLink.js";
import type { FileExporter } from "./FileExporter.js";
import type { KeyValueStore } from "./KeyValueStore.js";
import type { LinkOpener } from "./LinkOpener.js";
import type { NetworkStatus } from "./NetworkStatus.js";

export type { AppLifecycle } from "./AppLifecycle.js";
export type { DeepLink } from "./DeepLink.js";
export type { FileExporter, FileExportPayload } from "./FileExporter.js";
export type { KeyValueStore } from "./KeyValueStore.js";
export type { LinkOpener } from "./LinkOpener.js";
export type { NetworkStatus } from "./NetworkStatus.js";

export interface Capabilities {
  appLifecycle: AppLifecycle;
  deepLink: DeepLink;
  fileExporter: FileExporter;
  keyValueStore: KeyValueStore;
  linkOpener: LinkOpener;
  networkStatus: NetworkStatus;
}
