"use client";
import { useState, useEffect } from "react";
import type { VideoItem, VideoPlacement, VideoAnalyticsEvent } from "./types";
import { api } from "../api-client";
export function logVideoAnalytics(
  videoId: string,
  event: VideoAnalyticsEvent["event"],
) {
  if (!/^[0-9a-f-]{36}$/.test(videoId)) return;
  void api("video-events", "POST", [
    { eventId: crypto.randomUUID(), videoId, event },
  ]).catch(() => {});
}
export function useVideos(placement?: VideoPlacement) {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  useEffect(() => {
    let active = true;
    api<VideoItem[]>("videos" + (placement ? "?placement=" + placement : ""))
      .then((v) => {
        if (active) setVideos(v);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [placement]);
  return { videos, allVideos: videos };
}
