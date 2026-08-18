"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export interface AudioTrack {
  src: string;
  title: string;
  href?: string;
  cover?: string;
}

interface AudioPlayerContextValue {
  currentTrack: AudioTrack | null;
  queue: AudioTrack[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playTrack: (track: AudioTrack) => void;
  togglePlay: () => void;
  playNext: () => void;
  playFromQueue: (src: string) => void;
  removeFromQueue: (src: string) => void;
  seek: (time: number) => void;
  stop: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null);

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [queue, setQueue] = useState<AudioTrack[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const playNext = useCallback(() => {
    setQueue((prev) => {
      if (prev.length === 0) {
        setCurrentTrack(null);
        return prev;
      }

      const [next, ...rest] = prev;
      setCurrentTrack(next);
      return rest;
    });
  }, []);

  const playTrack = useCallback(
    (track: AudioTrack) => {
      if (currentTrack?.src === track.src) {
        audioRef.current?.play();
        return;
      }

      if (currentTrack && isPlaying) {
        setQueue((prev) =>
          prev.some((item) => item.src === track.src) ? prev : [...prev, track]
        );
        return;
      }

      setCurrentTime(0);
      setDuration(0);
      setCurrentTrack(track);
    },
    [currentTrack, isPlaying]
  );

  const playFromQueue = useCallback((src: string) => {
    setQueue((prev) => {
      const index = prev.findIndex((track) => track.src === src);
      if (index === -1) return prev;

      setCurrentTime(0);
      setDuration(0);
      setCurrentTrack(prev[index]);
      return prev.slice(index + 1);
    });
  }, []);

  const removeFromQueue = useCallback((src: string) => {
    setQueue((prev) => prev.filter((track) => track.src !== src));
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  }, [currentTrack]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    setCurrentTrack(null);
    setQueue([]);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    audio.src = currentTrack.src;
    audio.play().catch(() => {});
  }, [currentTrack]);

  const value = useMemo<AudioPlayerContextValue>(
    () => ({
      currentTrack,
      queue,
      isPlaying,
      currentTime,
      duration,
      playTrack,
      togglePlay,
      playNext,
      playFromQueue,
      removeFromQueue,
      seek,
      stop,
    }),
    [
      currentTrack,
      queue,
      isPlaying,
      currentTime,
      duration,
      playTrack,
      togglePlay,
      playNext,
      playFromQueue,
      removeFromQueue,
      seek,
      stop,
    ]
  );

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={playNext}
        className="hidden"
      />
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error("useAudioPlayer deve ser usado dentro de um AudioPlayerProvider");
  }
  return context;
}
