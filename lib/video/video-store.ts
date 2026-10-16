'use client';

import { useState, useEffect } from 'react';
import { VideoItem, VideoPlacement, VideoAnalyticsEvent } from './types';
import { INITIAL_VIDEOS } from './config';

const STORAGE_KEY = 'twh_videos_catalog';
const ANALYTICS_KEY = 'twh_video_analytics';

export function getStoredVideos(): VideoItem[] {
  if (typeof window === 'undefined') return INITIAL_VIDEOS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_VIDEOS));
      return INITIAL_VIDEOS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_VIDEOS;
  } catch {
    return INITIAL_VIDEOS;
  }
}

export function saveStoredVideos(videos: VideoItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
    // Dispatch custom storage event for same-tab updates
    window.dispatchEvent(new Event('twh_videos_updated'));
  } catch (err) {
    console.error('Failed to save videos to localStorage', err);
  }
}

export function logVideoAnalytics(videoId: string, event: VideoAnalyticsEvent['event']): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(ANALYTICS_KEY);
    const events: VideoAnalyticsEvent[] = raw ? JSON.parse(raw) : [];
    events.push({
      videoId,
      event,
      timestamp: new Date().toISOString()
    });
    // Keep max 100 events to prevent bloat
    if (events.length > 100) events.splice(0, events.length - 100);
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(events));
  } catch {
    // Ignore analytics errors
  }
}

export function useVideos(placement?: VideoPlacement) {
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    const all = getStoredVideos();
    return placement ? all.filter(v => v.placement === placement && v.isActive) : all;
  });

  useEffect(() => {
    const handleUpdate = () => {
      const all = getStoredVideos();
      setVideos(placement ? all.filter(v => v.placement === placement && v.isActive) : all);
    };

    window.addEventListener('twh_videos_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('twh_videos_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [placement]);

  return { videos, allVideos: getStoredVideos(), saveVideos: saveStoredVideos };
}
