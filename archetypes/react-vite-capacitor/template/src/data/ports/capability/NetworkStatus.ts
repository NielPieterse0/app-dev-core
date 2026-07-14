export interface NetworkStatus {
  isOnline(): boolean;
  onChange(callback: (online: boolean) => void): () => void;
}
