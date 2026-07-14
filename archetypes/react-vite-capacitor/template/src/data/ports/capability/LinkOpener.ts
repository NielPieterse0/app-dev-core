export interface LinkOpener {
  open(url: string, target?: "_blank" | "_self"): Promise<void>;
}
