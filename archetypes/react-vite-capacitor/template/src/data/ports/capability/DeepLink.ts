export interface DeepLink {
  getCurrentPath(): string;
  navigate(path: string): Promise<void>;
  onChange(callback: (path: string) => void): () => void;
}
