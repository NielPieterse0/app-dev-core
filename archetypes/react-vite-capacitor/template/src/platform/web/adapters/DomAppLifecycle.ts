import type { AppLifecycle } from "@/data/ports/capability/AppLifecycle.js";

export class DomAppLifecycle implements AppLifecycle {
  onResume(callback: () => void) {
    const listener = () => {
      if (document.visibilityState === "visible") {
        callback();
      }
    };

    document.addEventListener("visibilitychange", listener);
    return () => document.removeEventListener("visibilitychange", listener);
  }

  onPause(callback: () => void) {
    const listener = () => {
      if (document.visibilityState === "hidden") {
        callback();
      }
    };

    document.addEventListener("visibilitychange", listener);
    return () => document.removeEventListener("visibilitychange", listener);
  }
}
