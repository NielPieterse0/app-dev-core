import type { DeepLink } from "@/data/ports/capability/DeepLink.js";

export class HistoryDeepLink implements DeepLink {
  getCurrentPath() {
    return `${window.location.pathname}${window.location.search}${window.location.hash}`;
  }

  async navigate(path: string) {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  onChange(callback: (path: string) => void) {
    const listener = () => callback(this.getCurrentPath());
    window.addEventListener("popstate", listener);
    return () => window.removeEventListener("popstate", listener);
  }
}
