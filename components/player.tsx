"use client";

import { useState } from "react";
import Link from "next/link";
import {
  PauseIcon,
  PlayIcon,
  QueueIcon,
  SkipForwardIcon,
  XIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Item, ItemMedia, ItemContent, ItemTitle, ItemActions } from "@/components/ui/item";
import AudioCover from "@/components/audio-cover";
import { useAudioPlayer } from "@/components/audio-player-provider";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function Player() {
  const {
    currentTrack,
    queue,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    playNext,
    playFromQueue,
    removeFromQueue,
    stop,
  } = useAudioPlayer();
  const [showQueue, setShowQueue] = useState(false);

  if (!currentTrack) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <section className="fixed left-0 bottom-0 w-full bg-background border-t border-border z-[9999]">
      {showQueue && queue.length > 0 && (
        <div className="max-h-72 overflow-y-auto border-b border-border">
          <div className="max-w-2xl mx-auto px-8 md:px-0 py-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              A seguir
            </p>

            <ul className="flex flex-col gap-2">
              {queue.map((track) => (
                <li key={track.src}>
                  <Item
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => playFromQueue(track.src)}
                  >
                    <ItemMedia variant="image" className="size-10 overflow-hidden">
                      <AudioCover cover={track.cover} title={track.title} size={40} />
                    </ItemMedia>

                    <ItemContent>
                      <ItemTitle className="text-xs">{track.title}</ItemTitle>
                    </ItemContent>

                    <ItemActions>
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        aria-label="Remover da fila"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromQueue(track.src);
                        }}
                      >
                        <XIcon />
                      </Button>
                    </ItemActions>
                  </Item>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="h-0.5 bg-muted">
        <div className="h-full bg-primary transition-[width]" style={{ width: `${progress}%` }} />
      </div>

      <div className="max-w-2xl mx-auto px-8 md:px-0 py-3 flex items-center gap-3">
        <div className="size-12 shrink-0 overflow-hidden border border-border">
          <AudioCover cover={currentTrack.cover} title={currentTrack.title} size={48} />
        </div>

        <div className="min-w-0 flex-1">
          {currentTrack.href ? (
            <Link
              href={currentTrack.href}
              className="block text-sm font-medium truncate hover:underline"
            >
              {currentTrack.title}
            </Link>
          ) : (
            <p className="text-sm font-medium truncate">{currentTrack.title}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {formatTime(currentTime)} / {formatTime(duration)}
          </p>
        </div>

        <Button
          size="icon"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pausar" : "Reproduzir"}
          className="rounded-full"
        >
          {isPlaying ? <PauseIcon weight="fill" /> : <PlayIcon weight="fill" />}
        </Button>

        {queue.length > 0 && (
          <>
            <Button size="icon" variant="ghost" onClick={playNext} aria-label="Próximo áudio">
              <SkipForwardIcon weight="fill" />
            </Button>

            <Button
              size="icon"
              variant={showQueue ? "secondary" : "ghost"}
              onClick={() => setShowQueue((v) => !v)}
              aria-label="Ver fila de reprodução"
              aria-pressed={showQueue}
              className="relative"
            >
              <QueueIcon weight={showQueue ? "fill" : "regular"} />
              <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                {queue.length}
              </span>
            </Button>
          </>
        )}

        <Button size="icon" variant="ghost" onClick={stop} aria-label="Fechar player">
          <XIcon />
        </Button>
      </div>
    </section>
  );
}
