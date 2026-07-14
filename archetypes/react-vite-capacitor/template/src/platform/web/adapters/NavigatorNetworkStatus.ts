import type { NetworkStatus } from "@/data/ports/capability/NetworkStatus.js";

export class NavigatorNetworkStatus implements NetworkStatus {
  isOnline() {
    return window.navigator.onLine;
  }

  onChange(callback: (online: boolean) => void) {
    const onlineListener = () => callback(true);
    const offlineListener = () => callback(false);

    window.addEventListener("online", onlineListener);
    window.addEventListener("offline", offlineListener);

    return () => {
      window.removeEventListener("online", onlineListener);
      window.removeEventListener("offline", offlineListener);
    };
  }
}
