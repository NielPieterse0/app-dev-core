export interface AppLifecycle {
  onResume(callback: () => void): () => void;
  onPause(callback: () => void): () => void;
}
