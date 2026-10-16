'use client';

type VideoPauseCallback = () => void;

class VideoPlaybackManager {
  private activeId: string | null = null;
  private listeners = new Map<string, VideoPauseCallback>();

  register(id: string, pauseFn: VideoPauseCallback): () => void {
    this.listeners.set(id, pauseFn);
    return () => {
      this.listeners.delete(id);
      if (this.activeId === id) {
        this.activeId = null;
      }
    };
  }

  notifyPlaying(id: string) {
    if (this.activeId && this.activeId !== id) {
      const pauseOther = this.listeners.get(this.activeId);
      if (pauseOther) {
        try {
          pauseOther();
        } catch {
          // ignore
        }
      }
    }
    this.activeId = id;
  }

  notifyPaused(id: string) {
    if (this.activeId === id) {
      this.activeId = null;
    }
  }
}

export const videoPlaybackManager = new VideoPlaybackManager();
