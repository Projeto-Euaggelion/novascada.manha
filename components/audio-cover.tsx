import Image from "next/image";
import Logo from "@/components/logo";
import { cn } from "@/lib/utils";

interface AudioCoverProps {
  cover?: string;
  title: string;
  size: number;
  className?: string;
}

export default function AudioCover({ cover, title, size, className }: AudioCoverProps) {
  if (cover) {
    return (
      <Image
        src={cover}
        alt={title}
        width={size}
        height={size}
        className={cn("size-full object-cover", className)}
      />
    );
  }

  return (
    <div className={cn("flex size-full items-center justify-center bg-primary/10", className)}>
      <Logo colorLogo="text-primary" size={Math.round(size * 0.45)} />
    </div>
  );
}
