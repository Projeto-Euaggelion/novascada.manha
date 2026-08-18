"use client";

import { PauseIcon, PlayIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
} from "@/components/ui/item";
import AudioCover from "@/components/audio-cover";
import { useAudioPlayer } from "@/components/audio-player-provider";

interface PlayAudioButtonProps {
  src: string;
  title: string;
  href: string;
  cover?: string;
}

export default function PlayAudioButton({ src, title, href, cover }: PlayAudioButtonProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudioPlayer();

  const isCurrent = currentTrack?.src === src;
  const showPause = isCurrent && isPlaying;

  const handleClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack({ src, title, href, cover });
    }
  };

  return (
    <Item variant="outline" className="not-prose my-6">
      <ItemMedia variant="image" className="size-14 overflow-hidden">
        <AudioCover cover={cover} title={title} size={56} />
      </ItemMedia>

      <ItemContent>
        <ItemTitle className="text-sm">Ouvir devocional em áudio</ItemTitle>
        <ItemDescription className="line-clamp-1">{title}</ItemDescription>
      </ItemContent>

      <ItemActions>
        <Button
          size="icon-lg"
          onClick={handleClick}
          aria-label={showPause ? "Pausar áudio" : "Reproduzir áudio"}
          className="rounded-full"
        >
          {showPause ? <PauseIcon weight="fill" /> : <PlayIcon weight="fill" />}
        </Button>
      </ItemActions>
    </Item>
  );
}
