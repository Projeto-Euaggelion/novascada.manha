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
    <section className="fixed left-0 bottom-0 w-full border-t border-border z-[9999]">
      {showQueue && queue.length > 0 && (
        <div className="max-h-72 overflow-y-auto border-b border-border bg-white">
          <div className="max-w-2xl mx-auto">
            <p className="px-6 md:px-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground py-4 border-b border-ring/20">
              Lista de reprodução ({queue.length} {queue.length === 1 ? "item" : "itens"})
            </p>

            <ul className="flex flex-col gap-2">
              {queue.map((track) => (
                <li key={track.src}>
                  <Item
                    variant="muted"
                    size="sm"
                    className="cursor-pointer w-full"
                  >

                    <ItemContent>
                      <ItemTitle className="text-xs">{track.title}</ItemTitle>
                    </ItemContent>

                    <ItemActions>
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        aria-label="Reproduzir devocional"
                        onClick={() => playFromQueue(track.src)}
                      >
                        <PlayIcon />
                      </Button>
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

      <div className="relative w-full">
        <div className="relative max-w-2xl mx-auto py-4 flex flex-col items-center gap-3 z-20 bg-white/50 backdrop-blur-md">
          <div className="w-full flex flex-row items-center gap-3 border-b border-ring/20 px-4 md:px-0 pb-4">
            <div className="size-12 shrink-0 overflow-hidden border border-border">
              <AudioCover cover={currentTrack.cover} title={currentTrack.title} size={48} />
            </div>
            
            <div className="min-w-0 flex-1 flex flex-col gap-1">
              {currentTrack.href ? (
                <Link
                  href={currentTrack.href}
                  className="block text-sm font-medium truncate hover:underline"
                >
                  {currentTrack.title}
                </Link>
              ) : (
                <p className="text-sm font-medium">{currentTrack.title}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {formatTime(currentTime)} / {formatTime(duration)}
              </p>
            </div>
          </div>

          <div className="w-full flex flex-row items-center justify-between gap-2 px-4 md:px-0">
            <div className="flex flex-row gap-2">
              <Button
                size="icon"
                onClick={togglePlay}
                aria-label={isPlaying ? "Pausar" : "Reproduzir"}
                className="rounded-full"
              >
                {isPlaying ? <PauseIcon weight="fill" /> : <PlayIcon weight="fill" />}
              </Button>
              {queue.length > 0 && (
                <Button size="icon" variant="ghost" onClick={playNext} aria-label="Próximo áudio">
                  <SkipForwardIcon weight="fill" />
                </Button>
              )}
            </div>

            <div className="flex flex-row gap-2">
              {queue.length > 0 && (
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
              )}

              <Button size="icon" variant="ghost" onClick={stop} aria-label="Fechar player">
                <XIcon />
              </Button>
              </div>
          </div>

        </div>
        <div className="absolute top-0 left-0 h-full bg-primary transition-[width] -z-10" style={{ width: `${progress}%` }} />
      </div>
    </section>
  );
}
