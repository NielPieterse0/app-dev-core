import type { LinkOpener } from "@/data/ports/capability/LinkOpener.js";

export class WindowLinkOpener implements LinkOpener {
  async open(url: string, target: "_blank" | "_self" = "_blank") {
    window.open(url, target, target === "_blank" ? "noopener,noreferrer" : undefined);
  }
}
