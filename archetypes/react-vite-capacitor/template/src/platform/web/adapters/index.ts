import type { Capabilities } from "@/data/ports/capability/index.js";
import { AnchorFileExporter } from "./AnchorFileExporter.js";
import { DomAppLifecycle } from "./DomAppLifecycle.js";
import { HistoryDeepLink } from "./HistoryDeepLink.js";
import { LocalStorageKeyValueStore } from "./LocalStorageKeyValueStore.js";
import { NavigatorNetworkStatus } from "./NavigatorNetworkStatus.js";
import { WindowLinkOpener } from "./WindowLinkOpener.js";

export const webCapabilities: Capabilities = {
  appLifecycle: new DomAppLifecycle(),
  deepLink: new HistoryDeepLink(),
  fileExporter: new AnchorFileExporter(),
  keyValueStore: new LocalStorageKeyValueStore(),
  linkOpener: new WindowLinkOpener(),
  networkStatus: new NavigatorNetworkStatus(),
};
